// Diagnostic framework content — verbatim from legacy/index.html:878-946.
// The framework is two questions and four positions. No scores exist in the original, so none are added.
// Fields added for the redesign (certainty, spending, why, pricing) quote text that already exists on this
// site; each one names its source. Mapping documented in docs/PHASE7B_DIAGNOSTIC.md.
import type { ReactNode } from 'react'
import { PKGS } from '../sim/params'

export type ValueKind = 'det' | 'prob'
export type CellId = 'low' | 'mod' | 'high' | 'vhigh'

export interface Cell {
  id: CellId
  /** Position label in reading order (A top-left … D bottom-right). */
  pos: 'A' | 'B' | 'C' | 'D'
  icon: string
  value: ValueKind
  power: boolean
  risk: string
  title: string
  /** The cell text exactly as in the original. */
  text: ReactNode
  /** Verbatim fragments of the original, shown as labelled fields when the cell is selected. */
  choice?: string
  primaryRisk: string
  implication: string
  /** Spending pressure — from the cell text or the Industry "seven models" text (named in `spendingSource`). */
  spending: string
  spendingSource: string
}

export const COL_HEADS: Record<ValueKind, string> = { det: 'DETERMINISTIC VALUE', prob: 'PROBABILISTIC VALUE' }
export const ROW_LABELS = { cosmetic: 'COSMETIC / NON-POWER', power: 'POWER-AFFECTING' } as const

/** Value certainty, by column (Framework and Industry "Loot Box / Gacha" definitions). */
export const CERTAINTY: Record<ValueKind, string> = {
  det: 'Known before purchase — you see the item, then pay.',
  prob: 'Resolved by probability after the transaction completes.',
}

export const CELLS: Cell[] = [
  { id: 'low', pos: 'A', icon: 'cart', value: 'det', power: false, risk: 'Lowest risk', title: 'Fixed-price cosmetic shop',
    text: 'e.g. the skin shops in Honor of Kings and Where Winds Meet. Compromise/anchor Choice Architecture. The recommended default for most titles.',
    choice: 'Compromise/anchor Choice Architecture', primaryRisk: 'Lowest risk', implication: 'The recommended default for most titles.',
    spending: 'Compromise and anchor effects: buyers compare known options and choose.', spendingSource: 'Diagnostic cell; Framework, Choice Architecture' },
  { id: 'mod', pos: 'B', icon: 'capsule', value: 'prob', power: false, risk: 'Moderate risk', title: 'Cosmetic lucky draw',
    text: 'e.g. HoK’s Points Treasure Hunt and WWM’s Echo gacha. Pity/near-miss Choice Architecture. Pay-to-win-free, but the probability mechanic alone still draws regulatory attention.',
    choice: 'Pity/near-miss Choice Architecture', primaryRisk: 'Pay-to-win-free, but the probability mechanic alone still draws regulatory attention.',
    implication: 'Removing power from a probabilistic mechanic reduces but does not eliminate its regulatory exposure.',
    spending: 'Pity and near-miss effects, sunk-cost escalation: there is no set of known options to compare.', spendingSource: 'Diagnostic cell; Framework, Choice Architecture' },
  { id: 'high', pos: 'C', icon: 'swords', value: 'det', power: true, risk: 'High risk', title: 'Fixed pay-to-win shop',
    text: 'Fairness backlash well documented in player-perception research. Generally advised against.',
    primaryRisk: 'Fairness backlash well documented in player-perception research.', implication: 'Generally advised against.',
    spending: 'Direct purchase of competitive power, worth more to an owner the more opponents lack it.', spendingSource: 'Industry, Pay-to-Win Add-ons (Harutyunyan & Koca, 2025)' },
  { id: 'vhigh', pos: 'D', icon: 'gavel', value: 'prob', power: true, risk: 'Highest risk', title: 'Power-affecting loot boxes',
    text: 'Combines gambling-adjacent mechanics with competitive unfairness — the primary target of current loot-box regulation.',
    primaryRisk: 'Combines gambling-adjacent mechanics with competitive unfairness.', implication: 'The primary target of current loot-box regulation.',
    spending: 'Gambling-adjacent mechanics combined with paid competitive power.', spendingSource: 'Diagnostic cell' },
]

