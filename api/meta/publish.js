module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({error:"POST only"});
  const token = process.env.META_PAGE_ACCESS_TOKEN || process.env.META_IG_ACCESS_TOKEN;
  if (!token) return res.status(503).json({error:"Meta access token is not configured."});
  const { platform, image_url, caption, page_id, instagram_user_id } = req.body || {};
  if (!platform || !image_url || !caption) return res.status(400).json({error:"platform, image_url and caption are required"});
  try {
    if (platform === "instagram") {
      if (!instagram_user_id) return res.status(400).json({error:"instagram_user_id is required"});
      const create = await fetch("https://graph.facebook.com/v23.0/" + encodeURIComponent(instagram_user_id) + "/media", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({image_url, caption, access_token:token})
      });
      const c = await create.json();
      if (!create.ok || !c.id) return res.status(400).json(c);
      const publish = await fetch("https://graph.facebook.com/v23.0/" + encodeURIComponent(instagram_user_id) + "/media_publish", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({creation_id:c.id, access_token:token})
      });
      const p = await publish.json();
      return res.status(publish.ok ? 200 : 400).json(p);
    }
    if (platform === "facebook") {
      if (!page_id) return res.status(400).json({error:"page_id is required"});
      const r = await fetch("https://graph.facebook.com/v23.0/" + encodeURIComponent(page_id) + "/photos", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({url:image_url, caption, access_token:token})
      });
      const data = await r.json();
      return res.status(r.ok ? 200 : 400).json(data);
    }
    return res.status(400).json({error:"Unsupported platform"});
  } catch (e) { return res.status(500).json({error:String(e.message || e)}); }
};
