# Phase 4 — React Simulation page on the verified engine

## 1. Structure

```mermaid
flowchart TB
  App["App.tsx<br/>SimulationProvider wraps the router"] --> Page["pages/Simulation.tsx<br/>hero, progress steps, stage switch"]
  subgraph UI["pages/simulation/ (presentation only)"]
    MS["MarketSelect.tsx<br/>Step 1, profiles + honesty note"]
    HUD["Hud.tsx<br/>status bar"]
    SB["ShopBuilder.tsx<br/>packages, tiers, gacha sliders, event, launch"]
    LAB["LabPanel.tsx<br/>CBT, survey, A/B, confirm, credits"]
    LO["LiveOps.tsx<br/>KPI table, sparkline, log, live exports"]
    DB["Debrief.tsx<br/>grade, shares, report, 5 exports, copy, replay"]
  end
  Page --> MS & HUD & SB & LAB & LO & DB
  CTL["controller.tsx<br/>typed adapter: one Game per provider,<br/>engine calls only in click handlers"]
  MS & HUD & SB & LAB & LO & DB -->|useSimulation()| CTL
  CTL --> ENG["src/sim (Phase 3 engine, unchanged)"]
  CTL --> EXP["exports.ts<br/>Blob download, clipboard + fallback"]
```

**Key decisions**

- **One adapter.** Components never call the engine directly for state changes. They call controller actions (`confirmMarket`, `launch`, `confirmTest` …), which call the engine and then bump a `version` number so React re-renders. Displayed numbers come from engine functions (`hud`, `planNotes`, `liveOpsRow`, `logEntry`, `debrief`, `EXPORTS`). React only formats and lays them out.
- **Engine calls only in click handlers.** In development, React StrictMode runs render code twice. An engine call there would use random numbers twice and break equivalence. A StrictMode test proves this doesn't happen.
- **Game survives navigation.** The provider sits above the router, so going to Home and back keeps the game, as the original did (its pages were only hidden). Reloading the browser starts a new game, also as the original did.
- **No global state, no new packages.** Each provider owns its own game, and tests create their own.
- **Styles are scoped.** The original Simulation CSS is ported into `simulation.css` with every selector under `.sim`, so no other page changes.

**Engine API.** No engine change was needed. Everything the UI requires was already in `src/sim`: `createGame`, `selectMarket`, `launchMonth`, `runLabTest`, `saveVariantA`, `clearVariantA`, `labAvailability`, `resetGame`, `hud`, `planNotes`, `sweetNote`, `liveOpsRow`, `logEntry`, `debrief`, `EXPORTS`, `exportFileName`, `PULL_RANGE`, `ODDS_RANGE`. `src/sim` is unchanged since Phase 3 (`git diff 31f8897 -- src/sim` is empty).

## 2. Differences from the original UI

| Difference | Why |
|---|---|
| The debrief appears immediately after Month 8 (the original waited 350 ms). | The delay was cosmetic. Results are identical. |
| After Month 8 the shop, lab and LiveOps panels are removed rather than hidden. | Normal React rendering. What is visible is the same. |
| The four "flow steps" in the header now highlight the current step. | Progress indicator. |
| Small baby-seal pixel art in the header. | Approved visual identity. |
| The disabled launch button is visibly greyed out. | Tailwind's reset removes the browser's default disabled look. |
| The original's always-hidden "Clear Variant A" link in the lab tools isn't recreated. | It was dead code (`legacy/index.html:1457`). "Clear A" inside the A/B box is kept. |
| The market cards show a keyboard focus outline. | Accessibility. |
| The Simulation isn't yet translated into VI/ZH (the original translated it live with a page-rewriting script). | Belongs to the languages phase. Tier prices are marked `notranslate`. |

## 3. Tests added

| File | What it proves | Tests |
|---|---|---|
| `tests/simulation/ui.test.tsx` | Slices A–F through real clicks, each checked against a reference engine game with the same seed and actions. Covers: 5 markets; defaults; tier and package toggles; empty shop; slider ranges and clamping; confirm/cancel; credit use; A/B rules; credits running out; lab locked after launch; one month per click; LiveOps/log/HUD; copy last month; 8-month debrief; all 5 downloads (names, MIME type, contents, 240 daily rows); live exports; clipboard API, fallback and failure message; replay (fresh credits, default shop, RNG continues); StrictMode; navigation away and back | 21 |
| `tests/simulation/e2e.test.tsx` | Two scripted journeys run on the **React page and the original page** with the same seed. After every step, the HUD, LiveOps, log, lab cards, plan hints and debrief match. **18 CSV downloads are byte-identical** | 2 |
| `tests/simulation/uiDriver.tsx` | Helper that clicks the React page with the same vocabulary as the legacy harness | — |

**Can the tests catch mistakes?** I planted a bug (launching with the event checkbox inverted). 5 UI tests failed, and the bug was reverted.

**Real browser check (desktop, dev server).** I played a full game in the in-app browser: market → closed beta → 8 months with an event → debrief (grade, stats, 6 export/copy buttons). There were no console errors. At 375 px in dark mode there's no horizontal scrolling and the dark tokens apply. The download buttons weren't clicked there, because that would save files to your PC; downloads are covered in jsdom.

## 4. Outstanding

- F1–F9 (Phase 3 findings) are unchanged, by design.
- Vietnamese/Chinese for the Simulation page (languages phase). The Google-Translate switch can still rewrite this page's text (audit risk D7).
- There are no automated tests in a real browser engine (e.g. Playwright). That would mean a new dependency. The equivalence tests run in jsdom, and the real-browser check was manual.

## 5. Rollback

```bash
git revert <phase-4-commit-hash>
```

This removes the Simulation page and restores the placeholder. The engine (Phase 3) and other pages are unaffected.
