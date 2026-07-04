/**
 * useSensorData — Custom Hook สำหรับดึงข้อมูลเซนเซอร์แบบ real-time polling
 *
 * ฟีเจอร์หลัก:
 * - Polling ด้วย setInterval (ปรับความถี่ได้)
 * - ป้องกัน fetch ซ้อนกัน (ถ้า request ก่อนหน้ายังไม่เสร็จ ข้ามรอบนั้น)
 * - Exponential backoff เมื่อ fetch ล้มเหลวติดกัน
 * - Stale data detection เทียบ timestamp ข้อมูลกับเวลาปัจจุบัน
 * - Live counter นับวินาทีตั้งแต่อัปเดตล่าสุด
 * - AbortController สำหรับ cancel pending fetch เมื่อ unmount
 */

import { useState, useEffect, useRef, useCallback } from 'react';

// --- ค่าคงที่ที่ปรับได้ตรงจุดเดียว ---
export const SENSOR_CONFIG = {
  /** ความถี่ polling (มิลลิวินาที) — default 5 วินาที */
  POLLING_INTERVAL_MS: 5000,
  /** threshold สำหรับตรวจจับข้อมูลเก่า — default 15 วินาที */
  STALE_THRESHOLD_MS: 15000,
  /** backoff เริ่มต้นเมื่อ fetch ล้มเหลว (มิลลิวินาที) */
  RETRY_INITIAL_MS: 3000,
  /** backoff สูงสุด (มิลลิวินาที) */
  RETRY_MAX_MS: 30000,
  /** ตัวคูณ backoff ทุกครั้งที่พลาด */
  RETRY_MULTIPLIER: 2,
  /** base URL ของ API */
  API_BASE_URL: '/api',
} as const;

// --- Types ---
/** โครงสร้างข้อมูลเซนเซอร์ 1 record จาก D1 */
export interface SensorReading {
  id: number;
  temperature: number;
  humidity: number;
  soil_moisture: number;
  light_level: number;
  created_at: string; // ISO 8601 UTC
}

/** ค่าที่ hook คืนออกมา */
export interface UseSensorDataReturn {
  /** ข้อมูลเซนเซอร์ล่าสุดจาก API */
  data: SensorReading | null;
  /** กำลังโหลดข้อมูลครั้งแรก (ยังไม่เคยได้ data) */
  isLoading: boolean;
  /** error ล่าสุดจากการ fetch */
  error: Error | null;
  /** เวลาที่ fetch สำเร็จล่าสุด (client-side) */
  lastUpdated: Date | null;
  /** ข้อมูลเก่าเกิน threshold หรือไม่ (เทียบ created_at กับ now) */
  isStale: boolean;
  /** จำนวนวินาทีนับจาก timestamp ของข้อมูล (นับสดทุก 1 วินาที) */
  secondsSinceUpdate: number;
}

/** ตัวเลือกที่ส่งเข้า hook ได้ */
export interface UseSensorDataOptions {
  /** ความถี่ polling (มิลลิวินาที) — override SENSOR_CONFIG */
  pollingInterval?: number;
  /** threshold stale (มิลลิวินาที) — override SENSOR_CONFIG */
  staleThreshold?: number;
  /** base URL ของ API — override SENSOR_CONFIG */
  apiBaseUrl?: string;
  /** เปิด/ปิด polling (ปิดเมื่อไม่ได้อยู่ใน Live mode) */
  enabled?: boolean;
}

