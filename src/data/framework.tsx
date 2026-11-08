// Framework content — verbatim from legacy/index.html:711-762 (the academic reference).
import type { ReactNode } from 'react'

export const ORIGINAL_TITLE = 'Two formulas, one variable'
export const ORIGINAL_LEDE = "The course's own EVC formula is the pricing ceiling for any good. Whether it applies directly, or has to be re-derived in expectation, depends entirely on whether the good itself is certain or left to chance."

export const DET_NOTE = 'The maximum defensible price: the price of the next-best alternative, plus the differentiated value this item adds over it. Both terms are known quantities when the good itself is certain — as with a skin bought directly from the shop.'

export const PROB_NOTE: ReactNode = <>A reframing of the same course formula for a good whose delivery is uncertain: expected gain from success, minus the expected sunk cost of failing. Asked whether EVC can be applied to gaming at all, guest speaker Dr. Tim Smith said yes &mdash; but that it is trickier than a standard case. The general form below, from the operations research literature on loot box design, supports the structure: expected value is a drop-rate-weighted sum of marginal value across every possible outcome, not just a binary success/failure — this simplified two-outcome version is the special case relevant to chasing one specific item.</>

export const GENERAL_NOTE: ReactNode = <>Expected utility of a loot box, summed over every possible item j: its drop rate rⱼ, times the marginal value it adds given the items (A) the player already owns — so a duplicate of something already owned contributes zero. <span className="fw-cite">— Han, Ryan &amp; Tong, 2026</span></>

export const WTP_PARAGRAPH: ReactNode = <><b>Willingness-to-pay (WTP).</b> The course's price-response function, d(p) = D·(1 − W(p)), defines Paying Rate as P(wtp ≥ p) — the share of players whose willingness-to-pay for an item exceeds its price. Paying Rate is low not because prices are high, but because most players&rsquo; willingness to pay for extras is zero &mdash; the free game is enough. Newzoo estimates that 56% of all players spend nothing on games in a year, so the share paying in any single game is a minority. Low entry prices exist to convert the marginal player; ARPPU (average spend among payers) can still be very high.</>

export const CHOICE_PARAGRAPH: ReactNode = <><b>Choice Architecture.</b> Compromise and anchor effects require a small set of known-value alternatives to compare — exactly the setting a fixed-price shop creates. A gacha purchase has no such comparison set; the relevant psychology shifts to near-miss effects, sunk-cost escalation, and pity-timer anchoring instead. This is the mechanism this project's case study is built to isolate.</>

export const FRAMEWORK_REFERENCES: ReactNode[] = [
  <>Course materials: OPM 6600, Week 3–4, EVC Pricing &amp; Choice Architecture slides.</>,
  <>Guest speaker: Dr. Tim Smith, Wiglaf Pricing &mdash; class Q&amp;A on applying EVC to gaming, Sept. 2026.</>,
]
