async function sendBuyerEmail(opts) {
  var to = opts.to;
  var subject = opts.subject;
  var html = opts.html;
  var text = opts.text;
  var resendKey = (process.env.RESEND_API_KEY || "").trim();
  var from = (process.env.DELIVERY_FROM || "IZO-KING Studio <onboarding@resend.dev>").trim();

  if (resendKey) {
    var r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + resendKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ from: from, to: [to], subject: subject, html: html, text: text })
    });
    var body = await r.text();
    if (!r.ok) throw new Error("Resend " + r.status + ": " + body.slice(0, 300));
    return { provider: "resend", ok: true, detail: body.slice(0, 200) };
  }

  var seller = (process.env.SELLER_EMAIL || "maanizozo9@gmail.com").trim();
  var fr = await fetch("https://formsubmit.co/ajax/" + encodeURIComponent(seller), {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      email: to,
      _subject: "[IZO delivery needed] " + subject,
      message: text,
      _template: "table",
      _captcha: "false"
    })
  });
  var fb = await fr.text();
  return {
    provider: "seller-notify",
    ok: fr.ok,
    detail: fb.slice(0, 200),
    note: "RESEND_API_KEY missing — seller notified to forward links"
  };
}

function buildDeliveryEmail(buyerEmail, products, orderId) {
  var catalog = require("./product-files");
  var lines = products.map(function (p) {
    return "• " + p.name + "\n  " + p.url;
  });
  if (!lines.length) lines.push("• Full product folder\n  " + catalog.folder);
  var text =
    "Thank you for your purchase from IZO-KING Studio.\n\nYour files (open each link → File → Make a copy):\n\n" +
    lines.join("\n\n") +
    "\n\nAll files folder:\n" +
    catalog.folder +
    "\n\nOrder: " +
    (orderId || "n/a") +
    "\nHelp: maanizozo9@gmail.com\nSite: https://izo-king-studio.vercel.app/delivery.html\n";
  var html =
    '<div style="font-family:Georgia,serif;color:#252525;line-height:1.55;max-width:560px">' +
    '<h1 style="font-size:22px;color:#111827">Your IZO-KING files</h1>' +
    "<p>Thank you for your purchase. Open each link, then <strong>File → Make a copy</strong>.</p><ul>" +
    products
      .map(function (p) {
        return (
          '<li style="margin:12px 0"><strong>' +
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
    '<p style="font-size:13px;color:#5c5c5c">Order ' +
    (orderId || "n/a") +
    " · Help: maanizozo9@gmail.com</p></div>";
  return { to: buyerEmail, subject: "Your IZO-KING download links", text: text, html: html };
}

module.exports = { sendBuyerEmail: sendBuyerEmail, buildDeliveryEmail: buildDeliveryEmail };
