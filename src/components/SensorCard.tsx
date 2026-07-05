/**
 * SensorCard — แสดงค่าเซนเซอร์ตัวเดียวแบบเรียลไทม์
 *
 * ฟีเจอร์:
 * - ค่าปัจจุบัน + unit + icon
 * - Status badge: 🟢 LIVE (isStale=false) / 🔴 OFFLINE (isStale=true)
 * - Live counter: "อัปเดตล่าสุดเมื่อ X วินาทีที่แล้ว"
 * - Skeleton loading state
 * - Error fallback UI
 */

import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

// --- Types ---
interface SensorCardProps {
  /** ชื่อเซนเซอร์ เช่น "Temperature" */
  label: string;
  /** ค่าตัวเลข เช่น 24.5 */
  value: number | null;
  /** หน่วย เช่น "°C", "%", "Lux" */
  unit: string;
  /** Icon component (SVG) */
  icon: React.ReactNode;
  /** กำลังโหลดข้อมูลครั้งแรกหรือไม่ */
  isLoading: boolean;
  /** มี error หรือไม่ */
  error: Error | null;
  /** ข้อมูลเก่าเกิน threshold หรือไม่ */
  isStale: boolean;
  /** จำนวนวินาทีนับจาก timestamp ของข้อมูล */
  secondsSinceUpdate: number;
  /** เลือก card นี้อยู่หรือไม่ */
  isSelected?: boolean;
  /** callback เมื่อคลิกเลือก */
  onClick?: () => void;
}

export const SensorCard: React.FC<SensorCardProps> = ({
  label,
  value,
  unit,
  icon,
  isLoading,
  error,
  isStale,
  secondsSinceUpdate,
  isSelected = false,
  onClick,
}) => {
  const { t } = useTranslation();

  // --- จัดรูปแบบข้อความ "X วินาทีที่แล้ว" ---
  const formatTimeSince = (seconds: number): string => {
    if (seconds < 60) return t('time_seconds_ago', { seconds });
    if (seconds < 3600) return t('time_minutes_ago', { minutes: Math.floor(seconds / 60) });
    return t('time_hours_ago', { hours: Math.floor(seconds / 3600) });
  };

  const getTranslatedLabel = (lbl: string): string => {
    const keyMap: Record<string, string> = {
      'temperature': 'temp',
      'humidity': 'humidity',
      'soil moisture': 'moisture',
      'light level': 'light'
    };
    const key = keyMap[lbl.toLowerCase()] || lbl;
    return t(key);
  };

  const displayLabel = getTranslatedLabel(label);

  // --- Skeleton Loading State ---
  if (isLoading) {
    return (
      <div className="sensor-card sensor-card--skeleton" aria-busy="true">
        <div className="card-header">
          <span className="sensor-title">
            {icon}
            {displayLabel}
          </span>
          <span className="status-badge skeleton-badge">{t('loading')}</span>
        </div>
        <div className="sensor-value-container">
          <span className="sensor-value skeleton-text">--.-</span>
          <span className="sensor-unit">{unit}</span>
        </div>
        <div className="sensor-footer">
          <div className="skeleton-bar" />
        </div>
      </div>
    );
  }

  // --- Error State ---
  if (error && value === null) {
    return (
      <div className="sensor-card sensor-card--error" aria-live="polite">
        <div className="card-header">
          <span className="sensor-title">
            {icon}
            {displayLabel}
          </span>
          <span className="status-badge alert">{t('cannot_connect')}</span>
        </div>
        <div className="sensor-value-container">
          <span className="sensor-value" style={{ fontSize: '1.5rem', color: 'var(--color-muted-ink)' }}>
            {t('no_data')}
          </span>
        </div>
        <div className="sensor-footer">
          <span className="sensor-error-message">{error.message}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`sensor-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      style={isSelected ? { borderColor: 'var(--color-primary)', borderWidth: '1.5px' } : {}}
    >
      {/* Header: ชื่อ + Status Badge */}
      <div className="card-header">
        <span className="sensor-title">
          {icon}
          {displayLabel}
        </span>
        {/* Badge สถานะ: LIVE (🟢) หรือ OFFLINE (🔴) */}
        <span className={`status-badge ${isStale ? 'alert' : 'normal'}`}>
          <span className="live-indicator-dot" aria-hidden="true" />
          {isStale ? t('offline') : t('live')}
        </span>
      </div>

      {/* ค่าเซนเซอร์ */}
      <div className="sensor-value-container">
        <span key={value} className="sensor-value value-update-pulse">
          {value !== null ? value : '--'}
        </span>
        <span className="sensor-unit">{unit}</span>
      </div>

      {/* Footer: เวลาที่อัปเดตล่าสุด */}
      <div className="sensor-footer">
        <div className="sensor-last-update" aria-live="polite">
          <span className="last-update-text">
            {value !== null
              ? t('update_last', { time: formatTimeSince(secondsSinceUpdate) })
              : t('wait_data')}
          </span>
          {/* แสดง error ถ้ามี แต่ยังมี data เก่าอยู่ */}
          {error && value !== null && (
            <span className="sensor-retry-notice">
              {t('reconnecting')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
