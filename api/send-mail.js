/** Send transactional email via Resend (preferred) or notify seller via FormSubmit fallback */
async function sendBuyerEmail({ to, subject, html, text }) {
  const resendKey = (process.env.RESEND_API_KEY || "").trim();
  const from =
    (process.env.DELIVERY_FROM || "IZO-KING Studio <onboarding@resend.dev>").trim();

  if (resendKey) {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + resendKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: from,
        to: [to],
        subject: subject,
        html: html,
        text: text,
      }),
    });
    const body = await r.text();
    if (!r.ok) {
      throw new Error("Resend " + r.status + ": " + body.slice(0, 300));
    }
    return { provider: "resend", ok: true, detail: body.slice(0, 200) };
  }

  // Fallback: notify seller so they can forward links (no free arbitrary SMTP without a key)
  const seller = (process.env.SELLER_EMAIL || "maanizozo9@gmail.com").trim();
  const form = new URLSearchParams();
  form.set("email", to);
  form.set("_subject", "[IZO delivery needed] " + subject);
  form.set("message", text);
  form.set("_template", "table");
  form.set("_captcha", "false");
  const fr = await fetch("https://formsubmit.co/ajax/" + encodeURIComponent(seller), {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      email: to,
      _subject: "[IZO delivery needed] " + subject,
      message: text,
      _template: "table",
      _captcha: "false",
    }),
  });
  const fb = await fr.text();
  return {
    provider: "seller-notify",
    ok: fr.ok,
    detail: fb.slice(0, 200),
    note: "RESEND_API_KEY missing — seller notified to forward links manually",
  };
}

function buildDeliveryEmail(buyerEmail, products, orderId) {
  const catalog = require("./product-files");
  const lines = products.map(function (p) {
    return "• " + p.name + "\n  " + p.url;
  });
  if (!lines.length) {
    lines.push("• Full product folder\n  " + catalog.folder);
  }
  const text =
    "Thank you for your purchase from IZO-KING Studio.\n\n" +
    "Your files (open each link → File → Make a copy):\n\n" +
    lines.join("\n\n") +
    "\n\nAll files folder:\n" +
    catalog.folder +
    "\n\nOrder: " +
    (orderId || "n/a") +
    "\nHelp: maanizozo9@gmail.com\nSite: https://izo-king-studio.vercel.app/delivery.html\n";

  const html =
    '<div style="font-family:Georgia,serif;color:#252525;line-height:1.55;max-width:560px">' +
    "<h1 style=\"font-size:22px;color:#111827\">Your IZO-KING files</h1>" +
    "<p>Thank you for your purchase. Open each link, then <strong>File → Make a copy</strong>.</p><ul>" +
    products
      .map(function (p) {
        return (
          "<li style=\"margin:12px 0\"><strong>" +
          p.name +
          '</strong><br/><a href="' +
          p.url +
          '" style="color:#315C4A">Open file</a></li>'
        );
      })
      .join("") +
    "</ul><p><a href=\"" +
    catalog.folder +
    '\" style="display:inline-block;background:#315C4A;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none">Open full folder</a></p>' +
    "<p style=\"font-size:13px;color:#5c5c5c\">Order " +
    (orderId || "n/a") +
    " · Help: maanizozo9@gmail.com</p></div>";

  return {
    to: buyerEmail,
    subject: "Your IZO-KING download links",
    text: text,
    html: html,
  };
}

module.exports = { sendBuyerEmail, buildDeliveryEmail };
