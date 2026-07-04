import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useAutoCapture — custom hook สำหรับจัดการการถ่ายภาพอัตโนมัติตาม interval
 * 
 * หลักการ:
 * - ใช้ setInterval สำหรับ countdown ทุก 1 วินาที (แสดง UI)
 * - เมื่อ countdown ถึง 0 → เรียก onCapture callback
 * - ใช้ useRef เก็บ isCapturing flag ป้องกันการยิง capture ซ้อน
 * - cleanup interval ทันทีเมื่อ enabled เปลี่ยนเป็น false หรือ component unmount
 * - ไม่ใช้ localStorage — ปิดแท็บ/รีเฟรช = หยุดไปเลย
 */

interface UseAutoCaptureOptions {
  // เปิด/ปิดโหมด auto capture
  enabled: boolean;
  // ระยะเวลาระหว่างการถ่ายแต่ละครั้ง (มิลลิวินาที)
  intervalMs: number;
  // callback ที่จะถูกเรียกเมื่อถึงเวลาถ่ายรูป
  onCapture: () => void;
  // กล้องพร้อมใช้งานหรือไม่ (ต้องเปิดกล้องก่อนถึงจะถ่ายได้)
  isCameraReady: boolean;
}

interface UseAutoCaptureReturn {
  // วินาทีที่เหลือก่อนถ่ายรูปครั้งถัดไป
  remainingSeconds: number;
  // โหมด auto capture กำลังทำงานอยู่หรือไม่
  isActive: boolean;
}

export function useAutoCapture({
  enabled,
  intervalMs,
  onCapture,
  isCameraReady,
}: UseAutoCaptureOptions): UseAutoCaptureReturn {
  // เวลาที่เหลือ (วินาที) ก่อนถ่ายรูปครั้งถัดไป
  const [remainingSeconds, setRemainingSeconds] = useState<number>(
    Math.floor(intervalMs / 1000)
  );

  // flag ป้องกันการยิง capture ซ้อนกัน
  const isCapturingRef = useRef<boolean>(false);

  // เก็บ reference ล่าสุดของ onCapture เพื่อไม่ให้ useEffect re-run ทุกครั้งที่ callback เปลี่ยน
  const onCaptureRef = useRef(onCapture);
  useEffect(() => {
    onCaptureRef.current = onCapture;
  }, [onCapture]);

  // จัดการ countdown timer
  useEffect(() => {
    // ถ้าปิด auto capture หรือกล้องไม่พร้อม → ไม่ต้องทำอะไร
    if (!enabled || !isCameraReady) {
      return;
    }

    // รีเซ็ต countdown เมื่อเปิด auto capture
    const totalSeconds = Math.floor(intervalMs / 1000);
    setRemainingSeconds(totalSeconds);

    // countdown ทุก 1 วินาที
    const countdownInterval = setInterval(() => {
      setRemainingSeconds((prev) => {
        const next = prev - 1;

        if (next <= 0) {
          // ถึงเวลาถ่ายรูป — ป้องกันการยิงซ้อน
          if (!isCapturingRef.current) {
            isCapturingRef.current = true;
            try {
              onCaptureRef.current();
            } finally {
              isCapturingRef.current = false;
            }
          }
          // รีเซ็ต countdown กลับไปค่าเริ่มต้น
          return totalSeconds;
        }

        return next;
      });
    }, 1000);

    // cleanup เมื่อปิด toggle หรือ unmount
    return () => {
      clearInterval(countdownInterval);
    };
  }, [enabled, intervalMs, isCameraReady]);

  // คำนวณ isActive จาก enabled + isCameraReady
  const isActive = enabled && isCameraReady;

  return {
    remainingSeconds: isActive ? remainingSeconds : 0,
    isActive,
  };
}
