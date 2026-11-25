import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const databaseUrl = process.env.NEON_DATABASE_URL;
  if (!databaseUrl) {
    return res.status(503).json({
      ok: false,
      service: 'moustapha-shop-api',
      database: 'not_configured',
      message: 'NEON_DATABASE_URL is not configured for this deployment.'
    });
  }

  try {
    const sql = neon(databaseUrl);
    const rows = await sql`SELECT current_database() AS database, now() AS checked_at`;
    return res.status(200).json({
      ok: true,
      service: 'moustapha-shop-api',
      database: 'connected',
      checked_at: rows[0].checked_at
    });
  } catch (error) {
    console.error('Neon health check failed:', error?.message || 'unknown error');
    return res.status(503).json({
      ok: false,
      service: 'moustapha-shop-api',
      database: 'unavailable'
    });
  }
}
