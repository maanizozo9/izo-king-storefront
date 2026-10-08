const crypto = require("crypto");
const catalog = require("./product-files");
const { sendBuyerEmail, buildDeliveryEmail } = require("./send-mail");

function readBody(req) {
  return new Promise(function (resolve, reject) {
    if (req.body && typeof req.body === "object") {
      resolve(req.body);
      return;
    }
    let data = "";
    req.on("data", function (c) {
      data += c;
    });
    req.on("end", function () {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

module.exports = async function (req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: "POST only" }));
    return;
  }

  try {
    const payload = await readBody(req);
    const apiKey = (process.env.PAYHIP_API_KEY || "").trim();

    if (apiKey) {
      const expected = crypto.createHash("sha256").update(apiKey).digest("hex");
      if (payload.signature && payload.signature !== expected) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Invalid signature" }));
        return;
      }
    }

    if (payload.type && payload.type !== "paid") {
      res.statusCode = 200;
      res.end(JSON.stringify({ ok: true, skipped: payload.type }));
      return;
    }

    const email = payload.email || payload.customer_email;
    if (!email) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: "No buyer email" }));
      return;
    }

    const products = [];
    const items = payload.items || [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const key = it.product_key || "";
      let file = catalog.byKey[key] || null;
      if (!file) file = catalog.matchName(it.product_name);
      if (file) products.push(file);
    }
    if (!products.length) {
      products.push({
        name: "IZO-KING product folder",
        url: catalog.folder,
      });
    }

    const mail = buildDeliveryEmail(email, products, payload.id);
    const result = await sendBuyerEmail(mail);

    res.statusCode = 200;
    res.end(
      JSON.stringify({
        ok: true,
        emailed: email,
        products: products.map(function (p) {
          return p.name;
        }),
        mail: result,
      })
    );
  } catch (e) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: String(e && e.message ? e.message : e) }));
  }
};
