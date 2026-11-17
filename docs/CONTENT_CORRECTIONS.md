# Content corrections (approved November 2026)

The original site (legacy/index.html) is otherwise preserved word for word. Sections 1–2 were changed after checking sources; sections 3–6 are name and About-page revisions
requested by the author. tests/pages/contentPreservation.test.tsx lists each changed item as a narrow
exception that also requires the replacement text; nothing else is exempt.

## 1. Case Study — Wuthering Waves revenue comparison (Naavik, 2026)

**Original:** "Staying cosmetic-only has a revenue cost: Wuthering Waves, which puts power-affecting
characters in its gacha, earned roughly $320M over 21 months — nearly double Where Winds Meet's
pace on a broadly comparable download base."

**Problem:** the cited source does not reach that conclusion. Naavik, "Evaluating the 'Fair' Gacha
Games Experiment" (1 Feb 2026), https://naavik.co/digest/evaluating-the-fair-gacha-games-experiment/ :
- Wuthering Waves: about $320M on about 29M downloads over 21 months (about $15M a month),
  mobile excluding China Android. **Verified.**
- Where Winds Meet: about $115M on about 20M downloads over 14 months (about $8M a month), same scope.
  The raw monthly pace is ~1.9x, but 29M vs 20M downloads is not "broadly comparable".
- Naavik's comparison: Where Winds Meet's long-term revenue efficiency on iOS China "tracks closely"
  with Wuthering Waves'; its business model shift "has not radically undermined unit economics".
  It does not attribute the revenue gap to the cosmetic-only choice.

**Now:** "Does staying cosmetic-only cost revenue? Not clearly. Wuthering Waves, which puts
power-affecting characters in its gacha, earned roughly $320M over 21 months (about $15M a month, on
about 29M downloads), against about $8M a month (on about 20M downloads) for Where Winds Meet — both
mobile only, excluding China Android. But the same analysis finds Where Winds Meet's long-term revenue
efficiency on iOS China "tracks closely" with Wuthering Waves', and concludes that its cosmetic-only
model has not radically undermined unit economics."

## 2. Industry — South Korea regulation status

**Original:** "Statutory odds disclosure since 2024, with 3x damages for violations"

**Problem:** two dates merged. Odds disclosure took effect on 22 March 2024; the up-to-3x punitive
damages provision (for intentional violations) was promulgated 31 January 2025 and took effect on
1 August 2025.
- Ministry of Culture, Sports and Tourism statement, reported by The Fact (2025):
  https://news.tf.co.kr/read/economy/2168158.htm
- Law Times, 5 Aug 2025: https://www.lawtimes.co.kr/news/articleView.html?idxno=210245
- Yoon & Yang via Legal 500: https://www.legal500.com/developments/thought-leadership/punitive-damages-and-other-special-legal-provisions-for-litigation-concerning-probability-based-game-items/
- Asiae, 21 Jan 2025: https://www.asiae.co.kr/en/article/2025012111373991578

**Now:** "Statutory odds disclosure since March 2024; up to 3x damages for intentional violations
since August 2025". Year column (2024), approach (Disclosure) and rule type (Enacted) unchanged.
The supporting-source line now names these sources instead of only the project table.

## 3. About — VNG responsibilities and secondary event contributions (author-requested, Nov 2026)

**Original:** "Before graduate school, she spent two years at VNG Corporation as a Game Operation
Collaborator, working on live operations and localization for Revelation: New World and Dream & Lethe
Record. She led Chinese-to-Vietnamese and English localization, tested patches, and coordinated with
regional teams across the Philippines, Indonesia, Singapore and Thailand to ship updates on schedule —
including the Vietnam Gameverse 2023 launch and a one-year anniversary event — and contributed English
localization for Ghost Story."

**Now:** "Before graduate school, she spent two years at VNG Corporation as a Game Operation
Collaborator on Revelation: New World and Dream & Lethe Record. Her work covered game live operations and
event coordination; Chinese-to-Vietnamese and English localization; testing game updates and patches;
preparing, coordinating and delivering patch notes; and communicating with regional teams across the
Philippines, Indonesia, Singapore and Thailand so that updates shipped on schedule. She also contributed
English localization for Ghost Story."
Followed by a separate, smaller note: "Additional event contributions included support for the Vietnam
Gameverse 2023 launch and a one-year anniversary event."

