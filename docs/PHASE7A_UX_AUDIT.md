# Phase 7A — UX audit, storyboard, wireframes, roadmap

*Design and analysis only. No code was changed in this phase.*
*Baseline verified 2026-11-08: branch `react-migration` at `6b22c73`, clean tree, `pnpm check` → 164 tests pass, build OK.*

---

## 0. Method and limits

**Expert review, not user testing.** Everything below is my assessment as a reviewer walking the site as a first-time visitor. **No real users have been tested yet.** Section 7 proposes the checks that would confirm or overturn these findings.

**References actually studied**

| Reference | What I could read | Pattern taken from it |
|---|---|---|
| NN/g, *Progressive disclosure* | Full article | Show the few things most people need first; put the rest behind a clearly labelled control; **no more than two levels**; vague labels kill "information scent". |
| FT *Visual Vocabulary* (chart-doctor repo) | The README of `visual-vocabulary` | **Start from the relationship you want to show** (magnitude, part-to-whole, change over time, deviation, flow…), then pick the chart; **annotate the point of interest**. |
| Bret Victor, *Explorable Explanations* (the essay the explorabl.es movement is built on) | Full essay | **Reactive documents**: the reader changes an assumption and sees the consequence; interactivity stays *inside* the explanation, which still guides the reader. |
| The Pudding, *How to make dope shit, part 3* | Full article | **Stepper vs scrollytelling**: steppers force a structured argument and suit presenting and mobile; scroll-triggered animation is costly and can be skipped by fast scrolling. Pair **each takeaway with its own chart**; static charts are often enough. |
| pudding.cool homepage | Story teasers only | Each story is introduced by a **question or a claim**. |
| explorabl.es | Mission text only (examples load by script) | — |
| observablehq.com | **Not read** (the site refused the request: HTTP 429) | — |

**Measurements (desktop 1440 × 900, real browser)**

| Page | Height (screens) | Words visible without opening anything | Boxed blocks | Controls | Where the first control is | Where the first takeaway is |
|---|---|---|---|---|---|---|
| Home | 2.8 | ~450 | 13 | 0 | none | none |
| Industry | 6.2 | ~800 | 11 | 42 | ~430 px | ~1,070 px |
| Framework | 2.2 | ~310 | 6 | 16 | ~440 px | ~1,100 px (below the workbench) |
| Case Study | 5.1 | **~900** | 13 | 7 | **~1,600 px** | ~1,230 px |
| Diagnostic | 2.1 | ~270 | 6 | 17 (**14 on the first screen**) | ~500 px | ~1,260 px |
| Simulation (market step) | 1.9 | ~260 | — | 6 | ~720 px | none |
| About | 1.8 | ~300 | 3 | 0 | none | none |

---

## A. First-time visitor journey (expert assessment)

**Persona.** A classmate in a pricing course who rarely plays mobile games. They know "price", "value" and "willingness to pay", but not "gacha", "pity" or "ARPPU".

| Step | What they see | Likely confusion | Why |
|---|---|---|---|
| Home, first screen | Big question, a long lede, two pixel-art cards | "Is this a slide deck, an article or a game?" | No visible action. The two cards (the strongest idea on the site) are static pictures. The words "deterministic / probabilistic" arrive as badges before they are explained. |
| Home, scrolling | Four primer cards, a callout, six nav cards, two seal illustrations | "Which of these do I read?" | 13 equally weighted boxes. The one-sentence argument is in a small callout between two grids. |
| Industry | Subnav, three charts side by side, a timeline, seven model buttons, two tabs + slider, a map with six pins | "Is this one story or five facts?" | Each section is well built, but nothing says *why the next section follows*. Three charts compete on the first screen. 42 controls on one page. |
| Framework, workbench | Two big tabs, formula, sliders, result | Mostly clear. "Is $15 the price I should charge?" "What is DiffV?" | The ceiling-vs-price distinction is stated in the result text, not shown. The Probabilistic tab's "Value" and "Cost" are defined only in small print. |
| Framework, toolkit | Three cards: a formula, a two-box comparison, a quote | "How do these connect to the calculator I just used?" | Three parallel cards with no order. "d(p) = D·(1 − W(p))" appears with no picture of what it means. |
| Case Study, first two screens | Two long fact panels (26 rows of figures, Chinese names, ¥ amounts) | "What am I supposed to notice?" | **The economic point arrives after the figures.** The first clickable thing is ~1,600 px down. The key sentence ("chance decides how much you pay, but you choose what you get") is in a callout *below* the comparison. |
| Case Study, comparison | Six chips; clicking swaps two text boxes | "Did anything change?" | The interaction replaces text with text. Nothing shows *where in the purchase* the uncertainty sits. |
| Case Study, chart | Probability chart with band, slider, two readouts | Understandable with effort. "Why is one a line and one a shaded band?" | The legend explains it, but the honest-uncertainty idea deserves a one-line annotation on the chart itself. |
| Diagnostic | Two questions, nine example chips, four cells, detail panel | "Do I answer the questions, click a chip, or click a cell?" | Three entry points at once (14 controls on the first screen). The matrix (the actual idea) is not the visual centre. |
| Simulation | Long lede, four steps, five market cards, a details panel | Fine once started. "What should I watch during the game?" | No hint that goodwill and paying rate are the numbers to watch. The "best price" note is easy to miss. |
| About | Bio, links, timeline | Clear | Appropriately simple. |

