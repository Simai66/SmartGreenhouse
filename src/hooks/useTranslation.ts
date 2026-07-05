import { useState, useEffect } from 'react';

export type Language = 'th' | 'en';

let currentLanguage: Language = 'th';
const listeners = new Set<() => void>();

export const translations: Record<Language, Record<string, string>> = {
  th: {
    // Navbar & Global
    smart_greenhouse: "ระบบโรงเรือนอัจฉริยะ",
    data_source: "แหล่งข้อมูล:",
    demo_mode: "🎭 เดโม่",
    live_mode: "📡 ไลฟ์",
    last_update: "อัปเดตล่าสุดเมื่อ: {time}",
    sensor_offline: "เซนเซอร์ออฟไลน์",
    connecting: "กำลังเชื่อมต่อ...",
    live_data: "ข้อมูลไลฟ์",
    attention_required: "ความสนใจด่วน:",
    out_of_bounds: "{name} อยู่นอกช่วงปลอดภัย ({value}{unit})",
    normal_bounds: "ปกติ",
    needs_attention: "ต้องได้รับการดูแล",
    min_safe: "ขั้นต่ำปลอดภัย: ",
    max_safe: "สูงสุดปลอดภัย: ",
    stable: "เสถียร",
    all_systems_normal: "ระบบทั้งหมดทำงานปกติ",
    critical_alerts_active: "มีสัญญาณเตือนวิกฤต {count} รายการ",
    system_warnings_active: "มีสัญญาณเตือนระบบ",
    under_threshold: "ต่ำกว่าเกณฑ์",
    over_threshold: "สูงกว่าเกณฑ์",
    approaching_limit: "เข้าใกล้ขีดจำกัด",
    daily_min: "ค่าต่ำสุดวันนี้",
    daily_max: "ค่าสูงสุดวันนี้",
    safety_status: "สถานะความปลอดภัย",
    detailed_analytics: "บทวิเคราะห์โดยละเอียด",

    // Telemetries / Sensors
    temp: "อุณหภูมิอากาศ",
    humidity: "ความชื้นในอากาศ",
    moisture: "ความชื้นในดิน",
    light: "ความเข้มแสง",

    // Sensor Card States
    time_seconds_ago: "{seconds} วินาทีที่แล้ว",
    time_minutes_ago: "{minutes} นาทีที่แล้ว",
    time_hours_ago: "{hours} ชั่วโมงที่แล้ว",
    loading: "กำลังโหลด...",
    cannot_connect: "ไม่สามารถเชื่อมต่อ",
    no_data: "ไม่มีข้อมูล",
    reconnecting: "⚠ กำลังลองเชื่อมต่อใหม่...",
    live: "LIVE",
    offline: "OFFLINE",
    update_last: "อัปเดตล่าสุดเมื่อ {time}",
    wait_data: "รอข้อมูล...",

    // Controls
    system_mode: "โหมดทำงานของระบบ",
    controls_title: "แผงควบคุมอุปกรณ์",
    auto_mode: "โหมดอัตโนมัติ",
    manual_override: "ควบคุมด้วยตนเอง",
    fan: "พัดลมระบายอากาศ",
    pump: "ปั๊มน้ำ",
    growLight: "ระบบไฟช่วยโต",
    shade: "ตาข่ายพรางแสง",
    running_speed: "กำลังทำงาน (ความเร็ว: {speed})",
    running: "กำลังทำงาน",
    off: "ปิด",
    deployed: "กางออก ({pct}%)",

    // Logs
    system_logs: "บันทึกการทำงานของระบบ",
    log_time: "เวลา",
    log_device: "อุปกรณ์",
    log_action: "การทำงาน",
    log_trigger: "สาเหตุ / ตัวกระตุ้น",
    log_mode_auto: "ระบบเริ่มทำงานในโหมดอัตโนมัติ",
    log_mode_manual: "ระบบเปลี่ยนเป็นโหมดควบคุมด้วยตนเอง",
    auto_moisture_low: "อัตโนมัติ: ความชื้นในดิน {value}% < 35%",
    auto_moisture_high: "อัตโนมัติ: ความชื้นในดิน {value}% > 75%",
    auto_light_low: "อัตโนมัติ: ความเข้มแสง {value} Lux < 300 Lux",
    auto_light_high: "อัตโนมัติ: ความเข้มแสง {value} Lux > 1200 Lux",

    // AI Diagnostics
    ai_diagnostics: "ระบบวิเคราะห์โรคพืชด้วย AI",
    auto_capture: "ถ่ายภาพอัตโนมัติ",
    auto_capture_alert: "กรุณาเปิดกล้องก่อนใช้งานระบบถ่ายภาพอัตโนมัติ",
    next_capture: "ถ่ายภาพถัดไปใน",
    ai_powered: "ขับเคลื่อนด้วย AI",
    no_image_active: "ไม่มีภาพที่ใช้งานอยู่",
    start_camera_or_upload: "เปิดกล้องหรืออัปโหลดภาพใบพืชเพื่อวิเคราะห์",
    capture_button: "ถ่ายภาพ",
    close_button: "ปิด",
    clear_reset: "ล้างข้อมูล / รีเซ็ต",
    camera_start: "เปิดกล้อง",
    camera_stop: "ปิดกล้อง",
    switch_camera: "สลับกล้อง",
    upload_image: "อัปโหลดภาพ",
    no_images_captured: "ยังไม่มีภาพที่ถ่ายหรืออัปโหลด",
    select_image_scan: "เลือกภาพจากแกลเลอรีด้านบนเพื่อกดวิเคราะห์โรคพืช",
    analyze_button: "วิเคราะห์ด้วย AI",
    image_ready: "ภาพพร้อมสำหรับการวิเคราะห์",
    scan_leaf_btn: "วิเคราะห์ใบพืช",
    analyzing_button: "กำลังวิเคราะห์...",
    scan_step_upload: "อัปโหลดภาพถ่าย",
    scan_step_prep: "เตรียมภาพเข้าระบบ AI",
    scan_step_extract: "สกัดคุณลักษณะเด่นของภาพ",
    scan_step_classify: "ประเมินผลด้วย Deep Learning",
    diagnostic_result: "ผลการวินิจฉัยโรคพืช",
    confidence_level: "ระดับความมั่นใจ",
    disease_status: "สถานะ",
    status_healthy: "ปกติ / สุขภาพดี",
    status_infected: "ติดโรคพืช",
    recommendations: "คำแนะนำในการดูแลรักษา",
    scan_start_first: "กรุณาเริ่มการใช้งานกล้องถ่ายภาพก่อน",
    diagnose_select_img: "กรุณาเลือกหรือถ่ายภาพก่อนทำการวินิจฉัย",

    // Chart
    chart_title: "📊 กราฟข้อมูลย้อนหลัง",
    hour_1: "1 ชั่วโมง",
    hour_6: "6 ชั่วโมง",
    hour_24: "24 ชั่วโมง",
    chart_stale_warning: "⚠ ไม่สามารถอัปเดตข้อมูลได้ — แสดงข้อมูลล่าสุดที่มี",
    chart_empty: "ไม่มีข้อมูลในช่วงเวลาที่เลือก",
    chart_try_again: "ลองใหม่",
    chart_error_load: "ไม่สามารถโหลดข้อมูลย้อนหลังได้",
    chart_temp: "อุณหภูมิ (°C)",
    chart_humidity: "ความชื้น (%)",
    chart_moisture: "ความชื้นดิน (%)",
    chart_light: "แสง (Lux)",

    // Simulation
    simulation_tools: "เครื่องมือจำลองสถานการณ์",
    live_telemetry: "จำลองข้อมูลเซนเซอร์",
    trigger_anomaly_states: "จำลองสถานะผิดปกติเพื่อตรวจสอบ:",
    hot_alert: "เตือนอุณหภูมิสูง",
    dry_alert: "เตือนดินแห้ง",
    reset_to_normal: "รีเซ็ตเป็นสถานะปกติ",

    // Mock Disease Diagnostics
    disease_tomato: "โรคราใบไหม้ในมะเขือเทศ (Passalora fulva)",
    rec_tomato_1: "เพิ่มความเร็วพัดลมระบายอากาศ (เปิดพัดลมระบายอากาศ ON)",
    rec_tomato_2: "ใช้สารเคมีกำจัดเชื้อรากลุ่มทองแดงกับใบที่ติดเชื้อ",
    rec_tomato_3: "หลีกเลี่ยงการรดน้ำเหนือหัวเพื่อไม่ให้ใบเปียก",
    disease_mite: "การระบาดของไรแดง (Tetranychidae)",
    rec_mite_1: "ฉีดพ่นใต้ใบด้วยน้ำมันสะเดาหรือสบู่กำจัดแมลง",
    rec_mite_2: "ปล่อยไรตัวห้ำ (การควบคุมทางชีวภาพ)",
    rec_mite_3: "ตัดแต่งและทำลายใบที่ติดโรคอย่างปลอดภัย",
    disease_healthy: "ใบพืชสุขภาพดี - ไม่พบอาการโรคพืช",
    rec_healthy_1: "รักษาระดับความปลอดภัยของสัญญาณเซนเซอร์ต่าง ๆ อย่างต่อเนื่อง",
    rec_healthy_2: "ตัดแต่งกิ่งล่างเป็นครั้งคราวเพื่อให้ลมไหลเวียนได้ดี",
    simulated_feed: "กล้องจำลอง",
  },
  en: {
    // Navbar & Global
    smart_greenhouse: "Smart Greenhouse",
    data_source: "Data Source:",
    demo_mode: "🎭 Demo",
    live_mode: "📡 Live",
    last_update: "Last update: {time}",
    sensor_offline: "Sensor Offline",
    connecting: "Connecting...",
    live_data: "Live Data",
    attention_required: "Attention Required:",
    out_of_bounds: "{name} is critically out of bounds ({value}{unit})",
    normal_bounds: "Normal Bounds",
    needs_attention: "Needs Attention",
    min_safe: "Min Safe: ",
    max_safe: "Max Safe: ",
    stable: "Stable",
    all_systems_normal: "All Systems Normal",
    critical_alerts_active: "{count} Critical Alert(s) Active",
    system_warnings_active: "System Warnings Active",
    under_threshold: "Under Threshold",
    over_threshold: "Over Threshold",
    approaching_limit: "Approaching Limit",
    daily_min: "Daily Minimum",
    daily_max: "Daily Maximum",
    safety_status: "Safety Status",
    detailed_analytics: "Detailed Analytics",

    // Telemetries / Sensors
    temp: "Temperature",
    humidity: "Humidity",
    moisture: "Soil Moisture",
    light: "Light Level",

    // Sensor Card States
    time_seconds_ago: "{seconds}s ago",
    time_minutes_ago: "{minutes}m ago",
    time_hours_ago: "{hours}h ago",
    loading: "Loading...",
    cannot_connect: "Cannot connect",
    no_data: "No data",
    reconnecting: "⚠ Reconnecting...",
    live: "LIVE",
    offline: "OFFLINE",
    update_last: "Last updated {time}",
    wait_data: "Awaiting data...",

    // Controls
    system_mode: "System Mode",
    controls_title: "Equipment Control Center",
    auto_mode: "Auto Mode",
    manual_override: "Manual Override",
    fan: "Ventilation Fan",
    pump: "Water Pump",
    growLight: "Grow Light System",
    shade: "Shade Cloth",
    running_speed: "Running (Speed: {speed})",
    running: "Running",
    off: "Off",
    deployed: "Deployed ({pct}%)",

    // Logs
    system_logs: "System Activity Logs",
    log_time: "Time",
    log_device: "Device",
    log_action: "Action",
    log_trigger: "Trigger / Condition",
    log_mode_auto: "System initialized in Auto Mode",
    log_mode_manual: "System shifted to Manual Override",
    auto_moisture_low: "Auto: Soil Moisture {value}% < 35%",
    auto_moisture_high: "Auto: Soil Moisture {value}% > 75%",
    auto_light_low: "Auto: Light Level {value} Lux < 300 Lux",
    auto_light_high: "Auto: Light Level {value} Lux > 1200 Lux",

    // AI Diagnostics
    ai_diagnostics: "AI Crop Disease Diagnostics",
    auto_capture: "Auto Capture",
    auto_capture_alert: "Please start the camera first before enabling Auto Capture.",
    next_capture: "Next capture in",
    ai_powered: "AI-Powered",
    no_image_active: "No image active",
    start_camera_or_upload: "Start camera or upload a leaf image file",
    capture_button: "Capture",
    close_button: "Close",
    clear_reset: "Clear / Reset",
    camera_start: "Start Camera",
    camera_stop: "Stop Camera",
    switch_camera: "Switch Camera",
    upload_image: "Upload Image",
    no_images_captured: "No images captured or uploaded yet",
    select_image_scan: "Select an image from the gallery above to analyze",
    analyze_button: "Analyze Image",
    image_ready: "Image ready for analysis",
    scan_leaf_btn: "Scan Leaf",
    analyzing_button: "Analyzing...",
    scan_step_upload: "Uploading capture",
    scan_step_prep: "Preprocessing image matrix",
    scan_step_extract: "Extracting feature maps",
    scan_step_classify: "Deep learning classification",
    diagnostic_result: "Diagnostic Report",
    confidence_level: "Confidence Level",
    disease_status: "Disease Severity",
    status_healthy: "Healthy",
    status_infected: "Infected",
    recommendations: "Treatment Recommendations",
    scan_start_first: "Please start the camera stream first",
    diagnose_select_img: "Please select or snap an image to scan",

    // Chart
    chart_title: "📊 Historical Analytics",
    hour_1: "1 Hour",
    hour_6: "6 Hours",
    hour_24: "24 Hours",
    chart_stale_warning: "⚠ Failed to refresh data — showing cached history",
    chart_empty: "No historical records found for this range",
    chart_try_again: "Retry",
    chart_error_load: "Unable to retrieve historical chart data",
    chart_temp: "Temperature (°C)",
    chart_humidity: "Humidity (%)",
    chart_moisture: "Soil Moisture (%)",
    chart_light: "Light (Lux)",

    // Simulation
    simulation_tools: "Simulation Tools",
    live_telemetry: "Live Telemetry",
    trigger_anomaly_states: "Trigger Anomaly States for Review:",
    hot_alert: "Hot Alert",
    dry_alert: "Dry Alert",
    reset_to_normal: "Reset to Normal",

    // Mock Disease Diagnostics
    disease_tomato: "Tomato Leaf Mold (Passalora fulva)",
    rec_tomato_1: "Increase ventilation fan speed (Turn Ventilation Fan ON).",
    rec_tomato_2: "Apply organic copper-based fungicide to infected leaves.",
    rec_tomato_3: "Avoid overhead irrigation to keep foliage dry.",
    disease_mite: "Spider Mite Infestation (Tetranychidae)",
    rec_mite_1: "Spray lower leaf surfaces with neem oil or insecticidal soap.",
    rec_mite_2: "Introduce predatory mites (biological control agent).",
    rec_mite_3: "Prune and safely destroy heavily infested leaves.",
    disease_healthy: "Healthy Leaf - No Pathology Detected",
    rec_healthy_1: "Continue maintaining current telemetry safety ranges.",
    rec_healthy_2: "Prune lower branches occasionally to maintain optimal airflow.",
    simulated_feed: "Simulated Feed",
  }
};

export function t(key: string, replacements?: Record<string, string | number>): string {
  const langDict = translations[currentLanguage];
  let text = langDict[key] || key;
  if (replacements) {
    Object.entries(replacements).forEach(([k, v]) => {
      text = text.split(`{${k}}`).join(String(v));
    });
  }
  return text;
}

export function useTranslation() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const update = () => setTick(t => t + 1);
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);

  const changeLanguage = (lang: Language) => {
    currentLanguage = lang;
    listeners.forEach(listener => listener());
  };

  return {
    t,
    lang: currentLanguage,
    changeLanguage,
  };
}
