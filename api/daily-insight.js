const crypto = require("crypto");

const TOPICS = [
  "ADHD-friendly planning systems for freelancers",
  "Freelance invoicing and client follow-up without SaaS bloat",
  "How to validate a digital product offer in 7 days",
  "Small business cash flow visibility on a spreadsheet",
  "Turning one skill into a clear paid offer",
  "Scope creep boundaries for independent workers",
  "Exam and revision tracking for ADHD students",
  "Morning routines that work when motivation is low",
  "B2B deal decision briefs without another CRM",
  "Debt payoff tracking that stays simple",
];

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

function matchName(name) {
  var n = String(name || "").toLowerCase();
  var rules = [
    [/freelancer.*crm|invoice tracker/, "freelancer-crm"],
    [/study start|exam/, "study-start"],
    [/clear start|weekly/, "clear-start"],
    [/morning routine/, "morning-routine"],
    [/productivity/, "productivity-pack"],
    [/finance tracker/, "finance-tracker"],
    [/gentle reset/, "gentle-reset"],
    [/proposal|scope kit/, "proposal-scope"],
    [/anti.?scope|scope creep/, "anti-scope"],
    [/freedom|debt/, "freedom-ledger"],
    [/cash flow|13.?week/, "cash-flow-13"],
    [/offer test|7.?day/, "offer-test-7"],
  ];
  for (var i = 0; i < rules.length; i++) {
    if (rules[i][0].test(n)) return BY_SLUG[rules[i][1]];
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
        resolve({});
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
    body: JSON.stringify({ email: to, _subject: "[IZO delivery] " + subject, message: text, _captcha: "false" }),
  });
  return { provider: "seller-notify", ok: fr.ok, note: "Add RESEND_API_KEY in Vercel to email buyers directly" };
}

function buildMail(products, orderId) {
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
    products.map(function (p) {
      return "<li><b>" + p.name + "</b><br><a href='" + p.url + "'>Open file</a></li>";
    }).join("") +
    "</ul><p><a href='" + FOLDER + "'>Full folder</a></p></div>";
  return { subject: "Your IZO-KING download links", text: text, html: html };
}

async function handleDelivery(req, res, body) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (body.type === "paid" || (body.items && (body.email || body.customer_email))) {
    var apiKey = (process.env.PAYHIP_API_KEY || "").trim();
    if (apiKey && body.signature) {
      var expected = crypto.createHash("sha256").update(apiKey).digest("hex");
      if (body.signature !== expected) {
        res.statusCode = 401;
        return res.end(JSON.stringify({ error: "Invalid signature" }));
      }
    }
    var buyer = body.email || body.customer_email;
    var products = [];
    (body.items || []).forEach(function (it) {
      var f = matchName(it.product_name);
      if (f) products.push(f);
    });
    var m = buildMail(products, body.id);
    var sent = await sendMail(buyer, m.subject, m.text, m.html);
    res.statusCode = 200;
    return res.end(JSON.stringify({ ok: true, mode: "payhip", emailed: buyer, mail: sent }));
  }

  var admin = (process.env.DELIVERY_ADMIN_SECRET || "").trim();
  var code = (process.env.DELIVERY_CLAIM_CODE || "").trim();
  var auth = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  var provided = body.secret || body.code || auth;
  if (!(admin && provided === admin) && !(code && provided === code)) {
    res.statusCode = 401;
    return res.end(JSON.stringify({ error: "Unauthorized — claim code required" }));
  }
  var email = String(body.email || "").trim();
  if (!email || email.indexOf("@") < 1) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ error: "Valid email required" }));
  }
  var slug = String(body.product || "").trim();
  var list = BY_SLUG[slug] ? [BY_SLUG[slug]] : [];
  var msg = buildMail(list, body.order || "claim");
  var result = await sendMail(email, msg.subject, msg.text, msg.html);
  res.statusCode = 200;
  return res.end(
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
}

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.statusCode = 204;
    return res.end();
  }

  try {
    var body = req.method === "POST" ? await readBody(req) : {};

    // Delivery modes: Payhip webhook, claim form, or explicit action
    var isDelivery =
      body.action === "delivery" ||
      body.type === "paid" ||
      body.product ||
      body.code ||
      (body.items && body.email);

    if (isDelivery) {
      return handleDelivery(req, res, body);
    }

    // Original daily insight cron path
    var secret = process.env.CRON_SECRET || "";
    if (secret) {
      var authH = req.headers.authorization || "";
      var ua = req.headers["user-agent"] || "";
      if (ua.indexOf("vercel-cron") === -1 && authH !== "Bearer " + secret) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return;
      }
    }

    var oai = (process.env.OPENAI_API_KEY || "").trim();
    if (!oai) {
      res.statusCode = 503;
      res.end(JSON.stringify({ error: "OPENAI_API_KEY not set" }));
      return;
    }

    var topic = TOPICS[new Date().getUTCDay() % TOPICS.length];
    var r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + oai,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Write practical editorial content for IZO-KING digital tools. Global audience, clear English. Never invent fake stats. Return JSON keys: title, tag, excerpt, body.",
          },
          {
            role: "user",
            content: "Write a 350-500 word insight on: " + topic + ". End with one weekly action.",
          },
        ],
      }),
    });

    var raw = await r.text();
    if (!r.ok) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: "OpenAI HTTP " + r.status, detail: raw.slice(0, 400) }));
      return;
    }

    var data = JSON.parse(raw);
    var article = JSON.parse(data.choices[0].message.content);
    res.statusCode = 200;
    res.end(
      JSON.stringify({
        ok: true,
        provider: "openai",
        topic: topic,
        article: {
          title: article.title,
          tag: article.tag,
          excerpt: article.excerpt,
          bodyPreview: String(article.body || "").slice(0, 200),
        },
      })
    );
  } catch (e) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: String(e && e.message ? e.message : e) }));
  }
};
