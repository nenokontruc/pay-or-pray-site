# Pay or Pray — Phase 0 Audit

*Audit date: 2026-11-07. No files of yours were changed. All findings come from reading the code.*

**What I looked at**

| Source | What it is | Notes |
|---|---|---|
| `index (3).html` (267,113 bytes, 1,993 lines) | Original site: 7 pages, one file | **Byte-for-byte identical** to `main` on GitHub (SHA-256 match). |
| `i18n.js` (116,589 bytes, 391 entries) | VI / ZH string table | Identical to `main`. |
| `Recreate Academic Homepage.zip` | Figma Make export (React 19 + Vite 8 + TS) | 43 source files. Home and Industry are built; the other 5 pages are a placeholder. |
| GitHub `nenokontruc/pay-or-pray-site` | 1 branch (`main`), 2 files, GitHub Pages on | Last commit `ea3a782` (2026-11-01, "Update i18n.js"). |
| 5 screenshots | Approved look for Home, Industry, Framework | The Framework screenshot shows a calculator that **neither codebase has yet**. |

Line references: `index.html:N` means the original file. `src/...` means the Figma project.

---

## Before anything else: two blockers on this PC

- **Git is not installed** (`git` not found). I couldn't clone the repo, so I read it through GitHub's public API instead.
- **Node.js and pnpm are not installed.** The React project can't be built, run or tested without them. `.mise.toml` asks for Node 22 and pnpm 10.34.3.

Phase 1 starts by installing these. Nothing else can be checked or committed safely until then.

---

## A. Codebase inventory

### A1. The original site (`index.html`): how it is organized

| Part | Lines | What it does |
|---|---|---|
| CSS tokens + all styles | 11–466 | Light tokens (`#F4F6F6`, `#1C2833`, `#2E4053`, the 3 fonts). Dark mode with a `data-theme="light"` override (`index.html:27-28`). |
| Nav + 7 `<section class="page">` | 470–1145 | Every page is in the HTML at once. JS shows one and hides the rest. |
| Router | 1147–1182 | Hash routing (`#industry` …). Sets `document.title`. |
| **Simulation engine + UI** | 1184–1757 | ~570 lines. The business logic and the HTML-building code are mixed together (details in A3). |
| Progress bar, scroll-reveal, count-up | 1759–1815 | Uses `IntersectionObserver` and respects reduced-motion. |
| Mobile fixes, formula clean-up | 1816–1837 | |
| Language switcher | 1839–1882 | Sets a Google Translate cookie, then reloads the page. |
| Translation layer v2 | 1884–1991 | A 260-entry inline dictionary `D`, a 124-entry simulation dictionary `EX`, regex `RULES`, `NAMES`, `i18n.js` overrides, and a MutationObserver that translates the simulation while it runs. |

**What each page contains in the original**

| Page | Content | Interactive? |
|---|---|---|
| Home | Hero, deterministic/probabilistic cards, 4-step primer, 6 nav cards | No (scroll-reveal only). **No pixel art, no gacha machine.** |
| Industry | 4 count-up stats, publishers text, 8-item history list, 7 model cards, two-economies cards + static $10–19 / $5–7 chart, 6-row regulation table | Count-up only |
| Framework | Two formula blocks (EVC = RefP + DiffV; EVC(gacha) = P(success)×Value − P(failure)×Cost; V(A,v,r) = Σ rⱼ[v(A∪{j}) − v(A)]), WTP + choice-architecture prose | **No.** There is no calculator in the original. |
| Case Study | Facts for both games (odds, guarantees, ladders, revenue), comparison table, pricing implications, Chen et al. 36.7%, Naavik $320M, rationale for pairing the two games | No |
| Diagnostic | 2×2 risk matrix (4 cells), "Reading the matrix" prose | No |
| Simulation | Market select → test lab → 8 live months → debrief + 5 CSV exports | **Yes, fully working** |
| About | Bio, path timeline, acknowledgments, LinkedIn | No. `headshot.jpg` is referenced (`index.html:1095`) but **isn't in the repo**, so the "TT" fallback always shows. |

### A2. The Figma React project

