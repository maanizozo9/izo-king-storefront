module.exports = async (req, res) => {
  const provider = req.query.provider === "facebook" ? "facebook" : "instagram";
  const base = "https://izo-king-storefront-ismails-projects-325f8bd1a.vercel.app";
  const redirectUri = base + "/api/meta/callback";
  const appId = process.env.META_APP_ID || "3372020299661471";
  const state = Buffer.from(JSON.stringify({ provider, redirectUri, t: Date.now() })).toString("base64url");
  res.setHeader("Set-Cookie", "meta_oauth_state=" + state + "; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600");
  if (provider === "instagram") {
    const scopes = [
      "instagram_business_basic",
      "instagram_business_content_publish"
    ].join(",");
    const url = "https://www.instagram.com/oauth/authorize?client_id=" +
      encodeURIComponent(appId) + "&redirect_uri=" + encodeURIComponent(redirectUri) +
      "&response_type=code&scope=" + encodeURIComponent(scopes) +
      "&state=" + encodeURIComponent(state);
    return res.redirect(302, url);
  }
  const scopes = [
    "pages_show_list",
    "pages_read_engagement",
    "pages_manage_posts"
  ].join(",");
  const url = "https://www.facebook.com/v23.0/dialog/oauth?client_id=" +
    encodeURIComponent(appId) + "&redirect_uri=" + encodeURIComponent(redirectUri) +
    "&response_type=code&scope=" + encodeURIComponent(scopes) +
    "&state=" + encodeURIComponent(state);
  return res.redirect(302, url);
};