/** The framework's rule: two questions place any purchasable good in one of four positions. */
export function classify(value: ValueKind, power: boolean): CellId {
  return CELLS.find((c) => c.value === value && c.power === power)!.id
}

export interface Example {
  id: string
  label: string
  group: 'Case study' | 'Simulation package'
  value: ValueKind
  power: boolean
  /** Why it sits in this cell. */
  note: ReactNode
  /** One practical pricing implication, quoted from elsewhere on the site (source named). */
  pricing: string
  pricingSource: string
}

const SIM_NOTE = 'Placed by its settings in the Simulation: whether it is a lucky draw, and whether it raises competitive power.'

const STANDARD_EVC = 'Priced with the standard EVC formula: the value is known before purchase, so compromise effects, anchors and tiered ladders do the work.'
/** Pricing implication for a Simulation package, by the cell its own flags place it in. */
const SIM_PRICING: Record<CellId, [string, string]> = {
  low: [STANDARD_EVC, 'Case Study, What this means for pricing'],
  mod: ['A chance-based good: EVC has to be re-derived in expectation.', 'Framework, Probabilistic goods'],
  high: ['Generally advised against: fairness backlash is well documented.', 'Diagnostic cell'],
  vhigh: ['The primary target of current loot-box regulation.', 'Diagnostic cell'],
}

export const EXAMPLES: Example[] = [
  { id: 'hok-shop', label: 'Honor of Kings skin shop', group: 'Case study', value: 'det', power: false,
    note: 'Named in this cell by the original framework — at its lower edge, given its small skin stat bonuses.',
    pricing: STANDARD_EVC, pricingSource: 'Case Study, What this means for pricing' },
  { id: 'wwm-shop', label: 'Where Winds Meet skin shop', group: 'Case study', value: 'det', power: false,
    note: 'Named in this cell by the original framework.',
    pricing: STANDARD_EVC, pricingSource: 'Case Study, What this means for pricing' },
  { id: 'hok-draw', label: 'Honor of Kings · Points Treasure Hunt', group: 'Case study', value: 'prob', power: false,
    note: 'Named in this cell by the original framework — closer to the left edge than Where Winds Meet’s draw, because players choose the final prize.',
    pricing: 'Close to deterministic at the end: the uncertainty is mostly about price (between 1 and 361 draws), not about value.', pricingSource: 'Case Study, What this means for pricing' },
  { id: 'wwm-draw', label: 'Where Winds Meet · Echo gacha', group: 'Case study', value: 'prob', power: false,
    note: 'Named in this cell by the original framework.',
    pricing: 'Fully probabilistic until the 150-pull guarantee: the expected-value form of EVC applies.', pricingSource: 'Case Study, What this means for pricing' },
  ...PKGS.map((p): Example => {
    const cell = classify(p.gacha ? 'prob' : 'det', p.power)
    return { id: `sim-${p.id}`, label: p.label, group: 'Simulation package', value: p.gacha ? 'prob' : 'det', power: p.power, note: SIM_NOTE, pricing: SIM_PRICING[cell][0], pricingSource: SIM_PRICING[cell][1] }
  }),
]

export const DIAGNOSTIC_REFERENCES: ReactNode[] = [
  <>Petrovskaya, E., &amp; Zendle, D. (2022). Predatory Monetisation? <i>Journal of Business Ethics</i>, 181(4).</>,
  <>Zendle, D., Meyer, R., &amp; Ballou, N. (2020). The changing face of desktop video game monetisation. <i>PLOS ONE</i>, 15(5).</>,
]
