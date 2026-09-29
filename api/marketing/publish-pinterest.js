/**
 * POST /api/marketing/publish-pinterest
 * Body JSON: { board_id, title, description, link, image_url }
 * Live publish only when MARKETING_MODE=production and session connected.
 */
module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: "method_not_allowed" }));
  }

  const mode = (process.env.MARKETING_MODE || "test").toLowerCase();
  if (mode !== "production") {
    res.statusCode = 403;
    return res.end(
      JSON.stringify({
        error: "test_mode",
        message:
          "Live Pinterest publish is blocked. Set MARKETING_MODE=production in Vercel after connecting Pinterest.",
      })
    );
  }

  const session = readSession(req);
  if (!session || !session.access_token) {
    res.statusCode = 401;
    return res.end(JSON.stringify({ error: "not_connected" }));
  }

  let body = {};
  try {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
  } catch (e) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ error: "invalid_json" }));
  }

  const boardId = String(body.board_id || "").trim();
  const title = String(body.title || "").trim().slice(0, 100);
  const description = String(body.description || "").trim().slice(0, 500);
  const link = String(body.link || "").trim();
  const imageUrl = String(body.image_url || "").trim();

  if (!boardId) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ error: "board_id_required" }));
  }
  if (!imageUrl || !/^https:\/\//i.test(imageUrl)) {
    res.statusCode = 400;
    return res.end(
      JSON.stringify({
        error: "image_url_required",
        message: "Pinterest requires a public https image URL for the pin.",
      })
    );
  }

  const pinBody = {
    board_id: boardId,
    title: title || undefined,
    description: description || undefined,
    link: link || undefined,
    media_source: {
      source_type: "image_url",
      url: imageUrl,
    },
  };

  try {
    const r = await fetch("https://api.pinterest.com/v5/pins", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + session.access_token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pinBody),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      res.statusCode = r.status >= 400 && r.status < 600 ? r.status : 502;
      return res.end(JSON.stringify({ error: "pinterest_api", detail: j }));
    }
    res.statusCode = 200;
    return res.end(
      JSON.stringify({
        ok: true,
        pin_id: j.id || null,
        pin: j,
      })
    );
  } catch (e) {
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: "publish_exception" }));
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
