/**
 * GET /api/oauth/pinterest/status
 * Returns connection status without exposing tokens.
 */
module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");

  const clientConfigured = !!(
    process.env.PINTEREST_CLIENT_ID && process.env.PINTEREST_CLIENT_SECRET
  );
  const mode = (process.env.MARKETING_MODE || "test").toLowerCase();

  if (!clientConfigured) {
    res.statusCode = 200;
    return res.end(
      JSON.stringify({
        platform: "pinterest",
        configured: false,
        connected: false,
        mode,
        message: "Add PINTEREST_CLIENT_ID and PINTEREST_CLIENT_SECRET in Vercel.",
      })
    );
  }

  const session = readSession(req);
  const connected = !!(session && session.access_token);
  let username = null;
  if (connected) {
    try {
      const me = await fetch("https://api.pinterest.com/v5/user_account", {
        headers: { Authorization: "Bearer " + session.access_token },
      });
      if (me.ok) {
        const j = await me.json();
        username = j.username || j.business_name || null;
      }
    } catch (e) {}
  }

  res.statusCode = 200;
  return res.end(
    JSON.stringify({
      platform: "pinterest",
      configured: true,
      connected,
      username,
      mode,
      productionEnabled: mode === "production",
    })
  );
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
