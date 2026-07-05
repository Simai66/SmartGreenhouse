import React from 'react';

interface ControlLogItem {
  id: string;
  timestamp: string;
  device: string;
  action: string;
  trigger: string;
}

interface ControlsSidebarProps {
  autoMode: boolean;
  setAutoMode: (v: boolean) => void;
  controls: Record<string, { name: string; checked: boolean; statusText: string }>;
  handleToggle: (key: string) => void;
  simulationActive: boolean;
  setSimulationActive: (v: boolean) => void;
  controlLogs: ControlLogItem[];
  triggerAnomaly: (type: 'hot' | 'dry' | 'normal') => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
  lang: 'th' | 'en';
}

export const ControlsSidebar: React.FC<ControlsSidebarProps> = ({
  autoMode,
  setAutoMode,
  controls,
  handleToggle,
  simulationActive,
  setSimulationActive,
  controlLogs,
  triggerAnomaly,
  t,
  lang,
}) => {
  return (
    <section className="controls-sidebar">
      <span className="sidebar-title">{t('system_mode')}</span>
      <div className="sidebar-card" style={{ display: "flex", gap: "8px", padding: "6px", marginBottom: "var(--spacing-md)" }}>
        <button
          className={`action-button ${autoMode ? "" : "btn-normal"}`}
          style={{ flex: 1, padding: "8px", fontSize: "0.875rem", transition: "all 0.15s ease-out", border: autoMode ? "none" : "1px solid var(--color-border)", backgroundColor: autoMode ? "var(--color-primary)" : "transparent", color: autoMode ? "var(--color-neutral-bg)" : "var(--color-muted-ink)" }}
          onClick={() => {
            if (!autoMode) {
              setAutoMode(true);
            }
          }}
        >
          {t('auto_mode')}
        </button>
        <button
          className={`action-button ${!autoMode ? "" : "btn-normal"}`}
          style={{ flex: 1, padding: "8px", fontSize: "0.875rem", transition: "all 0.15s ease-out", border: !autoMode ? "none" : "1px solid var(--color-border)", backgroundColor: !autoMode ? "var(--color-primary)" : "transparent", color: !autoMode ? "var(--color-neutral-bg)" : "var(--color-muted-ink)" }}
          onClick={() => {
            if (autoMode) {
              setAutoMode(false);
            }
          }}
        >
          {t('manual_override')}
        </button>
      </div>

      <span className="sidebar-title">{t('controls_title')}</span>
      <div className="sidebar-card">
        {Object.entries(controls).map(([key, value]) => {
          const translateStatusText = (statusText: string) => {
            if (statusText === "Off") return t('off');
            if (statusText === "Running") return t('running');
            if (statusText === "Retracted") return lang === 'th' ? "ดึงกลับ" : "Retracted";
            if (statusText.includes("Running (Speed: Medium)")) {
              return t('running_speed', { speed: lang === 'th' ? 'ปานกลาง' : 'Medium' });
            }
            if (statusText.includes("Deployed (100%)")) {
              return t('deployed', { pct: 100 });
            }
            if (statusText.includes("ON (Full Spectrum)")) {
              return lang === 'th' ? "เปิด (Full Spectrum)" : "ON (Full Spectrum)";
            }
            if (statusText.includes("Watering Active")) {
              if (statusText.includes("(Auto)")) {
                return lang === 'th' ? "กำลังรดน้ำ (อัตโนมัติ)" : "Watering Active (Auto)";
              }
              return lang === 'th' ? "กำลังรดน้ำ" : "Watering Active";
            }
            if (statusText.includes("Off (Last run: Just now)")) {
              return lang === 'th' ? "ปิด (ทำงานล่าสุด: เมื่อครู่)" : "Off (Last run: Just now)";
            }
            return statusText;
          };

          return (
            <div className="control-item" key={key}>
              <div className="control-info">
                <span className="control-name">{t(key)}</span>
                <span className="control-status">{translateStatusText(value.statusText)}</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={value.checked}
                  onChange={() => handleToggle(key)}
                  aria-label={`Toggle ${value.name}`}
                />
                <span className="toggle-slider" />
              </label>
            </div>
          );
        })}
      </div>

      <span className="sidebar-title">{t('simulation_tools')}</span>
      <div className="sidebar-card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="control-name" style={{ fontSize: "0.875rem" }}>{t('live_telemetry')}</span>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={simulationActive}
              onChange={() => setSimulationActive(!simulationActive)}
              aria-label="Toggle simulation active"
            />
            <span className="toggle-slider" />
          </label>
        </div>
        <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <span className="control-status" style={{ marginBottom: "4px", display: "block" }}>
            {t('trigger_anomaly_states')}
          </span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <button 
              className="action-button btn-alert" 
              onClick={() => triggerAnomaly("hot")}
            >
              {t('hot_alert')}
            </button>
            <button 
              className="action-button btn-warning" 
              onClick={() => triggerAnomaly("dry")}
            >
              {t('dry_alert')}
            </button>
          </div>
          <button 
            className="action-button btn-normal" 
            style={{ width: "100%" }} 
            onClick={() => triggerAnomaly("normal")}
          >
            {t('reset_to_normal')}
          </button>
        </div>
      </div>

      <span className="sidebar-title" style={{ marginTop: "var(--spacing-md)", display: "block" }}>{t('system_logs')}</span>
      <div className="sidebar-card" style={{ maxHeight: "250px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px", padding: "12px" }}>
        {controlLogs.length === 0 ? (
          <span style={{ fontSize: "0.75rem", color: "var(--color-muted-ink)", textAlign: "center", display: "block", padding: "12px" }}>
            {lang === 'th' ? "ไม่มีประวัติการบันทึกอุปกรณ์" : "No control events recorded."}
          </span>
        ) : (
          controlLogs.map((log) => {
            const getTranslatedDevice = (dev: string) => {
              const keyMap: Record<string, string> = {
                'system': 'system',
                'water pump': 'pump',
                'grow light system': 'growLight',
                'ventilation fan': 'fan',
                'shade cloth': 'shade'
              };
              const key = keyMap[dev.toLowerCase()] || dev;
              if (key === 'system') return lang === 'th' ? 'ระบบ' : 'System';
              return t(key);
            };

            return (
              <div key={log.id} style={{ display: "flex", flexDirection: "column", gap: "2px", borderBottom: "1px solid var(--color-border)", paddingBottom: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--color-muted-ink)" }}>
                    {log.timestamp}
                  </span>
                  <span
                    className={`status-badge ${
                      log.action === "ON"
                        ? "normal"
                        : log.action === "OFF"
                        ? "alert"
                        : "warning"
                    }`}
                    style={{ fontSize: "0.625rem", padding: "2px 6px" }}
                  >
                    {log.action}
                  </span>
                </div>
                <span style={{ fontSize: "0.8125rem", fontWeight: "600", color: "var(--color-primary)" }}>
                  {getTranslatedDevice(log.device)}
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--color-muted-ink)" }}>
                  {log.trigger}
                </span>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
