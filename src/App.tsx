import { useState, useEffect, useRef } from 'react';
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

const CameraIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const UploadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

type Status = "normal" | "warning" | "alert";

interface DiagnosticResult {
  disease: string;
  confidence: number;
  status: Status;
  recommendations: string[];
}

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

  // 4. AI Crop Disease Diagnostics States
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [scanState, setScanState] = useState<"idle" | "scanning" | "completed">("idle");
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-mount video stream when camera active
  useEffect(() => {
    if (cameraActive && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [cameraActive, stream]);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Start webcam video stream
  const startCamera = async () => {
    setCapturedImage(null);
    setScanState("idle");
    setDiagnosticResult(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      setStream(mediaStream);
      setCameraActive(true);
    } catch (err) {
      console.error("Camera access error:", err);
      alert("Cannot access camera. Please upload an image file instead.");
    }
  };

  // Stop webcam video stream
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setCameraActive(false);
  };

  // Capture frame from video stream
  const capturePhoto = () => {
    const video = videoRef.current;
    if (video) {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Draw mirrored preview
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/png");
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  // Handle uploaded image file
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCapturedImage(event.target.result as string);
          setScanState("idle");
          setDiagnosticResult(null);
          stopCamera();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Mock results list for simulation
  const mockDiagnosticResults: DiagnosticResult[] = [
    {
      disease: "Tomato Leaf Mold (Passalora fulva)",
      confidence: 94,
      status: "alert",
      recommendations: [
        "Increase ventilation fan speed (Turn Ventilation Fan ON).",
        "Apply organic copper-based fungicide to infected leaves.",
        "Avoid overhead irrigation to keep foliage dry."
      ]
    },
    {
      disease: "Spider Mite Infestation (Tetranychidae)",
      confidence: 86,
      status: "warning",
      recommendations: [
        "Spray lower leaf surfaces with neem oil or insecticidal soap.",
        "Introduce predatory mites (biological control agent).",
        "Prune and safely destroy heavily infested leaves."
      ]
    },
    {
      disease: "Healthy Leaf - No Pathology Detected",
      confidence: 98,
      status: "normal",
      recommendations: [
        "Continue maintaining current telemetry safety ranges.",
        "Prune lower branches occasionally to maintain optimal airflow."
      ]
    }
  ];

  // Run mock scanner scan
  const runScan = () => {
    if (!capturedImage) return;
    setScanState("scanning");
    setDiagnosticResult(null);

    // Scan lasts 2.5 seconds
    setTimeout(() => {
      setScanState("completed");
      const randomIdx = Math.floor(Math.random() * mockDiagnosticResults.length);
      setDiagnosticResult(mockDiagnosticResults[randomIdx]);
    }, 2500);
  };

  // Reset diagnostic panel
  const resetDiagnostics = () => {
    setCapturedImage(null);
    setScanState("idle");
    setDiagnosticResult(null);
    stopCamera();
  };

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
                            ? "var(--color-status-alert-strong)"
                            : sensor.status === "warning"
                            ? "var(--color-status-warning-strong)"
                            : "var(--color-status-normal-strong)"
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
                      ? "var(--color-status-alert-strong)" 
                      : sensors[selectedSensor].status === "warning"
                      ? "var(--color-status-warning-strong)"
                      : "var(--color-status-normal-strong)",
                    fontSize: "1.125rem",
                    fontWeight: 600
                  }}>
                    {sensors[selectedSensor].status === "normal" ? "Normal Bounds" : "Needs Attention"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* AI Diagnostics Panel */}
          <div className="diagnostics-panel" style={{ marginTop: "var(--spacing-lg)" }}>
            <div className="card-header">
              <span className="details-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <LeafIcon />
                AI Crop Disease Diagnostics
              </span>
              <span className="status-badge normal">AI-Powered</span>
            </div>
            
            <div className="diagnostics-layout">
              {/* Left Column: Viewport */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div className="camera-viewport">
                  {cameraActive ? (
                    <video
                      id="camera-stream"
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="camera-video"
                    />
                  ) : capturedImage ? (
                    <img src={capturedImage} alt="Captured leaf" className="captured-image" />
                  ) : (
                    <div className="viewport-placeholder">
                      <CameraIcon />
                      <span style={{ fontSize: "0.875rem" }}>No image active</span>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-muted-ink)" }}>
                        Start camera or upload a leaf image file
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

                <div className="camera-actions">
                  {!cameraActive && !capturedImage && (
                    <>
                      <button className="action-button" onClick={startCamera} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <CameraIcon /> Start Camera
                      </button>
                      <button className="action-button" onClick={() => fileInputRef.current?.click()} style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-primary)" }}>
                        <UploadIcon /> Upload Photo
                      </button>
                    </>
                  )}

                  {cameraActive && (
                    <>
                      <button className="action-button" onClick={capturePhoto} style={{ backgroundColor: "var(--color-status-normal)" }}>
                        Capture Photo
                      </button>
                      <button className="action-button" onClick={stopCamera} style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-primary)" }}>
                        Cancel
                      </button>
                    </>
                  )}

                  {capturedImage && scanState !== "scanning" && (
                    <>
                      {scanState === "idle" && (
                        <button className="action-button" onClick={runScan} style={{ backgroundColor: "var(--color-status-normal)" }}>
                          Run Diagnostics
                        </button>
                      )}
                      <button className="action-button btn-alert" onClick={resetDiagnostics} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <TrashIcon /> Clear / Reset
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
                    <span style={{ fontSize: "0.875rem", display: "block", marginBottom: "8px" }}>Image ready for analysis</span>
                    <button className="action-button" onClick={runScan} style={{ width: "100%", maxWidth: "200px", margin: "0 auto" }}>
                      Scan Leaf
                    </button>
                  </div>
                )}

                {scanState === "scanning" && (
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    <span className="value-update-pulse" style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--color-status-normal)", display: "block", marginBottom: "8px" }}>
                      Scanning Leaf Tissue...
                    </span>
                    <span style={{ fontSize: "0.875rem", color: "var(--color-muted-ink)" }}>
                      AI is identifying cell pathologies and symptoms
                    </span>
                  </div>
                )}

                {scanState === "completed" && diagnosticResult && (
                  <div className="diagnostics-results">
                    <div className="results-header">
                      <span className="results-title">Diagnostic Result</span>
                      <span className={`status-badge ${diagnosticResult.status}`}>
                        {diagnosticResult.status === "normal" ? "Healthy" : "Infected"}
                      </span>
                    </div>
                    <div>
                      <strong style={{ fontSize: "1.125rem", color: "var(--color-primary)", display: "block" }}>
                        {diagnosticResult.disease}
                      </strong>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                        <span style={{ fontSize: "0.875rem", color: "var(--color-muted-ink)" }}>
                          Confidence:
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
                        Recommended Action Plan:
                      </span>
                      <ul className="recommendations-list">
                        {diagnosticResult.recommendations.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {scanState === "idle" && !capturedImage && (
                  <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--color-muted-ink)" }}>
                    <LeafIcon />
                    <p style={{ fontSize: "0.875rem", marginTop: "12px" }}>
                      Select a leaf image to test disease diagnostic capabilities
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
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
                  className="action-button btn-alert" 
                  onClick={() => triggerSimulationEvent("hot")}
                >
                  Hot Alert
                </button>
                <button 
                  className="action-button btn-warning" 
                  onClick={() => triggerSimulationEvent("dry")}
                >
                  Dry Alert
                </button>
              </div>
              <button 
                className="action-button btn-normal" 
                style={{ width: "100%" }} 
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
