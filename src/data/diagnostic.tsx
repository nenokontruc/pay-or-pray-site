// Diagnostic framework content — verbatim from legacy/index.html:878-946.
// The framework is two questions and four positions. No scores exist in the original, so none are added.
import type { ReactNode } from 'react'
import { PKGS } from '../sim/params'

export type ValueKind = 'det' | 'prob'
export type CellId = 'low' | 'mod' | 'high' | 'vhigh'

export interface Cell {
  id: CellId
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
}

export const COL_HEADS: Record<ValueKind, string> = { det: 'DETERMINISTIC VALUE', prob: 'PROBABILISTIC VALUE' }
export const ROW_LABELS = { cosmetic: 'COSMETIC / NON-POWER', power: 'POWER-AFFECTING' } as const

export const CELLS: Cell[] = [
  { id: 'low', value: 'det', power: false, risk: 'Lowest risk', title: 'Fixed-price cosmetic shop',
    text: 'e.g. the skin shops in Honor of Kings and Where Winds Meet. Compromise/anchor Choice Architecture. The recommended default for most titles.',
    choice: 'Compromise/anchor Choice Architecture', primaryRisk: 'Lowest risk', implication: 'The recommended default for most titles.' },
  { id: 'mod', value: 'prob', power: false, risk: 'Moderate risk', title: 'Cosmetic lucky draw',
    text: 'e.g. HoK’s Points Treasure Hunt and WWM’s Echo gacha. Pity/near-miss Choice Architecture. Pay-to-win-free, but the probability mechanic alone still draws regulatory attention.',
    choice: 'Pity/near-miss Choice Architecture', primaryRisk: 'Pay-to-win-free, but the probability mechanic alone still draws regulatory attention.',
    implication: 'Removing power from a probabilistic mechanic reduces but does not eliminate its regulatory exposure.' },
  { id: 'high', value: 'det', power: true, risk: 'High risk', title: 'Fixed pay-to-win shop',
    text: 'Fairness backlash well documented in player-perception research. Generally advised against.',
    primaryRisk: 'Fairness backlash well documented in player-perception research.', implication: 'Generally advised against.' },
  { id: 'vhigh', value: 'prob', power: true, risk: 'Highest risk', title: 'Power-affecting loot boxes',
    text: 'Combines gambling-adjacent mechanics with competitive unfairness — the primary target of current loot-box regulation.',
    primaryRisk: 'Combines gambling-adjacent mechanics with competitive unfairness.', implication: 'The primary target of current loot-box regulation.' },
]

/** The framework's rule: two questions place any purchasable good in one of four positions. */
export function classify(value: ValueKind, power: boolean): CellId {
  return CELLS.find((c) => c.value === value && c.power === power)!.id
}

export interface Example { id: string; label: string; group: 'Case study' | 'Simulation package'; value: ValueKind; power: boolean; note: ReactNode }

const SIM_NOTE = 'Placed by its settings in the Simulation: whether it is a lucky draw, and whether it raises competitive power.'

export const EXAMPLES: Example[] = [
  { id: 'hok-shop', label: 'Honor of Kings skin shop', group: 'Case study', value: 'det', power: false,
    note: 'Named in this cell by the original framework — at its lower edge, given its small skin stat bonuses.' },
  { id: 'wwm-shop', label: 'Where Winds Meet skin shop', group: 'Case study', value: 'det', power: false,
    note: 'Named in this cell by the original framework.' },
  { id: 'hok-draw', label: 'Honor of Kings · Points Treasure Hunt', group: 'Case study', value: 'prob', power: false,
    note: 'Named in this cell by the original framework — closer to the left edge than Where Winds Meet’s draw, because players choose the final prize.' },
  { id: 'wwm-draw', label: 'Where Winds Meet · Echo gacha', group: 'Case study', value: 'prob', power: false,
    note: 'Named in this cell by the original framework.' },
  ...PKGS.map((p): Example => ({ id: `sim-${p.id}`, label: p.label, group: 'Simulation package', value: p.gacha ? 'prob' : 'det', power: p.power, note: SIM_NOTE })),
]

export const DIAGNOSTIC_REFERENCES: ReactNode[] = [
  <>Petrovskaya, E., &amp; Zendle, D. (2022). Predatory Monetisation? <i>Journal of Business Ethics</i>, 181(4).</>,
  <>Zendle, D., Meyer, R., &amp; Ballou, N. (2020). The changing face of desktop video game monetisation. <i>PLOS ONE</i>, 15(5).</>,
]
