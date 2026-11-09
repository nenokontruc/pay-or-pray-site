# PRESENT mode — what it hides and where it stays

PRESENT is the button in the navigation bar (Esc exits). It adds the class `present` to `<html>`;
nothing re-renders, so calculator values, selections and the Simulation keep their state.

## Rules (src/index.css)
- Hidden: site chrome (footer except the Simulation's "How this simulation works", sub-navigation,
  language switch, progress bar), elements marked `.present-hide`, and closed "Explore…" panels
  (`details.disclosure`) unless marked `.present-keep`.
- Never hidden by class alone: `.game-note`. It carries warnings, caveats and test results.
- Two lengths of one message: `.normal-only` (full original) / `.present-only` (short line).

Everything below stays in NORMAL mode, word for word (enforced by tests/pages/contentPreservation.test.tsx).

| Page | Hidden in PRESENT | Reason | Material caveat? |
|---|---|---|---|
| Home | Hero intro paragraph | The h1 asks the question; the two demos show the answer | No |
| Home | Bodies of the four concept cards → one-line definition each (present-only, shortened from the full text) | Terms must be understandable without the presenter | No |
| Home | The whole six-card roadmap section | Repeats the top navigation; the page pager still links onward | No |
| Home | Full "argument in one sentence" → short line | Same three distinctions (tools, risks, countries), shorter | No |
| Industry | Page intro; all "Explore the analysis" and text-version panels; timeline sources line; selected model's "Example & evidence" line; regulation detail's "Supporting source" line | Background and sources, not the argument | No — the "not a scale" and legal-nuance notes and the benchmark footnote stay visible |
| Framework | "Show the mathematics" and "Full explanation" panels | Derivations; formula, inputs, result and interpretation stay | No |
| Case Study | Page intro; 36.7% / $320M evidence block; 4 of 5 panels; the "The key difference" sentence box (the labelled chips above it say the same); §03 reading guide and pricing table → three-scenario strip; the 6.0% / 94.0% takeaway sentence → labelled hypothetical bar inside the chart card | Secondary evidence, duplicates, or the same content in visual form | The "Teaching model: assumptions and source check" panel is kept (`present-keep`), and the chart's teaching-model footnote stays |
| Diagnostic | "Reading the matrix" and "Text version" panels | Long explanation; matrix, result, implication stay | No — "A screening tool, not a score" stays |
| Simulation | Page intro only (its goal returns as a present-only line: "Goal: earn revenue while protecting player goodwill."; the current progress step stays at full strength, the others recede) | Inputs, warnings, lab caveats, metrics, exports and model assumptions all stay | No |
| About | Secondary events note; "Path" timeline | Background detail | No — first-person introduction, the VNG role, how the experience shaped the research, the four capability rows and the acknowledgments stay |

## Added for projection (November 2026)
- **Typography** (src/index.css, `html.present …` rules; NORMAL unchanged): main interpretation 17px
  (callouts, Framework interpretation and lead, Case Study pricing-table cells, Diagnostic result fields,
  Case Study "Why it matters", Home demo and concept text); caveats and warnings 16px (all `.game-note`,
  "A screening tool, not a score", Framework hint, pictogram caption, timeline lesson); readouts 15px;
  chart footnotes and sources 14px. Headings and headline numbers are unchanged.
- **Case Study §03** (both modes): a reading guide above the pricing table, and the "What chance
  decides" row emphasised with heavier type and rules (not colour alone).
- **Case Study, PRESENT only** (November 2026):
  - §03: the nine-cell pricing table becomes three comparable scenario cards (src/pages/case-study/ScenarioStrip.tsx):
    fixed-price skins, Honor of Kings draw, Where Winds Meet draw, each answering "Chance decides" (✓ known /
    ? uncertain, hatched), "Who chooses the prize" and "Pricing tool". Labels are shortened from the table's cells;
    the Where Winds Meet guarantee is marked "source-reported, disputed".
  - §02: the takeaway sentence becomes a proportional bar (HypotheticalSplit in PityChart.tsx) inside the chart card,
    preceded by "Hypothetical teaching model — not observed game results" and both assumptions (fixed 0.0415% per
    pull; the guarantee always delivers this specific outfit, not just any Legendary). Widths and labels come from
    WWM_BEFORE_GUARANTEE. The chart is capped at 300px tall in PRESENT so the bar sits on the same screen.
  - Unchanged and still visible: the chart, its legend, the source-conflict footnote, and the
    "Teaching model: formula, assumptions and source check" panel. NORMAL keeps the table, guide and sentence.
