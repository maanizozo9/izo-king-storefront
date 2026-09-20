/**
 * Daily insight generator for IZO-KING
 * Set env: XAI_API_KEY (preferred) or OPENAI_API_KEY
 * Optional: CRON_SECRET, GITHUB_TOKEN (to auto-commit blog posts)
 *
 * GET /api/daily-insight
 * Header Authorization: Bearer <CRON_SECRET> when CRON_SECRET is set
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

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

function slugify(title) {
  return String(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
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
            "You write practical, human editorial content for IZO-KING, a digital tools studio selling Excel templates, ADHD planners, freelancer CRM, offer kits, and finance trackers. Audience is global. Write in clear simple English. Never invent fake stats, customers, or revenue. Do not sound like generic AI marketing. Return ONLY valid JSON with keys: title, tag, excerpt, body (markdown paragraphs).",
        },
        {
          role: "user",
          content:
            "Write one short insight article (350-500 words) on: " +
            topic +
            ". Tie the ending to useful systems (not hype). Include one concrete weekly action.",
        },
      ],
    }),
  });
  if (!res.ok) throw new Error("xAI HTTP " + res.status + " " + (await res.text()));
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || "";
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON in model response");
  return JSON.parse(match[0]);
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
            "You write practical editorial content for IZO-KING digital tools. Global audience, clear English. Never invent fake stats or customers. Return JSON: title, tag, excerpt, body.",
        },
        {
          role: "user",
          content: "Article topic: " + topic + ". 350-500 words. One weekly action at the end.",
        },
      ],
    }),
  });
  if (!res.ok) throw new Error("OpenAI HTTP " + res.status + " " + (await res.text()));
  const data = await res.json();
  return JSON.parse(data.choices?.[0]?.message?.content || "{}");
}

function renderHtml(article) {
  const id = slugify(article.title) || "insight-" + Date.now();
  const date = new Date().toISOString().slice(0, 10);
  const body = String(article.body || "")
    .split(/\n\n+/)
    .map((p) => "<p>" + p.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/</g, "&lt;").replace(/&lt;strong>/g, "<strong>").replace(/&lt;\/strong>/g, "</strong>") + "</p>")
    .join("\n");
  return {
    id,
    path: "blog/" + id + ".html",
    html: `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${article.title} — IZO-KING</title>
<meta name="description" content="${(article.excerpt || "").replace(/"/g, "&quot;")}"/>
<link rel="canonical" href="https://izo-king-studio.vercel.app/blog/${id}.html"/>
<link rel="icon" href="/1-3-1000061052.jpg"/>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet"/>
<style>
:root{--navy:#111827;--ivory:#FAF9F6;--beige:#F1EDE5;--gold:#B08D3C;--green:#315C4A;--char:#252525}
*{box-sizing:border-box}body{margin:0;font-family:Inter,system-ui,sans-serif;background:var(--beige);color:var(--char);line-height:1.65}
a{color:var(--gold)}header{background:var(--navy);color:var(--ivory);padding:16px 24px;display:flex;align-items:center;gap:12px}
header img{width:40px;height:40px;border-radius:50%;object-fit:cover}header a{color:var(--ivory);text-decoration:none;font-weight:600}
main{max-width:720px;margin:0 auto;padding:32px 20px 80px}
article{background:var(--ivory);border:1px solid #e5dfd3;border-radius:14px;padding:28px 24px}
h1{font-family:Fraunces,Georgia,serif;font-weight:500;font-size:1.75rem;color:var(--navy);margin:6px 0 12px}
.meta{font-size:12px;color:#7a7368}.tag{color:var(--green);font-weight:600}
.prose p{margin:0 0 1em}footer{text-align:center;padding:24px;font-size:13px;color:#7a7368}
</style>
</head>
<body>
<header><img src="/1-3-1000061052.jpg" alt="IZO"/><a href="/">IZO-KING</a><a href="/blog/" style="margin-left:auto">All insights</a></header>
<main><article>
<div class="meta"><span class="tag">${article.tag || "Insights"}</span> · <time>${date}</time></div>
<h1>${article.title}</h1>
<div class="prose">${body}</div>
</article></main>
<footer>© IZO-KING · <a href="/blog/">Insights</a> · <a href="/">Store</a></footer>
<script src="/products.js"></script><script src="/izo-chat.js"></script>
</body></html>`,
  };
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
  const body = {
    message,
    content: Buffer.from(content, "utf8").toString("base64"),
    branch: "main",
  };
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
  if (!put.ok) throw new Error("GitHub PUT " + put.status + " " + (await put.text()));
  return put.json();
}

export default async function handler(req) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const auth = req.headers.get("authorization") || "";
      const isCron = req.headers.get("user-agent")?.includes("vercel-cron");
      if (!isCron && auth !== "Bearer " + cronSecret) {
        return json(401, { error: "Unauthorized" });
      }
    }

    const xai = process.env.XAI_API_KEY;
    const oai = process.env.OPENAI_API_KEY;
    if (!xai && !oai) {
      return json(503, {
        error: "Missing API key",
        hint: "Add XAI_API_KEY or OPENAI_API_KEY in Vercel project environment variables",
      });
    }

    const topic = TOPICS[new Date().getUTCDay() % TOPICS.length];
    const article = xai ? await callXai(xai, topic) : await callOpenAI(oai, topic);
    if (!article.title || !article.body) {
      return json(500, { error: "Incomplete article from model", article });
    }

    const rendered = renderHtml(article);
    let github = null;
    if (process.env.GITHUB_TOKEN) {
      github = await commitToGithub(
        process.env.GITHUB_TOKEN,
        rendered.path,
        rendered.html,
        "chore: daily insight — " + article.title
      );
    }

    return json(200, {
      ok: true,
      topic,
      article: {
        title: article.title,
        tag: article.tag,
        excerpt: article.excerpt,
        path: "/" + rendered.path,
      },
      committed: Boolean(github),
      message: github
        ? "Article committed to GitHub; Vercel will redeploy."
        : "Generated only. Add GITHUB_TOKEN to auto-publish to the blog.",
    });
  } catch (e) {
    return json(500, { error: String(e.message || e) });
  }
}

export const config = { runtime: "edge" };
