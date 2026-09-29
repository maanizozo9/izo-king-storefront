/**
 * GET /api/oauth/pinterest/boards
 */
module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");

  const session = readSession(req);
  if (!session || !session.access_token) {
    res.statusCode = 401;
    return res.end(JSON.stringify({ error: "not_connected" }));
  }

  try {
    const r = await fetch("https://api.pinterest.com/v5/boards?page_size=50", {
      headers: { Authorization: "Bearer " + session.access_token },
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      res.statusCode = r.status;
      return res.end(JSON.stringify({ error: "boards_failed", detail: j }));
    }
    const items = (j.items || []).map(function (b) {
      return { id: b.id, name: b.name, privacy: b.privacy };
    });
    res.statusCode = 200;
    return res.end(JSON.stringify({ boards: items }));
  } catch (e) {
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: "boards_exception" }));
  }
};

function readSession(req) {
  try {
    const cookies = {};
    (req.headers.cookie || "").split(";").forEach(function (part) {
      const i = part.indexOf("=");
      if (i === -1) return;
      cookies[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
    });
    const raw = cookies.pinterest_session;
    if (!raw) return null;
    return JSON.parse(unseal(raw));
  } catch (e) {
    return null;
  }
}

function unseal(b64) {
  const crypto = require("crypto");
  const buf = Buffer.from(b64, "base64url");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const data = buf.subarray(28);
  const secret =
    process.env.TOKEN_ENCRYPTION_KEY ||
    process.env.PINTEREST_CLIENT_SECRET ||
    "dev-only-change-me";
  const key = crypto.createHash("sha256").update(secret).digest();
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}
