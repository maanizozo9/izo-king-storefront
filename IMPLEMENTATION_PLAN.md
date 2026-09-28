# SignalPilot — Implementation Plan

**Date:** 2026-09-28  
**Repo:** maanizozo9/izo-king-storefront  
**Production:** https://izo-king-studio.vercel.app  

## Inspection summary

1. **GitHub:** `maanizozo9/izo-king-storefront` — static HTML storefront (not React/TanStack).
2. **Vercel:** Static + serverless `api/` + catch-all rewrite to `index.html`. Domain alias `izo-king-studio.vercel.app`.
3. **Stack:** Plain HTML/CSS/JS. No package manager. Design tokens: navy `#0B1622`, gold `#C4A35A`, ivory `#FAF9F6`, beige `#F1EDE5`.
4. **Routing:** File-based `.html` + vercel.json rewrites (`/tools` → tools.html, `/leadsignal` → leadsignal.html).
5. **tools.html:** Two cards — NextStep (external ismail.group) + LeadSignal (local leadsignal.html). Grid of featured cards.
6. **Responsive:** CSS grid `auto-fit minmax(280px,1fr)`, clamp typography, flex-wrap nav.
7. **SEO:** Meta description, OG, canonical, sitemap.xml, robots.txt (sitemap URL slightly stale).
8. **Secrets:** None in client HTML. API folder has Meta/daily-insight server handlers.
9. **Decision:** Build SignalPilot as **static HTML + client JS** matching LeadSignal pattern — no framework migration, no breakage of existing tools.

## Product scope (MVP)

SignalPilot helps agencies/B2B providers:
- Analyze a company website URL (or run **Demo** with sample data)
- Produce Opportunity Score (Fit / Need / Timing / Reachability / Evidence)
- Classify insights: **Known / Inferred / Unknown** with sources
- Generate compliant outreach (Email / LinkedIn / WhatsApp) EN + AR
- Lightweight localStorage pipeline (New → Contacted → Replied → Won/Lost)
- Export JSON/CSV; copy message

**Not built:** Full CRM, mass scraper, auto-send, paid API keys in client.

## Architecture

| Piece | Approach |
|-------|----------|
| Landing + App | `signalpilot.html` single page (landing + app sections) |
| Engine | Client-side heuristic scoring + demo fixtures |
| Optional live fetch | `api/signalpilot/scan.js` Vercel serverless (public HTML only, timeout, SSRF guards) |
| Storage | localStorage keys `sp_pipeline`, `sp_usage` |
| i18n | EN default + AR toggle (RTL) |
| Integration | New card on `tools.html` + vercel rewrite + sitemap |

## Files to add/change

- **ADD** `signalpilot.html` — full UI + engine
- **ADD** `api/signalpilot/scan.js` — optional public-site fetch (safe)
- **EDIT** `tools.html` — third card for SignalPilot
- **EDIT** `vercel.json` — rewrite `/signalpilot` → signalpilot.html; exclude from SPA catch-all
- **EDIT** `sitemap.xml` — add signalpilot + tools.html
- **EDIT** `robots.txt` — fix sitemap host to izo-king-studio.vercel.app
- **ADD** `IMPLEMENTATION_PLAN.md`
- **EDIT** `README.md` — note SignalPilot

## Scoring (heuristic, transparent)

Weights (sum 100): Fit 25 · Need 25 · Timing 20 · Reachability 15 · Evidence 15.  
Demo mode uses fixed company profiles so users see real structure without network.

## Compliance

- Demo-first; live scan only public pages
- Outreach includes optional disclosure line; no auto-send
- Known/Inferred/Unknown labels on every claim
- No secrets in repo

## Deploy steps

1. Write files via GitHub push_files
2. Vercel auto-deploys from main
3. Verify production URLs
4. Confirm NextStep + LeadSignal still work

## Out of scope for this ship

- Paid tier billing / Stripe
- Real LLM outreach (templates only)
- Multi-user accounts
- Heavy batch CSV server processing (client CSV parse only)
