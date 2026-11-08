# Phase 5 — Content inventory and mapping

Source: `legacy/index.html`. Case Study `:765-876`, Diagnostic `:878-946`, About `:1084-1145`.

**Enforcement.** `tests/pages/contentPreservation.test.tsx` parses the original page and checks that the
text of every heading, paragraph, list item, table cell, fact label/value, callout, note, kicker, badge,
reference and footer line in these three sections appears **word for word** in the React page (visible, or
inside an expandable panel). Nothing can be dropped silently: the test fails.

Legend: **V** = visible on the page · **D** = inside an expandable panel (`<details>`, always in the page).

## Case Study

| Original item (line) | Content | React destination |
|---|---|---|
| Hero (`:768-770`) | Kicker, title "Two Chinese games, two ways to sell chance", lede | V · page hero |
| 01 kicker (`:775`) | "01 — Both sell both" | V · section 01 heading |
| HoK panel (`:777-792`) | Badge "Dual channel"; Tencent · MOBA · cosmetic-first; skin ladder 288–1,788 pts; recharge ¥6/30/68/128/328/648; 积分夺宝; 0.8% rising; guarantee by draw 361; Crystal → skin of your choice; 暴击夺宝 360 guarantee, random skin; 2016 revenue ¥6.8B; 2024 ~¥100M/day | V · game panel A (every fact row) |
| WWM panel (`:793-806`) | Badge; Everstone/NetEase · Wuxia RPG · China Dec 2024 · global Nov 2025 · cosmetic only; Echo Beads; 0.0415% fixed; 0.747% material; guarantee by pull 150; one specific named outfit; ~$115M (~$8M/mo) first 14 months | V · game panel B (every fact row) |
| 02 kicker, heading, lede (`:813-815`) | "Same idea, opposite designs" + lede | V · section 02 |
| Comparison table (`:817-827`) | 6 rows × 2 games | V · interactive comparison (one row at a time) **and** D · full table |
| Key-difference callout (`:829`) | "in Honor of Kings, chance decides how much you pay…" | V · section 02 takeaway |
| 03 kicker, heading (`:835-836`) | "The item, not the game, sets the pricing tool" | V · section 04 heading |
| Pricing prose (`:838-841`) | 4 paragraphs (fixed-price skins / HoK near-deterministic / WWM fully probabilistic / compare what is sold) | V · implications grid (short labels) **and** D · full paragraphs |
| Chen et al. note (`:843`) | unique boxes vs ~36.7% | V · evidence card |
| Naavik note (`:844`) | Wuthering Waves ~$320M over 21 months | V · evidence card |
| "Why this pairing, specifically" (`:846-850`) | 2 paragraphs incl. Genshin rejection | D · "Why this pairing" |
| Footer refs + meta (`:857-872`) | 8 references; drop-rate disclosure note | V · page footer |
| — new — | Probability section: WWM curve **derived** from 0.0415% + 150; HoK drawn as **illustrative**, only the two published anchors (0.8%, 361) | V · section 03, clearly labelled; derivation in D |

## Diagnostic

| Original item (line) | Content | React destination |
|---|---|---|
| Hero (`:881-883`) | Kicker "Diagnostic Framework", title, lede | V · page hero |
| Column heads (`:889-890`) | DETERMINISTIC VALUE / PROBABILISTIC VALUE | V · matrix axes |
| Row labels (`:893`, `:907`) | COSMETIC / NON-POWER · POWER-AFFECTING | V · matrix axes |
| 4 cells (`:895-918`) | Risk label, title, explanation incl. examples | V · matrix cells (verbatim) + selected-cell panel |
| "Reading the matrix" (`:921-925`) | 3 paragraphs (diagonal; top row conclusion; market dependence + Simulation link) | V · takeaway (top-row sentence) **and** D · full text |
| Footer refs (`:936-937`) | Petrovskaya & Zendle 2022; Zendle, Meyer & Ballou 2020 | V · page footer |
| — new — | Two-question classifier and example chips (case-study goods named in the cells; Simulation packages placed by their own power/gacha flags) | V · interactive selector |

## About

| Original item (line) | Content | React destination |
|---|---|---|
| Kicker + "Who built this" (`:1088-1089`) | | V |
| Photo frame (`:1093-1096`) | "TT" monogram; `headshot.jpg` (not in repo) | V · monogram; photo shown automatically if `public/headshot.jpg` is added |
| Meta (`:1097-1101`) | Program, Background, Localization | V |
| Bio (`:1104-1106`) | 3 paragraphs | V (verbatim) |
| "From experience to analysis" (`:1108-1113`) | 3 link cards (#industry, #simulation ×2) | V |
| "Path" timeline (`:1115-1120`) | 2019–2023, 2023–2025, 2025–now | V |
| Acknowledgments (`:1122`) | anonymized interviewee, Dr. Tim Smith, OPM 6600 instructor | V |
| LinkedIn (`:1123`) | https://www.linkedin.com/in/truc-trinh-anh-nha-253a63234/ | V · opens in new tab, `rel="noopener"` |
| Footer (`:1133-1140`) | About this project | V · existing footer (unchanged) |

## Verification results

- `tests/pages/contentPreservation.test.tsx`: **every** original text item in the three sections is found word for word. Whole fact rows, table rows and matrix cells are matched as units, so a value must sit next to its own label.
- **Can the check catch an edited figure?** I changed "0.747%" to "0.74%". The first version of the test still passed, because "0.747%" also appears in the derivation note. After tightening the test to match label + value together, the change was caught. Reverted.
- Key figures are also checked individually (`caseStudy.test.tsx`), and the comparison table and Diagnostic cells are compared cell by cell against the original file.

## Differences from the original pages (presentation only)

| Change | Why |
|---|---|
| New headings and "Takeaway" lines that summarise original statements (e.g. section 01 heading; Diagnostic takeaway shortening the original "makes sense" sentence) | Key message first, for the presentation. The full original wording stays on the page. |
| Case Study: interactive comparison shows one table row at a time, with a "Why it matters" sentence from the original analysis | The full table is kept in a disclosure. |
| Case Study: new probability chart (section 02) | Where Winds Meet's curve and its two figures (≈6.0% win before the guarantee; ≈145.5 expected pulls) are **derived** from the published 0.0415% and 150. They're labelled "derived", with the formula and assumptions shown. **Honor of Kings' curve is not drawn**: only the band implied by 0.8% start + rising odds + guarantee at 361. *These derived numbers are new to the site. Please confirm you're happy to show them.* |
| Case Study: implications grid | Short labels taken from the four original paragraphs; full paragraphs in a disclosure. |
| Diagnostic: two-question selector, example chips, arrow-key grid, detail panel | Uses only the original classification. "Primary risk" and "Implication" are sentences from the original cell text and "Reading the matrix", with the first letter capitalised where they begin a field. |
| Diagnostic: Simulation packages as examples | Placed by their own `power`/`gacha` settings in `src/sim/params.ts`, i.e. the framework's two questions. The original doesn't list them in the matrix. |
| About: "Who built this" is now the page's level-1 heading (was level 2) | Every page needs one main heading (accessibility). Same text and size. |
| About: headshot | Shown automatically if `public/headshot.jpg` is added. Until then, the "TT" monogram (same fallback as the original). |
