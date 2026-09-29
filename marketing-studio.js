(function () {
  "use strict";
  var STORAGE_KEY = "izo_marketing_studio_v1";
  var MODE_CLIENT = "test";
  var currentApproved = false;
  var pinterestStatus = { configured: false, connected: false, mode: "test" };

  function $(id) { return document.getElementById(id); }
  function products() {
    return Array.isArray(window.PRODUCTS) ? window.PRODUCTS.slice() : [];
  }
  function loadState() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
    catch (e) { return {}; }
  }
  function saveState(s) { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }
  function ensureLog(state) {
    if (!Array.isArray(state.log)) state.log = [];
    return state;
  }
  function productPageUrl(p) {
    if (!p || !p.name) return "https://izo-king-studio.vercel.app/";
    var slug = String(p.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
    return "https://izo-king-studio.vercel.app/products/" + slug;
  }
  function productImage(p) {
    if (p && p.img && /^https:\/\//i.test(p.img)) return p.img;
    return "https://izo-king-studio.vercel.app/1-3-1000061052.jpg";
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
    $("btn-publish-pinterest").disabled = true;
  }

  function setStatus(st) {
    var el = $("draft-status");
    var map = {
      draft: "status-draft",
      approved: "status-approved",
      scheduled: "status-scheduled",
      "published-mock": "status-published-mock",
      published: "status-published-mock",
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
      "[" + platform.toUpperCase() + "]\n\n" +
      t + "\n\n" + b + (h ? "\n\n" + h : "") + "\n\nURL: " + d;
  }

  function logEntry(status, extra) {
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
      extra: extra || null,
      mode: MODE_CLIENT
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
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }

  function approve() {
    if (!$("body").value.trim()) { alert("Generate or write a body first."); return; }
    currentApproved = true;
    setStatus("approved");
    $("btn-schedule").disabled = false;
    $("btn-publish").disabled = false;
    updatePinterestPublishButton();
    logEntry("approved");
  }
  function scheduleMock() {
    if (!currentApproved) { alert("Approve first."); return; }
    setStatus("scheduled");
    logEntry("scheduled");
    alert("Scheduled in browser log only. Live publish needs MARKETING_MODE=production + connected Pinterest.");
  }
  function publishMock() {
    if (!currentApproved) { alert("Approve first."); return; }
    setStatus("published-mock");
    logEntry("published-mock");
    alert("Mock only. Use Publish to Pinterest after connecting and MARKETING_MODE=production.");
  }

  function updatePinterestPublishButton() {
    var btn = $("btn-publish-pinterest");
    if (!btn) return;
    var ok =
      currentApproved &&
      $("platform").value === "pinterest" &&
      pinterestStatus.connected &&
      pinterestStatus.productionEnabled;
    btn.disabled = !ok;
  }

  function refreshPinterestStatus() {
    var pill = $("pinterest-pill");
    var detail = $("pinterest-detail");
    var boardWrap = $("pinterest-board-wrap");
    fetch("/api/oauth/pinterest/status", { credentials: "same-origin" })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        pinterestStatus = j || {};
        if (!j.configured) {
          pill.textContent = "Not configured";
          pill.className = "pill";
          detail.textContent = "Add PINTEREST_CLIENT_ID and PINTEREST_CLIENT_SECRET in Vercel, then redeploy.";
          $("btn-pinterest-connect").disabled = true;
          $("btn-pinterest-disconnect").disabled = true;
        } else if (j.connected) {
          pill.textContent = "Connected" + (j.username ? " · @" + j.username : "");
          pill.className = "pill ok";
          detail.textContent =
            "Server mode: " + (j.mode || "test") +
            (j.productionEnabled
              ? " — live publish allowed after Approve."
              : " — set MARKETING_MODE=production for live Pins.");
          $("btn-pinterest-connect").disabled = true;
          $("btn-pinterest-disconnect").disabled = false;
          boardWrap.classList.remove("hidden");
          loadBoards();
        } else {
          pill.textContent = "Configured · not connected";
          pill.className = "pill";
          detail.textContent = "Click Connect Pinterest to authorize boards and pins write.";
          $("btn-pinterest-connect").disabled = false;
          $("btn-pinterest-disconnect").disabled = true;
          boardWrap.classList.add("hidden");
        }
        updatePinterestPublishButton();
      })
      .catch(function () {
        pill.textContent = "Status unavailable";
        pill.className = "pill";
        detail.textContent = "Could not reach /api/oauth/pinterest/status.";
      });
  }

  function loadBoards() {
    var sel = $("pinterest-board");
    sel.innerHTML = '<option value="">Loading boards…</option>';
    fetch("/api/oauth/pinterest/boards", { credentials: "same-origin" })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (x) {
        sel.innerHTML = "";
        if (!x.ok || !x.j.boards || !x.j.boards.length) {
          sel.innerHTML = '<option value="">No boards found</option>';
          return;
        }
        x.j.boards.forEach(function (b) {
          var o = document.createElement("option");
          o.value = b.id;
          o.textContent = b.name + (b.privacy ? " (" + b.privacy + ")" : "");
          sel.appendChild(o);
        });
      })
      .catch(function () {
        sel.innerHTML = '<option value="">Failed to load boards</option>';
      });
  }

  function publishPinterestLive() {
    if (!currentApproved) { alert("Approve first."); return; }
    if ($("platform").value !== "pinterest") {
      alert("Set Platform to Pinterest.");
      return;
    }
    var boardId = $("pinterest-board") && $("pinterest-board").value;
    if (!boardId) {
      alert("Select a Pinterest board.");
      return;
    }
    var p = selectedProduct();
    var payload = {
      board_id: boardId,
      title: ($("title").value || "").slice(0, 100),
      description: (($("body").value || "") + "\n" + ($("hashtags").value || "")).trim().slice(0, 500),
      link: $("dest").value || productPageUrl(p),
      image_url: productImage(p)
    };
    $("btn-publish-pinterest").disabled = true;
    fetch("/api/marketing/publish-pinterest", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (x) {
        if (x.ok && x.j.ok) {
          setStatus("published");
          logEntry("published", { pin_id: x.j.pin_id });
          alert("Pin created on Pinterest. ID: " + (x.j.pin_id || "ok"));
        } else {
          setStatus("failed");
          logEntry("failed", x.j);
          alert("Publish failed: " + JSON.stringify(x.j));
        }
      })
      .catch(function (e) {
        setStatus("failed");
        alert("Network error: " + e);
      })
      .finally(function () {
        updatePinterestPublishButton();
      });
  }

  function exportJson() {
    var p = selectedProduct();
    var payload = {
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
      image_url: productImage(p),
      scheduleDate: $("sched-date").value,
      scheduleTime: $("sched-time").value
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
      if (id === "integrations") refreshPinterestStatus();
    });
  });

  $("product").addEventListener("change", onProductChange);
  $("platform").addEventListener("change", updatePinterestPublishButton);
  $("btn-generate").addEventListener("click", generateDraft);
  $("btn-approve").addEventListener("click", approve);
  $("btn-schedule").addEventListener("click", scheduleMock);
  $("btn-publish").addEventListener("click", publishMock);
  $("btn-publish-pinterest").addEventListener("click", publishPinterestLive);
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
    updatePinterestPublishButton();
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

  $("btn-pinterest-connect").addEventListener("click", function () {
    window.location.href = "/api/oauth/pinterest/start";
  });
  $("btn-pinterest-disconnect").addEventListener("click", function () {
    fetch("/api/oauth/pinterest/disconnect", { method: "POST", credentials: "same-origin" })
      .then(function () { refreshPinterestStatus(); });
  });
  $("btn-pinterest-refresh").addEventListener("click", refreshPinterestStatus);

  try {
    var q = new URLSearchParams(window.location.search);
    if (q.get("pinterest") === "connected") {
      history.replaceState({}, "", "/marketing-studio");
    } else if (q.get("pinterest") === "error") {
      alert("Pinterest connect error: " + (q.get("msg") || "unknown"));
      history.replaceState({}, "", "/marketing-studio");
    }
  } catch (e) {}

  fillProducts();
  renderLog();
  refreshPinterestStatus();
})();
