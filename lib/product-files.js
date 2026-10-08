module.exports = {
  folder: "https://drive.google.com/drive/folders/1Ntk-SgaNDTvhB0slhXXl0aVqZT65loHp",
  byKey: {
    "32piI": { name: "AI Automation ROI Framework", url: "https://docs.google.com/spreadsheets/d/1hyJfUppSIL7tWxsOsIMYd5Am3GuMEvN9OkXcXkjtuf0/edit" },
    t2BdM: { name: "13-Week Cash Flow Rescue Guide", url: "https://docs.google.com/spreadsheets/d/1hyJfUppSIL7tWxsOsIMYd5Am3GuMEvN9OkXcXkjtuf0/edit" },
    WEnSg: { name: "AI Automation Agency Operating System", url: "https://docs.google.com/spreadsheets/d/1hGLK6aAjkxO2EPfdJZEgpm1a9hAo-9gKIQTUcasFICE/edit" },
    Rb0r4: { name: "Anti-Scope Creep Masterclass", url: "https://docs.google.com/spreadsheets/d/12mXs-b57-KLOfhJZSfnqk_qbO09fXtPJFBCmeoEwkrw/edit" },
    "97sDY": { name: "The Freedom Ledger", url: "https://docs.google.com/spreadsheets/d/19rBZcE9TUmWphX0s5HHXJR9nqP7PoEyOH1ykI48eORs/edit" },
    H8O7j: { name: "Micro-SaaS Idea-to-Launch Blueprint", url: "https://docs.google.com/spreadsheets/d/1JrxAOVo2eMCfFKMiefGBqgcRZ9Si_0qXgq2Hj48Rvkc/edit" }
  },
  bySlug: {
    "freelancer-crm": { name: "Freelancer CRM & Invoice Tracker", url: "https://docs.google.com/spreadsheets/d/1_0zrFWIQUJaanPyzfyCWBZ6LtqxNVIL3eRPl7kHABBw/edit" },
    "study-start": { name: "The Study Start", url: "https://docs.google.com/spreadsheets/d/1L8CGdGcV4828zHh7FlvLGm4CJv6tkFZu_zsFYRigx5s/edit" },
    "clear-start": { name: "The Clear Start", url: "https://docs.google.com/spreadsheets/d/1-ZVL4E_8ZgY2RJxiO4WWXA5GndyiyJgBIBu6EDRjcx4/edit" },
    "morning-routine": { name: "ADHD Morning Routine", url: "https://docs.google.com/spreadsheets/d/179kibBTBkcWOJBtMGyz8QZoZWImfJu51eE5NtegTj4E/edit" },
    "productivity-pack": { name: "Small Business Productivity Pack", url: "https://docs.google.com/spreadsheets/d/1hGLK6aAjkxO2EPfdJZEgpm1a9hAo-9gKIQTUcasFICE/edit" },
    "finance-tracker": { name: "Small Business Finance Tracker", url: "https://docs.google.com/spreadsheets/d/1ifdqJL5Yg-h0klfeYO0Eo9RJIGnz-J4UBL2pWzdW2vc/edit" },
    "gentle-reset": { name: "The Gentle Reset", url: "https://docs.google.com/spreadsheets/d/1lPEeDkIFU2PtLTojqrbpfz1Rg1rs9pT7nQf2ciS5534/edit" },
    "proposal-scope": { name: "Freelance Proposal & Scope Kit", url: "https://docs.google.com/spreadsheets/d/1cAWdUGSExUVyB7Cd8aV8kc6PXQMe3iCDc_a0wt2TQ7I/edit" },
    "anti-scope": { name: "Anti-Scope Creep Scripts", url: "https://docs.google.com/spreadsheets/d/12mXs-b57-KLOfhJZSfnqk_qbO09fXtPJFBCmeoEwkrw/edit" },
    "freedom-ledger": { name: "The Freedom Ledger", url: "https://docs.google.com/spreadsheets/d/19rBZcE9TUmWphX0s5HHXJR9nqP7PoEyOH1ykI48eORs/edit" },
    "cash-flow-13": { name: "13-Week Cash Flow", url: "https://docs.google.com/spreadsheets/d/1hyJfUppSIL7tWxsOsIMYd5Am3GuMEvN9OkXcXkjtuf0/edit" },
    "offer-test-7": { name: "7-Day Offer Test Checklist", url: "https://docs.google.com/spreadsheets/d/1JrxAOVo2eMCfFKMiefGBqgcRZ9Si_0qXgq2Hj48Rvkc/edit" }
  },
  matchName: function (name) {
    var n = String(name || "").toLowerCase();
    var rules = [
      [/freelancer.*crm|invoice tracker/, "freelancer-crm"],
      [/study start|exam.*revision/, "study-start"],
      [/clear start|daily.*weekly/, "clear-start"],
      [/morning routine/, "morning-routine"],
      [/productivity pack/, "productivity-pack"],
      [/finance tracker|income.*expense/, "finance-tracker"],
      [/gentle reset/, "gentle-reset"],
      [/proposal|scope kit/, "proposal-scope"],
      [/anti.?scope|scope creep/, "anti-scope"],
      [/freedom ledger|debt/, "freedom-ledger"],
      [/13.?week|cash flow/, "cash-flow-13"],
      [/offer test|7.?day offer/, "offer-test-7"]
    ];
    for (var i = 0; i < rules.length; i++) {
      if (rules[i][0].test(n)) {
        var id = rules[i][1];
        return this.bySlug[id] || this.byKey[id] || null;
      }
    }
    return null;
  }
};
