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
  // --- จัดรูปแบบข้อความ "X วินาทีที่แล้ว" ---
  const formatTimeSince = (seconds: number): string => {
    if (seconds < 60) return `${seconds} วินาทีที่แล้ว`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} นาทีที่แล้ว`;
    return `${Math.floor(seconds / 3600)} ชั่วโมงที่แล้ว`;
  };

  // --- Skeleton Loading State ---
  if (isLoading) {
    return (
      <div className="sensor-card sensor-card--skeleton" aria-busy="true">
        <div className="card-header">
          <span className="sensor-title">
            {icon}
            {label}
          </span>
          <span className="status-badge skeleton-badge">กำลังโหลด...</span>
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
            {label}
          </span>
          <span className="status-badge alert">ไม่สามารถเชื่อมต่อ</span>
        </div>
        <div className="sensor-value-container">
          <span className="sensor-value" style={{ fontSize: '1.5rem', color: 'var(--color-muted-ink)' }}>
            ไม่มีข้อมูล
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
          {label}
        </span>
        {/* Badge สถานะ: LIVE (🟢) หรือ OFFLINE (🔴) */}
        <span className={`status-badge ${isStale ? 'alert' : 'normal'}`}>
          <span className="live-indicator-dot" aria-hidden="true" />
          {isStale ? 'OFFLINE' : 'LIVE'}
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
              ? `อัปเดตล่าสุดเมื่อ ${formatTimeSince(secondsSinceUpdate)}`
              : 'รอข้อมูล...'}
          </span>
          {/* แสดง error ถ้ามี แต่ยังมี data เก่าอยู่ */}
          {error && value !== null && (
            <span className="sensor-retry-notice">
              ⚠ กำลังลองเชื่อมต่อใหม่...
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
