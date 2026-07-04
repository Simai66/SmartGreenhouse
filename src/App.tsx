import { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkline } from './components/Sparkline';
import { SensorCard } from './components/SensorCard';
import { SensorHistoryChart } from './components/SensorHistoryChart';
import { useAutoCapture } from './hooks/useAutoCapture';
import { useSensorData } from './hooks/useSensorData';
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

// ไอคอนสลับกล้อง (หน้า/หลัง)
const RefreshCwIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

// ไอคอนปิด (X)
const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ไอคอนนาฬิกา/จับเวลา สำหรับ Auto Capture
const TimerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l2 2" />
    <path d="M5 3L2 6" />
    <path d="M22 6l-3-3" />
    <line x1="12" y1="1" x2="12" y2="3" />
  </svg>
);

type Status = "normal" | "warning" | "alert";

interface DiagnosticResult {
  disease: string;
  confidence: number;
  status: Status;
  recommendations: string[];
}

interface ControlLog {
  id: string;
  timestamp: string;
  device: string;
  action: "ON" | "OFF" | "MODE";
  trigger: string;
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
    pump: { name: "Water Pump", checked: false, statusText: "Off" },
    growLight: { name: "Grow Light System", checked: false, statusText: "Off" },
    shade: { name: "Shade Cloth", checked: true, statusText: "Deployed (100%)" },
  });

  // 3. Selection and Simulation Toggles
  const [selectedSensor, setSelectedSensor] = useState<string>("temp");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [simulationActive, setSimulationActive] = useState<boolean>(true);

  // --- โหมดแหล่งข้อมูล: Demo (mock) หรือ Live (D1 API) ---
  const [dataSource, setDataSource] = useState<'demo' | 'live'>('demo');

  // --- Custom Hook: ดึงข้อมูลเซนเซอร์จาก API (ทำงานเฉพาะโหมด Live) ---
  const liveSensor = useSensorData({ enabled: dataSource === 'live' });

  // 4. Automated Control System States & Log Helper
  const [autoMode, setAutoMode] = useState<boolean>(true);
  const [controlLogs, setControlLogs] = useState<ControlLog[]>([
    {
      id: "init",
      timestamp: new Date().toLocaleTimeString(),
      device: "System",
      action: "MODE",
      trigger: "System Initialized in Auto Mode"
    }
  ]);

  const logControlAction = (device: string, action: "ON" | "OFF" | "MODE", trigger: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const newLog: ControlLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp,
      device,
      action,
      trigger
    };
    setControlLogs((prev) => [newLog, ...prev].slice(0, 10)); // Keep last 10 logs
  };

  // 4. AI Crop Disease Diagnostics States
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  // เปลี่ยนจากเก็บรูปเดียวเป็น gallery array — รองรับถ่ายต่อเนื่อง
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  // index ของรูปที่เลือกจาก gallery เพื่อนำไป scan
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(-1);
  const [scanState, setScanState] = useState<"idle" | "scanning" | "completed">("idle");
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  // สลับกล้องหน้า/หลัง
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  // เปิด/ปิดโหมดถ่ายอัตโนมัติ
  const [autoCaptureEnabled, setAutoCaptureEnabled] = useState<boolean>(false);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // คำนวณ capturedImage จาก gallery + selectedIndex สำหรับ backward compat
  const capturedImage = selectedImageIndex >= 0 && selectedImageIndex < capturedImages.length
    ? capturedImages[selectedImageIndex]
    : null;

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

  // Automated Control Logic Trigger
  useEffect(() => {
    if (!autoMode) return;

    const moistureVal = sensors.moisture.value;
    const lightVal = sensors.light.value;

    let updated = false;
    let newPumpChecked = controls.pump.checked;
    let newPumpText = controls.pump.statusText;
    let newLightChecked = controls.growLight.checked;
    let newLightText = controls.growLight.statusText;

    // Water Pump automation
    if (moistureVal < 35 && !controls.pump.checked) {
      newPumpChecked = true;
      newPumpText = "Watering Active (Auto)";
      updated = true;
      logControlAction("Water Pump", "ON", `Auto: Moisture ${moistureVal}% < 35%`);
    } else if (moistureVal > 75 && controls.pump.checked) {
      newPumpChecked = false;
      newPumpText = "Off";
      updated = true;
      logControlAction("Water Pump", "OFF", `Auto: Moisture ${moistureVal}% > 75%`);
    }

    // Grow Light automation
    if (lightVal < 300 && !controls.growLight.checked) {
      newLightChecked = true;
      newLightText = "ON (Full Spectrum)";
      updated = true;
      logControlAction("Grow Light System", "ON", `Auto: Light ${lightVal} Lux < 300 Lux`);
    } else if (lightVal > 1200 && controls.growLight.checked) {
      newLightChecked = false;
      newLightText = "Off";
      updated = true;
      logControlAction("Grow Light System", "OFF", `Auto: Light ${lightVal} Lux > 1200 Lux`);
    }

    if (updated) {
      setControls((prev) => ({
        ...prev,
        pump: {
          ...prev.pump,
          checked: newPumpChecked,
          statusText: newPumpText,
        },
        growLight: {
          ...prev.growLight,
          checked: newLightChecked,
          statusText: newLightText,
        }
      }));
    }
  }, [autoMode, sensors.moisture.value, sensors.light.value, controls.pump.checked, controls.growLight.checked]);

  // เปิดกล้อง — ใช้ facingMode ปัจจุบัน
  const startCamera = async (requestedFacingMode?: "user" | "environment") => {
    const mode = requestedFacingMode || facingMode;
    // รีเซ็ตเฉพาะ scan state ไม่ลบ gallery
    setScanState("idle");
    setDiagnosticResult(null);
    setSelectedImageIndex(-1);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode }
      });
      setStream(mediaStream);
      setCameraActive(true);
    } catch (err) {
      console.error("Camera access error:", err);
      alert("Cannot access camera. Please upload an image file instead.");
    }
  };

  // ปิดกล้อง — ปิด stream + reset state
  const stopCamera = () => {
    // ปิด auto capture ด้วยเมื่อปิดกล้อง
    setAutoCaptureEnabled(false);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setCameraActive(false);
  };

  // สลับกล้องหน้า/หลัง — ปิด stream เก่า แล้วเปิดใหม่ด้วย facingMode ตรงข้าม
  const switchCamera = async () => {
    const newMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newMode);
    // ปิด stream เก่า
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    // เปิดใหม่ด้วย facingMode ใหม่
    await startCamera(newMode);
  };

  // ถ่ายรูปจาก video stream — กล้องยังเปิดค้างอยู่ ไม่ปิด!
  const capturePhoto = useCallback(() => {
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
        // เก็บรูปเข้า gallery (สูงสุด 10 รูป, ลบรูปเก่าสุดออก)
        setCapturedImages((prev) => {
          const updated = [dataUrl, ...prev].slice(0, 10);
          return updated;
        });
        // เลือกรูปล่าสุดเป็นตัวที่ active
        setSelectedImageIndex(0);
        // รีเซ็ต scan state สำหรับรูปใหม่
        setScanState("idle");
        setDiagnosticResult(null);
        // *** ไม่เรียก stopCamera() — กล้องเปิดค้าง ถ่ายต่อได้เลย ***
      }
    }
  }, []);

  // เลือกรูปจาก gallery เพื่อนำไป scan
  const selectCapturedImage = (index: number) => {
    setSelectedImageIndex(index);
    setScanState("idle");
    setDiagnosticResult(null);
  };

  // อัปโหลดรูปจากไฟล์ — เก็บเข้า gallery เหมือนถ่ายรูป
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const dataUrl = event.target.result as string;
          setCapturedImages((prev) => [dataUrl, ...prev].slice(0, 10));
          setSelectedImageIndex(0);
          setScanState("idle");
          setDiagnosticResult(null);
          stopCamera();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // ใช้ useAutoCapture hook — ถ่ายรูปอัตโนมัติทุก 60 นาที
  // สำหรับ dev/testing: เปลี่ยนเป็น 10 * 1000 (10 วินาที) ได้
  const AUTO_CAPTURE_INTERVAL_MS = 60 * 60 * 1000; // 60 นาที
  const { remainingSeconds: autoCaptureRemaining, isActive: autoCaptureActive } = useAutoCapture({
    enabled: autoCaptureEnabled,
    intervalMs: AUTO_CAPTURE_INTERVAL_MS,
    onCapture: capturePhoto,
    isCameraReady: cameraActive && !!stream,
  });

  // จัดรูปแบบ countdown เป็น MM:SS
  const formatCountdown = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

  // รีเซ็ต diagnostic panel — ลบ gallery ทั้งหมด + ปิดกล้อง
  const resetDiagnostics = () => {
    setCapturedImages([]);
    setSelectedImageIndex(-1);
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
            // Light level drifts down naturally unless grow light system is active
            drift = controls.growLight.checked 
              ? 120 
              : -20 + (Math.random() - 0.5) * 10;
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
  }, [simulationActive, controls.pump.checked, controls.growLight.checked]);

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
    let modeOverridden = false;
    if (autoMode) {
      setAutoMode(false);
      modeOverridden = true;
    }

    setControls((prev) => {
      const isChecked = !prev[key].checked;
      let text = isChecked ? "Running" : "Off";
      
      if (key === "fan") {
        text = isChecked ? "Running (Speed: Medium)" : "Off";
      } else if (key === "pump") {
        text = isChecked ? "Watering Active" : "Off (Last run: Just now)";
      } else if (key === "growLight") {
        text = isChecked ? "ON (Full Spectrum)" : "Off";
      } else if (key === "shade") {
        text = isChecked ? "Deployed (100%)" : "Retracted";
      }

      // Log actions
      const deviceName = prev[key].name;
      logControlAction(deviceName, isChecked ? "ON" : "OFF", "Manual Override");
      if (modeOverridden) {
        logControlAction("System", "MODE", "Switched to Manual Mode (Override)");
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
          {/* Data Source Toggle: Demo / Live */}
          <div className="data-source-toggle">
            <button
              className={`data-source-button ${dataSource === 'demo' ? 'active' : ''}`}
              onClick={() => setDataSource('demo')}
              aria-pressed={dataSource === 'demo'}
            >
              🎭 Demo
            </button>
            <button
              className={`data-source-button ${dataSource === 'live' ? 'active' : ''}`}
              onClick={() => setDataSource('live')}
              aria-pressed={dataSource === 'live'}
            >
              📡 Live
            </button>
          </div>
          <span className="refresh-label">
            {dataSource === 'live' && liveSensor.lastUpdated
              ? `Last update: ${liveSensor.lastUpdated.toLocaleTimeString()}`
              : `Last update: ${lastUpdated.toLocaleTimeString()}`
            }
          </span>
          <div className="system-status-indicator">
            {dataSource === 'live' ? (
              <>
                <span className={`status-dot ${liveSensor.isStale ? 'alert' : 'normal'}`} />
                <span>{liveSensor.isStale ? 'Sensor Offline' : liveSensor.isLoading ? 'Connecting...' : 'Live Data'}</span>
              </>
            ) : (
              <>
                <span className={`status-dot ${systemStatus}`} />
                <span>{systemStatusText}</span>
              </>
            )}
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
          {/* === โหมด Live: แสดง SensorCard จาก D1 API === */}
          {dataSource === 'live' ? (
            <>
              <div className="sensor-grid">
                <SensorCard
                  label="Temperature"
                  value={liveSensor.data?.temperature ?? null}
                  unit="°C"
                  icon={<TempIcon />}
                  isLoading={liveSensor.isLoading}
                  error={liveSensor.error}
                  isStale={liveSensor.isStale}
                  secondsSinceUpdate={liveSensor.secondsSinceUpdate}
                />
                <SensorCard
                  label="Humidity"
                  value={liveSensor.data?.humidity ?? null}
                  unit="%"
                  icon={<DropletIcon />}
                  isLoading={liveSensor.isLoading}
                  error={liveSensor.error}
                  isStale={liveSensor.isStale}
                  secondsSinceUpdate={liveSensor.secondsSinceUpdate}
                />
                <SensorCard
                  label="Soil Moisture"
                  value={liveSensor.data?.soil_moisture ?? null}
                  unit="%"
                  icon={<DropletIcon />}
                  isLoading={liveSensor.isLoading}
                  error={liveSensor.error}
                  isStale={liveSensor.isStale}
                  secondsSinceUpdate={liveSensor.secondsSinceUpdate}
                />
                <SensorCard
                  label="Light Level"
                  value={liveSensor.data?.light_level ?? null}
                  unit="Lux"
                  icon={<SunIcon />}
                  isLoading={liveSensor.isLoading}
                  error={liveSensor.error}
                  isStale={liveSensor.isStale}
                  secondsSinceUpdate={liveSensor.secondsSinceUpdate}
                />
              </div>

              {/* กราฟย้อนหลัง — แสดงเฉพาะโหมด Live */}
              <SensorHistoryChart enabled={dataSource === 'live'} />
            </>
          ) : (
            /* === โหมด Demo: แสดง mock sensor cards เดิม === */
            <>
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
            </>
          )}

          {/* AI Diagnostics Panel */}
          <div className="diagnostics-panel" style={{ marginTop: "var(--spacing-lg)" }}>
            <div className="card-header">
              <span className="details-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <LeafIcon />
                AI Crop Disease Diagnostics
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {/* Auto Capture Toggle */}
                <div className="auto-capture-toggle">
                  <TimerIcon />
                  <span className="control-name" style={{ fontSize: "0.8125rem" }}>Auto Capture</span>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={autoCaptureEnabled}
                      onChange={() => {
                        if (!autoCaptureEnabled && !cameraActive) {
                          // ถ้ายังไม่เปิดกล้อง → แจ้งเตือน
                          alert("Please start the camera first before enabling Auto Capture.");
                          return;
                        }
                        setAutoCaptureEnabled(!autoCaptureEnabled);
                      }}
                      aria-label="Toggle auto capture"
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>
                <span className="status-badge normal">AI-Powered</span>
              </div>
            </div>

            {/* Auto Capture Countdown Bar */}
            {autoCaptureActive && (
              <div className="auto-capture-bar">
                <TimerIcon />
                <span className="auto-capture-label">Next capture in</span>
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
                      <button className="action-button" onClick={() => startCamera()} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <CameraIcon /> Start Camera
                      </button>
                      <button className="action-button" onClick={() => fileInputRef.current?.click()} style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-primary)" }}>
                        <UploadIcon /> Upload Photo
                      </button>
                    </>
                  )}

                  {/* กล้องเปิดอยู่ → แสดงปุ่มถ่าย + สลับกล้อง + ปิดกล้อง */}
                  {cameraActive && (
                    <>
                      <button className="action-button" onClick={capturePhoto} style={{ backgroundColor: "var(--color-status-normal)", display: "flex", alignItems: "center", gap: "6px" }}>
                        <CameraIcon /> Capture
                      </button>
                      <button className="action-button" onClick={switchCamera} style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-primary)" }}>
                        <RefreshCwIcon /> Switch Camera
                      </button>
                      <button className="action-button" onClick={stopCamera} style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-status-alert)" }}>
                        <XIcon /> Close
                      </button>
                    </>
                  )}

                  {/* กล้องปิดอยู่ + มีรูปใน gallery → แสดงปุ่มเปิดกล้อง + อัปโหลด + ล้าง */}
                  {!cameraActive && capturedImages.length > 0 && (
                    <>
                      <button className="action-button" onClick={() => startCamera()} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <CameraIcon /> Start Camera
                      </button>
                      <button className="action-button" onClick={() => fileInputRef.current?.click()} style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-primary)" }}>
                        <UploadIcon /> Upload
                      </button>
                    </>
                  )}

                  {/* รูปที่เลือกอยู่ + ไม่ได้กำลัง scan → แสดงปุ่ม scan + ล้าง */}
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
          <span className="sidebar-title">System Mode</span>
          <div className="sidebar-card" style={{ display: "flex", gap: "8px", padding: "6px", marginBottom: "var(--spacing-md)" }}>
            <button
              className={`action-button ${autoMode ? "" : "btn-normal"}`}
              style={{ flex: 1, padding: "8px", fontSize: "0.875rem", transition: "all 0.15s ease-out", border: autoMode ? "none" : "1px solid var(--color-border)", backgroundColor: autoMode ? "var(--color-primary)" : "transparent", color: autoMode ? "var(--color-neutral-bg)" : "var(--color-muted-ink)" }}
              onClick={() => {
                if (!autoMode) {
                  setAutoMode(true);
                  logControlAction("System", "MODE", "Switch to Auto Mode");
                }
              }}
            >
              Auto Mode
            </button>
            <button
              className={`action-button ${!autoMode ? "" : "btn-normal"}`}
              style={{ flex: 1, padding: "8px", fontSize: "0.875rem", transition: "all 0.15s ease-out", border: !autoMode ? "none" : "1px solid var(--color-border)", backgroundColor: !autoMode ? "var(--color-primary)" : "transparent", color: !autoMode ? "var(--color-neutral-bg)" : "var(--color-muted-ink)" }}
              onClick={() => {
                if (autoMode) {
                  setAutoMode(false);
                  logControlAction("System", "MODE", "Switch to Manual Mode");
                }
              }}
            >
              Manual Mode
            </button>
          </div>

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

          <span className="sidebar-title" style={{ marginTop: "var(--spacing-md)", display: "block" }}>Control History Logs</span>
          <div className="sidebar-card" style={{ maxHeight: "250px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px", padding: "12px" }}>
            {controlLogs.length === 0 ? (
              <span style={{ fontSize: "0.75rem", color: "var(--color-muted-ink)", textAlign: "center", display: "block", padding: "12px" }}>
                No control events recorded.
              </span>
            ) : (
              controlLogs.map((log) => (
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
                    {log.device}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--color-muted-ink)" }}>
                    {log.trigger}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