**Why:** the author asked for responsibilities to be listed separately, for patch-note preparation and
delivery to be added, and for the two events to be secondary rather than central. "Led" was dropped
so the list matches the author's approved wording; no new role, title or project is claimed.

## 4. About — acknowledgments (author-requested, Nov 2026)

**Original:** "Thanks to a former manager and monetization specialist (anonymized) for the industry
interview behind much of this analysis, to guest speaker Dr. Tim Smith of Wiglaf Pricing, and to the
OPM 6600 instructor for guidance and access to the course's research database."

**Now:** "Thanks to Professor Xiao Zhang, instructor of OPM 6600 — Pricing and Revenue Optimization,
for guidance and access to the course's research database; to guest speaker Dr. Tim Smith of Wiglaf
Pricing for sharing industry insights; and to a former manager and monetization specialist (anonymized)
for the industry interview behind much of this analysis."

**Why:** the instructor is now named (provided by the author). Dr. Tim Smith stays a guest speaker; the
two roles are kept separate (tests/pages/about.test.tsx). The instructor's contribution keeps its
original description; nothing further is implied.

## 5. Author's name with its accents (author-requested, Nov 2026)

**Original:** "Trúc Trinh" (Home byline, footer on every page, About portrait description and introduction).
**Now:** "Trúc Trịnh". The unaccented full name in parentheses, "(Truc Anh Nha Trinh)", was removed from the
About introduction at the author's request. The LinkedIn address keeps its ASCII form (it is a link, not a
displayed name).

## 6. About in the first person, with capability rows (author-requested, Nov 2026)

The biography is narrated in the first person ("I / my"). The VNG responsibilities, previously one long
sentence that the three "From experience to analysis" link cards partly repeated, now appear once, as four
capability rows: what I did, and the research page that models it.

| Original | Now |
|---|---|
| "Trúc Trinh (Truc Anh Nha Trinh) is a graduate student … where this project was completed for OPM 6600 … She holds a Bachelor of Business Administration …" | "I'm Trúc Trịnh, a graduate student … where I completed this project for OPM 6600 … I hold a Bachelor of Business Administration …" |
| VNG paragraph (section 3 wording) | "Before graduate school, I spent two years at VNG Corporation as a Game Operation Collaborator on Revelation: New World and Dream & Lethe Record." The responsibilities moved to the rows below, word for word. |
| "This project grew out of that work. Running events and adapting games for different countries raised the questions it tries to answer: why the same item needs a different price in each market, and why some ways of selling build trust while others burn it." | "My experience in game live operations and localization shaped the questions behind this research: why the same item needs a different price in each market, and why some ways of selling build trust while others burn it." (Also fixes PRESENT mode, where "that work" referred to a hidden paragraph.) |
| Heading "From experience to analysis" | "What I did, and where it shows up in this research" |
| Card "Localization across Southeast Asia → the out-of-game economy and regional price ladders on the Industry page" | Row "Localization": Chinese-to-Vietnamese and English localization, including English localization for Ghost Story → same description and link |
| Card "Live operations & events → the LiveOps dashboard and event mechanics in the Simulation" | Row "Live Operations & Events": live operations and event coordination → same description and link |
| Card "Patch testing → the pre-launch test lab: closed beta, survey, A/B test" | Row "Patch Testing & Patch-Note Delivery": testing game updates and patches; preparing, coordinating and delivering patch notes → same description and link, labelled "testing only" (patch notes are not presented as A/B testing) |
| — | Row "Regional Collaboration": communicating with regional teams across the Philippines, Indonesia, Singapore and Thailand so that updates shipped on schedule → "No dedicated page" (no research page models it; no link invented) |

Unchanged: the secondary events note, the "Path" timeline, the sidebar facts and the acknowledgments (section 4).

## 7. Final academic patch against the project report (author-requested, Nov 2026)

Reference: the project report, FINAL REVIEW COPY (13 Nov 2026). Branch `academic-patch`, cut from production `main` (90b9592).

