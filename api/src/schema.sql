-- ตาราง sensor_readings — เก็บข้อมูลเซนเซอร์จาก Raspberry Pi 5
-- Raspberry Pi อ่านค่าแล้วเขียนลงตารางนี้โดยตรง
CREATE TABLE IF NOT EXISTS sensor_readings (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  temperature    REAL NOT NULL,        -- อุณหภูมิ (°C)
  humidity       REAL NOT NULL,        -- ความชื้นอากาศ (%)
  soil_moisture  REAL NOT NULL,        -- ความชื้นดิน (%)
  light_level    REAL NOT NULL,        -- ความเข้มแสง (Lux)
  created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  -- ISO 8601 UTC timestamp — ใช้ TEXT เพราะ SQLite/D1 ไม่มี native datetime
);

-- Index สำหรับ query ย้อนหลังตาม timestamp (สำคัญสำหรับ /api/sensor-history)
CREATE INDEX IF NOT EXISTS idx_sensor_readings_created_at
  ON sensor_readings(created_at);
