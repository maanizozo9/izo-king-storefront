/**
 * GET /api/oauth/pinterest/callback
 * Exchanges code for tokens and stores access_token in HttpOnly cookie.
 */
module.exports = async function handler(req, res) {
  const base = process.env.SITE_URL || "https://izo-king-studio.vercel.app";
  const studio = base.replace(/\/$/, "") + "/marketing-studio";

  function redirectErr(msg) {
    res.statusCode = 302;
    res.setHeader("Location", studio + "?pinterest=error&msg=" + encodeURIComponent(msg));
    return res.end();
  }

  try {
    const url = new URL(req.url, base);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const err = url.searchParams.get("error");
    if (err) return redirectErr(err);
    if (!code) return redirectErr("missing_code");

    const cookies = parseCookies(req.headers.cookie || "");
    if (!state || state !== cookies.pinterest_oauth_state) {
      return redirectErr("invalid_state");
    }

    const clientId = process.env.PINTEREST_CLIENT_ID;
    const clientSecret = process.env.PINTEREST_CLIENT_SECRET;
    const redirectUri =
      process.env.PINTEREST_REDIRECT_URI ||
      base.replace(/\/$/, "") + "/api/oauth/pinterest/callback";

    if (!clientId || !clientSecret) return redirectErr("not_configured");

    const basic = Buffer.from(clientId + ":" + clientSecret).toString("base64");
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    });

    const tokenRes = await fetch("https://api.pinterest.com/v5/oauth/token", {
      method: "POST",
      headers: {
        Authorization: "Basic " + basic,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });
    const tokenJson = await tokenRes.json().catch(() => ({}));
    if (!tokenRes.ok || !tokenJson.access_token) {
      return redirectErr(
        (tokenJson && (tokenJson.message || tokenJson.error)) || "token_exchange_failed"
      );
    }

    const payload = {
      access_token: tokenJson.access_token,
      refresh_token: tokenJson.refresh_token || null,
      expires_at: Date.now() + (Number(tokenJson.expires_in) || 2592000) * 1000,
      scope: tokenJson.scope || "",
    };

    const encrypted = seal(JSON.stringify(payload));
    const secure = base.startsWith("https");
    const maxAge = 60 * 60 * 24 * 30;
    const cookieParts = [
      "pinterest_session=" + encodeURIComponent(encrypted),
      "Path=/",
      "HttpOnly",
      "SameSite=Lax",
      "Max-Age=" + maxAge,
    ];
    if (secure) cookieParts.push("Secure");

    res.statusCode = 302;
    res.setHeader("Set-Cookie", [
      cookieParts.join("; "),
      "pinterest_oauth_state=; Path=/; HttpOnly; Max-Age=0",
    ]);
    res.setHeader("Location", studio + "?pinterest=connected");
    return res.end();
  } catch (e) {
    return redirectErr("callback_exception");
  }
};

function parseCookies(header) {
  const out = {};
  header.split(";").forEach(function (part) {
    const i = part.indexOf("=");
    if (i === -1) return;
    out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  });
  return out;
}

function seal(plain) {
  const crypto = require("crypto");
  const key = deriveKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64url");
}

function deriveKey() {
  const crypto = require("crypto");
  const secret =
    process.env.TOKEN_ENCRYPTION_KEY ||
    process.env.PINTEREST_CLIENT_SECRET ||
    "dev-only-change-me";
  return crypto.createHash("sha256").update(secret).digest();
}
