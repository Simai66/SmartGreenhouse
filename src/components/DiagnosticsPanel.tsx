import React from 'react';
import {
  CameraIcon,
  UploadIcon,
  TrashIcon,
  RefreshCwIcon,
  XIcon,
  TimerIcon,
  LeafIcon,
} from './Icons';

const AUTO_CAPTURE_INTERVAL_MS = 60 * 60 * 1000;

interface DiagnosticResult {
  disease: string;
  confidence: number;
  status: 'normal' | 'warning' | 'alert';
  recommendations: string[];
}

interface DiagnosticsPanelProps {
  cameraActive: boolean;
  setVideoRef: (node: HTMLVideoElement | null) => void;
  isSimulated: boolean;
  capturedImage: string | null;
  capturedImages: string[];
  selectedImageIndex: number;
  selectCapturedImage: (idx: number) => void;
  scanState: 'idle' | 'scanning' | 'completed';
  diagnosticResult: DiagnosticResult | null;
  startCamera: () => void;
  stopCamera: () => void;
  switchCamera: () => void;
  capturePhoto: () => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  autoCaptureEnabled: boolean;
  setAutoCaptureEnabled: (v: boolean) => void;
  autoCaptureRemaining: number;
  runDiagnostics: () => void;
  resetDiagnostics: () => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
  lang: 'th' | 'en';
}

