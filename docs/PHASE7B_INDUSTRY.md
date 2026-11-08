# Phase 7B — Industry narrative refinement

## Structure
Before: five independent sections (market, history, models, economies, regulation), each a title + visual + takeaway.
After: one story of five questions. Each section follows the same frame:
question (h2) → key finding → existing visual → takeaway → "Explore the analysis" disclosure → bridge to the next question.

1. Why does this market matter? — size **then** spending (order A kept: the "yet" contrast in the original takeaway makes the 56% the pivot)
2. How did freemium evolve? — all eight milestones; panel now says era "n of 3" and "What changed for pricing managers"; previous/next buttons; text version of all eight
3. How do free games generate revenue? — seven models in three separate groups (3 deterministic / 1 probabilistic / 3 either); continuum bar removed so no scale is implied
4. Why does pricing differ across markets? — in-game vs out-of-game (both panels kept in the DOM); benchmark labelled as practitioner interview, not an estimated optimum
5. Why does regulation affect monetization strategy? — adds "Type of rule": enacted, interpretation of existing law, proposal, litigation

## Data and citations
No figure, period, definition or citation changed. Only additions: `instrument` / `instrumentBasis` per jurisdiction,
`INSTRUMENTS`, `INSTRUMENT_CHECK_SOURCES` in `src/data/industry.tsx`.
Belgium (Gaming Commission applying the 1999 Gambling Act, 2018) and the Netherlands (Council of State ruling, 9 March 2022)
were checked against Osborne Clarke, CMS (two notes) and SCL. The other four follow from the wording of the original status line.

The content-preservation test now covers Industry; it initially found 24 original items missing from the earlier React page
(non-active timeline milestones, inactive economy panel, model texts, two apostrophes). All are restored.

## Verification
- `tests/pages/industry.test.tsx` (16 tests) + Industry in `contentPreservation.test.tsx`
- `pnpm check`: 22 files, 235 tests, build OK
- Browser: 1280×800 light and 375×812 dark — no horizontal overflow; key finding, model groups and regulation checked visually
