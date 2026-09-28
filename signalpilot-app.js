/* SignalPilot client engine v1 */
const I18N = {
  en: {badge:"Software · Opportunity intelligence",title:"SignalPilot",lead:"Discover companies likely to need your service, score with evidence, generate outreach, track next actions.",cta_open:"Open SignalPilot →",cta_demo:"Try demo (no URL needed)",cta_back:"Back to tools",f1t:"Score",f1d:"Fit, Need, Timing, Reachability, Evidence.",f2t:"Evidence",f2d:"Known, Inferred, or Unknown with source.",f3t:"Outreach",f3d:"Email, LinkedIn, WhatsApp — EN & AR.",app_title:"Analyze opportunity",app_hint:"Paste a public website, or use Demo.",lbl_url:"Company website URL",lbl_service:"Your service (optional)",lbl_profile:"Service profile",lbl_msg_lang:"Outreach language",btn_scan:"Analyze URL",btn_demo:"Load demo company",btn_clear:"Clear",insights_h:"Insights",outreach_h:"Outreach draft",btn_copy:"Copy message",btn_pipe:"+ Pipeline",btn_json:"Export JSON",btn_csv:"Export CSV",disc_outreach:"You send. We never auto-send.",pipe_title:"Pipeline",pipe_hint:"Browser localStorage only.",btn_clear_pipe:"Clear pipeline",price_title:"Pricing",price_note:"Billing not wired — contact for early access.",cta_access:"Request early access"},
  ar: {badge:"برمجيات · استخبارات الفرص",title:"SignalPilot",lead:"اكتشف الشركات التي يُحتمل أن تحتاج خدمتك مع أدلة واضحة وتواصل متوافق.",cta_open:"افتح SignalPilot ←",cta_demo:"جرّب العرض التوضيحي",cta_back:"العودة للأدوات",f1t:"التقييم",f1d:"الملاءمة والحاجة والتوقيت.",f2t:"الأدلة",f2d:"معروف / مستنتج / غير معروف.",f3t:"التواصل",f3d:"بريد ولينكدإن وواتساب.",app_title:"تحليل الفرصة",app_hint:"الصق موقعاً عاماً أو استخدم العرض.",lbl_url:"رابط الموقع",lbl_service:"خدمتك",lbl_profile:"ملف الخدمة",lbl_msg_lang:"لغة الرسالة",btn_scan:"تحليل",btn_demo:"شركة تجريبية",btn_clear:"مسح",insights_h:"الرؤى",outreach_h:"مسودة التواصل",btn_copy:"نسخ",btn_pipe:"+ خط الأنابيب",btn_json:"JSON",btn_csv:"CSV",disc_outreach:"أنت ترسل فقط.",pipe_title:"خط الأنابيب",pipe_hint:"محلياً في المتصفح.",btn_clear_pipe:"مسح",price_title:"الأسعار",price_note:"لا فوترة بعد.",cta_access:"وصول مبكر"}
};
let uiLang = "en";
function toggleLang() {
  uiLang = uiLang === "en" ? "ar" : "en";
  document.getElementById("htmlRoot").lang = uiLang;
  document.getElementById("htmlRoot").dir = uiLang === "ar" ? "rtl" : "ltr";
  document.getElementById("langBtn").textContent = uiLang === "en" ? "AR" : "EN";
  const t = I18N[uiLang];
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const k = el.getAttribute("data-i18n");
    if (t[k]) el.textContent = t[k];
  });
}
const DEMO = {
  company: "Northwind Digital Studio",
  domain: "northwind-demo.example",
  url: "https://northwind-demo.example",
  signals: { hasCareers: true, hasPricing: true, hasBlog: true, hasContact: true, techHints: ["WordPress", "HubSpot"], hiring: true, languages: ["en", "ar"] }
};
function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
function scoreFromSignals(sig, profile, serviceText) {
  let fit = 40, need = 35, timing = 40, reach = 45, evid = 40;
  if (sig.hasPricing) { fit += 15; need += 10; evid += 10; }
  if (sig.hasCareers || sig.hiring) { need += 15; timing += 20; evid += 8; }
  if (sig.hasBlog) { fit += 8; evid += 6; }
  if (sig.hasContact) { reach += 25; evid += 5; }
  if (sig.techHints && sig.techHints.length) { fit += 10; evid += 8; }
  if (profile === "agency") fit += 8;
  fit = clamp(fit, 0, 100); need = clamp(need, 0, 100);
  timing = clamp(timing, 0, 100); reach = clamp(reach, 0, 100); evid = clamp(evid, 0, 100);
  const total = Math.round(fit * 0.25 + need * 0.25 + timing * 0.2 + reach * 0.15 + evid * 0.15);
  return { total, fit, need, timing, reach, evid };
}
function buildInsights(sig, score) {
  const list = [];
  if (sig.hasCareers || sig.hiring)
    list.push({ kind: "known", text: "Careers / hiring signal present.", source: "Careers page" });
  else
    list.push({ kind: "unknown", text: "No clear hiring page detected.", source: "—" });
  if (sig.hasPricing)
    list.push({ kind: "known", text: "Public pricing page found.", source: "Pricing page" });
  else
    list.push({ kind: "inferred", text: "No pricing page; may sell consultatively.", source: "Heuristic" });
  if (sig.hasBlog)
    list.push({ kind: "inferred", text: "Blog content suggests marketing investment.", source: "Blog" });
  if (sig.hasContact)
    list.push({ kind: "known", text: "Contact path available.", source: "Contact page" });
  if (sig.techHints && sig.techHints.length)
    list.push({ kind: "inferred", text: "Tech hints: " + sig.techHints.join(", ") + ".", source: "HTML" });
  if (score.total >= 70)
    list.push({ kind: "inferred", text: "High opportunity score vs profile weights.", source: "Score model" });
  return list;
}
function buildOutreach(company, service, channel, lang, score) {
  const svc = service || "our services";
  const name = company || "there";
  if (lang === "ar") {
    if (channel === "linkedin") return "مرحباً فريق " + name + "،\n\nلاحظت إشارات على موقعكم. نساعد في " + svc + ".\n\nمكالمة قصيرة 15 دقيقة؟\n\n— SignalPilot";
    if (channel === "whatsapp") return "مرحباً بخصوص " + name + ". نقدم " + svc + ". دقيقة للمحادثة؟\n(SignalPilot)";
    return "الموضوع: فكرة لـ " + name + "\n\nمرحباً،\n\nإشارات تتوافق مع " + svc + " (درجة " + score.total + "/100).\n\nمكالمة تعريفية؟\n\n---\nSignalPilot draft";
  }
  if (channel === "linkedin") return "Hi " + name + " team,\n\nPublic signals on your site may align with " + svc + ".\n\nOpen to a 15-min intro?\n\n— SignalPilot draft";
  if (channel === "whatsapp") return "Hi — possible fit with " + name + ". We provide " + svc + ". Short chat?\n(SignalPilot draft)";
  return "Subject: Quick idea for " + name + "\n\nHi,\n\nSignals on " + name + " may align with " + svc + " (score " + score.total + "/100).\n\nShort intro call?\n\nBest regards\n\n---\nSignalPilot draft — review before send.";
}
function parseHtmlSignals(html) {
  const lower = (html || "").toLowerCase();
  const sig = {
    hasCareers: /career|jobs|hiring|join (our|the) team/.test(lower),
    hasPricing: /pricing|plans?|packages?|retainer/.test(lower),
    hasBlog: /\/blog|articles|insights/.test(lower),
    hasContact: /contact|mailto:|book a call/.test(lower),
    techHints: [],
    hiring: /hiring/.test(lower),
    languages: ["en"]
  };
  if (/wordpress|wp-content/.test(lower)) sig.techHints.push("WordPress");
  if (/shopify/.test(lower)) sig.techHints.push("Shopify");
  if (/hubspot/.test(lower)) sig.techHints.push("HubSpot");
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
  document.getElementById("companyMeta").textContent = report.domain + (report.mode ? " · " + report.mode : "") + " · score model v1";
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
  document.getElementById("msgBox").textContent = buildOutreach(currentReport.company, service, ch, lang, currentReport.score);
}
function runDemo() {
  hideStatus();
  const profile = document.getElementById("profileSelect").value;
  const service = document.getElementById("serviceInput").value;
  const score = scoreFromSignals(DEMO.signals, profile, service);
  const insights = buildInsights(DEMO.signals, score);
  renderReport({
    company: DEMO.company, domain: DEMO.domain, url: DEMO.url, mode: "Demo",
    signals: DEMO.signals, score: score, insights: insights, at: new Date().toISOString()
  });
  bumpUsage("demo");
}
async function runScan() {
  const url = (document.getElementById("urlInput").value || "").trim();
  if (!url) { setStatus("error", "Enter a URL or click Load demo company."); return; }
  var parsed;
  try { parsed = new URL(url.indexOf("http") === 0 ? url : "https://" + url); }
  catch (e) { setStatus("error", "Invalid URL."); return; }
  if (!/^https?:$/.test(parsed.protocol)) { setStatus("error", "Only http(s)."); return; }
  if (/^(localhost|127\.|10\.|192\.168\.|0\.0\.0\.0|::1)/.test(parsed.hostname)) {
    setStatus("error", "Private hosts blocked."); return;
  }
  setStatus("loading", "Analyzing…");
  document.getElementById("scanBtn").disabled = true;
  const profile = document.getElementById("profileSelect").value;
  const service = document.getElementById("serviceInput").value;
  var html = "";
  var mode = "Heuristic (client)";
  try {
    const res = await fetch("/api/signalpilot/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: parsed.href })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.html) { html = data.html; mode = "Live public scan"; }
    } else mode = "Domain heuristic";
  } catch (e) { mode = "Domain heuristic (offline)"; }
  const sig = html ? parseHtmlSignals(html) : {
    hasCareers: false, hasPricing: false, hasBlog: false, hasContact: true,
    techHints: [], hiring: false, languages: ["en"]
  };
  if (!html) sig.hasContact = true;
  const score = scoreFromSignals(sig, profile, service);
  const insights = buildInsights(sig, score);
  const company = hostnameFromUrl(parsed.href);
  renderReport({
    company: company.charAt(0).toUpperCase() + company.slice(1),
    domain: company, url: parsed.href, mode: mode, signals: sig, score: score, insights: insights,
    at: new Date().toISOString()
  });
  setStatus("loading", "Done · " + mode);
  setTimeout(hideStatus, 2500);
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
  navigator.clipboard.writeText(t).then(function () { setStatus("loading", "Copied."); }).catch(function () { setStatus("error", "Copy failed."); });
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
    setStatus("loading", "Already in pipeline."); setTimeout(hideStatus, 1500); return;
  }
  arr.unshift({
    id: "sp_" + Date.now(), company: currentReport.company, domain: currentReport.domain,
    score: currentReport.score.total, status: "New", at: new Date().toISOString()
  });
  savePipe(arr);
  setStatus("loading", "Added to pipeline.");
  setTimeout(hideStatus, 1500);
}
function setPipeStatus(id, status) {
  savePipe(loadPipe().map(function (x) { return x.id === id ? Object.assign({}, x, { status: status }) : x; }));
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
          return '<option value="' + s + '"' + (s === it.status ? ' selected' : '') + '>' + s + '</option>';
        }).join('') + '</select></div></div>';
    }).join('') : '<div style="font-size:12px;color:var(--muted)">Empty</div>';
    return '<div class="col"><h4>' + st + ' (' + items.length + ')</h4>' + body + '</div>';
  }).join('');
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
    ["company", "domain", "score", "fit", "need", "timing", "reach", "evidence", "mode", "url"],
    [r.company, r.domain, r.score.total, r.score.fit, r.score.need, r.score.timing, r.score.reach, r.score.evid, r.mode, r.url]
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
  document.getElementById("langOut").addEventListener("change", function () {
    if (currentReport) setChannel(currentChannel);
  });
});
window.toggleLang = toggleLang;
window.runDemo = runDemo;
window.runScan = runScan;
window.clearResult = clearResult;
window.copyMsg = copyMsg;
window.addToPipeline = addToPipeline;
window.setChannel = setChannel;
window.clearPipeline = clearPipeline;
window.exportJSON = exportJSON;
window.exportCSV = exportCSV;
window.setPipeStatus = setPipeStatus;