**Overall pattern.** The content is right but the *order of disclosure is inverted*. Figures and labels come first; the question and the insight come after. Several interactions swap text instead of showing a relationship.

---

## B. Visual hierarchy audit

Scale for cognitive load, density and discoverability: **L** good · **M** acceptable · **H** problem.

| Page | Primary focal point (now) | Should be | Secondary info | Call to action | Load | Density | Discoverability | Presentation flow |
|---|---|---|---|---|---|---|---|---|
| Home | Title | The **known item vs. lucky draw** contrast | Primer, nav cards | Weak (nav cards only) | M | **H** (13 boxes) | **H** (nothing to try) | Good opening slide, weak second screen |
| Industry | Three equal charts | **One** headline number per section, then its chart | Timeline detail, model list | Clear per widget | M | M | L | **H**: no connective thread between the five sections |
| Framework | Tabs + formula | Same, plus the **ceiling vs. price** idea made visible | Mathematics panel (well placed) | Clear | L | L | L | Workbench good; toolkit is a dead end |
| Case Study | Two fact panels | **"Where does the randomness end?"** | Figures, table, sources | Late (1,600 px) | **H** | **H** | **H** | **H**: the point comes after the evidence |
| Diagnostic | Controls column | **The 2×2 matrix** | Examples, detail, text table | Too many | **H** | M | M | Medium |
| Simulation | Market cards | Same, plus "what to watch" | Profiles table | Clear | M | M | L | Good |
| About | Bio | Same | Links, path | — | L | L | — | Fine |

---

## C. Visualization opportunities

Only where a visual teaches something the text can't. Complexity / regression risk: L · M · H.