export function useSensorData(options?: UseSensorDataOptions): UseSensorDataReturn {
  // --- ดึง config จาก options หรือใช้ default ---
  const pollingInterval = options?.pollingInterval ?? SENSOR_CONFIG.POLLING_INTERVAL_MS;
  const staleThreshold = options?.staleThreshold ?? SENSOR_CONFIG.STALE_THRESHOLD_MS;
  const apiBaseUrl = options?.apiBaseUrl ?? SENSOR_CONFIG.API_BASE_URL;
  const enabled = options?.enabled ?? true;

  // --- State ---
  const [data, setData] = useState<SensorReading | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState<number>(0);

  // --- Refs (ไม่ trigger re-render) ---
  /** flag ป้องกัน fetch ซ้อนกัน */
  const isFetchingRef = useRef<boolean>(false);
  /** ค่า backoff ปัจจุบัน (มิลลิวินาที) */
  const backoffRef = useRef<number>(SENSOR_CONFIG.RETRY_INITIAL_MS);
  /** timer ID สำหรับ backoff retry */
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** AbortController สำหรับ cancel pending fetch */
  const abortControllerRef = useRef<AbortController | null>(null);
  /** จำนวน error ติดต่อกัน */
  const consecutiveErrorsRef = useRef<number>(0);

  // --- ฟังก์ชัน fetch ข้อมูลจาก API ---
  const fetchLatest = useCallback(async () => {
    // ป้องกัน fetch ซ้อนกัน — ถ้า request ก่อนหน้ายังไม่เสร็จ ข้ามรอบนี้
    if (isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;

    // สร้าง AbortController ใหม่ทุกครั้ง
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(`${apiBaseUrl}/sensor-latest`, {
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const json = await response.json();

      if (!json.success) {
        throw new Error(json.error || 'API returned unsuccessful response');
      }

      // อัปเดต state เมื่อ fetch สำเร็จ
      if (json.data) {
        setData(json.data as SensorReading);
        setLastUpdated(new Date());
        setError(null);
        // รีเซ็ต backoff กลับค่าเริ่มต้นเมื่อสำเร็จ
        backoffRef.current = SENSOR_CONFIG.RETRY_INITIAL_MS;
        consecutiveErrorsRef.current = 0;
      }

      setIsLoading(false);
    } catch (err) {
      // ไม่นับ AbortError เป็น error (เกิดจากการ unmount)
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }

      const fetchError = err instanceof Error ? err : new Error('Unknown fetch error');
      setError(fetchError);
      setIsLoading(false);
      consecutiveErrorsRef.current += 1;

      // Exponential backoff — เพิ่มเวลารอทุกครั้งที่พลาด
      console.warn(
        `[useSensorData] Fetch failed (${consecutiveErrorsRef.current}x). ` +
          `Next retry in ${backoffRef.current / 1000}s. Error: ${fetchError.message}`
      );

      // ตั้ง timer สำหรับ retry ด้วย backoff
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      retryTimerRef.current = setTimeout(() => {
        fetchLatest();
      }, backoffRef.current);

      // เพิ่ม backoff (x2) แต่ไม่เกิน max
      backoffRef.current = Math.min(
        backoffRef.current * SENSOR_CONFIG.RETRY_MULTIPLIER,
        SENSOR_CONFIG.RETRY_MAX_MS
      );
    } finally {
      isFetchingRef.current = false;
    }
  }, [apiBaseUrl]);

  // --- Polling Effect ---
  // ตั้ง setInterval สำหรับ polling ตามความถี่ที่กำหนด
  useEffect(() => {
    if (!enabled) {
      // ปิด polling → reset state
      setIsLoading(true);
      return;
    }

    // fetch ครั้งแรกทันที
    fetchLatest();

    // ตั้ง interval สำหรับ polling
    const intervalId = setInterval(() => {
      // ถ้าไม่มี error ติดต่อกัน → fetch ปกติ
      // ถ้ามี error → ปล่อยให้ backoff retry จัดการ (ไม่ fetch ซ้ำจาก interval)
      if (consecutiveErrorsRef.current === 0) {
        fetchLatest();
      }
    }, pollingInterval);

    // Cleanup — ป้องกัน memory leak
    return () => {
      clearInterval(intervalId);
      // cancel pending fetch
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      // clear retry timer
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
      }
    };
  }, [enabled, pollingInterval, fetchLatest]);

  // --- Live Counter Effect ---
  // นับวินาทีนับจาก timestamp ของข้อมูลล่าสุด (ทุก 1 วินาที)
  useEffect(() => {
    if (!data?.created_at) {
      setSecondsSinceUpdate(0);
      return;
    }

    // ฟังก์ชันคำนวณจำนวนวินาทีนับจาก created_at
    const calcSeconds = () => {
      const dataTime = new Date(data.created_at).getTime();
      const now = Date.now();
      return Math.max(0, Math.floor((now - dataTime) / 1000));
    };

    // อัปเดตทันทีครั้งแรก
    setSecondsSinceUpdate(calcSeconds());

    // แล้วนับขึ้นทุก 1 วินาที
    const tickId = setInterval(() => {
      setSecondsSinceUpdate(calcSeconds());
    }, 1000);

    return () => clearInterval(tickId);
  }, [data?.created_at]);

  // --- คำนวณ isStale ---
  // เทียบ timestamp ข้อมูล กับ เวลาปัจจุบัน
  const isStale = (() => {
    if (!data?.created_at) return false; // ยังไม่เคยได้ข้อมูล → ไม่นับเป็น stale
    return secondsSinceUpdate * 1000 >= staleThreshold;
  })();

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    isStale,
    secondsSinceUpdate,
  };
}
