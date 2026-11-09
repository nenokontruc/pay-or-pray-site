# Phase 6 — Framework: inventory, mathematical specification, results

Source: `legacy/index.html:711-762`.

## 1. Content inventory → destination

Legend: **V** visible · **D** inside "Show the mathematics" or a card's expandable panel (always in the page).
Enforced by `tests/pages/contentPreservation.test.tsx` (Framework added to the Phase 5 test): every original
text item must appear word for word, with formulas and fact rows matched as whole units.

| Original item (line) | Content | React destination |
|---|---|---|
| Kicker, title, lede (`:714-716`) | "Framework"; "Two formulas, one variable"; lede on EVC as the pricing ceiling | Kicker V; new title "Two ways to value an in-game item" + subtitle V; original title and lede D (heading of the mathematics panel) |
| Deterministic block label + badge (`:722`) | "Deterministic goods" · "Applies directly" | Tab A (V) and the original block in D |
| Formula (`:723`) | EVC = RefP + DiffV | V · Tab A (large) and D |
| Note (`:724`) | "The maximum defensible price: …" | V · Tab A (shortened lead) + full sentence D |
| Terms (`:726-727`) | RefP / DiffV definitions | V · control labels and D |
| Probabilistic block label + badge (`:732`) | "Probabilistic goods" · "Consistent with published OR literature" | Tab B (V) and D |
| Formula (`:733`) | EVC(gacha) = P(success) × Value − P(failure) × Cost | V · Tab B and D |
| Note (`:734`) | Reframing; Dr. Tim Smith Q&A; OR literature supports the structure; special case | D (full) + V card "EVC and gaming" |
| General formula (`:735`) | V(A,v,r) = Σⱼ rⱼ × [v(A∪{j}) − v(A)] | D (verbatim) + typeset version with worked example |
| Note + citation (`:736`) | marginal value, duplicate contributes zero; Han, Ryan & Tong, 2026 | D (verbatim) + explanation of why |
| "The rest of the toolkit" (`:739`) | heading | V |
| WTP paragraph (`:741`) | d(p) = D·(1 − W(p)), Paying Rate, Newzoo 56%, ARPPU | V card (key line) + D (full paragraph) |
| Choice Architecture paragraph (`:742`) | compromise/anchor vs near-miss, sunk cost, pity timer | V card + D (full) |
| Footer (`:751-758`) | 2 references + standard meta | V · page footer |

## 2. Mathematical specification (what each symbol means)

**Deterministic:** `EVC = RefP + DiffV`
- RefP is the price of the next-best alternative (≥ 0).
- DiffV is the differentiated value over that alternative. It may be **negative** if the item is worse on what the customer values; the page allows −$50…$50.
- EVC is the *maximum defensible price*, a ceiling. It isn't the profit-maximizing price, and the page says so.

**Probabilistic (simplified, original):** `EVC(gacha) = P(success) × Value − P(failure) × Cost`, with `P(failure) = 1 − P(success)`.

The original note defines this as *"expected gain from success, minus the expected sunk cost of failing."* So:

| Symbol | Meaning on this page | Not to be confused with |
|---|---|---|
| P(success) | Chance that this attempt yields the wanted item | The drop rate of *any* item |
| Value | What the player gains **if** the attempt succeeds (value conditional on success) | The item's list price |
| Cost | What is lost, as a sunk cost, **if** it fails (cost conditional on failure) | The *price per draw*, or the *expected cost of acquiring* the item (price × expected draws, see Case Study) |
| EVC(gacha) | Expected net value of the attempt under these two outcomes | A full model of a gacha (no pity, no duplicates, one target item) |

**One consistent reading (shown as an interpretation, not as the definition):** if one attempt costs *c* and the item is worth *W* to the player, set Value = *W − c* (net gain on success) and Cost = *c* (lost on failure). The expression becomes p·W − c, which is algebra under that reading.