| Section | Current weakness | Educational objective | Best format (FT relationship) | Interaction (only if useful) | What it teaches | Academic content to keep | Complexity | Risk |
|---|---|---|---|---|---|---|---|---|
| **Home · duality** | Static pictures | "Known item vs. chance" in 10 seconds | Two-panel contrast | Tap the shelf: item + price appear. Tap the capsule machine: a draw happens (teaching odds, labelled). | You pay the same way but learn *what you got* at different times. | Existing text, byline | M | L |
| Home · primer + nav | 13 equal boxes | Know the 4 terms; know the route | **Numbered route** (flow) | — (static) | The order of the argument | All primer text, all 6 destinations | L | L |
| Industry · market | 3 competing charts | "Huge, but most players pay nothing, and growth is stalling" | Lead with the pictogram (part-to-whole); donut and bars as supporting | Keep as is | That the money comes from a minority | All figures + sources | L | L |
| Industry · whole page | No connective thread | Each section answers the previous one | "Story so far" bridge line per section | — | Why history, models, economies and rules follow | All | L | L |
| Framework · ceiling vs. price | Stated, not shown | EVC is a *ceiling*; the price sits at or below it | Add a **price marker** on the existing value bar (magnitude) | Optional "your price" slider: below/at/above the ceiling | That pricing above EVC loses the rational buyer | Formula, definitions | M | L |
| **Framework · toolkit** | 3 parallel cards | WTP → Choice architecture → EVC in gaming as **one chain** | 3-step **stepper** with one running example | Step 1: price slider over an illustrative WTP strip shows Paying Rate. Step 2: shelf vs. capsule (anchors need comparisons). Step 3: links to the two calculator tabs. | d(p) = D·(1 − W(p)) visually; why gacha breaks anchoring; why EVC must be re-derived | Both paragraphs verbatim, formula, Newzoo 56%, Tim Smith quote | M | L |
| **Case Study · opening** | Figures first | "Both sell both; the difference is the draw" | **Channel diagram**: two lanes (fixed shop / lucky draw) × two games | — (static, annotated) | Where each game puts randomness | All fact rows (moved below, unchanged) | M | M (content test) |
| **Case Study · comparison** | Text-swap chips | *Where* uncertainty sits in each purchase | **Purchase-path diagram** (flow), highlighted step by step | Stepper: Pay → Draw → Miss → Guarantee → Prize. Each step lights the matching table row. | HoK: uncertain cost, chosen prize. WWM: uncertain cost **and** prize until 150. | Full table (kept), callout, "why it matters" sentences | M | M |
| Case Study · chart | Line vs. band unexplained on the chart | Honest uncertainty | Keep; add **two on-chart annotations** | Keep slider; add "reset to 100" | Exact vs. range vs. hypothetical | Teaching-model label, derivation panel | L | L |
| Case Study · implications | 3 × 3 text grid | Item → pricing tool | Keep grid, add a **row-highlight** synced to the path stepper | (shared with the stepper) | Same storefront, two tools | Four paragraphs (kept) | L | L |
| **Diagnostic** | 3 entry points | Read the framework in 5 seconds | **Matrix first and large**; the two questions become the **axis labels** (clickable toggles); examples drop to one compact row | Click an axis or a cell; examples secondary | Two questions → four positions; risk rises on the diagonal | Cell text verbatim, Reading the matrix, text table | M | M (tests reference current controls) |
| Simulation · onboarding | No "what to watch" | Know the 3 numbers that matter | One-line **"Watch these"** strip under the HUD (static) | — | Revenue vs. goodwill trade-off | All | L | L (no engine change) |
| About | — | — | Keep | — | — | — | — | — |

**Things I'm deliberately *not* recommending:** scroll-triggered animations (they interrupt speaking, and Pudding notes fast scrolling skips them); extra tooltips on every term (two-level disclosure is enough); a separate "presentation copy" of the site.

---

## D. Information architecture: storyboard

**The argument in one line:** *Free games earn money by selling either known items or chances. Those are two different pricing problems; the case study shows two ways to sell chance, the diagnostic shows the risk, and the simulation lets you feel the trade-off.*

| # | Page · section | Question on screen | Primary visual | What you (presenting) do | Takeaway on screen |
|---|---|---|---|---|---|
| 1 | Home · hero | "When does free actually pay off?" | Shelf vs. capsule machine | Tap both | "Known item, or a chance at one." |
| 2 | Home · route | "What do I need to know?" | 4 terms on a numbered route | Point to step 1 | — |
| 3 | Industry · market | "How big is this, and who pays?" | 56 / 100 pictogram | Click "spend nothing" | Mobile is 55% of $188.8B; 56% pay nothing |
| 4 | Industry · history | "How did we get here?" | Timeline | Click 2009 and 2017 | Three eras |
| 5 | Industry · models | "What can a free game sell?" | Determinism continuum | Click Loot box | Two kinds of goods |
| 6 | Industry · economies | "Does one price fit every country?" | Price-range slider | Slide to $15 | Porting a US ladder misprices |
| 7 | Industry · rules | "Why can we see the odds at all?" | Map | Click China | Disclosure law = our dataset |
| 8 | Framework · deterministic | "What is a known item worth?" | Value bar + price marker | Move RefP/DiffV | EVC is a ceiling |
| 9 | Framework · probabilistic | "What is a *chance* worth?" | Probability + contribution bars | Lower P(success) | Re-derive in expectation |
| 10 | Framework · toolkit stepper | "Why does chance change the psychology?" | WTP strip → shelf vs. capsule | Step 1 → 3 | No comparison set → anchoring fails |
| 11 | Case Study · channels | "Do these games sell chance differently?" | Channel diagram | — | Both sell both |
| 12 | Case Study · purchase path | "Where does the randomness end?" | Path stepper | Step through 5 steps | HoK: you choose the prize. WWM: the studio does |
| 13 | Case Study · odds | "How long until you win?" | Pity chart (teaching model) | Slide to 149 / 150 | Most hit the guarantee (hypothetical) |
| 14 | Case Study · pricing | "Which pricing tool applies?" | Implications grid | Point | The item sets the tool |
| 15 | Diagnostic | "How risky is a design?" | Large 2×2 | Click axes | Stay in the top row |
| 16 | Simulation | "Can you price it yourself?" | Live game | Run 2–3 months | Revenue vs. goodwill |
| 17 | About | — | — | — | — |