const formatCountdown = (totalSeconds: number): string => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const DiagnosticsPanel: React.FC<DiagnosticsPanelProps> = ({
  cameraActive,
  setVideoRef,
  isSimulated,
  capturedImage,
  capturedImages,
  selectedImageIndex,
  selectCapturedImage,
  scanState,
  diagnosticResult,
  startCamera,
  stopCamera,
  switchCamera,
  capturePhoto,
  handleImageUpload,
  fileInputRef,
  autoCaptureEnabled,
  setAutoCaptureEnabled,
  autoCaptureRemaining,
  runDiagnostics,
  resetDiagnostics,
  t,
  lang,
}) => {
  const autoCaptureActive = autoCaptureEnabled && cameraActive;

  return (
    <div className="diagnostics-panel" style={{ marginTop: "var(--spacing-lg)" }}>
      <div className="card-header">
        <span className="details-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <LeafIcon />
          {t('ai_diagnostics')}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Auto Capture Toggle */}
          <div className="auto-capture-toggle">
            <TimerIcon />
            <span className="control-name" style={{ fontSize: "0.8125rem" }}>{t('auto_capture')}</span>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={autoCaptureEnabled}
                onChange={() => {
                  if (!autoCaptureEnabled && !cameraActive) {
                    // ถ้ายังไม่เปิดกล้อง → แจ้งเตือน
                    alert(t('auto_capture_alert'));
                    return;
                  }
                  setAutoCaptureEnabled(!autoCaptureEnabled);
                }}
                aria-label="Toggle auto capture"
              />
              <span className="toggle-slider" />
            </label>
          </div>
          <span className="status-badge normal">{t('ai_powered')}</span>
        </div>
      </div>

      {/* Auto Capture Countdown Bar */}
      {autoCaptureActive && (
        <div className="auto-capture-bar">
          <TimerIcon />
          <span className="auto-capture-label">{t('next_capture')}</span>
          <span className="countdown-display">{formatCountdown(autoCaptureRemaining)}</span>
          <div className="countdown-progress">
            <div
              className="countdown-progress-fill"
              style={{
                width: `${((AUTO_CAPTURE_INTERVAL_MS / 1000 - autoCaptureRemaining) / (AUTO_CAPTURE_INTERVAL_MS / 1000)) * 100}%`,
              }}
            />
          </div>
        </div>
      )}
      
      <div className="diagnostics-layout">
        {/* Left Column: Viewport */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div className="camera-viewport">
            {/* กล้องเปิดอยู่ → แสดง live feed เสมอ (ไม่สลับไป captured image) */}
            {cameraActive ? (
              <>
                <video
                  id="camera-stream"
                  ref={setVideoRef}
                  autoPlay
                  playsInline
                  className="camera-video"
                />
                {isSimulated && (
                  <div className="simulated-badge">
                    {t('simulated_feed')}
                  </div>
                )}
              </>
            ) : capturedImage ? (
              <img src={capturedImage} alt="Captured leaf" className="captured-image" />
            ) : (
              <div className="viewport-placeholder">
                <CameraIcon />
                <span style={{ fontSize: "0.875rem" }}>{t('no_image_active')}</span>
                <span style={{ fontSize: "0.75rem", color: "var(--color-muted-ink)" }}>
                  {t('start_camera_or_upload')}
                </span>
              </div>
            )}

            {/* Laser Scanner animation during scanning */}
            {scanState === "scanning" && (
              <div className="scanner-overlay">
                <div className="scanner-laser" />
              </div>
            )}
          </div>

          {/* Thumbnail Gallery — แสดงรูปที่ถ่ายไว้ */}
          {capturedImages.length > 0 && (
            <div className="capture-gallery">
              {capturedImages.map((img, i) => (
                <button
                  key={i}
                  className={`capture-thumbnail ${selectedImageIndex === i ? "selected" : ""}`}
                  onClick={() => selectCapturedImage(i)}
                  aria-label={`Select captured image ${i + 1}`}
                >
                  <img src={img} alt={`Capture ${i + 1}`} />
                </button>
              ))}
            </div>
          )}

          <div className="camera-actions">
            {/* กล้องปิดอยู่ + ไม่มีรูปใน gallery */}
            {!cameraActive && capturedImages.length === 0 && (
              <>
                <button className="action-button" onClick={startCamera} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <CameraIcon /> {t('camera_start')}
                </button>
                <button className="action-button" onClick={() => fileInputRef.current?.click()} style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-primary)" }}>
                  <UploadIcon /> {t('upload_image')}
                </button>
              </>
            )}

            {/* กล้องเปิดอยู่ → แสดงปุ่มถ่าย + สลับกล้อง + ปิดกล้อง */}
            {cameraActive && (
              <>
                <button className="action-button" onClick={capturePhoto} style={{ backgroundColor: "var(--color-status-normal)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <CameraIcon /> {t('capture_button')}
                </button>
                <button className="action-button" onClick={switchCamera} style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-primary)" }}>
                  <RefreshCwIcon /> {t('switch_camera')}
                </button>
                <button className="action-button" onClick={stopCamera} style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-status-alert-strong)" }}>
                  <XIcon /> {t('close_button')}
                </button>
              </>
            )}

            {/* กล้องปิดอยู่ + มีรูปใน gallery → แสดงปุ่มเปิดกล้อง + อัปโหลด */}
            {!cameraActive && capturedImages.length > 0 && (
              <>
                <button className="action-button" onClick={startCamera} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <CameraIcon /> {t('camera_start')}
                </button>
                <button className="action-button" onClick={() => fileInputRef.current?.click()} style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-primary)" }}>
                  <UploadIcon /> {t('upload_image')}
                </button>
              </>
            )}

            {/* รูปที่เลือกอยู่ + ไม่ได้กำลัง scan → แสดงปุ่ม scan + ล้าง */}
            {capturedImage && scanState !== "scanning" && (
              <>
                {scanState === "idle" && (
                  <button className="action-button" onClick={runDiagnostics} style={{ backgroundColor: "var(--color-status-normal)" }}>
                    {t('analyze_button')}
                  </button>
                )}
                <button className="action-button btn-alert" onClick={resetDiagnostics} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <TrashIcon /> {t('clear_reset')}
                </button>
              </>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              style={{ display: "none" }}
              aria-label="Upload leaf image"
            />
          </div>
        </div>

        {/* Right Column: Diagnostic Results */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {scanState === "idle" && capturedImage && (
            <div style={{ textAlign: "center", padding: "20px", color: "var(--color-muted-ink)" }}>
              <span style={{ fontSize: "0.875rem", display: "block", marginBottom: "8px" }}>{t('image_ready')}</span>
              <button className="action-button" onClick={runDiagnostics} style={{ width: "100%", maxWidth: "200px", margin: "0 auto" }}>
                {t('scan_leaf_btn')}
              </button>
            </div>
          )}

          {scanState === "scanning" && (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <span className="value-update-pulse" style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--color-status-normal)", display: "block", marginBottom: "8px" }}>
                {lang === 'th' ? "กำลังสแกนเนื้อเยื่อใบ..." : "Scanning Leaf Tissue..."}
              </span>
              <span style={{ fontSize: "0.875rem", color: "var(--color-muted-ink)" }}>
                {lang === 'th' ? "AI กำลังตรวจสอบความผิดปกติและอาการของเซลล์" : "AI is identifying cell pathologies and symptoms"}
              </span>
            </div>
          )}

          {scanState === "completed" && diagnosticResult && (
            <div className="diagnostics-results">
              <div className="results-header">
                <span className="results-title">{t('diagnostic_result')}</span>
                <span className={`status-badge ${diagnosticResult.status}`}>
                  {diagnosticResult.status === "normal" ? t('status_healthy') : t('status_infected')}
                </span>
              </div>
              <div>
                <strong style={{ fontSize: "1.125rem", color: "var(--color-primary)", display: "block" }}>
                  {t(diagnosticResult.disease)}
                </strong>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                  <span style={{ fontSize: "0.875rem", color: "var(--color-muted-ink)" }}>
                    {t('confidence_level')}:
                  </span>
                  <strong style={{ fontSize: "0.875rem", color: "var(--color-primary)" }}>
                    {diagnosticResult.confidence}%
                  </strong>
                </div>
                <div className="confidence-bar-container">
                  <div
                    className="confidence-bar"
                    style={{
                      width: "100%",
                      transform: `scaleX(${diagnosticResult.confidence / 100})`,
                      transformOrigin: "left",
                      backgroundColor:
                        diagnosticResult.status === "alert"
                          ? "var(--color-status-alert)"
                          : diagnosticResult.status === "warning"
                          ? "var(--color-status-warning)"
                          : "var(--color-status-normal)",
                    }}
                  />
                </div>
              </div>
              
              <div style={{ borderTop: "1px dashed var(--color-border)", paddingTop: "12px", marginTop: "4px" }}>
                <span className="stat-label" style={{ fontSize: "0.75rem", display: "block", marginBottom: "8px" }}>
                  {t('recommendations')}:
                </span>
                <ul className="recommendations-list">
                  {diagnosticResult.recommendations.map((rec, i) => (
                    <li key={i}>{t(rec)}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {scanState === "idle" && !capturedImage && (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--color-muted-ink)" }}>
              <LeafIcon />
              <p style={{ fontSize: "0.875rem", marginTop: "12px" }}>
                {t('select_image_scan')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
