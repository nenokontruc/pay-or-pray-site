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
| Home | Bodies of the four concept cards (titles stay) | Compact overview; presenter explains | No |
| Home | Roadmap intro and card descriptions (titles stay) | Navigation already shows the structure | No |
| Home | Full "argument in one sentence" → short line | Same three distinctions (tools, risks, countries), shorter | No |
| Industry | Page intro; all "Explore the analysis" and text-version panels; timeline sources line; selected model's "Example & evidence" line; regulation detail's "Supporting source" line | Background and sources, not the argument | No — the "not a scale" and legal-nuance notes and the benchmark footnote stay visible |
| Framework | "Show the mathematics" and "Full explanation" panels | Derivations; formula, inputs, result and interpretation stay | No |
| Case Study | Page intro; 36.7% / $320M evidence block; 4 of 5 panels | Secondary evidence | The "Teaching model: assumptions and source check" panel is kept (`present-keep`), and the chart's teaching-model footnote stays |
| Diagnostic | "Reading the matrix" and "Text version" panels | Long explanation; matrix, result, implication stay | No — "A screening tool, not a score" stays |
| Simulation | Page intro only | Inputs, warnings, lab caveats, metrics, exports and model assumptions all stay | No |
| About | VNG background paragraph; "Path" timeline | Personal background | No — name, course, objective and acknowledgments stay |