**Presenter-guided vs. independent use (same content, same calculations):**

- **Presenter stepper.** In Present mode, `→` / `PageDown` moves to the next storyboard section on the page (then on to the next page), and `←` goes back. A small "4 / 17" indicator shows where you are. These keys are disabled while focus is in an input, so sliders still work. Nothing animates on its own.
- **Reset.** Every demonstration gets a visible "Reset" (Framework already has one).
- **Sources on demand.** In Present mode, `S` opens the current page's references in a panel; `Esc` closes it.
- **Independent mode.** The same sections show the question line and a small "Try it" cue next to the primary control. No separate copy of the site.

---

## E. Annotated wireframes (top three priorities)

### E1 · Framework: "The rest of the toolkit" → guided chain

```
DESKTOP ───────────────────────────────────────────────────────────────────────────
  WHY DOES CHANCE CHANGE THE PRICING PROBLEM?                   ← question first (h2)
  ┌ ① Who pays? ─────┬ ② What do they compare? ┬ ③ So, how do we value it? ┐  ← stepper tabs
  └──────────────────┴─────────────────────────┴───────────────────────────┘     (always 3; keyboard ←/→)
  ┌───────────────────────────────────────────┬───────────────────────────────┐
  │ ① 100 players' willingness to pay          │ d(p) = D·(1 − W(p))           │ ← original formula,
  │  ▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▯▯▯▯▯▯▯▯▯▯▯▯▯▯ …       │ Paying Rate = P(wtp ≥ p)       │   labelled
  │  0          price ▼ $4.99          $20     │                               │
  │  [=========●=====================]          │  Paying Rate: 18%  ← live     │
  │  ILLUSTRATIVE distribution · 56% pay       │                               │
  │  nothing (Newzoo) — real                   │                               │ ← real vs illustrative
  └───────────────────────────────────────────┴───────────────────────────────┘    tagged separately
  TAKEAWAY  Raising the price loses the marginal player — most were never paying.
  ▸ Full explanation (original WTP paragraph, verbatim)            Next: ② →

  ② (same frame)  [ shelf: $4.99 · $9.99 · $19.99 ]   vs   [ capsule: ?  ? ? ]
                  "Compare and choose" (anchor, compromise)     "No comparison set" → near-miss,
                  — highlight the middle tier on hover —         sunk-cost escalation, pity timer
  ③ (same frame)  Known value → EVC applies directly  [Open Deterministic tab ↑]
                  Chance → EVC re-derived in expectation [Open Probabilistic tab ↑]
                  "Yes — but trickier than a standard case." Dr. Tim Smith (quote, sourced)

MOBILE (375) ──────────────────────
  question h2
  ① ② ③  ← compact step pills
  strip chart (full width)
  slider + live Paying Rate (big)
  takeaway
  ▸ full explanation
  [◀ prev]          [next ▶]
```

*Annotations:* (a) One running example (a skin with a few price tiers) across all three steps. (b) The WTP strip is **illustrative**, and the 56% figure is **real (Newzoo)**; they are tagged differently. (c) Step ③ scrolls up to and selects the matching calculator tab. That reuses the workbench and adds no new maths.

### E2 · Case Study: "What changes between these two designs?"

