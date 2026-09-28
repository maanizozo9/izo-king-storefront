(function () {
  if (window.__izoToolsHome) return;
  window.__izoToolsHome = true;

  var path = (location.pathname || "/").replace(/\/+$/, "") || "/";
  if (path !== "/" && path !== "") return;

  var css = document.createElement("style");
  css.textContent = [
    "#izo-tools-home{font-family:Inter,system-ui,sans-serif;background:linear-gradient(180deg,#0B1622 0%,#122033 100%);color:#FAF9F6;padding:56px 20px;margin:0;border-top:1px solid rgba(196,163,90,.22);border-bottom:1px solid rgba(196,163,90,.18)}",
    "#izo-tools-home *{box-sizing:border-box}",
    "#izo-tools-home .izo-th-wrap{max-width:1080px;margin:0 auto}",
    "#izo-tools-home .izo-th-badge{display:inline-block;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#C4A35A;border:1px solid rgba(196,163,90,.4);padding:5px 12px;border-radius:999px;margin-bottom:14px}",
    "#izo-tools-home h2{font-family:Fraunces,Georgia,serif;font-weight:500;font-size:clamp(1.6rem,3.5vw,2.15rem);margin:0 0 10px;color:#FAF9F6;text-align:center}",
    "#izo-tools-home .izo-th-sub{text-align:center;max-width:540px;margin:0 auto 32px;color:rgba(250,249,246,.68);font-size:15px;line-height:1.55}",
    "#izo-tools-home .izo-th-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}",
    "#izo-tools-home .izo-th-card{background:rgba(255,255,255,.04);border:1px solid rgba(196,163,90,.28);border-radius:18px;overflow:hidden;display:flex;flex-direction:column;transition:border-color .2s,transform .2s}",
    "#izo-tools-home .izo-th-card:hover{border-color:rgba(196,163,90,.55);transform:translateY(-2px)}",
    "#izo-tools-home .izo-th-art{height:160px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden}",
    "#izo-tools-home .izo-th-art.nextstep{background:linear-gradient(135deg,#0f1c2e 0%,#1a3350 60%,#0B1622 100%)}",
    "#izo-tools-home .izo-th-art.leadsignal{background:linear-gradient(135deg,#0f1c2e 0%,#1e3a2f 60%,#0B1622 100%)}",
    "#izo-tools-home .izo-th-art svg{width:88%;max-width:280px;height:auto}",
    "#izo-tools-home .izo-th-body{padding:20px 22px 22px;display:flex;flex-direction:column;gap:10px;flex:1}",
    "#izo-tools-home .izo-th-tag{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#C4A35A}",
    "#izo-tools-home .izo-th-body h3{font-family:Fraunces,Georgia,serif;font-weight:500;font-size:1.35rem;margin:0;color:#FAF9F6}",
    "#izo-tools-home .izo-th-body p{margin:0;font-size:14px;line-height:1.55;color:rgba(250,249,246,.72);flex:1}",
    "#izo-tools-home .izo-th-btns{display:flex;flex-wrap:wrap;gap:10px;margin-top:6px}",
    "#izo-tools-home .izo-th-btn{display:inline-flex;align-items:center;padding:10px 16px;border-radius:999px;font-weight:600;font-size:13px;text-decoration:none;transition:background .15s}",
    "#izo-tools-home .izo-th-btn.primary{background:#C4A35A;color:#0B1622}",
    "#izo-tools-home .izo-th-btn.primary:hover{background:#d4b56a}",
    "#izo-tools-home .izo-th-btn.ghost{background:transparent;color:#FAF9F6;border:1px solid rgba(250,249,246,.25)}",
    "#izo-tools-home .izo-th-btn.ghost:hover{border-color:#C4A35A;color:#C4A35A}",
    "#izo-tools-home .izo-th-foot{text-align:center;margin-top:28px}",
    "#izo-tools-home .izo-th-foot a{color:#C4A35A;font-weight:600;font-size:14px;text-decoration:none}",
    "#izo-tools-home .izo-th-foot a:hover{text-decoration:underline}",
    "a.izo-nav-tools{color:inherit;text-decoration:none;font-weight:600}",
    "@media(max-width:600px){#izo-tools-home{padding:40px 16px}#izo-tools-home .izo-th-art{height:140px}}"
  ].join("\n");
  document.head.appendChild(css);

  var nextArt =
    '<svg viewBox="0 0 320 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<rect x="24" y="28" width="120" height="84" rx="10" fill="#1a2a3d" stroke="#C4A35A" stroke-opacity=".45"/>' +
    '<rect x="36" y="40" width="60" height="8" rx="2" fill="#C4A35A" fill-opacity=".7"/>' +
    '<rect x="36" y="56" width="96" height="6" rx="2" fill="#FAF9F6" fill-opacity=".25"/>' +
    '<rect x="36" y="68" width="80" height="6" rx="2" fill="#FAF9F6" fill-opacity=".18"/>' +
    '<rect x="36" y="80" width="88" height="6" rx="2" fill="#FAF9F6" fill-opacity=".12"/>' +
    '<circle cx="48" cy="98" r="5" fill="#2F6B4F"/><text x="58" y="101" fill="#FAF9F6" font-size="9" opacity=".7" font-family="Inter,sans-serif">Known</text>' +
    '<path d="M152 70 H178" stroke="#C4A35A" stroke-width="2" stroke-dasharray="4 3"/>' +
    '<polygon points="178,66 188,70 178,74" fill="#C4A35A"/>' +
    '<rect x="196" y="36" width="100" height="68" rx="10" fill="#C4A35A" fill-opacity=".15" stroke="#C4A35A" stroke-opacity=".6"/>' +
    '<text x="246" y="62" text-anchor="middle" fill="#C4A35A" font-size="11" font-weight="600" font-family="Inter,sans-serif">NEXT</text>' +
    '<text x="246" y="78" text-anchor="middle" fill="#FAF9F6" font-size="12" font-weight="600" font-family="Inter,sans-serif">ACTION</text>' +
    '<circle cx="246" cy="92" r="4" fill="#C4A35A"/>' +
    "</svg>";

  var leadArt =
    '<svg viewBox="0 0 320 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<circle cx="70" cy="70" r="36" fill="#1a2a3d" stroke="#C4A35A" stroke-opacity=".4"/>' +
    '<circle cx="70" cy="70" r="22" fill="none" stroke="#2F6B4F" stroke-width="2" stroke-opacity=".8"/>' +
    '<circle cx="70" cy="70" r="8" fill="#C4A35A"/>' +
    '<path d="M70 34 V22 M70 118 V106 M34 70 H22 M118 70 H106" stroke="#C4A35A" stroke-opacity=".35" stroke-width="2"/>' +
    '<path d="M118 70 C150 50 180 45 210 52" stroke="#C4A35A" stroke-width="2" fill="none" stroke-opacity=".7"/>' +
    '<circle cx="210" cy="52" r="6" fill="#2F6B4F"/>' +
    '<path d="M118 78 C155 95 190 100 230 88" stroke="#C4A35A" stroke-width="2" fill="none" stroke-opacity=".45"/>' +
    '<circle cx="230" cy="88" r="5" fill="#C4A35A" fill-opacity=".8"/>' +
    '<path d="M118 62 C160 40 200 30 250 40" stroke="#FAF9F6" stroke-width="1.5" fill="none" stroke-opacity=".25"/>' +
    '<circle cx="250" cy="40" r="4" fill="#FAF9F6" fill-opacity=".4"/>' +
    '<rect x="248" y="100" width="52" height="22" rx="6" fill="#C4A35A" fill-opacity=".2" stroke="#C4A35A" stroke-opacity=".5"/>' +
    '<text x="274" y="115" text-anchor="middle" fill="#C4A35A" font-size="10" font-weight="700" font-family="Inter,sans-serif">$LEAD</text>' +
    "</svg>";

  var section = document.createElement("section");
  section.id = "izo-tools-home";
  section.setAttribute("aria-label", "IZO-KING software tools");
  section.innerHTML =
    '<div class="izo-th-wrap">' +
    '<div style="text-align:center"><span class="izo-th-badge">Software tools · Not downloads</span></div>' +
    "<h2>Live tools from the studio</h2>" +
    '<p class="izo-th-sub">Browser software — not Excel or PDF files. Decision support and pay-per-lead revenue, side by side.</p>' +
    '<div class="izo-th-grid">' +
    '<article class="izo-th-card">' +
    '<div class="izo-th-art nextstep">' + nextArt + "</div>" +
    '<div class="izo-th-body">' +
    '<div class="izo-th-tag">Software · B2B sales</div>' +
    "<h3>NextStep</h3>" +
    "<p>Turns opportunity context into an evidence-linked next sales action. Known / Inferred / Unknown classification, rationale, and follow-up — without another heavy CRM.</p>" +
    '<div class="izo-th-btns">' +
    '<a class="izo-th-btn primary" href="https://ismail.group" target="_blank" rel="noopener">Open NextStep →</a>' +
    '<a class="izo-th-btn ghost" href="https://whop.com/checkout/plan_zvqf30LtnPirA" target="_blank" rel="noopener">Pro plan</a>' +
    "</div></div></article>" +
    '<article class="izo-th-card">' +
    '<div class="izo-th-art leadsignal">' + leadArt + "</div>" +
    '<div class="izo-th-body">' +
    '<div class="izo-th-tag">Software · Lead revenue</div>' +
    "<h3>LeadSignal</h3>" +
    "<p>Pay-per-lead operator for B2B affiliates. Research software-ready companies, send compliant personalized outreach, track signups and commissions.</p>" +
    '<div class="izo-th-btns">' +
    '<a class="izo-th-btn primary" href="/leadsignal.html">Open LeadSignal →</a>' +
    '<a class="izo-th-btn ghost" href="/tools.html">Tools hub</a>' +
    "</div></div></article>" +
    "</div>" +
    '<div class="izo-th-foot"><a href="/tools.html">See all software tools →</a></div>' +
    "</div>";

  function insertSection() {
    if (document.getElementById("izo-tools-home")) return true;
    var root = document.getElementById("root");
    if (!root) return false;

    var headings = root.querySelectorAll("h2");
    var target = null;
    for (var i = 0; i < headings.length; i++) {
      var t = (headings[i].textContent || "").toLowerCase();
      if (t.indexOf("start with the tools") !== -1 || t.indexOf("people reach for") !== -1) {
        target = headings[i];
        break;
      }
    }
    if (target) {
      var block = target.closest("section") || target.parentElement;
      while (block && block.parentElement && block.parentElement !== root && block.parentElement.id !== "root") {
        if (block.parentElement.children.length > 3) break;
        block = block.parentElement;
      }
      if (block && block.parentNode) {
        block.parentNode.insertBefore(section, block);
        return true;
      }
    }

    var firstSection = root.querySelector("section") || root.firstElementChild;
    if (firstSection && firstSection.nextSibling) {
      firstSection.parentNode.insertBefore(section, firstSection.nextSibling);
      return true;
    }
    if (root.lastElementChild) {
      root.appendChild(section);
      return true;
    }
    return false;
  }

  function injectNav() {
    if (document.querySelector("a.izo-nav-tools")) return;
    var links = document.querySelectorAll("nav a, header a");
    var shop = null;
    for (var i = 0; i < links.length; i++) {
      var href = (links[i].getAttribute("href") || "").toLowerCase();
      var txt = (links[i].textContent || "").trim().toLowerCase();
      if (txt === "shop" || href.indexOf("/shop") !== -1) {
        shop = links[i];
        break;
      }
    }
    if (shop && shop.parentNode) {
      var a = document.createElement("a");
      a.href = "/tools.html";
      a.className = shop.className + " izo-nav-tools";
      a.textContent = "Tools";
      a.style.color = "#C4A35A";
      a.style.fontWeight = "600";
      shop.parentNode.insertBefore(a, shop.nextSibling);
    }
  }

  function tryAll() {
    insertSection();
    injectNav();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      setTimeout(tryAll, 400);
      setTimeout(tryAll, 1200);
      setTimeout(tryAll, 2500);
    });
  } else {
    setTimeout(tryAll, 400);
    setTimeout(tryAll, 1200);
    setTimeout(tryAll, 2500);
  }

  var obs = new MutationObserver(function () {
    if (!document.getElementById("izo-tools-home")) tryAll();
    else injectNav();
  });
  obs.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(function () {
    obs.disconnect();
  }, 8000);
})();
