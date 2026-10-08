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
        try {
          const params = new URLSearchParams(data);
          const o = {};
          params.forEach(function (v, k) {
            o[k] = v;
          });
          resolve(o);
        } catch (e2) {
          reject(e);
        }
      }
    });
    req.on("error", reject);
  });
}

module.exports = async function (req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: "POST only" }));
    return;
  }

  try {
    const body = await readBody(req);
    const admin = (process.env.DELIVERY_ADMIN_SECRET || "").trim();
    const code = (process.env.DELIVERY_CLAIM_CODE || "").trim();
    const auth = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    const provided = body.secret || body.code || auth;

    const okAdmin = admin && provided === admin;
    const okClaim = code && provided === code;
    if (!okAdmin && !okClaim) {
      res.statusCode = 401;
      res.end(
        JSON.stringify({
          error: "Unauthorized — use DELIVERY_CLAIM_CODE or admin secret",
        })
      );
      return;
    }

    const email = String(body.email || "").trim();
    if (!email || email.indexOf("@") < 1) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: "Valid email required" }));
      return;
    }

    const slug = String(body.product || body.slug || "").trim();
    let products = [];
    if (slug === "all" && okAdmin) {
      products = Object.keys(catalog.bySlug).map(function (k) {
        return catalog.bySlug[k];
      });
    } else if (catalog.bySlug[slug]) {
      products = [catalog.bySlug[slug]];
    } else if (catalog.byKey[slug]) {
      products = [catalog.byKey[slug]];
    } else if (body.product_name) {
      const m = catalog.matchName(body.product_name);
      if (m) products = [m];
    }

    if (!products.length) {
      products = [{ name: "IZO-KING product folder", url: catalog.folder }];
    }

    const mail = buildDeliveryEmail(email, products, body.order || "claim");
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