```
DESKTOP ───────────────────────────────────────────────────────────────────────────
  01  DO THESE GAMES SELL CHANCE DIFFERENTLY?                         ← question
               FIXED-PRICE SHOP              LUCKY DRAW
  Honor of Kings  [ skin · known price ] ✓    [ draws → Honor Crystal → skin YOU choose ]
  Where Winds Meet[ Echo Beads · known ] ✓    [ pulls → (featured outfit?) → outfit STUDIO chose ]
                   no uncertainty                  ↑ uncertainty lives here
  TAKEAWAY  Both sell both. The difference is how each designs the draw.
  ▸ All figures (the 26 original fact rows, unchanged)

  02  WHERE DOES THE RANDOMNESS END?
  Step  ① Pay   ② Draw   ③ Miss   ④ Guarantee   ⑤ What you get        ← stepper (keyboard ←/→)
  ┌ Honor of Kings ───────────────────────────┬ Where Winds Meet ───────────────────────────┐
  │ ●──●──●──●──◉                              │ ●──●──●──●──◉                               │
  │ ③ Miss: odds RISE each draw (luck value)  │ ③ Miss: odds stay FIXED at 0.0415%          │ ← the step's
  │ cost so far: uncertain                    │ cost so far: uncertain · prize: uncertain    │   two cells,
  └───────────────────────────────────────────┴─────────────────────────────────────────────┘   from the table
  Uncertain: [ cost ■ ] [ prize □ ]   vs   [ cost ■ ] [ prize ■ ]   ← two-chip summary per game
  TAKEAWAY (original callout)  Chance decides how much you pay in HoK; in WWM it also decides,
                               until the guarantee, whether you get the item at all.
  ▸ Full comparison table (unchanged)

MOBILE (375) ──────────────────────
  question
  ① ② ③ ④ ⑤ (pills)
  HoK card (path + step text)
  WWM card (path + step text)
  uncertainty chips
  takeaway · ▸ table
```

*Annotations:* (a) The step texts are the existing table cells ("Rise with a luck value…", "Fixed until the guarantee", "361 draws…", "150 pulls…"). No new mechanics. (b) "Guarantee" shows **361** and **150**. The step stays conceptual, and the chart below carries the numbers with its teaching-model label. (c) The 26 fact rows move behind "All figures"; the content-preservation test still applies.

### E3 · Home: the 10-second argument

```
DESKTOP ───────────────────────────────────────────────────────────────────────────
  When does freemium make sense?
  "One question: do players know what they're buying — or pay for a chance at it?"  ← one-line lede
  ┌──────────── KNOWN ITEM ────────────┐  ┌──────────── A CHANCE AT IT ────────────┐
  │   [pixel shelf]                     │  │   [pixel capsule machine]               │
  │   ( Tap to buy )                    │  │   ( Tap to draw )   draws: 3            │
  │   → "You get the crown. $9.99."     │  │   → "Not this time." / "You got it!"    │
  │   You know what you get, before.    │  │   You find out after. Teaching odds 5%. │ ← labelled illustrative
  └─────────────────────────────────────┘  └─────────────────────────────────────────┘
  [ Reset ]
  TAKEAWAY  Two different pricing problems. The rest of the site shows the evidence.
  ① Industry → ② Framework → ③ Case Study → ④ Diagnostic → ⑤ Simulation   ← numbered route
  ▸ New here? Four terms in 60 seconds (primer, unchanged)

MOBILE: cards stack; route becomes a vertical list.
```

*Annotations:* (a) **Needs your decision** (from the Phase 0 audit, still open): the draw uses teaching odds. I recommend the Simulation's own default, 5% with a 50-pull pity, labelled "teaching odds", not WWM's real 0.0415%. (b) Draws use `Math.random` on the page only. The verified Simulation engine is untouched. (c) No sound and no auto-play.

---

## F. Implementation roadmap

Scores are 1–5 (5 = most). Effort and risk: 5 = largest.

