import { useState, useEffect } from 'react';
import { Sparkline } from './components/Sparkline';
import './App.css';

// SVG Icons inline to avoid external dependencies and stay self-contained
const LeafIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 8.5C18 17 15 20 11 20z" />
    <path d="M19 2c-2.26 4.33-5.27 7.14-8 10" />
  </svg>
);

const TempIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
  </svg>
);

const DropletIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-11-7-11S5 10.7 5 15a7 7 0 0 0 7 7z" />
  </svg>
);

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="M4.93 4.93l1.41 1.41" />
    <path d="M17.66 17.66l1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="M6.34 17.66l-1.41 1.41" />
    <path d="M19.07 4.93l-1.41 1.41" />
  </svg>
);

const AlertTriangleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

type Status = "normal" | "warning" | "alert";

interface SensorData {
  id: string;
  name: string;
  value: number;
  unit: string;
  history: number[];
  minThreshold: number;
  maxThreshold: number;
  icon: () => React.ReactElement;
  status: Status;
  statusText: string;
  dailyMin: number;
  dailyMax: number;
}

function App() {
  // 1. Core Sensor Telemetries
  const [sensors, setSensors] = useState<Record<string, SensorData>>({
    temp: {
      id: "temp",
      name: "Temperature",
      value: 24.5,
      unit: "°C",
      history: [24.0, 24.2, 24.5, 24.4, 24.3, 24.6, 24.5, 24.7, 24.5, 24.5],
      minThreshold: 18.0,
      maxThreshold: 32.0,
      icon: TempIcon,
      status: "normal",
      statusText: "Stable",
      dailyMin: 21.2,
      dailyMax: 29.8,
    },
    humidity: {
      id: "humidity",
      name: "Humidity",
      value: 68,
      unit: "%",
      history: [65, 66, 68, 67, 69, 70, 68, 67, 68, 68],
      minThreshold: 50,
      maxThreshold: 85,
      icon: DropletIcon,
      status: "normal",
      statusText: "Stable",
      dailyMin: 58,
      dailyMax: 76,
    },
    moisture: {
      id: "moisture",
      name: "Soil Moisture",
      value: 42,
      unit: "%",
      history: [46, 45, 44, 43, 43, 42, 42, 41, 42, 42],
      minThreshold: 35,
      maxThreshold: 75,
      icon: DropletIcon,
      status: "normal",
      statusText: "Stable",
      dailyMin: 40,
      dailyMax: 65,
    },
    light: {
      id: "light",
      name: "Light Level",
      value: 850,
      unit: "Lux",
      history: [820, 830, 850, 840, 860, 870, 850, 860, 850, 850],
      minThreshold: 300,
      maxThreshold: 1200,
      icon: SunIcon,
      status: "normal",
      statusText: "Adequate",
      dailyMin: 0, // Nighttime
      dailyMax: 1150,
    },
  });

  // 2. Control Equipment States
  const [controls, setControls] = useState({
    fan: { name: "Ventilation Fan", checked: true, statusText: "Running (Speed: Medium)" },
    pump: { name: "Water Pump", checked: false, statusText: "Off (Last run: 3h ago)" },
    shade: { name: "Shade Cloth", checked: true, statusText: "Deployed (100%)" },
  });

  // 3. Selection and Simulation Toggles
  const [selectedSensor, setSelectedSensor] = useState<string>("temp");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [simulationActive, setSimulationActive] = useState<boolean>(true);

  // Status mapping logic
  const determineStatus = (id: string, val: number, minTh: number, maxTh: number): { status: Status; text: string } => {
    // Add margin rules for Warning states
    const warningBuffer = (maxTh - minTh) * 0.1; // 10% of range
    
    if (val < minTh || val > maxTh) {
      return { status: "alert", text: val < minTh ? "Under Threshold" : "Over Threshold" };
    } else if (val < minTh + warningBuffer || val > maxTh - warningBuffer) {
      return { status: "warning", text: "Approaching Limit" };
    }
    return { status: "normal", text: id === "light" ? "Adequate" : "Stable" };
  };

  // Simulating live variations
  useEffect(() => {
    if (!simulationActive) return;

    const interval = setInterval(() => {
      setSensors((prev) => {
        const updated = { ...prev };
        
        Object.keys(updated).forEach((key) => {
          const s = updated[key];
          let drift = 0;
          
          // Custom drift logic for each sensor to keep it within sensible parameters
          if (key === "temp") {
            drift = (Math.random() - 0.5) * 0.4; // Small temp fluctuations
          } else if (key === "humidity") {
            drift = (Math.random() - 0.5) * 2; // Medium humidity fluctuations
          } else if (key === "moisture") {
            // Soil moisture decreases slightly unless pump is active
            drift = controls.pump.checked ? 1.5 : -0.2;
          } else if (key === "light") {
            drift = (Math.random() - 0.5) * 30; // Brightness variations
          }

          let newValue = Number((s.value + drift).toFixed(key === "temp" ? 1 : 0));
          
          // Clamp value limits
          if (key === "temp") newValue = Math.max(10, Math.min(45, newValue));
          if (key === "humidity") newValue = Math.max(20, Math.min(100, newValue));
          if (key === "moisture") newValue = Math.max(0, Math.min(100, newValue));
          if (key === "light") newValue = Math.max(0, Math.min(2000, newValue));

          const history = [...s.history.slice(1), newValue];
          const { status, text } = determineStatus(key, newValue, s.minThreshold, s.maxThreshold);

          // Update Min/Max tracking for the day
          const dailyMin = Math.min(s.dailyMin, newValue);
          const dailyMax = Math.max(s.dailyMax, newValue);

          updated[key] = {
            ...s,
            value: newValue,
            history,
            status,
            statusText: text,
            dailyMin,
            dailyMax,
          };
        });

        return updated;
      });
      setLastUpdated(new Date());
    }, 4000);

    return () => clearInterval(interval);
  }, [simulationActive, controls.pump.checked]);

  // Overall system warning/alert rollup
  const activeAlerts = Object.values(sensors).filter((s) => s.status === "alert");
  const activeWarnings = Object.values(sensors).filter((s) => s.status === "warning");
  
  let systemStatus: Status = "normal";
  let systemStatusText = "All Systems Normal";

  if (activeAlerts.length > 0) {
    systemStatus = "alert";
    systemStatusText = `${activeAlerts.length} Critical Alert(s) Active`;
  } else if (activeWarnings.length > 0) {
    systemStatus = "warning";
    systemStatusText = "System Warnings Active";
  }

  // Toggling controls
  const handleToggle = (key: keyof typeof controls) => {
    setControls((prev) => {
      const isChecked = !prev[key].checked;
      let text = isChecked ? "Running" : "Off";
      
      if (key === "fan") {
        text = isChecked ? "Running (Speed: Medium)" : "Off";
      } else if (key === "pump") {
        text = isChecked ? "Watering Active" : "Off (Last run: Just now)";
      } else if (key === "shade") {
        text = isChecked ? "Deployed (100%)" : "Retracted";
      }

      return {
        ...prev,
        [key]: {
          ...prev[key],
          checked: isChecked,
          statusText: text,
        },
      };
    });
  };

  // Helper to manually inject testing thresholds for warnings/alerts
  const triggerSimulationEvent = (type: "normal" | "hot" | "dry") => {
    setSensors((prev) => {
      const updated = { ...prev };
      if (type === "hot") {
        // Force high temperature alert
        const val = 34.8;
        const s = updated.temp;
        updated.temp = {
          ...s,
          value: val,
          history: [...s.history.slice(1), val],
          status: "alert",
          statusText: "Over Threshold",
        };
      } else if (type === "dry") {
        // Force low soil moisture alert
        const val = 28;
        const s = updated.moisture;
        updated.moisture = {
          ...s,
          value: val,
          history: [...s.history.slice(1), val],
          status: "alert",
          statusText: "Under Threshold",
        };
      } else {
        // Return temp & moisture to safety bounds
        const tVal = 24.5;
        const mVal = 52;
        updated.temp = {
          ...updated.temp,
          value: tVal,
          history: [...updated.temp.history.slice(1), tVal],
          status: "normal",
          statusText: "Stable",
        };
        updated.moisture = {
          ...updated.moisture,
          value: mVal,
          history: [...updated.moisture.history.slice(1), mVal],
          status: "normal",
          statusText: "Stable",
        };
      }
      return updated;
    });
  };

  return (
    <div className="dashboard-container">
      {/* 1. Navbar */}
      <header className="dashboard-header">
        <div className="header-logo">
          <LeafIcon />
          <span className="logo-text">PlantSense Greenhouse</span>
        </div>
        <div className="header-meta">
          <span className="refresh-label">
            Last update: {lastUpdated.toLocaleTimeString()}
          </span>
          <div className="system-status-indicator">
            <span className={`status-dot ${systemStatus}`} />
            <span>{systemStatusText}</span>
          </div>
        </div>
      </header>

      {/* 2. Critical Alert Banner */}
      {activeAlerts.length > 0 && (
        <div className="alert-banner">
          <AlertTriangleIcon />
          <div>
            <strong>Attention Required:</strong>{" "}
            {activeAlerts.map((a) => `${a.name} is critically out of bounds (${a.value}${a.unit}).`).join(" ")}
          </div>
        </div>
      )}

      {/* 3. Main Dashboard Grid Layout */}
      <main className="dashboard-layout">
        {/* Left Side: Telemetries */}
        <section className="dashboard-main">
          <div className="sensor-grid">
            {Object.values(sensors).map((sensor) => {
              const Icon = sensor.icon;
              const isSelected = selectedSensor === sensor.id;
              return (
                <div
                  key={sensor.id}
                  className={`sensor-card ${isSelected ? "selected" : ""}`}
                  onClick={() => setSelectedSensor(sensor.id)}
                  style={isSelected ? { borderColor: "var(--color-primary)", borderWidth: "1.5px" } : {}}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setSelectedSensor(sensor.id)}
                >
                  <div className="card-header">
                    <span className="sensor-title">
                      <Icon />
                      {sensor.name}
                    </span>
                    <span className={`status-badge ${sensor.status}`}>
                      {sensor.statusText}
                    </span>
                  </div>
                  <div className="sensor-value-container">
                    <span key={sensor.value} className="sensor-value value-update-pulse">{sensor.value}</span>
                    <span className="sensor-unit">{sensor.unit}</span>
                  </div>
                  <div className="sensor-footer">
                    <div className="sparkline-container">
                      <Sparkline
                        data={sensor.history}
                        strokeColor={
                          sensor.status === "alert"
                            ? "var(--color-status-alert)"
                            : sensor.status === "warning"
                            ? "var(--color-status-warning)"
                            : "var(--color-status-normal)"
                        }
                        fillColor={
                          sensor.status === "alert"
                            ? "rgba(239, 68, 68, 0.02)"
                            : sensor.status === "warning"
                            ? "rgba(245, 158, 11, 0.02)"
                            : "rgba(16, 185, 129, 0.02)"
                        }
                      />
                    </div>
                    <div className="sensor-limits">
                      <span>Min Safe: {sensor.minThreshold}{sensor.unit}</span>
                      <span>Max Safe: {sensor.maxThreshold}{sensor.unit}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Lower Detail Panel (Progressive Disclosure) */}
          {selectedSensor && sensors[selectedSensor] && (
            <div className="details-panel">
              <div className="details-header">
                <span className="details-title">
                  {sensors[selectedSensor].name} Detailed Analytics
                </span>
                <span className={`status-badge ${sensors[selectedSensor].status}`}>
                  {sensors[selectedSensor].statusText}
                </span>
              </div>
              <div className="details-grid">
                <div className="details-stat" style={{ "--i": 0 } as React.CSSProperties}>
                  <span className="stat-label">Daily Minimum</span>
                  <span className="stat-value">
                    {sensors[selectedSensor].dailyMin}
                    {sensors[selectedSensor].unit}
                  </span>
                </div>
                <div className="details-stat" style={{ "--i": 1 } as React.CSSProperties}>
                  <span className="stat-label">Daily Maximum</span>
                  <span className="stat-value">
                    {sensors[selectedSensor].dailyMax}
                    {sensors[selectedSensor].unit}
                  </span>
                </div>
                <div className="details-stat" style={{ "--i": 2 } as React.CSSProperties}>
                  <span className="stat-label">Safety Status</span>
                  <span className="stat-value" style={{ 
                    color: sensors[selectedSensor].status === "alert" 
                      ? "var(--color-status-alert)" 
                      : sensors[selectedSensor].status === "warning"
                      ? "var(--color-status-warning)"
                      : "var(--color-status-normal)",
                    fontSize: "1.125rem",
                    fontWeight: 600
                  }}>
                    {sensors[selectedSensor].status === "normal" ? "Normal Bounds" : "Needs Attention"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Right Side: Device Controls & System Actions */}
        <section className="controls-sidebar">
          <span className="sidebar-title">Greenhouse Controls</span>
          <div className="sidebar-card">
            {Object.entries(controls).map(([key, value]) => (
              <div className="control-item" key={key}>
                <div className="control-info">
                  <span className="control-name">{value.name}</span>
                  <span className="control-status">{value.statusText}</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={value.checked}
                    onChange={() => handleToggle(key as keyof typeof controls)}
                    aria-label={`Toggle ${value.name}`}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>
            ))}
          </div>

          <span className="sidebar-title">Simulation Tools</span>
          <div className="sidebar-card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="control-name" style={{ fontSize: "0.875rem" }}>Live Telemetry</span>
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
                Trigger Anomaly States for Review:
              </span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <button 
                  className="action-button" 
                  style={{ backgroundColor: "#fee2e2", color: "#991b1b" }} 
                  onClick={() => triggerSimulationEvent("hot")}
                >
                  Hot Alert
                </button>
                <button 
                  className="action-button" 
                  style={{ backgroundColor: "#fef3c7", color: "#92400e" }} 
                  onClick={() => triggerSimulationEvent("dry")}
                >
                  Dry Alert
                </button>
              </div>
              <button 
                className="action-button" 
                style={{ width: "100%", backgroundColor: "#e0f2fe", color: "#0369a1" }} 
                onClick={() => triggerSimulationEvent("normal")}
              >
                Reset to Normal
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
