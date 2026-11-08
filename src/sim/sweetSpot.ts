// Best single price for one cosmetic item, by grid search (legacy/index.html:1232-1245).
// Deterministic: uses quantiles of the budget distribution, no random numbers.
import type { MarketInfo } from './params'

export interface SweetSpot { price: number; revPerPlayer: number }

export function sweetSpot(mk: MarketInfo): SweetSpot {
  const W = [mk.weights[0], mk.weights[1] - mk.weights[0], 1 - mk.weights[1]]
  let best = 1, bestRev = 0
  for (let p = 0.5; p <= 60; p += 0.5) {
    let r = 0
    for (let s = 0; s < 3; s++) {
      let c = 0
      for (let j = 0; j < 80; j++) {
        const b = -mk.tiers[s] * Math.log(1 - (j + 0.5) / 80)
        for (let k = 0; k < 12; k++) { const it = 0.3 + 0.9 * (k + 0.5) / 12; if (Math.min(b * it, b) >= p) c++ }
      }
      r += W[s] * p * c / 960
    }
    if (r > bestRev) { bestRev = r; best = p }
  }
  return { price: best, revPerPlayer: bestRev }
}
