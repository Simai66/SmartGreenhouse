/**
 * SensorHistoryChart — กราฟย้อนหลังข้อมูลเซนเซอร์
 *
 * ฟีเจอร์:
 * - LineChart จาก recharts แสดง 4 เซนเซอร์ (temp, humidity, soil_moisture, light_level)
 * - Dropdown เลือกช่วงเวลา: 1h / 6h / 24h
 * - Loading skeleton ระหว่าง fetch
 * - Error fallback ถ้า fetch ล้มเหลว
 * - Responsive container
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { SENSOR_CONFIG } from '../hooks/useSensorData';
import { useTranslation } from '../hooks/useTranslation';

// --- Types ---
interface HistoryRecord {
  id: number;
  temperature: number;
  humidity: number;
  soil_moisture: number;
  light_level: number;
  created_at: string;
}

/** ช่วงเวลาที่รองรับ */
type TimeRange = '1h' | '6h' | '24h';

interface SensorHistoryChartProps {
  /** เปิด/ปิดการดึงข้อมูล */
  enabled?: boolean;
  /** base URL ของ API */
  apiBaseUrl?: string;
}

// สีของแต่ละเส้นกราฟ — ใช้ -strong variant ตาม DESIGN.md
const LINE_COLORS = {
  temperature: '#b91c1c',    // alert-strong (แดง — อุณหภูมิ)
  humidity: '#1d4ed8',       // น้ำเงินเข้ม — ความชื้น
  soil_moisture: '#047857',  // normal-strong (เขียว — ดิน)
  light_level: '#b45309',   // warning-strong (เหลือง — แสง)
} as const;

export const SensorHistoryChart: React.FC<SensorHistoryChartProps> = ({
  enabled = true,
  apiBaseUrl,
}) => {
  const baseUrl = apiBaseUrl ?? SENSOR_CONFIG.API_BASE_URL;
  const { t } = useTranslation();

  // --- State ---
  const [range, setRange] = useState<TimeRange>('1h');
  const [historyData, setHistoryData] = useState<HistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // ป้องกัน fetch ซ้อนกัน
  const isFetchingRef = useRef<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // --- ดึงข้อมูลย้อนหลัง ---
  const fetchHistory = useCallback(async (selectedRange: TimeRange) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    // cancel request ก่อนหน้า (ถ้ามี)
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setIsLoading(true);
      const response = await fetch(`${baseUrl}/sensor-history?range=${selectedRange}`, {
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const json = await response.json();

      if (!json.success) {
        throw new Error(json.error || 'API returned unsuccessful response');
      }

      setHistoryData(json.data || []);
      setError(null);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [baseUrl]);

  // --- ดึงข้อมูลเมื่อ range เปลี่ยน หรือเปิดใช้งาน ---
  useEffect(() => {
    if (!enabled) return;
    fetchHistory(range);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [enabled, range, fetchHistory]);

  // --- จัดรูปแบบ timestamp สำหรับแกน X ---
  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const rangeOptions = [
    { value: '1h' as const, label: t('hour_1') },
    { value: '6h' as const, label: t('hour_6') },
    { value: '24h' as const, label: t('hour_24') },
  ];

  // --- เตรียมข้อมูลสำหรับ recharts ---
  const chartData = historyData.map((record) => ({
    time: formatTime(record.created_at),
    [t('chart_temp')]: record.temperature,
    [t('chart_humidity')]: record.humidity,
    [t('chart_moisture')]: record.soil_moisture,
    [t('chart_light')]: record.light_level,
  }));

  // --- Loading State ---
  if (isLoading && historyData.length === 0) {
    return (
      <div className="history-chart-container" aria-busy="true">
        <div className="chart-header">
          <span className="details-title">{t('chart_title')}</span>
        </div>
        <div className="chart-skeleton">
          <div className="skeleton-bar" style={{ height: '200px', borderRadius: 'var(--rounded-md)' }} />
        </div>
      </div>
    );
  }

  // --- Error State (ไม่มี data เลย) ---
  if (error && historyData.length === 0) {
    return (
      <div className="history-chart-container" aria-live="polite">
        <div className="chart-header">
          <span className="details-title">{t('chart_title')}</span>
        </div>
        <div className="chart-error">
          <span className="chart-error-icon">⚠️</span>
          <span className="chart-error-text">{t('chart_error_load')}</span>
          <span className="chart-error-detail">{error.message}</span>
          <button className="action-button" onClick={() => fetchHistory(range)}>
            {t('chart_try_again')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="history-chart-container">
      {/* Header: ชื่อ + Range selector */}
      <div className="chart-header">
        <span className="details-title">{t('chart_title')}</span>
        <div className="range-selector">
          {rangeOptions.map((option) => (
            <button
              key={option.value}
              className={`range-button ${range === option.value ? 'active' : ''}`}
              onClick={() => setRange(option.value)}
              aria-pressed={range === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* แสดง error ถ้ามี แต่ยังมี data เก่าอยู่ */}
      {error && historyData.length > 0 && (
        <div className="chart-stale-notice">
          {t('chart_stale_warning')}
        </div>
      )}

      {/* กราฟ */}
      {chartData.length > 0 ? (
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 11, fill: 'var(--color-muted-ink)' }}
                tickLine={false}
                axisLine={{ stroke: 'var(--color-border)' }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--color-muted-ink)' }}
                tickLine={false}
                axisLine={{ stroke: 'var(--color-border)' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--rounded-md)',
                  fontSize: '0.8125rem',
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '0.75rem', paddingTop: '8px' }}
              />
              <Line
                type="monotone"
                dataKey={t('chart_temp')}
                stroke={LINE_COLORS.temperature}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey={t('chart_humidity')}
                stroke={LINE_COLORS.humidity}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey={t('chart_moisture')}
                stroke={LINE_COLORS.soil_moisture}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey={t('chart_light')}
                stroke={LINE_COLORS.light_level}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="chart-empty">
          <span>{t('chart_empty')}</span>
        </div>
      )}
    </div>
  );
};
