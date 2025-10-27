import { pool } from '../db/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { cacheGetJson, cacheSetJson, cacheDel } from '../utils/cache.js';
import { emitAirportsUpdated } from '../utils/realtime.js';

const AIRPORTS_CACHE_KEY = 'airports:list';
const AIRPORTS_CACHE_TTL = 60 * 60; // 1 hour

export const listAirports = asyncHandler(async (req, res) => {
  const { q, limit = 50 } = req.query;
  // Only cache the full list (no search query)
  if (!q) {
    const cached = await cacheGetJson(`${AIRPORTS_CACHE_KEY}:${limit}`);
    if (cached) return res.json(new ApiResponse(200, cached));
  }

  const conn = await pool.getConnection();
  try {
    let sql = `SELECT airport_code, city, country FROM airports`;
    const params = [];
    if (q && q.trim()) {
      sql += ` WHERE airport_code LIKE ? OR city LIKE ? OR country LIKE ?`;
      const like = `%${q.trim()}%`;
      params.push(like, like, like);
    }
    sql += ` ORDER BY city ASC LIMIT ?`;
    params.push(Number(limit));
    const [rows] = await conn.query(sql, params);
    if (!q) {
      await cacheSetJson(`${AIRPORTS_CACHE_KEY}:${limit}`, rows, AIRPORTS_CACHE_TTL);
    }
    return res.json(new ApiResponse(200, rows));
  } finally {
    conn.release();
  }
});

// Helper to invalidate airports cache and notify clients
export const invalidateAirportsCacheAndBroadcast = async () => {
  await cacheDel(`${AIRPORTS_CACHE_KEY}:50`);
  await cacheDel(`${AIRPORTS_CACHE_KEY}:100`);
  await cacheDel(`${AIRPORTS_CACHE_KEY}:200`);
  emitAirportsUpdated();
};


