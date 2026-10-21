/* Rewrite dead Shopify store links to on-site product pages */
(function () {
  var map = {
    "https://izo-king.myshopify.com/products/adhd-daily-weekly-planner-clear-start": "/products/the-clear-start-adhd-friendly-daily-weekly-planner",
    "https://izo-king.myshopify.com/products/adhd-morning-routine-bundle": "/products/adhd-morning-routine-bundle",
    "https://izo-king.myshopify.com/products/freelancer-crm-invoice-tracker-excel-template": "/products/freelancer-crm-invoice-tracker-excel-template",
    "https://izo-king.myshopify.com/products/small-business-finance-tracker-excel-income-expense-profit-dashboard": "/products/small-business-finance-tracker",
    "https://izo-king.myshopify.com/products/small-business-productivity-pack-excel": "/products/small-business-productivity-pack",
    "https://izo-king.myshopify.com/products/the-gentle-reset-an-adhd-friendly-home-reset-workbook-printable-cleaning-routine-for-adults": "/products/the-gentle-reset-adhd-friendly-home-reset-workbook",
    "https://izo-king.myshopify.com/products/the-study-start-adhd-exam-revision-tracker-excel": "/products/the-study-start-adhd-friendly-exam-revision-tracker",
    "https://izo-king.myshopify.com": "/shop"
  };
  var keys = Object.keys(map).sort(function (a, b) { return b.length - a.length; });
  function fix() {
    document.querySelectorAll("a[href]").forEach(function (a) {
      var h = a.getAttribute("href") || "";
      for (var i = 0; i < keys.length; i++) {
        if (h.indexOf(keys[i]) !== -1) {
          a.setAttribute("href", map[keys[i]]);
          break;
        }
      }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fix);
  else fix();
  var n = 0;
  var t = setInterval(function () { fix(); if (++n > 15) clearInterval(t); }, 500);
  if (window.MutationObserver) new MutationObserver(fix).observe(document.documentElement, { childList: true, subtree: true });
})();
