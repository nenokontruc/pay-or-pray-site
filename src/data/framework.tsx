// Framework content — verbatim from legacy/index.html:711-762 (the academic reference).
import type { ReactNode } from 'react'

export const ORIGINAL_TITLE = 'Two formulas, one variable'
export const ORIGINAL_LEDE = "The course's own EVC formula is the pricing ceiling for any good. Whether it applies directly, or has to be re-derived in expectation, depends entirely on whether the good itself is certain or left to chance."

export const DET_NOTE = 'The maximum defensible price: the price of the next-best alternative, plus the differentiated value this item adds over it. Both terms are known quantities when the good itself is certain — as with a skin bought directly from the shop.'

// Corrected Nov 2026 (docs/CONTENT_CORRECTIONS.md): the original called this expression a reframing of the EVC formula.
export const PROB_NOTE: ReactNode = <>This expression is not EVC itself. It is the expected net payoff of one draw, and it equals p&middot;G &minus; c (below) only when Value is the net gain G &minus; c and Cost is the draw price c; read with Value as the item&rsquo;s full value, it overstates the payoff by p&middot;c. Asked whether EVC can be applied to gaming at all, guest speaker Dr. Tim Smith said yes &mdash; but that it is trickier than a standard case. The general form below, from the operations research literature on loot box design, supports the structure: expected value is a drop-rate-weighted sum of marginal value across every possible outcome, not just a binary success/failure — this simplified two-outcome version is the special case relevant to chasing one specific item.</>

export const GENERAL_NOTE: ReactNode = <>Expected utility of a loot box, summed over every possible item j: its drop rate rⱼ, times the marginal value it adds given the items (A) the player already owns — so a duplicate of something already owned contributes zero. <span className="fw-cite">— Han, Ryan &amp; Tong, 2026</span></>

// Corrected Nov 2026 (docs/CONTENT_CORRECTIONS.md): non-payers are no longer equated with zero willingness to pay.
export const WTP_PARAGRAPH: ReactNode = <><b>Willingness-to-pay (WTP).</b> The course's price-response function, d(p) = D·(1 − W(p)), defines Paying Rate as P(wtp ≥ p) — the share of players whose willingness-to-pay for an item exceeds its price. A low Paying Rate means that, at the current price, few players&rsquo; willingness to pay reaches that price; the shape of that distribution has to be estimated. Newzoo reports that a majority of players (about 56%) do not pay for games &mdash; a spending outcome, not evidence that their willingness to pay is zero. Low entry prices exist to convert the marginal player; ARPPU (average spend among payers) can still be very high.</>

export const CHOICE_PARAGRAPH: ReactNode = <><b>Choice Architecture.</b> Compromise and anchor effects require a small set of known-value alternatives to compare — exactly the setting a fixed-price shop creates. A gacha purchase has no such comparison set; the relevant psychology shifts to near-miss effects, sunk-cost escalation, and pity-timer anchoring instead. This is the mechanism this project's case study is built to isolate.</>

export const FRAMEWORK_REFERENCES: ReactNode[] = [
  <>Course materials: OPM 6600, Week 3–4, EVC Pricing &amp; Choice Architecture slides.</>,
  <>Guest speaker: Dr. Tim Smith, Wiglaf Pricing &mdash; class Q&amp;A on applying EVC to gaming, Sept. 2026.</>,
]