**General model (Han, Ryan & Tong, 2026, as cited):** `V(A,v,r) = Σⱼ rⱼ [v(A∪{j}) − v(A)]`.
- A is the set already owned, rⱼ the probability of reward j, and v the player's value of a set.
- Because A ∪ {j} = A when j is already owned, a duplicate adds exactly 0 *in this set-based model*. A model where duplicates have value (e.g. conversion to currency) would need a different v.
- **Relationship to the simplified form.** With one valued target (probability p, marginal value Value) and nothing else valued, V = p × Value, which is exactly the *success term*. The failure term −P(failure) × Cost is **not** part of V, which measures gross expected value before any price is paid. The page states this instead of claiming one formula derives the other.

## 3. Interaction design

- Two ARIA tabs. Arrow keys / Home / End move between them; both panels stay mounted, so values survive switching.
- Each input has a slider and a number box kept in sync. Invalid or out-of-range typing shows a message and doesn't change the result. Reset restores the illustrative defaults.
- Deterministic visual: a segmented bar (RefP + DiffV = EVC; negative DiffV is shown as a subtracted segment).
- Probabilistic visuals: a success/failure probability bar, and a diverging bar of expected gain vs expected sunk cost with the net result.
- "Show the mathematics": the original formulas verbatim, definitions, live step-by-step with the current inputs, assumptions, interpretation, limitations, the general model with a worked duplicate example, and references.

## 4. Phase 5 probability question (resolved first, commit f7855ec)

- **Source check (Nov 2026):** the cited BitTopup guide supports *0.0415% fixed* for outfits, *no soft pity* and a *150-pull hard pity* for a specific outfit. The same guide says the shared counter resets on **any** Legendary. A second BitTopup guide says the guarantee awards **any** Legendary (0.83% rate). Both are top-up reseller pages, not official disclosures.
- **Constant independent odds:** consistent with "0.0415%, fixed" and "no soft pity". The unverifiable part is that *only this outfit* resets the counter.
- **Arithmetic, checked three ways** (closed form, step-by-step product, 2,000,000-player Monte Carlo): 6.00% within pulls 1–149; 94.00% reach pull 150; 100% by pull 150; 145.46 expected pulls.
- **Outcome:** the curve is labelled a *hypothetical teaching model*. "Before the guarantee", "reaching the guaranteed pull" and "on or before pull 150" are stated separately, and the formula, assumptions and source conflict are in an expandable panel. The Honor of Kings curve is still not drawn.

## 5. Results

**Tests:** 164 pass (127 before + 37 new): `tests/lib/evc.test.ts` (18 numerical), `tests/pages/framework.test.tsx` (17 interaction), plus the content-preservation check extended to the Framework (2).
- Planted a 1% error in the expected-sunk-cost formula: 10 tests failed. Reverted.

**Browser (actually run, in-app browser, dev server):**
- 1440 px light: inputs left, result right, tabs in one row, no sideways scrolling. Typing, slider and arrow keys all update the result.
- 1280 px light: screenshot of the Probabilistic tab matches the approved layout.
- 375 px dark: both calculators stack with the result visible, no sideways scrolling even with the mathematics open, dark tokens applied (screenshot).
- All 7 pages at 375 px: no sideways scrolling, no console errors.

**Mathematical ambiguities kept visible on the page:**
- What "Value" and "Cost" mean in the simplified form. They're defined as conditional amounts, distinct from price per draw and expected acquisition cost. "One consistent reading" (Value = W − c, Cost = c → p·W − c) is offered as an interpretation only.
- The general form's V matches only the success term of the simplified form. The failure term isn't part of V, so the page doesn't claim one formula derives the other.
- "A duplicate contributes zero" holds because the model values sets (A ∪ {j} = A). A game where duplicates convert into currency would need a different v.
- Han, Ryan & Tong (2026) is cited by author and year only, as on the original site. The full reference is in the written report and wasn't invented here.
