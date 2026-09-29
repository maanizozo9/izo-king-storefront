(function () {
  "use strict";
  var STORAGE_KEY = "izo_marketing_studio_v1";
  var MODE = "test";

  function $(id) { return document.getElementById(id); }
  function products() {
    return Array.isArray(window.PRODUCTS) ? window.PRODUCTS.slice() : [];
  }
  function loadState() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
    catch (e) { return {}; }
  }
  function saveState(s) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  }
  function ensureLog(state) {
    if (!Array.isArray(state.log)) state.log = [];
    return state;
  }
  function productPageUrl(p) {
    if (!p || !p.name) return "https://izo-king-studio.vercel.app/";
    var slug = String(p.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
    return "https://izo-king-studio.vercel.app/products/" + slug;
  }
  function selectedProduct() {
    var id = $("product").value;
    return products().find(function (p) { return p.id === id; }) || null;
  }
  function fillProducts() {
    var sel = $("product");
    var list = products();
    sel.innerHTML = "";
    if (!list.length) {
      sel.innerHTML = '<option value="">No products found</option>';
      return;
    }
    list.forEach(function (p) {
      var opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.name + " (" + (p.platform || "") + " · " + (p.price || "") + ")";
      sel.appendChild(opt);
    });
    onProductChange();
  }
  function onProductChange() {
    var p = selectedProduct();
    if (!p) {
      $("product-meta").textContent = "";
      $("dest").value = "";
      return;
    }
    $("product-meta").textContent = (p.cat || "") + " · " + (p.type || "") + " · Catalogue price: " + (p.price || "Check current price");
    $("dest").value = productPageUrl(p);
  }

  var currentApproved = false;

  function generateDraft() {
    var p = selectedProduct();
    if (!p) { alert("Select a product from the catalogue."); return; }
    var platform = $("platform").value;
    var angle = $("angle").value;
    var lang = $("lang").value;
    var cta = ($("cta").value || "See product details").trim();
    var name = p.name || "Product";
    var vp = p.vp || "";
    var price = p.price || "";
    var platformName = p.platform || "";
    var dest = productPageUrl(p);
    var title = name;
    var body = "";
    var tags = "";

    if (lang === "en") {
      if (angle === "problem") {
        title = name + " — less admin clutter";
        body = "If client lists, invoices, or next steps live in different places, work gets noisy.\n\n" + name + " is listed for: " + vp + "\n\nFormat: " + (p.type || "digital") + ". Sold via " + platformName + ". Catalogue price: " + price + ".\n\n" + cta + ":\n" + dest;
      } else if (angle === "feature") {
        title = "What's in " + name;
        body = name + "\n" + vp + "\n\nCategory: " + (p.cat || "") + "\nType: " + (p.type || "") + "\nPlatform: " + platformName + "\nCatalogue price: " + price + "\n\n" + cta + "\n" + dest;
      } else if (angle === "usecase") {
        title = "When to use " + name;
        body = "Use case: operators who need a practical system in the " + (p.cat || "catalogue") + " category.\n\n" + name + " — " + vp + "\n\nConfirm the live checkout price on " + platformName + " before buying. Catalogue listing shows: " + price + ".\n\n" + dest;
      } else if (angle === "workflow") {
        title = "Before / after with " + name;
        body = "Before: scattered notes and unclear next steps.\nAfter: one listed system — " + name + ".\n\n" + vp + "\n\nCatalogue price: " + price + " · " + platformName + "\n" + cta + "\n" + dest;
      } else {
        title = "Tip: keep systems simple";
        body = "Pick one system you will actually open.\n\n" + name + ": " + vp + "\n\nListed at " + price + " on " + platformName + ".\n" + dest;
      }
      tags = "#digitaltools #izo_king";
    } else if (lang === "ar") {
      title = name;
      body = name + "\n" + vp + "\n\nالسعر في الكتالوج: " + price + "\nالمنصة: " + platformName + "\n\n" + cta + "\n" + dest + "\n\nلا تقييمات أو أرقام مبيعات مخترعة — البيانات من كتالوج الموقع فقط.";
      tags = "";
    } else {
      title = name;
      body = name + "\n" + vp + "\n\nPrix catalogue: " + price + "\nPlateforme: " + platformName + "\n\n" + cta + "\n" + dest + "\n\nAucune note ou chiffre de ventes inventé.";
      tags = "";
    }

    if (platform === "pinterest") {
      title = title.slice(0, 100);
      body = body.slice(0, 500);
    } else if (platform === "x") {
      body = (name + " — " + vp + "\n" + dest).slice(0, 260);
      title = name.slice(0, 70);
      tags = "";
    } else if (platform === "instagram") {
      body = body + "\n\nLink in bio / product page: " + dest;
      tags = (tags + " #smallbusiness").trim();
    }

    $("title").value = title;
    $("body").value = body;
    $("hashtags").value = tags;
    $("dest").value = dest;
    setStatus("draft");
    updatePreview();
    currentApproved = false;
    $("btn-schedule").disabled = true;
    $("btn-publish").disabled = true;
  }

  function setStatus(st) {
    var el = $("draft-status");
    var map = {
      draft: "status-draft",
      approved: "status-approved",
      scheduled: "status-scheduled",
      "published-mock": "status-published-mock",
      failed: "status-failed"
    };
    el.innerHTML = 'Status: <span class="status ' + (map[st] || "status-draft") + '">' + st + "</span>";
  }
  function updatePreview() {
    var platform = $("platform").value;
    var t = $("title").value || "";
    var b = $("body").value || "";
    var h = $("hashtags").value || "";
    var d = $("dest").value || "";
    $("preview").textContent =
      "[" + platform.toUpperCase() + " · TEST MODE]\n\n" +
      t + "\n\n" + b + (h ? "\n\n" + h : "") + "\n\nURL: " + d;
  }

  function logEntry(status) {
    var p = selectedProduct();
    if (!p) return;
    var state = ensureLog(loadState());
    state.log.unshift({
      id: "m_" + Date.now(),
      at: new Date().toISOString(),
      productId: p.id,
      productName: p.name,
      platform: $("platform").value,
      campaign: $("campaign").value || "",
      status: status,
      title: $("title").value || "",
      mode: MODE
    });
    state.log = state.log.slice(0, 100);
    saveState(state);
    renderLog();
  }

  function renderLog() {
    var state = ensureLog(loadState());
    var tb = document.querySelector("#log-table tbody");
    tb.innerHTML = "";
    if (!state.log.length) {
      tb.innerHTML = '<tr><td colspan="5" class="muted">No entries yet.</td></tr>';
      return;
    }
    state.log.forEach(function (row) {
      var tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" + escapeHtml(row.at || "") + "</td>" +
        "<td>" + escapeHtml(row.productName || "") + "</td>" +
        "<td>" + escapeHtml(row.platform || "") + "</td>" +
        "<td>" + escapeHtml(row.status || "") + "</td>" +
        "<td>" + escapeHtml(row.campaign || "") + "</td>";
      tb.appendChild(tr);
    });
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&", "<": "<", ">": ">", '"': """, "'": "&#39;" })[c];
    });
  }

  function approve() {
    if (!$("body").value.trim()) { alert("Generate or write a body first."); return; }
    currentApproved = true;
    setStatus("approved");
    $("btn-schedule").disabled = false;
    $("btn-publish").disabled = false;
    logEntry("approved");
  }
  function scheduleMock() {
    if (!currentApproved) { alert("Approve first."); return; }
    setStatus("scheduled");
    logEntry("scheduled");
    alert("Scheduled in test mode only (this browser). No live API call.");
  }
  function publishMock() {
    if (!currentApproved) { alert("Approve first."); return; }
    setStatus("published-mock");
    logEntry("published-mock");
    alert("Mock publish complete. Nothing was sent to social networks.");
  }
  function exportJson() {
    var p = selectedProduct();
    var payload = {
      mode: MODE,
      product: p,
      platform: $("platform").value,
      campaign: $("campaign").value,
      language: $("lang").value,
      tone: $("tone").value,
      angle: $("angle").value,
      title: $("title").value,
      body: $("body").value,
      hashtags: $("hashtags").value,
      destinationUrl: $("dest").value,
      scheduleDate: $("sched-date").value,
      scheduleTime: $("sched-time").value,
      note: "Manual posting only until OAuth is configured."
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "izo-marketing-draft.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }
  function copyText() {
    var text = ($("title").value + "\n\n" + $("body").value + "\n\n" + $("hashtags").value + "\n" + $("dest").value).trim();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { alert("Copied."); });
    } else {
      prompt("Copy:", text);
    }
  }

  document.querySelectorAll(".tab").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".tab").forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      var id = btn.getAttribute("data-tab");
      $("tab-compose").classList.toggle("hidden", id !== "compose");
      $("tab-queue").classList.toggle("hidden", id !== "queue");
      $("tab-integrations").classList.toggle("hidden", id !== "integrations");
      if (id === "queue") renderLog();
    });
  });

  $("product").addEventListener("change", onProductChange);
  $("btn-generate").addEventListener("click", generateDraft);
  $("btn-approve").addEventListener("click", approve);
  $("btn-schedule").addEventListener("click", scheduleMock);
  $("btn-publish").addEventListener("click", publishMock);
  $("btn-copy").addEventListener("click", copyText);
  $("btn-export").addEventListener("click", exportJson);
  $("title").addEventListener("input", updatePreview);
  $("body").addEventListener("input", updatePreview);
  $("hashtags").addEventListener("input", updatePreview);
  $("btn-reset").addEventListener("click", function () {
    $("title").value = "";
    $("body").value = "";
    $("hashtags").value = "";
    $("campaign").value = "";
    currentApproved = false;
    setStatus("draft");
    $("btn-schedule").disabled = true;
    $("btn-publish").disabled = true;
    updatePreview();
  });
  $("btn-refresh-log").addEventListener("click", renderLog);
  $("btn-clear-scheduled").addEventListener("click", function () {
    var state = ensureLog(loadState());
    state.log = state.log.filter(function (r) { return r.status !== "scheduled"; });
    saveState(state);
    renderLog();
  });
  $("btn-clear-all").addEventListener("click", function () {
    if (confirm("Clear all local Marketing Studio log entries?")) {
      saveState({ log: [] });
      renderLog();
    }
  });

  fillProducts();
  renderLog();
})();
