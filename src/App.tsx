import { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkline } from './components/Sparkline';
import { SensorCard } from './components/SensorCard';
import { SensorHistoryChart } from './components/SensorHistoryChart';
import { useAutoCapture } from './hooks/useAutoCapture';
import { useSensorData } from './hooks/useSensorData';
import { useTranslation } from './hooks/useTranslation';
import './App.css';

// SVG Icons imported from Icons component
import {
  LeafIcon,
  TempIcon,
  DropletIcon,
  SunIcon,
  AlertTriangleIcon,
} from './components/Icons';
import { useCameraStream } from './hooks/useCameraStream';
import { ControlsSidebar } from './components/ControlsSidebar';
import { DiagnosticsPanel } from './components/DiagnosticsPanel';

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
  triggerKey: string;
  triggerParams?: Record<string, string | number>;
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
  const { t, lang, changeLanguage } = useTranslation();

  // State to track daily min and max for live sensors dynamically
  const [liveDailyMinMax, setLiveDailyMinMax] = useState<Record<string, { min: number | null; max: number | null }>>({
    temp: { min: null, max: null },
    humidity: { min: null, max: null },
    moisture: { min: null, max: null },
    light: { min: null, max: null },
  });

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

  // Update liveDailyMinMax based on new live data
  useEffect(() => {
    if (dataSource === 'live' && liveSensor.data) {
      setLiveDailyMinMax((prev) => {
        const { temperature, humidity, soil_moisture, light_level } = liveSensor.data!;
        return {
          temp: {
            min: prev.temp.min === null ? temperature : Math.min(prev.temp.min, temperature),
            max: prev.temp.max === null ? temperature : Math.max(prev.temp.max, temperature),
          },
          humidity: {
            min: prev.humidity.min === null ? humidity : Math.min(prev.humidity.min, humidity),
            max: prev.humidity.max === null ? humidity : Math.max(prev.humidity.max, humidity),
          },
          moisture: {
            min: prev.moisture.min === null ? soil_moisture : Math.min(prev.moisture.min, soil_moisture),
            max: prev.moisture.max === null ? soil_moisture : Math.max(prev.moisture.max, soil_moisture),
          },
          light: {
            min: prev.light.min === null ? light_level : Math.min(prev.light.min, light_level),
            max: prev.light.max === null ? light_level : Math.max(prev.light.max, light_level),
          },
        };
      });
    }
  }, [dataSource, liveSensor.data]);

  // 4. Automated Control System States & Log Helper
  const [autoMode, setAutoMode] = useState<boolean>(true);
  const [controlLogs, setControlLogs] = useState<ControlLog[]>([
    {
      id: "init",
      timestamp: new Date().toLocaleTimeString(),
      device: "System",
      action: "MODE",
      triggerKey: "log_mode_auto"
    }
  ]);

  const logControlAction = (device: string, action: "ON" | "OFF" | "MODE", triggerKey: string, triggerParams?: Record<string, string | number>) => {
    const timestamp = new Date().toLocaleTimeString();
    const newLog: ControlLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp,
      device,
      action,
      triggerKey,
      triggerParams,
    };
    setControlLogs((prev) => [newLog, ...prev].slice(0, 10)); // Keep last 10 logs
  };

  const handleSetAutoMode = (val: boolean) => {
    setAutoMode(val);
    logControlAction("System", "MODE", val ? "log_mode_auto" : "log_mode_manual");
  };

  // 4. AI Crop Disease Diagnostics States
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  // index ของรูปที่เลือกจาก gallery เพื่อนำไป scan
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(-1);
  const [scanState, setScanState] = useState<"idle" | "scanning" | "completed">("idle");
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
  // เปิด/ปิดโหมดถ่ายอัตโนมัติ
  const [autoCaptureEnabled, setAutoCaptureEnabled] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    cameraActive,
    stream,
    videoRef,
    setVideoRef,
    isSimulated,
    startCamera,
    stopCamera,
    switchCamera
  } = useCameraStream({
    onStart: () => {
      setScanState("idle");
      setDiagnosticResult(null);
      setSelectedImageIndex(-1);
    },
    onStop: () => {
      setAutoCaptureEnabled(false);
    }
  });

  // คำนวณ capturedImage จาก gallery + selectedIndex สำหรับ backward compat
  const capturedImage = selectedImageIndex >= 0 && selectedImageIndex < capturedImages.length
    ? capturedImages[selectedImageIndex]
    : null;

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
      logControlAction("Water Pump", "ON", "auto_moisture_low", { value: moistureVal });
    } else if (moistureVal > 75 && controls.pump.checked) {
      newPumpChecked = false;
      newPumpText = "Off";
      updated = true;
      logControlAction("Water Pump", "OFF", "auto_moisture_high", { value: moistureVal });
    }

    // Grow Light automation
    if (lightVal < 300 && !controls.growLight.checked) {
      newLightChecked = true;
      newLightText = "ON (Full Spectrum)";
      updated = true;
      logControlAction("Grow Light System", "ON", "auto_light_low", { value: lightVal });
    } else if (lightVal > 1200 && controls.growLight.checked) {
      newLightChecked = false;
      newLightText = "Off";
      updated = true;
      logControlAction("Grow Light System", "OFF", "auto_light_high", { value: lightVal });
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
  }, [autoMode, sensors.moisture.value, sensors.light.value, controls.pump.checked, controls.pump.statusText, controls.growLight.checked, controls.growLight.statusText]);

  // Camera stream operations managed by useCameraStream hook

  // ถ่ายรูปจาก video stream — กล้องยังเปิดค้างอยู่ ไม่ปิด!
  const capturePhoto = useCallback(() => {
    const video = videoRef.current;

    // หากเป็นโหมดจำลอง (Simulated Mode) หรือไม่มีวิดีโอตัวจริง ให้วาดรูปใบไม้เดโม่ขึ้นมาแทน
    if (isSimulated || !video) {
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // วาดภาพพื้นหลังจำลอง
        const grad = ctx.createLinearGradient(0, 0, 0, 480);
        grad.addColorStop(0, "#065f46"); // เขียวเข้ม
        grad.addColorStop(1, "#022c22"); // เขียวมืด
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 640, 480);

        // วาดรูปใบไม้สีเขียว
        ctx.beginPath();
        ctx.moveTo(320, 400);
        ctx.quadraticCurveTo(150, 240, 320, 80);
        ctx.quadraticCurveTo(490, 240, 320, 400);
        ctx.fillStyle = "#10b981"; // Emerald green leaf
        ctx.fill();
        ctx.strokeStyle = "#047857";
        ctx.lineWidth = 4;
        ctx.stroke();

        // วาดเส้นลายใบ
        ctx.beginPath();
        ctx.moveTo(320, 400);
        ctx.lineTo(320, 80);
        ctx.strokeStyle = "#047857";
        ctx.lineWidth = 3;
        ctx.stroke();

        // กิ่งก้านใบย่อย
        for (let y = 140; y < 380; y += 40) {
          ctx.beginPath();
          ctx.moveTo(320, y);
          ctx.lineTo(320 - (y - 80) * 0.3, y - 20);
          ctx.moveTo(320, y);
          ctx.lineTo(320 + (y - 80) * 0.3, y - 20);
          ctx.stroke();
        }

        // เขียนข้อความทับลงไป
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 16px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("SIMULATED LEAF SAMPLE", 320, 440);

        const dataUrl = canvas.toDataURL("image/png");
        setCapturedImages((prev) => {
          const updated = [dataUrl, ...prev].slice(0, 10);
          return updated;
        });
        setSelectedImageIndex(0);
        setScanState("idle");
        setDiagnosticResult(null);
      }
      return;
    }

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
  }, [isSimulated]);

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
  const { remainingSeconds: autoCaptureRemaining } = useAutoCapture({
    enabled: autoCaptureEnabled,
    intervalMs: AUTO_CAPTURE_INTERVAL_MS,
    onCapture: capturePhoto,
    isCameraReady: cameraActive && !!stream,
  });



  // Mock results list for simulation
  const mockDiagnosticResults: DiagnosticResult[] = [
    {
      disease: "disease_tomato",
      confidence: 94,
      status: "alert",
      recommendations: [
        "rec_tomato_1",
        "rec_tomato_2",
        "rec_tomato_3"
      ]
    },
    {
      disease: "disease_mite",
      confidence: 86,
      status: "warning",
      recommendations: [
        "rec_mite_1",
        "rec_mite_2",
        "rec_mite_3"
      ]
    },
    {
      disease: "disease_healthy",
      confidence: 98,
      status: "normal",
      recommendations: [
        "rec_healthy_1",
        "rec_healthy_2"
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
      logControlAction(deviceName, isChecked ? "ON" : "OFF", "manual_override");
      if (modeOverridden) {
        logControlAction("System", "MODE", "log_mode_manual");
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

  // Get active sensor details dynamically based on dataSource
  const activeSensorDetails = (() => {
    if (!selectedSensor) return null;

    if (dataSource === 'demo') {
      const s = sensors[selectedSensor];
      if (!s) return null;
      
      const translatedStatusText = (() => {
        if (s.statusText === "Under Threshold") return t('under_threshold');
        if (s.statusText === "Over Threshold") return t('over_threshold');
        if (s.statusText === "Approaching Limit") return t('approaching_limit');
        return t('stable');
      })();

      return {
        name: t(s.id),
        value: s.value,
        unit: s.unit,
        dailyMin: s.dailyMin,
        dailyMax: s.dailyMax,
        status: s.status,
        statusText: translatedStatusText,
        safetyText: s.status === "normal" ? t('normal_bounds') : t('needs_attention'),
      };
    } else {
      const keyMap: Record<string, { nameKey: string; unit: string; minTh: number; maxTh: number; val: number | null }> = {
        temp: { nameKey: 'temp', unit: '°C', minTh: 18.0, maxTh: 32.0, val: liveSensor.data?.temperature ?? null },
        humidity: { nameKey: 'humidity', unit: '%', minTh: 50, maxTh: 85, val: liveSensor.data?.humidity ?? null },
        moisture: { nameKey: 'moisture', unit: '%', minTh: 35, maxTh: 75, val: liveSensor.data?.soil_moisture ?? null },
        light: { nameKey: 'light', unit: 'Lux', minTh: 300, maxTh: 1200, val: liveSensor.data?.light_level ?? null },
      };

      const info = keyMap[selectedSensor];
      if (!info) return null;

      let status: Status = 'normal';
      let statusText = t('loading');
      if (info.val !== null) {
        const resolved = determineStatus(selectedSensor, info.val, info.minTh, info.maxTh);
        status = resolved.status;
        
        const translatedStatusText = (() => {
          if (resolved.text === "Under Threshold") return t('under_threshold');
          if (resolved.text === "Over Threshold") return t('over_threshold');
          if (resolved.text === "Approaching Limit") return t('approaching_limit');
          return t('stable');
        })();
        statusText = translatedStatusText;
      }

      const liveMin = liveDailyMinMax[selectedSensor].min;
      const liveMax = liveDailyMinMax[selectedSensor].max;

      return {
        name: t(info.nameKey),
        value: info.val,
        unit: info.unit,
        dailyMin: liveMin !== null ? liveMin : '--',
        dailyMax: liveMax !== null ? liveMax : '--',
        status,
        statusText,
        safetyText: status === "normal" ? t('normal_bounds') : t('needs_attention'),
      };
    }
  })();

  const formattedControlLogs = controlLogs.map((log) => ({
    id: log.id,
    timestamp: log.timestamp,
    device: log.device,
    action: log.action,
    trigger: t(log.triggerKey, log.triggerParams),
  }));

  return (
    <div className="dashboard-container">
      {/* 1. Navbar */}
      <header className="dashboard-header">
        <div className="header-logo">
          <LeafIcon />
          <span className="logo-text">{t('smart_greenhouse')}</span>
        </div>
        <div className="header-meta">
          {/* Data Source Toggle: Demo / Live */}
          <div className="data-source-toggle">
            <button
              className={`data-source-button ${dataSource === 'demo' ? 'active' : ''}`}
              onClick={() => setDataSource('demo')}
              aria-pressed={dataSource === 'demo'}
            >
              {t('demo_mode')}
            </button>
            <button
              className={`data-source-button ${dataSource === 'live' ? 'active' : ''}`}
              onClick={() => setDataSource('live')}
              aria-pressed={dataSource === 'live'}
            >
              {t('live_mode')}
            </button>
          </div>
          {/* Language Toggle */}
          <button
            className="data-source-button language-toggle-btn"
            onClick={() => changeLanguage(lang === 'th' ? 'en' : 'th')}
            aria-label="Toggle language"
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            🌐 {lang === 'th' ? 'EN' : 'TH'}
          </button>
          <span className="refresh-label">
            {dataSource === 'live' && liveSensor.lastUpdated
              ? t('last_update', { time: liveSensor.lastUpdated.toLocaleTimeString() })
              : t('last_update', { time: lastUpdated.toLocaleTimeString() })
            }
          </span>
          <div className="system-status-indicator">
            {dataSource === 'live' ? (
              <>
                <span className={`status-dot ${liveSensor.isStale ? 'alert' : 'normal'}`} />
                <span>{liveSensor.isStale ? t('sensor_offline') : liveSensor.isLoading ? t('connecting') : t('live_data')}</span>
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
            <strong>{t('attention_required')}</strong>{" "}
            {activeAlerts.map((a) => t('out_of_bounds', { name: t(a.id), value: a.value, unit: a.unit })).join(" ")}
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
                  isSelected={selectedSensor === "temp"}
                  onClick={() => setSelectedSensor("temp")}
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
                  isSelected={selectedSensor === "humidity"}
                  onClick={() => setSelectedSensor("humidity")}
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
                  isSelected={selectedSensor === "moisture"}
                  onClick={() => setSelectedSensor("moisture")}
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
                  isSelected={selectedSensor === "light"}
                  onClick={() => setSelectedSensor("light")}
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
                      {t(sensor.id)}
                    </span>
                    <span className={`status-badge ${sensor.status}`}>
                      {(() => {
                        if (sensor.statusText === "Stable" || sensor.statusText === "Adequate") return t('stable');
                        if (sensor.statusText === "Under Threshold") return t('under_threshold');
                        if (sensor.statusText === "Over Threshold") return t('over_threshold');
                        if (sensor.statusText === "Approaching Limit") return t('approaching_limit');
                        return sensor.statusText;
                      })()}
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
                      <span>{t('min_safe')}{sensor.minThreshold}{sensor.unit}</span>
                      <span>{t('max_safe')}{sensor.maxThreshold}{sensor.unit}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Lower Detail Panel (Progressive Disclosure) */}
          {activeSensorDetails && (
            <div className="details-panel">
              <div className="details-header">
                <span className="details-title">
                  {activeSensorDetails.name} {t('detailed_analytics')}
                </span>
                <span className={`status-badge ${activeSensorDetails.status}`}>
                  {activeSensorDetails.statusText}
                </span>
              </div>
              <div className="details-grid">
                <div className="details-stat" style={{ "--i": 0 } as React.CSSProperties}>
                  <span className="stat-label">{t('daily_min')}</span>
                  <span className="stat-value">
                    {activeSensorDetails.dailyMin}
                    {activeSensorDetails.unit}
                  </span>
                </div>
                <div className="details-stat" style={{ "--i": 1 } as React.CSSProperties}>
                  <span className="stat-label">{t('daily_max')}</span>
                  <span className="stat-value">
                    {activeSensorDetails.dailyMax}
                    {activeSensorDetails.unit}
                  </span>
                </div>
                <div className="details-stat" style={{ "--i": 2 } as React.CSSProperties}>
                  <span className="stat-label">{t('safety_status')}</span>
                  <span className="stat-value" style={{ 
                    color: activeSensorDetails.status === "alert" 
                      ? "var(--color-status-alert-strong)" 
                      : activeSensorDetails.status === "warning"
                      ? "var(--color-status-warning-strong)"
                      : "var(--color-status-normal-strong)",
                    fontSize: "1.125rem",
                    fontWeight: 600
                  }}>
                    {activeSensorDetails.safetyText}
                  </span>
                </div>
              </div>
            </div>
          )}
            </>
          )}

          {/* AI Diagnostics Panel */}
          <DiagnosticsPanel
            cameraActive={cameraActive}
            setVideoRef={setVideoRef}
            isSimulated={isSimulated}
            capturedImage={capturedImage}
            capturedImages={capturedImages}
            selectedImageIndex={selectedImageIndex}
            selectCapturedImage={selectCapturedImage}
            scanState={scanState}
            diagnosticResult={diagnosticResult}
            startCamera={startCamera}
            stopCamera={stopCamera}
            switchCamera={switchCamera}
            capturePhoto={capturePhoto}
            handleImageUpload={handleImageUpload}
            fileInputRef={fileInputRef}
            autoCaptureEnabled={autoCaptureEnabled}
            setAutoCaptureEnabled={setAutoCaptureEnabled}
            autoCaptureRemaining={autoCaptureRemaining}
            runDiagnostics={runScan}
            resetDiagnostics={resetDiagnostics}
            t={t}
            lang={lang}
          />
        </section>

        <ControlsSidebar
          autoMode={autoMode}
          setAutoMode={handleSetAutoMode}
          controls={controls}
          handleToggle={(key) => handleToggle(key as any)}
          simulationActive={simulationActive}
          setSimulationActive={setSimulationActive}
          controlLogs={formattedControlLogs}
          triggerAnomaly={triggerSimulationEvent}
          t={t}
          lang={lang}
        />
      </main>
    </div>
  );
}

export default App;
