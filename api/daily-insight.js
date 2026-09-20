/**
 * Daily insight generator for IZO-KING
 * Prefers OPENAI_API_KEY, falls back to XAI_API_KEY
 * Optional: CRON_SECRET, GITHUB_TOKEN
 */

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

function slugify(title) {
  return String(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

async function callOpenAI(apiKey, topic) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + apiKey,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You write practical editorial content for IZO-KING digital tools (Excel templates, ADHD planners, freelancer CRM, offer kits, finance trackers). Global audience, clear English. Never invent fake stats or customers. Return JSON with keys: title, tag, excerpt, body.",
        },
        {
          role: "user",
          content:
            "Write one short insight article (350-500 words) on: " +
            topic +
            ". Include one concrete weekly action at the end.",
        },
      ],
    }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error("OpenAI HTTP " + res.status + " " + text.slice(0, 500));
  const data = JSON.parse(text);
  const content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
  if (!content) throw new Error("Empty OpenAI response");
  return JSON.parse(content);
}

async function callXai(apiKey, topic) {
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + apiKey,
    },
    body: JSON.stringify({
      model: "grok-2-latest",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content:
            "You write practical editorial content for IZO-KING. Return ONLY JSON: title, tag, excerpt, body. No fake stats.",
        },
        {
          role: "user",
          content: "Article (350-500 words) on: " + topic,
        },
      ],
    }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error("xAI HTTP " + res.status + " " + text.slice(0, 500));
  const data = JSON.parse(text);
  const content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
  const match = String(content || "").match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON in xAI response");
  return JSON.parse(match[0]);
}

function renderHtml(article) {
  const id = slugify(article.title) || "insight-" + Date.now();
  const date = new Date().toISOString().slice(0, 10);
  const body = String(article.body || "")
    .split(/\n\n+/)
    .map(function (p) {
      return (
        "<p>" +
        p
          .replace(/&/g, "&")
          .replace(/</g, "<")
          .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") +
        "</p>"
      );
    })
    .join("\n");
  const title = String(article.title || "Insight").replace(/</g, "");
  const tag = String(article.tag || "Insights").replace(/</g, "");
  const excerpt = String(article.excerpt || "").replace(/"/g, """);
  const html =
    "<!doctype html>\n<html lang=\"en\"><head><meta charset=\"utf-8\"/><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"/>" +
    "<title>" +
    title +
    " — IZO-KING</title><meta name=\"description\" content=\"" +
    excerpt +
    "\"/><link rel=\"icon\" href=\"/1-3-1000061052.jpg\"/>" +
    "<link href=\"https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500&family=Inter:wght@400;500;600&display=swap\" rel=\"stylesheet\"/>" +
    "<style>body{margin:0;font-family:Inter,system-ui,sans-serif;background:#F1EDE5;color:#252525;line-height:1.65}header{background:#111827;color:#FAF9F6;padding:16px 24px;display:flex;gap:12px;align-items:center}header img{width:40px;height:40px;border-radius:50%}header a{color:#FAF9F6;text-decoration:none;font-weight:600}main{max-width:720px;margin:0 auto;padding:32px 20px}article{background:#FAF9F6;border:1px solid #e5dfd3;border-radius:14px;padding:28px 24px}h1{font-family:Fraunces,Georgia,serif;font-weight:500;color:#111827}.tag{color:#315C4A;font-weight:600;font-size:12px}</style></head><body>" +
    "<header><img src=\"/1-3-1000061052.jpg\" alt=\"IZO\"/><a href=\"/\">IZO-KING</a><a href=\"/blog/\" style=\"margin-left:auto\">Insights</a></header>" +
    "<main><article><div class=\"tag\">" +
    tag +
    " · " +
    date +
    "</div><h1>" +
    title +
    "</h1><div>" +
    body +
    "</div></article></main>" +
    "<script src=\"/products.js\"></script><script src=\"/izo-chat.js\"></script></body></html>";
  return { id: id, path: "blog/" + id + ".html", html: html };
}

function toBase64(str) {
  return Buffer.from(str, "utf8").toString("base64");
}

async function commitToGithub(token, path, content, message) {
  const api = "https://api.github.com/repos/maanizozo9/izo-king-storefront/contents/" + path;
  let sha;
  const get = await fetch(api, {
    headers: { Authorization: "Bearer " + token, Accept: "application/vnd.github+json" },
  });
  if (get.ok) {
    const j = await get.json();
    sha = j.sha;
  }
  const body = { message: message, content: toBase64(content), branch: "main" };
  if (sha) body.sha = sha;
  const put = await fetch(api, {
    method: "PUT",
    headers: {
      Authorization: "Bearer " + token,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!put.ok) throw new Error("GitHub PUT " + put.status + " " + (await put.text()).slice(0, 300));
  return put.json();
}

module.exports = async function handler(req, res) {
  try {
    if (req.method && req.method !== "GET" && req.method !== "POST") {
      res.statusCode = 405;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Method not allowed" }));
      return;
    }

    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const auth = (req.headers && (req.headers.authorization || req.headers.Authorization)) || "";
      const ua = (req.headers && (req.headers["user-agent"] || "")) || "";
      const isCron = ua.indexOf("vercel-cron") !== -1;
      if (!isCron && auth !== "Bearer " + cronSecret) {
        res.statusCode = 401;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return;
      }
    }

    const oai = (process.env.OPENAI_API_KEY || "").trim();
    const xai = (process.env.XAI_API_KEY || "").trim();
    if (!oai && !xai) {
      res.statusCode = 503;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Missing API key" }));
      return;
    }

    const topic = TOPICS[new Date().getUTCDay() % TOPICS.length];
    const article = oai ? await callOpenAI(oai, topic) : await callXai(xai, topic);
    if (!article.title || !article.body) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Incomplete article", article: article }));
      return;
    }

    const rendered = renderHtml(article);
    let committed = false;
    if (process.env.GITHUB_TOKEN) {
      await commitToGithub(
        process.env.GITHUB_TOKEN,
        rendered.path,
        rendered.html,
        "chore: daily insight — " + article.title
      );
      committed = true;
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(
      JSON.stringify({
        ok: true,
        provider: oai ? "openai" : "xai",
        topic: topic,
        article: {
          title: article.title,
          tag: article.tag,
          excerpt: article.excerpt,
          path: "/" + rendered.path,
        },
        committed: committed,
        message: committed
          ? "Article committed to GitHub"
          : "Generated only. Add GITHUB_TOKEN to auto-publish.",
      })
    );
  } catch (e) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: String(e && e.message ? e.message : e) }));
  }
};
