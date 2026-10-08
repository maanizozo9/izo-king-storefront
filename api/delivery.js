const crypto = require("crypto");

const FOLDER = "https://drive.google.com/drive/folders/1Ntk-SgaNDTvhB0slhXXl0aVqZT65loHp";
const BY_SLUG = {
  "freelancer-crm": { name: "Freelancer CRM & Invoice Tracker", url: "https://docs.google.com/spreadsheets/d/1_0zrFWIQUJaanPyzfyCWBZ6LtqxNVIL3eRPl7kHABBw/edit" },
  "study-start": { name: "The Study Start", url: "https://docs.google.com/spreadsheets/d/1L8CGdGcV4828zHh7FlvLGm4CJv6tkFZu_zsFYRigx5s/edit" },
  "clear-start": { name: "The Clear Start", url: "https://docs.google.com/spreadsheets/d/1-ZVL4E_8ZgY2RJxiO4WWXA5GndyiyJgBIBu6EDRjcx4/edit" },
  "morning-routine": { name: "ADHD Morning Routine", url: "https://docs.google.com/spreadsheets/d/179kibBTBkcWOJBtMGyz8QZoZWImfJu51eE5NtegTj4E/edit" },
  "productivity-pack": { name: "Small Business Productivity Pack", url: "https://docs.google.com/spreadsheets/d/1hGLK6aAjkxO2EPfdJZEgpm1a9hAo-9gKIQTUcasFICE/edit" },
  "finance-tracker": { name: "Small Business Finance Tracker", url: "https://docs.google.com/spreadsheets/d/1ifdqJL5Yg-h0klfeYO0Eo9RJIGnz-J4UBL2pWzdW2vc/edit" },
  "gentle-reset": { name: "The Gentle Reset", url: "https://docs.google.com/spreadsheets/d/1lPEeDkIFU2PtLTojqrbpfz1Rg1rs9pT7nQf2ciS5534/edit" },
  "proposal-scope": { name: "Freelance Proposal & Scope Kit", url: "https://docs.google.com/spreadsheets/d/1cAWdUGSExUVyB7Cd8aV8kc6PXQMe3iCDc_a0wt2TQ7I/edit" },
  "anti-scope": { name: "Anti-Scope Creep Scripts", url: "https://docs.google.com/spreadsheets/d/12mXs-b57-KLOfhJZSfnqk_qbO09fXtPJFBCmeoEwkrw/edit" },
  "freedom-ledger": { name: "The Freedom Ledger", url: "https://docs.google.com/spreadsheets/d/19rBZcE9TUmWphX0s5HHXJR9nqP7PoEyOH1ykI48eORs/edit" },
  "cash-flow-13": { name: "13-Week Cash Flow", url: "https://docs.google.com/spreadsheets/d/1hyJfUppSIL7tWxsOsIMYd5Am3GuMEvN9OkXcXkjtuf0/edit" },
  "offer-test-7": { name: "7-Day Offer Test Checklist", url: "https://docs.google.com/spreadsheets/d/1JrxAOVo2eMCfFKMiefGBqgcRZ9Si_0qXgq2Hj48Rvkc/edit" },
};
const BY_KEY = {
  "32piI": BY_SLUG["cash-flow-13"],
  t2BdM: BY_SLUG["cash-flow-13"],
  Rb0r4: BY_SLUG["anti-scope"],
  "97sDY": BY_SLUG["freedom-ledger"],
  H8O7j: BY_SLUG["offer-test-7"],
  WEnSg: BY_SLUG["productivity-pack"],
};

function matchName(name) {
  var n = String(name || "").toLowerCase();
  var rules = [
    [/freelancer.*crm|invoice tracker/, "freelancer-crm"],
    [/study start|exam.*revision/, "study-start"],
    [/clear start|daily.*weekly/, "clear-start"],
    [/morning routine/, "morning-routine"],
    [/productivity pack/, "productivity-pack"],
    [/finance tracker/, "finance-tracker"],
    [/gentle reset/, "gentle-reset"],
    [/proposal|scope kit/, "proposal-scope"],
    [/anti.?scope|scope creep/, "anti-scope"],
    [/freedom ledger|debt/, "freedom-ledger"],
    [/13.?week|cash flow/, "cash-flow-13"],
    [/offer test|7.?day/, "offer-test-7"],
  ];
  for (var i = 0; i < rules.length; i++) {
    if (rules[i][0].test(n)) return BY_SLUG[rules[i][1]] || null;
  }
  return null;
}

