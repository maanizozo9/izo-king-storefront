/**
 * GET /api/oauth/pinterest/start
 * Redirects browser to Pinterest OAuth consent.
 * Requires: PINTEREST_CLIENT_ID, PINTEREST_REDIRECT_URI (optional, defaults to site callback)
 */
module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({ error: "method_not_allowed" }));
  }

  const clientId = process.env.PINTEREST_CLIENT_ID;
  const base = process.env.SITE_URL || "https://izo-king-studio.vercel.app";
  const redirectUri =
    process.env.PINTEREST_REDIRECT_URI ||
    base.replace(/\/$/, "") + "/api/oauth/pinterest/callback";

  if (!clientId) {
    res.statusCode = 503;
    res.setHeader("Content-Type", "application/json");
    return res.end(
      JSON.stringify({
        error: "not_configured",
        message:
          "Add PINTEREST_CLIENT_ID and PINTEREST_CLIENT_SECRET in Vercel Environment Variables.",
      })
    );
  }

  const crypto = require("crypto");
  const state = crypto.randomBytes(16).toString("hex");
  const secure = process.env.NODE_ENV === "production" || base.startsWith("https");
  res.setHeader(
    "Set-Cookie",
    `pinterest_oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600${secure ? "; Secure" : ""}`
  );

  const scope = ["boards:read", "pins:read", "pins:write", "user_accounts:read"].join(",");
  const url = new URL("https://www.pinterest.com/oauth/");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", scope);
  url.searchParams.set("state", state);

  res.statusCode = 302;
  res.setHeader("Location", url.toString());
  return res.end();
};
