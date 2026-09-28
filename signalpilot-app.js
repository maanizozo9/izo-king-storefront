/* SignalPilot client engine v2 — real public URLs only, no fictional demo data */
const I18N = {
  en: {
    badge: "Software · Opportunity intelligence",
    title: "SignalPilot",
    lead: "Analyze a real public company website: score Fit/Need/Timing from page evidence, label Known/Inferred/Unknown, draft outreach, track next actions.",
    cta_open: "Analyze a real company →",
    cta_back: "Back to tools",
    f1t: "Score", f1d: "Fit, Need, Timing, Reachability, Evidence from fetched HTML.",
    f2t: "Evidence", f2d: "Known, Inferred, or Unknown — only from the page we retrieved.",
    f3t: "Outreach", f3d: "Email, LinkedIn, WhatsApp drafts. You send; we never auto-send.",
    app_title: "Analyze opportunity",
    app_hint: "Paste a real public company website. Analysis runs only on HTML we can fetch — no fictional companies, no invented scores.",
    lbl_url: "Company website URL",
    lbl_service: "Your service (optional)",
    lbl_profile: "Service profile",
    lbl_msg_lang: "Outreach language",
    btn_scan: "Analyze public URL",
    btn_clear: "Clear",
    insights_h: "Insights",
    outreach_h: "Outreach draft",
    btn_copy: "Copy message",
    btn_pipe: "+ Pipeline",
    btn_json: "Export JSON",
    btn_csv: "Export CSV",
    disc_outreach: "You send. We never auto-send.",
    pipe_title: "Pipeline",
    pipe_hint: "Browser localStorage only.",
    btn_clear_pipe: "Clear pipeline",
    price_title: "Pricing"
  },
  ar: {
    badge: "برمجيات · استخبارات الفرص",
    title: "SignalPilot",
    lead: "حلّل موقعاً عاماً حقيقياً لشركة: تقييم من محتوى الصفحة، أدلة معروفة/مستنتجة، مسودة تواصل، وتتبع الخطوة التالية.",
    cta_open: "حلّل شركة حقيقية ←",
    cta_back: "العودة للأدوات",
    f1t: "التقييم", f1d: "من HTML المسترجَع فعلياً.",
    f2t: "الأدلة", f2d: "معروف / مستنتج / غير معروف من الصفحة فقط.",
    f3t: "التواصل", f3d: "مسودات — أنت ترسل فقط.",
    app_title: "تحليل الفرصة",
    app_hint: "الصق موقعاً عاماً حقيقياً. لا شركات وهمية ولا درجات مخترعة.",
    lbl_url: "رابط الموقع",
    lbl_service: "خدمتك",
    lbl_profile: "ملف الخدمة",
    lbl_msg_lang: "لغة الرسالة",
    btn_scan: "تحليل رابط عام",
    btn_clear: "مسح",
    insights_h: "الرؤى",
    outreach_h: "مسودة التواصل",
    btn_copy: "نسخ",
    btn_pipe: "+ خط الأنابيب",
    btn_json: "JSON",
    btn_csv: "CSV",
    disc_outreach: "أنت ترسل فقط.",
    pipe_title: "خط الأنابيب",
    pipe_hint: "محلياً في المتصفح.",
    btn_clear_pipe: "مسح",
    price_title: "الأسعار"
  }
};
let uiLang = "en";
function toggleLang() {
  uiLang = uiLang === "en" ? "ar" : "en";
  document.getElementById("htmlRoot").lang = uiLang;
  document.getElementById("htmlRoot").dir = uiLang === "ar" ? "rtl" : "ltr";
  document.getElementById("langBtn").textContent = uiLang === "en" ? "AR" : "EN";
  const t = I18N[uiLang];
  document.querySelectorAll("[data-i18n]").forEach(function (el) {
    const k = el.getAttribute("data-i18n");
    if (t[k]) el.textContent = t[k];
  });
}
function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
function scoreFromSignals(sig, profile) {
  let fit = 25, need = 25, timing = 25, reach = 25, evid = 20;
  if (sig.hasPricing) { fit += 15; need += 12; evid += 12; }
  if (sig.hasCareers || sig.hiring) { need += 18; timing += 22; evid += 10; }
  if (sig.hasBlog) { fit += 10; evid += 8; }
  if (sig.hasContact) { reach += 30; evid += 8; }
  if (sig.techHints && sig.techHints.length) { fit += 12; evid += 10; }
  if (profile === "agency" && (sig.techHints || []).some(function (t) { return /WordPress|Shopify|Webflow/i.test(t); })) fit += 10;
  if (profile === "saas") fit += 5;
  fit = clamp(fit, 0, 100); need = clamp(need, 0, 100);
  timing = clamp(timing, 0, 100); reach = clamp(reach, 0, 100); evid = clamp(evid, 0, 100);
  const total = Math.round(fit * 0.25 + need * 0.25 + timing * 0.2 + reach * 0.15 + evid * 0.15);
  return { total: total, fit: fit, need: need, timing: timing, reach: reach, evid: evid };
}
function buildInsights(sig, score) {
  const list = [];
  if (sig.hasCareers || sig.hiring)
    list.push({ kind: "known", text: "Careers / hiring wording found on the fetched page.", source: "Fetched HTML" });
  else
    list.push({ kind: "unknown", text: "No careers/hiring wording found in the fetched HTML.", source: "Fetched HTML" });
  if (sig.hasPricing)
    list.push({ kind: "known", text: "Pricing/plans wording found on the fetched page.", source: "Fetched HTML" });
  else
    list.push({ kind: "unknown", text: "No pricing/plans wording found in the fetched HTML.", source: "Fetched HTML" });
  if (sig.hasBlog)
    list.push({ kind: "known", text: "Blog/articles/insights links or wording found.", source: "Fetched HTML" });
  else
    list.push({ kind: "unknown", text: "No blog/insights wording found in the fetched HTML.", source: "Fetched HTML" });
  if (sig.hasContact)
    list.push({ kind: "known", text: "Contact / mailto / booking wording found.", source: "Fetched HTML" });
  else
    list.push({ kind: "unknown", text: "No clear contact path found in the fetched HTML.", source: "Fetched HTML" });
  if (sig.techHints && sig.techHints.length)
    list.push({ kind: "inferred", text: "Tech hints in HTML: " + sig.techHints.join(", ") + ".", source: "Fetched HTML patterns" });
  list.push({
    kind: "inferred",
    text: "Overall score " + score.total + "/100 is a weighted heuristic on signals above — not a purchase prediction.",
    source: "Score model v2"
  });
  return list;
}
function buildOutreach(company, service, channel, lang, score) {
  const svc = service || "our services";
  const name = company || "there";
  if (lang === "ar") {
    if (channel === "linkedin") return "مرحباً فريق " + name + "،\n\nراجعت موقعكم العام ووجدت إشارات قد تتوافق مع " + svc + ".\n\nهل تناسبكم مكالمة قصيرة 15 دقيقة؟\n\n— مسودة SignalPilot · راجع قبل الإرسال";
    if (channel === "whatsapp") return "مرحباً بخصوص " + name + ". نقدم " + svc + ". هل لديكم دقيقة؟\n(مسودة SignalPilot)";
    return "الموضوع: فكرة لـ " + name + "\n\nمرحباً،\n\nبعد مراجعة الموقع العام لـ " + name + " ظهرت إشارات قد تتوافق مع " + svc + " (درجة إرشادية " + score.total + "/100).\n\nأقترح مكالمة تعريفية قصيرة.\n\n---\nمسودة SignalPilot — راجع قبل الإرسال.";
  }
  if (channel === "linkedin") return "Hi " + name + " team,\n\nI reviewed your public site and saw signals that may align with " + svc + ".\n\nOpen to a 15-min intro?\n\n— SignalPilot draft · review before send";
  if (channel === "whatsapp") return "Hi — possible fit with " + name + ". We provide " + svc + ". Short chat?\n(SignalPilot draft)";
  return "Subject: Quick idea for " + name + "\n\nHi,\n\nI reviewed the public site for " + name + " and saw signals that may align with " + svc + " (indicative score " + score.total + "/100 from page heuristics).\n\nOpen to a short intro call?\n\nBest regards\n\n---\nSignalPilot draft — review before send.";
}
function parseHtmlSignals(html) {
  const lower = (html || "").toLowerCase();
  const sig = {
    hasCareers: /career|jobs|hiring|join (our|the) team|we'?re hiring/.test(lower),
    hasPricing: /pricing|\/plans?\b|packages?|retainer|price list/.test(lower),
    hasBlog: /\/blog|articles|insights|resources/.test(lower),
    hasContact: /contact|mailto:|book a call|get in touch|schedule/.test(lower),
    techHints: [],
    hiring: /hiring|we'?re hiring/.test(lower),
    languages: ["en"]
  };
  if (/wordpress|wp-content/.test(lower)) sig.techHints.push("WordPress");
  if (/shopify/.test(lower)) sig.techHints.push("Shopify");
  if (/hubspot/.test(lower)) sig.techHints.push("HubSpot");
  if (/webflow/.test(lower)) sig.techHints.push("Webflow");
  if (/wix\.com|wixstatic/.test(lower)) sig.techHints.push("Wix");
  return sig;
}
function hostnameFromUrl(u) {
  try { return new URL(u).hostname.replace(/^www\./, ""); } catch (e) { return u || "company"; }
}
let currentReport = null;
let currentChannel = "email";
const PIPE_KEY = "sp_pipeline_v1";
const USAGE_KEY = "sp_usage_v1";
function setStatus(type, msg) {
  const el = document.getElementById("statusBox");
  el.className = "status " + type;
  el.textContent = msg;
  el.classList.remove("hidden");
}
function hideStatus() { document.getElementById("statusBox").classList.add("hidden"); }
function escapeHtml(s) {
  return String(s || "").replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">");
}
function renderReport(report) {
  currentReport = report;
  document.getElementById("result").classList.remove("hidden");
  document.getElementById("companyName").textContent = report.company;
  document.getElementById("companyMeta").textContent =
    report.domain + " · " + report.mode + " · " + (report.bytes || 0) + " bytes HTML · score model v2";
  const s = report.score;
  document.getElementById("scoreRing").style.setProperty("--p", s.total);
  document.getElementById("scoreNum").textContent = s.total;
  document.getElementById("dimBars").innerHTML = [
    ["Fit", s.fit], ["Need", s.need], ["Timing", s.timing], ["Reach", s.reach], ["Evidence", s.evid]
  ].map(function (pair) {
    return '<div class="dim"><strong>' + pair[1] + '</strong><span>' + pair[0] + '</span></div>';
  }).join("");
  document.getElementById("insightsList").innerHTML = report.insights.map(function (i) {
    return '<div class="insight ' + i.kind + '"><span class="badge-k ' + i.kind + '">' + i.kind + '</span>' +
      escapeHtml(i.text) + ' <span style="color:var(--muted);font-size:12px">· ' + escapeHtml(i.source || "") + '</span></div>';
  }).join("");
  setChannel(currentChannel);
  document.getElementById("result").scrollIntoView({ behavior: "smooth", block: "start" });
}
function setChannel(ch) {
  currentChannel = ch;
  document.querySelectorAll("#msgTabs .tab").forEach(function (t) {
    t.classList.toggle("active", t.dataset.ch === ch);
  });
  if (!currentReport) return;
  const lang = document.getElementById("langOut").value;
  const service = document.getElementById("serviceInput").value;
  document.getElementById("msgBox").textContent = buildOutreach(
    currentReport.company, service, ch, lang, currentReport.score
  );
}
async function runScan() {
  const url = (document.getElementById("urlInput").value || "").trim();
  if (!url) {
    setStatus("error", "Enter a real public https URL (e.g. https://example.com). No demo mode.");
    return;
  }
  var parsed;
  try {
    parsed = new URL(url.indexOf("http") === 0 ? url : "https://" + url);
  } catch (e) {
    setStatus("error", "Invalid URL.");
    return;
  }
  if (!/^https?:$/.test(parsed.protocol)) {
    setStatus("error", "Only http(s) public URLs.");
    return;
  }
  if (/^(localhost|127\.|10\.|192\.168\.|0\.0\.0\.0|::1)/.test(parsed.hostname)) {
    setStatus("error", "Private/local hosts are blocked.");
    return;
  }
  setStatus("loading", "Fetching public HTML…");
  document.getElementById("scanBtn").disabled = true;
  const profile = document.getElementById("profileSelect").value;
  var html = "";
  var finalUrl = parsed.href;
  var errMsg = "";
  try {
    const res = await fetch("/api/signalpilot/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: parsed.href })
    });
    const data = await res.json().catch(function () { return {}; });
    if (data.html && data.html.length > 50) {
      html = data.html;
      if (data.finalUrl) finalUrl = data.finalUrl;
    } else {
      errMsg = data.error || ("Could not retrieve HTML (status " + res.status + ")");
    }
  } catch (e) {
    errMsg = "Network error: " + (e.message || "fetch failed");
  }
  if (!html) {
    setStatus("error", "No analysis without real page HTML. " + (errMsg || "Try another public URL."));
    document.getElementById("scanBtn").disabled = false;
    return;
  }
  const sig = parseHtmlSignals(html);
  const score = scoreFromSignals(sig, profile);
  const insights = buildInsights(sig, score);
  const company = hostnameFromUrl(finalUrl);
  renderReport({
    company: company.charAt(0).toUpperCase() + company.slice(1),
    domain: company,
    url: finalUrl,
    mode: "Live public HTML",
    bytes: html.length,
    signals: sig,
    score: score,
    insights: insights,
    at: new Date().toISOString()
  });
  setStatus("loading", "Done · analyzed " + html.length + " bytes of public HTML");
  setTimeout(hideStatus, 3000);
  document.getElementById("scanBtn").disabled = false;
  bumpUsage("scan");
}
function clearResult() {
  currentReport = null;
  document.getElementById("result").classList.add("hidden");
  hideStatus();
}
function copyMsg() {
  const t = document.getElementById("msgBox").textContent;
  navigator.clipboard.writeText(t).then(function () {
    setStatus("loading", "Copied.");
  }).catch(function () {
    setStatus("error", "Copy failed.");
  });
  setTimeout(hideStatus, 1500);
}
function bumpUsage(kind) {
  try {
    const u = JSON.parse(localStorage.getItem(USAGE_KEY) || "{}");
    u[kind] = (u[kind] || 0) + 1;
    u.last = new Date().toISOString();
    localStorage.setItem(USAGE_KEY, JSON.stringify(u));
  } catch (e) {}
}
function loadPipe() {
  try { return JSON.parse(localStorage.getItem(PIPE_KEY) || "[]"); } catch (e) { return []; }
}
function savePipe(arr) {
  localStorage.setItem(PIPE_KEY, JSON.stringify(arr));
  renderPipeline();
}
function addToPipeline() {
  if (!currentReport) return;
  const arr = loadPipe();
  if (arr.some(function (x) { return x.domain === currentReport.domain; })) {
    setStatus("loading", "Already in pipeline.");
    setTimeout(hideStatus, 1500);
    return;
  }
  arr.unshift({
    id: "sp_" + Date.now(),
    company: currentReport.company,
    domain: currentReport.domain,
    score: currentReport.score.total,
    status: "New",
    at: new Date().toISOString()
  });
  savePipe(arr);
  setStatus("loading", "Added to pipeline.");
  setTimeout(hideStatus, 1500);
}
function setPipeStatus(id, status) {
  savePipe(loadPipe().map(function (x) {
    return x.id === id ? Object.assign({}, x, { status: status }) : x;
  }));
}
function clearPipeline() {
  if (!confirm("Clear all pipeline items on this device?")) return;
  savePipe([]);
}
function renderPipeline() {
  const statuses = ["New", "Contacted", "Replied", "Won", "Lost"];
  const arr = loadPipe();
  const board = document.getElementById("pipelineBoard");
  board.innerHTML = statuses.map(function (st) {
    const items = arr.filter(function (x) { return x.status === st; });
    var body = items.length ? items.map(function (it) {
      return '<div class="item"><strong>' + escapeHtml(it.company) + '</strong>' +
        '<span style="color:var(--muted)">' + it.score + '/100</span>' +
        '<div style="margin-top:4px"><select onchange="setPipeStatus(\'' + it.id + '\', this.value)" style="font-size:11px;padding:2px;width:100%">' +
        statuses.map(function (s) {
          return '<option value="' + s + '"' + (s === it.status ? " selected" : "") + ">" + s + "</option>";
        }).join("") + "</select></div></div>";
    }).join("") : '<div style="font-size:12px;color:var(--muted)">Empty</div>';
    return '<div class="col"><h4>' + st + " (" + items.length + ")</h4>" + body + "</div>";
  }).join("");
}
function exportJSON() {
  if (!currentReport) return;
  const blob = new Blob([JSON.stringify(currentReport, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "signalpilot-" + (currentReport.domain || "report") + ".json";
  a.click();
}
function exportCSV() {
  if (!currentReport) return;
  const r = currentReport;
  const rows = [
    ["company", "domain", "score", "fit", "need", "timing", "reach", "evidence", "mode", "url", "bytes"],
    [r.company, r.domain, r.score.total, r.score.fit, r.score.need, r.score.timing, r.score.reach, r.score.evid, r.mode, r.url, r.bytes || ""]
  ];
  const csv = rows.map(function (row) {
    return row.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(",");
  }).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "signalpilot-" + (r.domain || "report") + ".csv";
  a.click();
}
document.addEventListener("DOMContentLoaded", function () {
  renderPipeline();
  var lo = document.getElementById("langOut");
  if (lo) lo.addEventListener("change", function () {
    if (currentReport) setChannel(currentChannel);
  });
});
window.toggleLang = toggleLang;
window.runScan = runScan;
window.clearResult = clearResult;
window.copyMsg = copyMsg;
window.addToPipeline = addToPipeline;
window.setChannel = setChannel;
window.clearPipeline = clearPipeline;
window.exportJSON = exportJSON;
window.exportCSV = exportCSV;
window.setPipeStatus = setPipeStatus;