function readBody(req) {
  return new Promise(function (resolve, reject) {
    if (req.body && typeof req.body === "object") return resolve(req.body);
    var data = "";
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

async function sendMail(to, subject, text, html) {
  var key = (process.env.RESEND_API_KEY || "").trim();
  var from = (process.env.DELIVERY_FROM || "IZO-KING Studio <onboarding@resend.dev>").trim();
  if (key) {
    var r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
      body: JSON.stringify({ from: from, to: [to], subject: subject, html: html, text: text }),
    });
    var body = await r.text();
    if (!r.ok) throw new Error("Resend " + r.status + ": " + body.slice(0, 200));
    return { provider: "resend", ok: true };
  }
  var seller = (process.env.SELLER_EMAIL || "maanizozo9@gmail.com").trim();
  var fr = await fetch("https://formsubmit.co/ajax/" + encodeURIComponent(seller), {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      email: to,
      _subject: "[IZO delivery] " + subject,
      message: text,
      _captcha: "false",
    }),
  });
  return { provider: "seller-notify", ok: fr.ok, note: "Add RESEND_API_KEY to email buyers directly" };
}

function buildMail(email, products, orderId) {
  if (!products.length) products = [{ name: "IZO-KING folder", url: FOLDER }];
  var text =
    "Thank you for your IZO-KING purchase.\n\nYour files (File → Make a copy):\n\n" +
    products.map(function (p) {
      return "• " + p.name + "\n  " + p.url;
    }).join("\n\n") +
    "\n\nFolder: " +
    FOLDER +
    "\nOrder: " +
    (orderId || "n/a") +
    "\nHelp: maanizozo9@gmail.com\n";
  var html =
    "<div style='font-family:Georgia,serif;max-width:560px'><h1>Your IZO-KING files</h1><p>Open each link, then <b>File → Make a copy</b>.</p><ul>" +
    products
      .map(function (p) {
        return "<li><b>" + p.name + "</b><br><a href='" + p.url + "'>Open file</a></li>";
      })
      .join("") +
    "</ul><p><a href='" +
    FOLDER +
    "'>Full folder</a></p><p style='color:#666;font-size:13px'>Order " +
    (orderId || "n/a") +
    " · maanizozo9@gmail.com</p></div>";
  return { subject: "Your IZO-KING download links", text: text, html: html };
}

module.exports = async function (req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    return res.end();
  }
  if (req.method === "GET") {
    res.statusCode = 200;
    return res.end(JSON.stringify({ ok: true, service: "izo-delivery" }));
  }
  if (req.method !== "POST") {
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: "POST only" }));
  }

  try {
    var body = await readBody(req);

    // Payhip paid webhook
    if (body.type === "paid" || (body.items && body.email)) {
      var apiKey = (process.env.PAYHIP_API_KEY || "").trim();
      if (apiKey && body.signature) {
        var expected = crypto.createHash("sha256").update(apiKey).digest("hex");
        if (body.signature !== expected) {
          res.statusCode = 401;
          return res.end(JSON.stringify({ error: "Invalid signature" }));
        }
      }
      var buyer = body.email || body.customer_email;
      if (!buyer) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: "No email" }));
      }
      var products = [];
      (body.items || []).forEach(function (it) {
        var f = BY_KEY[it.product_key] || matchName(it.product_name);
        if (f) products.push(f);
      });
      var m = buildMail(buyer, products, body.id);
      var sent = await sendMail(buyer, m.subject, m.text, m.html);
      res.statusCode = 200;
      return res.end(JSON.stringify({ ok: true, mode: "payhip", emailed: buyer, mail: sent }));
    }

    // Claim form / admin send
    var admin = (process.env.DELIVERY_ADMIN_SECRET || "").trim();
    var code = (process.env.DELIVERY_CLAIM_CODE || "").trim();
    var auth = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    var provided = body.secret || body.code || auth;
    if (!(admin && provided === admin) && !(code && provided === code)) {
      res.statusCode = 401;
      return res.end(JSON.stringify({ error: "Unauthorized" }));
    }
    var email = String(body.email || "").trim();
    if (!email || email.indexOf("@") < 1) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: "Valid email required" }));
    }
    var slug = String(body.product || body.slug || "").trim();
    var list = [];
    if (slug === "all" && provided === admin) {
      Object.keys(BY_SLUG).forEach(function (k) {
        list.push(BY_SLUG[k]);
      });
    } else if (BY_SLUG[slug]) list = [BY_SLUG[slug]];
    else if (BY_KEY[slug]) list = [BY_KEY[slug]];
    else if (body.product_name) {
      var mm = matchName(body.product_name);
      if (mm) list = [mm];
    }
    var msg = buildMail(email, list, body.order || "claim");
    var result = await sendMail(email, msg.subject, msg.text, msg.html);
    res.statusCode = 200;
    res.end(
      JSON.stringify({
        ok: true,
        mode: "claim",
        emailed: email,
        products: list.map(function (p) {
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
