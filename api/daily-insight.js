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

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  try {
    const secret = process.env.CRON_SECRET || "";
    if (secret) {
      const auth = req.headers.authorization || "";
      const ua = req.headers["user-agent"] || "";
      if (ua.indexOf("vercel-cron") === -1 && auth !== "Bearer " + secret) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return;
      }
    }

    const oai = (process.env.OPENAI_API_KEY || "").trim();
    if (!oai) {
      res.statusCode = 503;
      res.end(JSON.stringify({ error: "OPENAI_API_KEY not set" }));
      return;
    }

    const topic = TOPICS[new Date().getUTCDay() % TOPICS.length];
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
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

    const raw = await r.text();
    if (!r.ok) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: "OpenAI HTTP " + r.status, detail: raw.slice(0, 400) }));
      return;
    }

    const data = JSON.parse(raw);
    const content = data.choices[0].message.content;
    const article = JSON.parse(content);

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
        message: "Generated successfully. Add GITHUB_TOKEN later to auto-publish to /blog/.",
      })
    );
  } catch (e) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: String(e && e.message ? e.message : e) }));
  }
};
