-- ข้อมูลตัวอย่าง (seed) สำหรับทดสอบ API ใน local dev
-- จำลองข้อมูลเซนเซอร์ย้อนหลัง 1 ชั่วโมง (ทุก 5 นาที = 12 records)

INSERT INTO sensor_readings (temperature, humidity, soil_moisture, light_level, created_at) VALUES
  (24.2, 65.0, 48.0, 820.0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-60 minutes')),
  (24.4, 66.0, 47.5, 830.0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-55 minutes')),
  (24.5, 66.5, 47.0, 840.0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-50 minutes')),
  (24.8, 67.0, 46.5, 850.0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-45 minutes')),
  (25.0, 67.5, 46.0, 860.0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-40 minutes')),
  (25.2, 68.0, 45.5, 870.0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-35 minutes')),
  (25.1, 68.5, 45.0, 865.0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-30 minutes')),
  (24.9, 69.0, 44.5, 855.0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-25 minutes')),
  (24.7, 68.0, 44.0, 845.0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-20 minutes')),
  (24.5, 67.5, 43.5, 840.0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-15 minutes')),
  (24.6, 67.0, 43.0, 835.0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-10 minutes')),
  (24.5, 68.0, 42.5, 850.0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-5 minutes')),
  (24.5, 68.0, 42.0, 850.0, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));
