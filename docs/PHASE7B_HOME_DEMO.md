# Phase 7B · Item 3 — Home interactive demonstration: specification

Goal: in under a minute, a visitor *experiences* the site's core distinction:
**Deterministic — you pay for a known item. Probabilistic — you pay for a chance at an outcome.**

Everything below is a **hypothetical teaching model** in an illustrative currency ("gems"). It is not
Honor of Kings or Where Winds Meet data and says so on screen. The code lives in `src/lib/homeGacha.ts`,
independent of the verified Simulation engine (`src/sim/` is not imported or changed).

## A. Known item (display case)

| State | What the visitor sees | Controls |
|---|---|---|
| Closed | The pixel display case, labelled "Tap the display case" | The case itself is a button |
| Open | One item, a **Silver Crown (cosmetic)**, with its price tag **800 gems** | **Inspect** (toggles details: cosmetic only, no gameplay advantage, what you see is what you get) · **Buy for 800 gems** |
| Bought | Receipt: "You paid 800 gems and received: Silver Crown — exactly the item shown." Takeaway: *the outcome was known before you paid.* | **Reset** |

No real purchase or payment of any kind.

## B. A chance at it (gashapon machine)

**Price:** 100 gems per draw.

**Outcome distribution per draw** (sums to 100%):

| Reward | Chance |
|---|---|
| Featured outfit | 5% |
| Rare accessory | 20% |
| Common emote | 75% |

**Guarantee (hard pity), defined precisely:**
- A counter tracks **draws since the featured outfit was last won** (it starts at 0).
- Rare and common rewards **do not** reset the counter.
- If 49 draws in a row miss the featured outfit, **draw 50 gives the featured outfit with certainty** (no random number is used for that draw).
- Whenever the featured outfit is won, by luck or by the guarantee, the counter **resets to 0**. Visitors can keep drawing; a second featured outfit is a duplicate.

**Derived from these assumptions** (shown as teaching figures; checked in tests):
- P(featured within the first 49 draws) = 1 − 0.95⁴⁹ ≈ **91.9%**; by draw 50 it is 100%.
- Expected draws to the featured outfit = (1 − 0.95⁵⁰) / 0.05 ≈ **18.5** (≈ 1,846 gems); range 1–50 draws (100–5,000 gems).

**Controls:** the machine (or **Draw · 100 gems**) draws once; **Draw ×10** helps show the guarantee during a presentation; **Reset**.

**Feedback:** a capsule drops and opens (skipped when the visitor prefers reduced motion), the outcome is announced to screen readers, and the panel shows draws, gems spent, featured wins, a pity meter ("12 / 50 since the featured outfit"), the chance on the next draw (5%, or 100% on the guaranteed draw) and the last 10 results.

## C. Comparison

Appears once the visitor has bought the crown **and** drawn at least once; until then a two-item checklist invites them to try both.

| | Known item | A chance at it |
|---|---|---|
| Known before paying | The item and its price | The price per draw and the odds |
| Still uncertain | Nothing | Which reward, and how many draws |
| Final spending set by | The price tag: 800 gems | Luck: *n* draws = *n* × 100 gems so far (100–5,000 for the featured outfit) |
| Pricing problem | EVC applies directly | EVC in expectation |

The comparison links to the Framework (the two calculators) and to the Case Study (how two real games design the draw).

## UX rules

- One primary control per card, discoverable without instructions (the artwork is the button, with a short label).
- Every control is a real `<button>`: keyboard (Tab, Enter or Space) and touch (minimum 44 px target).
- `prefers-reduced-motion: reduce` → no capsule animation.
- No sound, no autoplay, no points or badges.
- All original Home text is kept (hero, the two card descriptions, byline, four primer concepts, callout, six-page roadmap), enforced by the content-preservation test.

## Build results

- Built as three slices: known item, gashapon, then comparison and polish. Each slice was tested before the next.
- **Changed after real-browser checks:**
  - The gashapon card showed every control and stat before the first draw. Now the stats, pity meter, history, ×10 and Reset appear only after the first draw (progressive disclosure).
  - Odds labels were cut off inside the thin bar. They moved to a legend.
  - The crown and the dispensed capsule were drawn card-wide, because a shared card rule sets `width:auto` on every svg. They now have explicit sizes, locked in by a test.
- **Tests:** 11 rule tests (`tests/lib/homeGacha.test.ts`) and 15 interaction tests (`tests/pages/home.test.tsx`). Home was also added to the word-for-word content check.
- **Browser (actually run, in-app browser):**
  - 1280 × 800 light: both demos, the full journey (inspect → buy → 21 draws → comparison), sprite sizes measured.
  - 375 × 812 dark: cards stack, no sideways scrolling, every button ≥ 44 px, dark tokens applied.
  - Not tested: a physical touch device, and a screen reader. Touch targets and labels are checked in code.
