/**
 * SmartGreenhouse API — Hono + Cloudflare D1
 *
 * 2 Endpoints:
 *   GET /api/sensor-latest    → คืนค่าเซนเซอร์ล่าสุด 1 record
 *   GET /api/sensor-history   → คืนข้อมูลย้อนหลังตามช่วงเวลา (1h, 6h, 24h)
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';

// ประเภทของ Cloudflare D1 bindings
type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// --- CORS Middleware ---
// อนุญาตให้ frontend dev server (Vite) เรียก API ได้
app.use(
  '/api/*',
  cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:4173'],
    allowMethods: ['GET'],
    allowHeaders: ['Content-Type'],
  })
);

// --- GET /api/sensor-latest ---
// คืนค่าเซนเซอร์ล่าสุด 1 record จาก D1
app.get('/api/sensor-latest', async (c) => {
  try {
    const result = await c.env.DB.prepare(
      'SELECT id, temperature, humidity, soil_moisture, light_level, created_at FROM sensor_readings ORDER BY created_at DESC LIMIT 1'
    ).first();

    // ถ้ายังไม่มีข้อมูลในตาราง
    if (!result) {
      return c.json({ success: true, data: null }, 200);
    }

    return c.json({ success: true, data: result }, 200);
  } catch (error) {
    // จับ error ทั้งหมดจาก D1 query
    const message = error instanceof Error ? error.message : 'Unknown database error';
    console.error('[sensor-latest] D1 query failed:', message);
    return c.json({ success: false, error: message }, 500);
  }
});

// --- GET /api/sensor-history?range=1h ---
// คืนข้อมูลย้อนหลังตามช่วงเวลาที่ระบุ
// รองรับ: 1h, 6h, 24h
const VALID_RANGES: Record<string, string> = {
  '1h': '-1 hours',
  '6h': '-6 hours',
  '24h': '-24 hours',
};

app.get('/api/sensor-history', async (c) => {
  const range = c.req.query('range') || '1h';

  // ตรวจสอบค่า range ที่ได้รับ
  const sqlOffset = VALID_RANGES[range];
  if (!sqlOffset) {
    return c.json(
      {
        success: false,
        error: `Invalid range "${range}". Supported values: ${Object.keys(VALID_RANGES).join(', ')}`,
      },
      400
    );
  }

  try {
    // ดึงข้อมูลย้อนหลังตาม range เรียงจากเก่า → ใหม่ (สำหรับวาดกราฟ)
    const { results } = await c.env.DB.prepare(
      `SELECT id, temperature, humidity, soil_moisture, light_level, created_at
       FROM sensor_readings
       WHERE created_at >= datetime('now', ?)
       ORDER BY created_at ASC`
    )
      .bind(sqlOffset)
      .all();

    return c.json({ success: true, data: results || [] }, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown database error';
    console.error('[sensor-history] D1 query failed:', message);
    return c.json({ success: false, error: message }, 500);
  }
});

// --- Health Check ---
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
