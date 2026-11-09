# Content corrections (approved November 2026)

The original site (legacy/index.html) is otherwise preserved word for word. Sections 1–2 were changed after checking sources; sections 3–4 are About-page revisions requested and
worded by the author. tests/pages/contentPreservation.test.tsx allows exactly these four changes and
requires the replacement text.

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

## Checked, no change
- Case Study "36.7%": Chen, Elmachtoub, Hamilton & Lei (2021), Management Science — the traditional
  box "only garners 36.7% of the optimal revenue" as the number of items grows
  (abstract, https://par.nsf.gov/biblio/10291033). Matches the site.
