/**
 * SignalPilot public-page scan — Vercel serverless
 * Fetches public HTML only. Blocks private IPs. Hard timeout.
 * No secrets. No storage of response beyond the request.
 */
const BLOCKED = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|0\.0\.0\.0|::1|169\.254\.)/i;

function isBlockedHost(hostname) {
  if (!hostname) return true;
  if (BLOCKED.test(hostname)) return true;
  if (hostname.endsWith('.local') || hostname.endsWith('.internal')) return true;
  return false;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { return res.status(400).json({ error: 'Invalid JSON' }); }
  }
  const url = (body && body.url) || '';
  let parsed;
  try {
    parsed = new URL(url);
  } catch (e) {
    return res.status(400).json({ error: 'Invalid URL' });
  }
  if (!/^https?:$/.test(parsed.protocol)) {
    return res.status(400).json({ error: 'Only http(s)' });
  }
  if (isBlockedHost(parsed.hostname)) {
    return res.status(400).json({ error: 'Host not allowed' });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const r = await fetch(parsed.href, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'SignalPilotBot/1.0 (+https://izo-king-studio.vercel.app/signalpilot.html; public research)',
        'Accept': 'text/html,application/xhtml+xml'
      }
    });
    clearTimeout(timer);
    if (!r.ok) {
      return res.status(200).json({ error: 'Upstream status ' + r.status, html: '' });
    }
    const ct = (r.headers.get('content-type') || '').toLowerCase();
    if (!ct.includes('text/html') && !ct.includes('application/xhtml')) {
      return res.status(200).json({ error: 'Not HTML', html: '' });
    }
    let html = await r.text();
    if (html.length > 400000) html = html.slice(0, 400000);
    return res.status(200).json({
      ok: true,
      finalUrl: r.url,
      html
    });
  } catch (e) {
    clearTimeout(timer);
    const msg = e.name === 'AbortError' ? 'Timeout' : (e.message || 'Fetch failed');
    return res.status(200).json({ error: msg, html: '' });
  }
};
