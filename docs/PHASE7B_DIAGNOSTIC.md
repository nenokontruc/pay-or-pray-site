# Phase 7B · Item 4 — Diagnostic, matrix-first: specification and mapping

**Question on screen:** *Where does your monetization design fall?* Answer two questions to understand its pricing and player-risk implications.

**Flow:** Select (two Yes/No questions, or an example) → Locate (the matrix highlights one cell, and the matching column and row light up) → Understand (result panel and takeaway) → Explore evidence (Reading the matrix, text version, references).

## Classification (unchanged from the original)

| Q1 · Is the item's value known before purchase? | Q2 · Does it change competitive power? | Position | Original cell |
|---|---|---|---|
| Yes (deterministic) | No | **A** | Fixed-price cosmetic shop · Lowest risk |
| No (probabilistic) | No | **B** | Cosmetic lucky draw · Moderate risk |
| Yes | Yes | **C** | Fixed pay-to-win shop · High risk |
| No | Yes | **D** | Power-affecting loot boxes · Highest risk |

The letters A–D are position labels in reading order, not scores. The risk labels are the original ordinal positions. **No numerical scores are added.**

## Result-panel fields and where each comes from

| Field | A | B | C | D | Source |
|---|---|---|---|---|---|
| Value certainty | Known before purchase | Resolved by probability after the transaction | Known before purchase | Resolved by probability… | Framework (deterministic goods); Industry, "Loot Box / Gacha" |
| Spending pressure | Compromise and anchor effects | Pity, near-miss, sunk-cost escalation | Direct purchase of competitive power (network effects) | Gambling-adjacent mechanics + paid power | Diagnostic cells; Framework, Choice Architecture; Industry, "Pay-to-Win Add-ons" (Harutyunyan & Koca, 2025) |
| Principal risk | Lowest risk | Probability mechanic still draws regulatory attention | Fairness backlash | Gambling-adjacent + competitive unfairness | Diagnostic cells |
| Operational implication | Recommended default for most titles | Removing power reduces, doesn't eliminate, regulatory exposure | Generally advised against | Primary target of loot-box regulation | Diagnostic cells; "Reading the matrix" |

## Examples (all nine original examples kept)

| Example | Position | Why here | Pricing implication (source) |
|---|---|---|---|
| Honor of Kings skin shop | A | Named in the cell by the original; at its lower edge (small stat bonuses) | Standard EVC: value known before purchase (Case Study) |
| Where Winds Meet skin shop | A | Named in the cell | Standard EVC (Case Study) |
| HoK · Points Treasure Hunt | B | Named in the cell; closer to the left edge (players choose the prize) | Close to deterministic at the end: uncertainty is about price, 1–361 draws (Case Study) |
| WWM · Echo gacha | B | Named in the cell | Fully probabilistic until 150: expected-value EVC (Case Study) |
| Simulation · Cosmetic Skins, Battle Pass | A | Its own Simulation flags: not a draw, no power | Standard EVC (Case Study) |
| Simulation · Power Items | C | Flags: not a draw, raises power | Generally advised against (Diagnostic cell) |
| Simulation · Cosmetic Gacha | B | Flags: a draw, no power | EVC re-derived in expectation (Framework) |
| Simulation · Power Gacha | D | Flags: a draw, raises power | Primary target of loot-box regulation (Diagnostic cell) |

No new examples were classified.

**Screening tool, not a score.** The page says so: the framework compares designs by two questions; it isn't a statistically validated risk-scoring instrument.

## Build results

**Before → after (measured at desktop 1280 × 800):**
- Before: 14 controls of equal weight on the first screen (two questions, nine example chips, four cells), with the matrix to one side and the takeaway at ~1,260 px.
- After: one bench holds the two Yes/No questions, the matrix and Reset (9 controls). All four quadrants fit on the first screen (bottom row ends at 794 px). The examples are a compact row below.
- The answers light up the matching column and row ("Q1 · Yes", "Q2 · No"), so the visitor sees *why* a cell is selected.

**Checked in a real browser (in-app browser):**
- 1280 × 800, light: layout, all four cells on the first screen (after tightening hero spacing and cell padding, which were found too tall on the first pass), example selection (Echo gacha → B, with Q1 switched to No), result panel.
- 375 × 812, dark: the 2×2 is kept (cells ~141 px wide), no sideways scrolling, Yes/No and Reset ≥ 44 px, dark tokens applied.
- Not tested: a physical touch device and a screen reader.

**Tests:** `tests/pages/diagnostic.test.tsx` was rewritten (23 tests): the four quadrants with the original text, positions A–D and icons; all four Yes/No combinations with axis highlighting; the result fields and screening note; all nine examples (answers update, cell, why-here, pricing implication); changing an answer clears the example; reset; arrow-key roving focus and accessible names; the text version; scoped token-only CSS with a 2×2 phone layout. The content-preservation test confirms every original Diagnostic sentence and citation is still on the page.

**Limitations:**
- The framework is a screening tool, and the page says so; there are no scores.
- The "spending pressure" lines for C and D summarise original cell text and the Industry pay-to-win description. They are not new research.
- On phones the questions stack above the matrix, so the matrix starts below the first screen there.
