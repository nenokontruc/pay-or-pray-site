// Framework calculations (legacy/index.html:719-743). Pure functions, no React.
// Each function validates its inputs and throws RangeError on values the model does not define.

/** Input ranges used by the Framework page (illustrative teaching values, not game data). */
export const REFP_RANGE = { min: 0, max: 100, step: 0.5 } as const
export const DIFFV_RANGE = { min: -50, max: 50, step: 0.5 } as const
export const P_RANGE_PCT = { min: 0, max: 100, step: 0.1 } as const
export const VALUE_RANGE = { min: 0, max: 200, step: 1 } as const
export const COST_RANGE = { min: 0, max: 100, step: 0.5 } as const

export const DETERMINISTIC_DEFAULTS = { refP: 10, diffV: 5 } as const
export const PROBABILISTIC_DEFAULTS = { pSuccessPct: 20, value: 15, cost: 3 } as const

function finite(name: string, x: number) {
  if (typeof x !== 'number' || !Number.isFinite(x)) throw new RangeError(`${name} must be a finite number`)
}

/**
 * Deterministic goods: EVC = RefP + DiffV.
 * RefP — price of the next-best alternative (≥ 0).
 * DiffV — differentiated value over that alternative; may be negative when the item is worse
 * than the alternative on what the customer values. A negative EVC means no positive price is defensible.
 */
export function deterministicEVC(refP: number, diffV: number): number {
  finite('RefP', refP)
  finite('DiffV', diffV)
  if (refP < 0) throw new RangeError('RefP cannot be negative')
  return refP + diffV
}

export interface GachaEVC {
  pSuccess: number
  pFailure: number
  /** P(success) × Value — expected gain from success. */
  gain: number
  /** P(failure) × Cost — expected sunk cost of failing. */
  loss: number
  /** gain − loss */
  evc: number
}

/**
 * Probabilistic goods (original simplified two-outcome form):
 *   EVC(gacha) = P(success) × Value − P(failure) × Cost,  with P(failure) = 1 − P(success).
 * Value — what the player gains if the draw succeeds. Cost — what is lost (sunk) if it fails.
 * Neither is the price per draw nor the expected cost of acquiring an item; see the page text.
 */
export function gachaEVC(pSuccess: number, value: number, cost: number): GachaEVC {
  finite('P(success)', pSuccess)
  finite('Value', value)
  finite('Cost', cost)
  if (pSuccess < 0 || pSuccess > 1) throw new RangeError('P(success) must be between 0 and 1')
  if (value < 0) throw new RangeError('Value cannot be negative')
  if (cost < 0) throw new RangeError('Cost cannot be negative')
  const pFailure = 1 - pSuccess
  const gain = pSuccess * value
  const loss = pFailure * cost
  return { pSuccess, pFailure, gain, loss, evc: gain - loss }
}

export interface Reward { item: string; prob: number }

/**
 * General expected utility of one loot box (Han, Ryan & Tong, 2026, as cited in the original):
 *   V(A, v, r) = Σⱼ rⱼ × [ v(A ∪ {j}) − v(A) ]
 * A — items already owned; rⱼ — probability of reward j; v — the player's value of a set of items.
 * Because A ∪ {j} = A when j is already owned, a duplicate adds v(A) − v(A) = 0 in this set-based model.
 */
export function expectedMarginalValue(owned: ReadonlySet<string>, rewards: readonly Reward[], v: (s: ReadonlySet<string>) => number): number {
  let total = 0, sumP = 0
  for (const r of rewards) {
    finite(`r(${r.item})`, r.prob)
    if (r.prob < 0 || r.prob > 1) throw new RangeError(`r(${r.item}) must be between 0 and 1`)
    sumP += r.prob
  }
  if (sumP > 1 + 1e-9) throw new RangeError('reward probabilities sum to more than 1')
  const base = v(owned)
  for (const r of rewards) total += r.prob * (v(new Set([...owned, r.item])) - base)
  return total
}

/** Additive value function: the set is worth the sum of its items' values. */
export const additiveValue = (values: Readonly<Record<string, number>>) => (s: ReadonlySet<string>) => {
  let t = 0
  s.forEach((i) => { t += values[i] ?? 0 })
  return t
}

/** "$15", "$12.50", "−$3" — money for the calculators (trailing .00 dropped). */
export function money(n: number): string {
  const abs = Math.abs(n), s = Number.isInteger(Math.round(abs * 100) / 100) ? String(Math.round(abs)) : abs.toFixed(2)
  return (n < 0 && abs >= 0.005 ? '−$' : '$') + s
}