| Where | Was | Now | Why |
|---|---|---|---|
| Framework, new first section (moved from a draft Industry 06 at the author's request) | — | "When does freemium actually pay off?": premium expected profit $130,000; freemium break-even payer share 12.98%; matches premium at 13.75%; $3-per-payer case 173.0% (infeasible); payer-share slider with three outcomes. All numbers from `src/lib/breakEven.ts` (report equations 3.1–3.4, Table 1). | RQ1 was missing from the site. Labelled hypothetical; not the conversion rate of any real game. |
| Framework, deterministic result | "Expected value to customer (EVC)" | "Economic value to the customer (EVC)" | The course defines EVC as Economic Value to the Customer. |
| Framework, probabilistic tab | `EVC(gacha) = P(success) × Value − P(failure) × Cost`; defaults 20%, $15, $3 | `Expected net payoff = p × G − c`, with ceiling p × G; defaults 20%, G = $18, c = $3 (same $0.60) | The draft expression is not EVC. It equals p·G − c only when Value is the net gain G − c (report Section 2.4); with Value read as the item's full value it overstates the payoff by p·c. The label and the calculation now agree. |
| Framework, "Show the mathematics" | Badge "Consistent with published OR literature"; note "A reframing of the same course formula…" | Badge "Original draft form — valid only if Value is the net gain"; note "This expression is not EVC itself…"; new block "Used on this page: Expected net payoff"; live steps compute p·G − c and check the draft form with Value = G − c | The original formula stays on the page, with the condition under which it is valid. |
| Framework, WTP step | "56 players · willingness to pay $0"; "Real 56% of players spend nothing on games in a year (Newzoo)"; takeaway "…because most players' willingness to pay for extras is zero"; full explanation said the same | Whole population labelled illustrative; Newzoo's non-payer share described as a spending outcome, not a measure of willingness to pay; new takeaway: the distribution has to be estimated | The report does not treat non-payers as having zero willingness to pay. The illustrative numbers (24 / 39 / 4 buyers) are unchanged. |
| Framework, toolkit step 3 | "P(success) × Value − P(failure) × Cost" | "ceiling p × G · net payoff p × G − c" | Same correction as the tab. |
| Diagnostic, takeaway and "Reading the matrix" | Freemium "makes sense" when a design stays in the top row | A screen for monetization risk, not a test of profitability; profitability is decided by the break-even conditions (top of the Framework page) | The grid answers RQ2, not RQ1. |
| Industry 05 takeaway, explanation, callout; China status line | China's law is "the reason" both games' exact probabilities are public; "the reason this project has exact odds data" | The law requires published rates, but this project's odds come from secondary sources and were not matched to an official disclosure | Neither game's odds were verified against an official disclosure (report, Unresolved Evidence items 1–4). |
| Case Study chart footnote and readout | "Honor of Kings publishes its starting odds (0.8%) and guarantee (draw 361)"; "odds start at 0.8%" | "the project's sources report … (not verified against an official disclosure)"; "reported odds start at 0.8%" | Same reason. |
| Framework heading and lede | "Two ways to value an in-game item" / "The same economic question, two different pricing mechanisms." | "From business model to item pricing" / "First, when freemium is economically viable. Then, how to price a known item versus a chance-based reward." | The page now opens with RQ1, then RQ2 (author's wording). |
| Industry, last bridge | "Framework: how do you price a known item, and a chance?" | "Framework: when does freemium pay off, and how do you price an item?" | Names what the next page now starts with. |
| Framework "Show the mathematics" in PRESENT | Hidden in PRESENT, so "Open the mathematics" did nothing | Kept (collapsed) in PRESENT | Broken interaction during presentation. |

Not changed (deliberately): the Industry market figure "56% … spend nothing on games in a year" (the report reads the Newzoo figure only through secondary coverage and could not confirm the time window either way); the "Han, Ryan & Tong, 2026" citation year (the report flags it for the author to confirm); Choice Architecture wording in the Diagnostic cells and toolkit step 2; the Simulation.

## Checked, no change
- Case Study "36.7%": Chen, Elmachtoub, Hamilton & Lei (2021), Management Science — the traditional
  box "only garners 36.7% of the optimal revenue" as the number of items grows
  (abstract, https://par.nsf.gov/biblio/10291033). Matches the site.
