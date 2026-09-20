module.exports = async (req, res) => {
  const code = req.query.code;
  const state = req.query.state;
  const cookie = req.headers.cookie || "";
  if (!code || !state) return res.status(400).send("Missing OAuth code or state.");
  if (!cookie.includes("meta_oauth_state=" + state)) return res.status(400).send("OAuth state validation failed.");
  const decoded = JSON.parse(Buffer.from(state, "base64url").toString());
  const provider = decoded.provider;
  const redirectUri = decoded.redirectUri;
  const appId = process.env.META_APP_ID || "3372020299661471";
  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret) return res.status(500).send("META_APP_SECRET is not configured in Vercel.");
  try {
    let token;
    if (provider === "instagram") {
      const body = new URLSearchParams({
        client_id: appId,
        client_secret: appSecret,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        code
      });
      const r = await fetch("https://api.instagram.com/oauth/access_token", { method:"POST", headers:{"Content-Type":"application/x-www-form-urlencoded"}, body });
      const data = await r.json();
      if (!r.ok) throw new Error(JSON.stringify(data));
      token = data.access_token;
      const longR = await fetch("https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=" + encodeURIComponent(appSecret) + "&access_token=" + encodeURIComponent(token));
      const longData = await longR.json();
      if (longR.ok && longData.access_token) token = longData.access_token;
    } else {
      const u = "https://graph.facebook.com/v23.0/oauth/access_token?client_id=" +
        encodeURIComponent(appId) + "&client_secret=" + encodeURIComponent(appSecret) +
        "&redirect_uri=" + encodeURIComponent(redirectUri) + "&code=" + encodeURIComponent(code);
      const r = await fetch(u);
      const data = await r.json();
      if (!r.ok) throw new Error(JSON.stringify(data));
      token = data.access_token;
    }
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end("<!doctype html><html><body style='font-family:system-ui;max-width:680px;margin:50px auto;padding:20px'><h1>IZO-KING Meta connection completed</h1><p>Authorization succeeded.</p><p>The secure token was received by the server and was not displayed here.</p><p>Next step: add the returned token to the Vercel environment as the appropriate Meta token variable, then publishing can be enabled.</p></body></html>");
  } catch (e) {
    res.status(500).send("Meta OAuth error: " + String(e.message || e));
  }
};