| # | Change | Learning impact | Clarity | Effort | Risk | Presentation importance | Likely files |
|---|---|---|---|---|---|---|---|
| **1** | **Case Study: channel diagram + purchase-path stepper**; figures behind "All figures" | 5 | 5 | 3 | 3 | 5 | `pages/CaseStudy.tsx`, new `case-study/PurchasePath.tsx`, `case-study/ChannelMap.tsx`, `case-study/caseStudy.css`, `data/caseStudy.tsx` (step mapping only), tests |
| **2** | **Framework toolkit → 3-step chain** | 4 | 5 | 3 | 2 | 4 | `pages/Framework.tsx`, new `framework/ToolkitChain.tsx`, `framework/framework.css`, tests |
| **3** | **Presenter stepper** (←/→ section navigation in Present mode, "n / 17" indicator, `S` = sources) | 4 | 4 | 3 | 3 | 5 | `App.tsx`, new `components/PresentNav.tsx`, `index.css` (present-mode block only), each page's `slide` sections get stable ids, tests |
| 4 | **Home duality demo** + numbered route | 4 | 4 | 2 | 2 | 5 | `pages/Home.tsx`, new `components/DualityDemo.tsx`, Home styles (scoped) |
| 5 | **Diagnostic: matrix-first**, axes as the two questions | 4 | 5 | 2 | 3 | 4 | `pages/Diagnostic.tsx`, `diagnostic/diagnostic.css`, `tests/pages/diagnostic.test.tsx` |
| 6 | Framework: price marker on the value bar ("ceiling vs. price") | 3 | 4 | 1 | 1 | 3 | `framework/DeterministicTab.tsx`, css |
| 7 | Industry: question-first section heads + "story so far" bridges; pictogram leads the market section | 3 | 4 | 1 | 1 | 4 | `pages/Industry.tsx`, `industry/MarketOverview.tsx` |
| 8 | Case Study chart: two on-chart annotations + reset | 2 | 3 | 1 | 1 | 3 | `case-study/PityChart.tsx` |
| 9 | Simulation: "Watch these" strip | 2 | 3 | 1 | 1 | 3 | `simulation/Hud.tsx` (presentation only) |

**Suggested order:** 1 → 2 → 3, then 4–9 in small batches. Each item is a separate slice with its own tests and commit. Nothing touches `src/sim`, any formula or figure, citations, routing, or the global theme tokens.

---

## 7. Validation plan (not yet conducted)

Run with 3–5 classmates who haven't seen the site, about 15 minutes each, thinking aloud. I'd note what they say; nothing is recorded or sent anywhere.

| Check | How | Pass if |
|---|---|---|
| Can they explain a section from its primary visual? | **5-second test**: show the first screen of a section, hide it, ask "what was the point?" | ≥ 4 of 5 state the takeaway in their own words |
| Can they find the main interaction unaided? | **First-click test**: "show me what you'd try first" | ≥ 4 of 5 click the primary control first |
| Do they understand what changed? | After one interaction: "what just happened, and why?" | Correct cause → effect for ≥ 4 of 5 |
| Real data vs. illustrative? | Point at the pity chart and a calculator: "is this measured data?" | ≥ 4 of 5 answer correctly |
| Can you present without reading paragraphs? | Rehearse the 17-frame storyboard with a timer | Every frame presentable from the question + takeaway alone |
| Are sources reachable? | "Where does the 56% come from?" / "Who said EVC is trickier for games?" | Found in under 20 seconds |

---

## 8. Decisions for you

1. **Approve the order** (1 Case Study → 2 Framework toolkit → 3 Presenter stepper), or reorder.
2. **Home draw odds** (needed only for item 4): teaching odds of 5% with a 50-pull pity (recommended), or another value.
3. **Presenter stepper keys**: ←/→ and PageUp/PageDown (works with most presentation clickers), plus `S` for sources. OK?

---

## Build log

- **Item 1 — Case Study channel diagram + purchase-path stepper** (approved 2026-11-08, built in Phase 7B):
  - Section 01 now opens with the question "Do these games sell chance differently?" and a 2 × 2 channel map. Lucky-draw cells are dashed and hatched ("randomness lives here"). The 14 original fact rows moved, unchanged, into "All figures for both games".
  - Section 02's text-swap chips were replaced by a 5-step purchase path (Pay → Draw → Miss → Guarantee → What you get). Each step shows the two original table cells for its row and highlights that row in the full table. Arrow keys, Home/End, previous/next and reset all work.
  - The summary separates "Chance decides" from "Not left to chance". An early version listed Honor of Kings' prize under "chance decides" with a strike-through; that was caught in the browser check and fixed.
  - Measured at 1280 × 800: the channel map now starts at ~580 px, on the first screen. Before, ~2 screens of figures came first.
  - All original text, the full table, the teaching-model label and the source note are unchanged (content-preservation test).
