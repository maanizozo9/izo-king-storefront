/**
 * POST /api/oauth/pinterest/disconnect
 */
module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  if (req.method !== "POST") {
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: "method_not_allowed" }));
  }
  res.setHeader(
    "Set-Cookie",
    "pinterest_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure"
  );
  res.statusCode = 200;
  return res.end(JSON.stringify({ ok: true, connected: false }));
};