| File | Status | Notes |
|---|---|---|
| `src/App.tsx` | Working | Shell: progress bar, nav, **Present mode** (new), language select, prev/next pager, footer. |
| `src/lib/router.ts` | Working | Hash routing. Keeps every original `#page` link working. |
| `src/pages/Home.tsx` | Working, static | Same text as the original, plus pixel art (display case, gashapon, seal). **The art isn't interactive.** |
| `src/pages/Industry.tsx` + 5 sections | Working, interactive | Donut, pictogram, growth bars, clickable timeline, model explorer, in/out-economy tabs, price-range slider, dot-map of the regulations. Takeaways and disclosures follow your "one message → one visual → one takeaway" pattern. |
| `src/data/industry.tsx` | Working | All Industry facts in one data file. **I checked every figure against the original:** 188.8 / 103 / 55% / 56% / 1.3% / ~$82B / 21% / benchmarks / regulation wording all match. "Other platforms $85.8B" is derived (total minus mobile) and **labelled as derived**. That's correct practice. |
| `src/lib/industryCalc.ts` | Working | Pure helper functions. |
| `src/lib/industryCalc.test.mts` | Exists, **not wired up** | Uses `node:assert`. No `test` script in `package.json`. It imports a `.ts` file directly, which needs Node's type-stripping flag. |
| `src/pages/Coming.tsx` | **Placeholder** | Used for Framework, Case Study, Diagnostic, Simulation and About (`src/App.tsx:95`). |
| `src/components/Art.tsx`, `Pixel.tsx`, `PixelIcon.tsx` | Working | Pixel art drawn in code from the site palette. Good. Easy to theme. |
| `src/components/LangSwitch.tsx` | **Partial port** | Copies only the Google-Translate cookie part. The hand-written translations (`D`, `EX`, `RULES`, `NAMES`, `i18n.js`) are **not used at all**. |
| `src/index.css` | Working, **deviates from spec** | Tokens copied, but the `data-theme` guard was dropped and `--badge-outline-bg` is missing (see D). |
| `vite.config.ts` | Figma-specific | 5 Figma Make plugins, reads `.figma/make/site.json`, port 8443, `base: '/'`. |
| `.figma/make/site.json` | Config | `robots.index: false` adds a *noindex* tag (the original site doesn't have one). |

### A3. What is inside the Simulation (must be preserved)

| Concern | Where | What it does |
|---|---|---|
| **State** | `newState()` `index.html:1219` | round, maxRounds=8, goodwill=70, totalRevenue, eventStreak, history, market, credits=3, launched, variantA, txns, panel, daily, tests, sweet, pending. Plus module-level `players[]` and `nextId`. |
| **Market parameters** | `MARKET_INFO` `:1188-1194` | Per market: nonSpend share, 3 segment budget scales (`tiers`), segment `weights`, p2wAppeal/Penalty, gachaAffinity/Penalty, benchmark text. |
| **Packages** | `PKGS`, `LADDER` `:1195-1202` | 5 packages. Price ladder $0.99–99.99. Defaults. Pass `valueBonus` 1.15. |
| **Constants** | `:1204-1207` | SAMPLE 1000, PITY 50, BASE_POP 200,000 (weight 200), CREDITS 3, DAYS 30, EVENT_DAYS 7. Engagement ranges by segment. |
| **Random numbers** | `rand()` `:1209-1212` | Park–Miller generator (`seed × 16807 mod 2³¹−1`), **seeded from `Date.now()`**. Also `randRange`, `shuffle`. |
| **Player model** | `makePlayer` `:1223-1227` | Non-spender draw, segment draw, budget = exponential(−tier × ln(1−u)), interest per package U(0.3, 1.2), engagement. |
| **Sweet spot** | `sweetSpot` `:1232-1245` | Grid search for the best single price, used by the debrief grade and the ladder hints. *I re-ran it exactly as written: US $12, CN $12, JP $19, VN $6.50, ID $1.50.* That matches your honesty note (`:990`). |
| **Purchases / gacha** | `simulate` `:1269-1322` | Monthly shock, event boost with fatigue, daily activity, a shared wallet across packages in random order, a choice-overload penalty above 6 tiers, buys the highest affordable tier, and gacha pulls until a win, the 50-pull pity, or the budget runs out. |
| **Goodwill** | `goodwillDelta` `:1325-1335` | Penalties for power and gacha (scaled by market), a bonus for cosmetic-only, crowding above 3 packages, event fatigue, noise ±2. |
| **Churn / installs** | `churnAndInstall` `:1336-1346` | Churn rate rises when goodwill < 60. Payers churn ×0.7. Installs rise when goodwill > 70. |
| **Test lab** | `RUNNERS` `:1482-1513` | CBT (150 players, 95% CI), survey (300, ×1.35 hypothetical bias, percentiles), A/B (split in half, z-test against 1.96). Credit confirm step. |
| **Reporting** | `renderLiveOps`, `sparkline`, `endGame` `:1536-1728` | LiveOps table with month-over-month arrows, daily sparkline, grade S–D, revenue shares, event-lift analysis, dead tiers, retention. |
| **Exports** | `:1605-1659` | 5 CSVs (months, daily, panel, transactions, tests) + copy to clipboard. |

---

## B. Architecture diagram (proposed target)

The engine (pure logic) sits apart from the UI. The UI calls the engine; the engine never touches the page.

```mermaid
flowchart TB
  subgraph Shell["App shell (src/App.tsx)"]
    Router["Hash router<br/>#home … #about"]
    Nav["Nav + Present mode + Lang select"]
    Footer["Per-page references"]
  end

  subgraph Pages["Pages (React components)"]
    Home["Home<br/>display case + gacha demo + roadmap"]
    Industry["Industry<br/>5 interactive sections (done)"]
    Framework["Framework<br/>EVC calculators"]
    Case["Case Study<br/>HoK vs WWM, pity curves"]
    Diag["Diagnostic<br/>2×2 risk matrix"]
    SimUI["Simulation UI<br/>market → lab → months → debrief"]
    About["About"]
  end

  subgraph Logic["Pure logic (no React, unit-tested)"]
    IC["industryCalc.ts"]
    EVC["evc.ts<br/>RefP+DiffV, two-outcome EVC, Σ r·Δv"]
    Gacha["gachaMath.ts<br/>expected pulls with pity"]
    Engine["sim/engine.ts<br/>players, simulate, goodwill, churn, lab, grade"]
    RNG["sim/rng.ts<br/>seedable Park–Miller (same algorithm)"]
    CSV["sim/csv.ts<br/>5 exports"]
  end

  subgraph Data["Content & data (single source of truth)"]
    DInd["data/industry.tsx"]
    DCase["data/caseStudy.ts"]
    DSim["sim/params.ts<br/>MARKET_INFO, PKGS, constants"]
    I18N["i18n table (from i18n.js)"]
    Refs["data/references.ts"]
  end

  Router --> Pages
  Industry --> IC --> DInd
  Framework --> EVC
  Case --> Gacha --> DCase
  Home --> Gacha
  Diag --> DCase
  SimUI -->|plan, actions| Engine
  Engine --> RNG
  Engine --> DSim
  SimUI --> CSV
  Pages -.->|t()| I18N
  Footer --> Refs

  subgraph Tests["Tests"]
    Golden["Golden-master tests<br/>original sim JS vs engine.ts, same seed"]
    Unit["Unit tests (Vitest)"]
    UI["Interaction tests (Testing Library)"]
  end
  Golden -.-> Engine
  Unit -.-> Logic
  UI -.-> Pages
```

**Today's state, for comparison:** in the original, the Simulation reads the shop straight from the page (`readPlan()` queries `.pkg-row` checkboxes, `index.html:1248-1258`) and writes results as HTML strings. In the Figma version, 5 of 7 pages render `Coming.tsx`.

---

## C. Feature migration matrix

*Complexity / Risk: L = low, M = medium, H = high.*

| # | Feature | Original HTML | Figma React | State | Complexity | Risk | Recommended action |
|---|---|---|---|---|---|---|---|
| 1 | Hash routing, page titles | ✅ | ✅ (no `document.title`) | Working | L | L | Keep React. Add page titles. |
| 2 | Nav, progress bar | ✅ | ✅ | Working | L | L | Keep React. |
| 3 | Present mode | — | ✅ | Working (new) | L | L | Keep. |
| 4 | Design tokens + dark mode | ✅ (with `data-theme` override) | ⚠️ guard dropped | Deviates | L | M | Restore the original token block exactly. |
| 5 | Scroll-reveal / count-up | ✅ | — (replaced by charts) | — | L | L | Port as a small `useReveal` hook only if wanted. |
| 6 | Home: hero, cards, primer, nav cards | ✅ | ✅ + pixel art | Working | L | L | Keep React. |
| 7 | Home: **interactive** fixed-price item + gacha machine | — | — (static art) | **New feature** | M | M (accuracy) | Build new. Odds need your decision (G4). |
| 8 | Industry: market stats | ✅ count-up | ✅ donut / pictogram / bars | Working, figures verified | — | L | Keep React. |
| 9 | Industry: timeline (8 milestones) | ✅ list | ✅ interactive | Working, text verified | — | L | Keep React. |
| 10 | Industry: 7 monetization models | ✅ cards | ✅ explorer | Working | — | L | Keep React. |
| 11 | Industry: two economies + price range | ✅ static chart | ✅ slider + verdicts | Working | — | L | Keep. The "illustrative" disclaimer is good. |
| 12 | Industry: regulation table | ✅ | ✅ map + full table | Working | — | L | Keep React. |
| 13 | Framework: formulas + prose | ✅ static | ❌ placeholder | Missing | L | M | Port the text exactly. |
| 14 | Framework: **calculators** (screenshot) | — | — | **New feature** | M | **H** (interpretation) | Build from the original formulas only. Label inputs as teaching examples. |
| 15 | Case Study: facts, table, implications | ✅ | ❌ | Missing | M | M | Port into `data/caseStudy.ts`, then build visuals. |
| 16 | Case Study: probability / pity visual | — | — | **New feature** | M | **H** | WWM can be derived from the published numbers. HoK needs its luck-value schedule (G5). |
| 17 | Diagnostic 2×2 | ✅ static | ❌ | Missing | L | L | Port. Make it interactive with the two original questions only — no invented risk scores. |
| 18 | Simulation: market select + profiles table | ✅ | ❌ | Missing | M | M | React UI over the engine. |
| 19 | Simulation: engine (players, purchases, gacha, goodwill, churn) | ✅ | ❌ | Missing | **H** | **H** | Extract to `sim/engine.ts` **unchanged**. Golden-master tests. |
| 20 | Simulation: test lab (CBT, survey, A/B + confirm, credits) | ✅ | ❌ | Missing | M | H | Engine functions + React panel. |
| 21 | Simulation: LiveOps table, sparkline, log | ✅ | ❌ | Missing | M | M | React components fed by `history`. |
| 22 | Simulation: debrief + grade | ✅ | ❌ | Missing | M | H | Pure function `debrief(state)` + view. |
| 23 | Simulation: 5 CSV exports + copy | ✅ | ❌ | Missing | L | H (data integrity) | Move the CSV builders as-is. Byte-equality tests. |
| 24 | About | ✅ | ❌ | Missing | L | L | Port. Add `headshot.jpg` if you have one. |
| 25 | Per-page reference footers | ✅ (5 lists) | ⚠️ Industry only | Partial | L | M (academic) | Move all references into `data/references.ts`. |
| 26 | Language select (Google cookie) | ✅ | ✅ | Working | L | **H** (see D7) | Replace (G2). |
| 27 | Hand-written translations (`D`, `EX`, `RULES`, `i18n.js`) | ✅ | ❌ | Missing | M–H | M | React-native `t()` using your `i18n.js` data (G2). |
| 28 | Simulation translated while it runs | ✅ (MutationObserver) | ❌ | Missing | M | M | Replace with `t()` + placeholders. Keep CSVs in English, as now. |
| 29 | Tests | none | 1 file, not run | Minimal | — | — | Vitest (section E). |
| 30 | Deployment (GitHub Pages) | ✅ live | ❌ (`base:'/'`, Figma deploy script) | Not deployable | L | M | GitHub Actions build, after your approval. |

---

## D. Technical risk assessment

### Confirmed problems (seen in the code)

1. **Simulation logic and the page are tangled together.** `readPlan()` reads checkboxes and sliders from the page (`index.html:1248-1258`). `refreshPlanUI()`, `updateHUD()` and `endGame()` build HTML strings. `simulate()` reads the global `state.market` (`:1270`), and `churnAndInstall()` reads `state.round` (`:1341`). → The migration must pass the plan in as data instead of reading it from the page.
2. **Runs can't be reproduced.** The RNG seed is `Date.now()` (`:1209`). That's fine for players, but tests can't compare two implementations until the seed can be passed in. The fix keeps the exact same algorithm.
3. **Order of random numbers is part of the behavior.** Every lab test, `shuffle()` and `pickDay()` uses the one shared random stream. Running a closed beta before Month 1 changes Month 1's numbers. A refactor that reorders loops — even "harmlessly" — gives different results. *(Concept: the RNG is like a deck of cards dealt in order. Same deck + same deal order = same game.)*
4. **Expected gacha cost is an approximation.** `Math.min(100/odds, PITY) × pull` (`:1400`, also used for buying decisions at `:1303`) ignores that pity cuts the tail short. At 5% odds it gives 20 pulls; the exact expectation with a 50-pull pity is ≈18.5. **Existing behavior: keep it unless you decide otherwise (G6).**
5. **Vietnam "sweet spot" shows as $7, not $6.50.** `toFixed(0)` at `:1750` and `:1678` rounds the engine's $6.50 up. Your honesty note (`:990`) correctly says "$6.50". Display-only inconsistency.
6. **i18n.js can only replace, never add.** `ext()` only overrides keys that already exist in the built-in dictionaries (`:1914-1916`). *I checked: all 384 current non-menu entries do match (264 `D` + 120 `EX`), so nothing is broken today.* But any new sentence added only to `i18n.js` is silently ignored.
7. **Translation works by rewriting the page after it loads.** It does this at `:1921-1924`, `:1963-1968` and `:1976-1989`, and the Figma `LangSwitch.tsx:24-31` loads Google Translate onto the React page. React expects to be the only thing changing the page. Outside edits (Google Translate wraps text in `<font>` tags) are a well-known cause of React crashes and of text not updating when state changes. This matters for interactive charts and the Simulation. *(I've listed it as confirmed because the mechanism is in the code. Whether it crashes this particular app hasn't been tested.)*
8. **Figma CSS dropped part of the token spec.** The original wraps dark mode in `:root:not([data-theme="light"])` (`index.html:28`); Figma uses plain `:root` (`src/index.css:16-17`), so a forced light theme no longer works. `--badge-outline-bg` is also missing.
9. **References were lost on 5 pages.** The Figma `Footer` only has Industry references (`src/App.tsx:28-41`). The original has page-specific lists for Framework (`:753-754`), Case Study (`:860-867`), Diagnostic (`:936-937`) and Simulation (`:1071-1073`).
10. **The Figma build won't work on GitHub Pages as-is.** `base` is `/` (`vite.config.ts:16`). Your Pages site is served from `/pay-or-pray-site/`, so the built JS/CSS files would fail to load. The deploy script calls `figma make deploy` (`.figma/make/deploy`).
11. **Tests are not run.** `package.json` has no test script, and there's no test runner.
12. **Smaller issues in the original:** the "Save Variant A" button says "Free" but is disabled at 0 credits (`:1452`, `:1455`). `#clear-A` is always hidden (`:1457`, dead code). `headshot.jpg` is missing from the repo.

### Possible risks (to watch, not yet observed)

- **React StrictMode runs some code twice in development** (`src/main.tsx:7`). If simulation code that draws random numbers runs inside rendering or `useEffect`, dev and production would give different numbers. Rule: draw random numbers only in click handlers / engine calls.
- **Tailwind is installed but barely used.** Its CSS reset could slightly change form and heading defaults compared with the original. I'll check in Phase 1 whether to remove it.
- **The Figma Make plugins** in `vite.config.ts` are dev-only, but they add complexity you don't need outside Figma.
- **noindex**: `site.json` would stop search engines from listing the site. The original doesn't do this.
- **Performance**: the Simulation keeps every transaction and panel row in memory (8 months × ~1,000+ players). That's fine today. If it ever runs as part of React state on every render, it must be memoized.
- **Font-specific CSS** for VI/ZH (`index.html:1887-1895`) must be carried over, or Vietnamese and Chinese will render in fallback fonts.

---

## E. Test strategy

**Tools:** Vitest (unit + interaction, same config as Vite), @testing-library/react + jsdom (simulating clicks), and optionally 3–5 Playwright smoke tests for the final pre-presentation check.

### E1. Golden-master equivalence tests for the Simulation (most important)

*Concept: "golden master" = record what the trusted old code outputs, then prove the new code gives exactly the same output.*

1. Copy the original simulation functions **verbatim** into `tests/reference/originalSim.js`. The only edits are mechanical: (a) the seed becomes a parameter, (b) `readPlan()` is replaced by a plan object. Every edit gets a comment.
2. For several seeds × 5 markets × scripted plans (cosmetic-only, all 5 packages, power gacha, events every month, >6 tiers, empty-budget edge cases), run 8 months through **both** implementations.
3. Assert **deep equality** of `history`, `players`, `txns`, `panel`, `daily`, `tests`, the grade, and **byte-identical CSVs**. Park–Miller in JavaScript doubles is exact (max product ≈ 3.6×10¹³ < 2⁵³), so results must match to the last digit. No tolerances.
4. Lab tests: CBT / survey / A/B outputs for a fixed seed, including the credit count and "credits not refunded".

### E2. Unit tests (pure functions)

- `industryCalc` (move the existing assertions to Vitest).
- `sweetSpot`: US 12, CN 12, JP 19, VN 6.5, ID 1.5 (values I computed above).
- `goodwillDelta`, `churnAndInstall` boundaries (goodwill 59/60/61, 79/80/81), choice overload at 6 vs 7 tiers, pity at exactly 50.
- `evc.ts`: RefP 10 + DiffV 5 = 15 (screenshot example); two-outcome EVC; Σ rⱼ·Δv where a duplicate contributes 0.
- `gachaMath.ts`: expected pulls with hard pity (only once you approve the formula, G5/G6).
- CSV: quoting of commas, quotes, newlines and semicolons (`csvCell`, `:1606`).

### E3. Interaction tests (React)

- Simulation flow: choose market → confirm → toggle tiers → launch → a LiveOps row appears, the HUD updates, and after Month 8 the debrief shows.
- Lab: confirm/cancel, credits 3→2, A/B disabled reasons (no A / identical / empty B), surveys blocked after launch.
- Export buttons create files with the right names (`payorpray_<market>_months.csv` …).
- Industry: the timeline arrow keys, slider verdicts, and map pin selection.
- Keyboard and screen-reader basics: every control is reachable by Tab, and `aria-pressed` / `aria-selected` are correct.

### E4. Regression tests

- **Content tests:** key academic figures appear unchanged (188.8, 56%, 0.8%, 361, 0.0415%, 150, 36.7%, $320M, the 6 jurisdictions…). If someone accidentally edits a statistic, a test fails.
- **i18n coverage test:** every translatable key exists in the table for `vi` and `zh`.
- **Route smoke test:** all 7 hashes render without console errors.
- **Build test:** `pnpm build` passes with the GitHub Pages `base`.

---

## F. Implementation roadmap

Each phase ends with: tests green → you review → commit on the branch → you approve before the next phase. `main` (your live site) is **not touched** until the final phase, and only with your explicit approval.

| Phase | Scope | Depends on | Files affected | Acceptance criteria | Tests | Rollback |
|---|---|---|---|---|---|---|
| **1. Environment & baseline** | Install Git, Node 22, pnpm. Clone the repo. Tag `html-baseline` at `ea3a782`. Create branch `react-migration`. Move the React project in under `app/` (or the root — G3) and keep the original as `legacy/index.html` + `legacy/i18n.js`. | — | New folders only. | `pnpm dev` shows Home + Industry identical to the screenshots. The live site is unchanged. | Manual check. | Delete the branch. The tag still marks the original. |
| **2. Project hygiene** | Minimal `vite.config.ts` (Pages `base`, no Figma plugins). Vitest. Port the `industryCalc` test. Restore the exact token block (`data-theme` guard, `--badge-outline-bg`). Decide on Tailwind. | 1 | `vite.config.ts`, `package.json`, `src/index.css`, `src/lib/*.test.ts` | `pnpm test` and `pnpm build` pass. Dark/light behave like the original. | Unit + build. | `git revert` of the phase commit. |
| **3. Simulation engine** | `src/sim/{params,rng,engine,lab,debrief,csv}.ts`, extracted **without changing behavior**. No UI. | 2 | `src/sim/*`, `tests/reference/originalSim.js`, `tests/sim/*` | Golden-master tests pass with exact equality for all seeds × markets × plans. Byte-identical CSVs. | E1, E2 | Revert. Nothing visible changes. |
| **4. Simulation UI** | Market select, plan builder, event toggle, lab with confirm, HUD, LiveOps, sparkline, log, debrief, exports, play again. The "How this simulation works" footer. | 3 | `src/pages/Simulation.tsx`, `src/pages/simulation/*` | Every original control exists and works. A scripted run with a fixed seed matches the original's numbers. | E3 + golden | Revert. The page falls back to `Coming`. |
| **5. Case Study, Diagnostic, About** | Port text and data exactly. Comparison table. Interactive 2×2. References. | 2 | `src/pages/{CaseStudy,Diagnostic,About}.tsx`, `src/data/{caseStudy,references}.ts` | Every sentence and figure from the original is present (diff-checked). Pity visual only after G5. | Content + interaction | Revert per page. |
| **6. Framework calculators** | Deterministic slider calculator (screenshot). Probabilistic calculator using the original two-outcome formula. "Show the mathematics" with Σ rⱼ·Δv. | 2 (+ G decisions) | `src/pages/Framework.tsx`, `src/lib/evc.ts` | Formulas exactly as in `index.html:723-736`. Inputs labelled as teaching examples. Citations shown. | Unit (evc) + interaction | Revert. |
| **7. Home interactive** | Clickable display case (known price → known item) vs gashapon (pay → random outcome, with pity), as a labelled teaching demo. | 6 (shared gacha math) | `src/pages/Home.tsx`, `src/components/GachaDemo.tsx` | Odds source per G4. Reduced-motion respected. Keyboard accessible. | Unit + interaction | Revert. |
| **8. Languages** | Per G2: React `t()` using your `i18n.js` data (keyed by English as today), VI/ZH fonts, protected brand names, a coverage test. | 4–7 | `src/i18n/*`, all pages | Switching language needs no reload and doesn't break the Simulation. CSVs stay English. | i18n coverage + smoke | Revert. English still works. |
| **9. Presentation polish** | Page titles, reduced motion, mobile at 375 px, dark mode, Present mode for every page, accessibility pass. | 4–8 | CSS + components | Checklist passes on desktop + phone. | Playwright smoke (optional) | Revert. |
| **10. Deploy** | GitHub Actions build → Pages. **Only with your explicit approval.** | 9 | `.github/workflows/deploy.yml` | Live site works at the same URL. Old version recoverable. | Build + smoke on the live URL | Re-deploy tag `html-baseline` (one command). |

*Why the Simulation comes first (phases 3–4): it's the biggest risk and the most valuable feature. Proving it is preserved early means the rest is mostly content work. If your presentation is very soon, phases 5–6 can run before 3–4. See G1.*

---

## G. Decisions I need from you

1. **When is the presentation?** This sets priorities. If it's under ~2 weeks away, I'd do Simulation + Case Study + Framework first and leave Vietnamese/Chinese until after.
2. **Languages.** *(a, recommended)* English as the main language, with VI/ZH served by React from your `i18n.js` translations — no Google Translate, so no crash risk; untranslated new text shows in English. *(b)* Keep Google Translate as a fallback for untranslated text (risk D7). *(c)* English only for now.
3. **Where the React app lives.** *(a, recommended)* Same repo, branch `react-migration`, original kept in `legacy/` and tagged. It replaces the live site only when you approve. *(b)* A new repository.
4. **Home gacha demo odds.** The real WWM odds (0.0415%) would almost never hit in a live demo. *(a, recommended)* A clearly labelled teaching example (e.g. the Simulation's own default: 5% odds, 50-pull pity). *(b)* Real WWM odds with a "fast-forward to pity" button. *(c)* HoK-style rising odds (needs Q5).
5. **Honor of Kings' luck-value schedule.** Your sources give 0.8% starting odds and a guarantee by draw 361, but **not how much the odds rise per draw**. Do you have that schedule? If not, I'll show HoK as a range (1–361 draws) and **won't invent** a curve. For WWM I can derive P(win before pity) and expected pulls from 0.0415% + 150. These would be new derived numbers, so I'll show you the math before it goes on the site.
6. **Keep the Simulation's approximations?** The expected-cost formula (D4) and "$7" rounding (D5). *Recommended:* keep the engine exactly as it is (it's what your report describes) and fix only the "$7" display to "$6.50".
7. **Search engines:** keep the Figma `noindex` (the site won't appear in Google) or remove it like the original?

**Also needed (not a decision):** please install **Git** and **Node.js 22 LTS** (or let me give you the exact install commands). And please tell me if you have the research/assignment materials mentioned in your brief (item E). They weren't attached, so I validated content only against your original HTML.
