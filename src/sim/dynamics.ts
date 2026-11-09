// Goodwill and retention (legacy/index.html:1325-1346).
import { PKGS, type MarketInfo } from './params'
import { isLive, type Plan } from './plan'
import { activeIdx, makePlayer, type Population } from './players'
import type { Rng } from './rng'

/** Monthly goodwill change. `eventStreak` is the streak already including this month. */
export function goodwillDelta(rng: Rng, mk: MarketInfo, plan: Plan, eventOn: boolean, eventStreak: number): number {
  let d = 0, n = 0
  PKGS.forEach((p) => {
    if (!isLive(p, plan[p.id])) return
    n++
    if (p.power) d -= 3 * mk.p2wPenalty
    if (p.gacha) d -= (p.power ? 2 : 1) * mk.gachaPenalty
    if (!p.power && !p.gacha) d += 0.6
  })
  if (n > 3) d -= (n - 3) * 0.8
  if (eventOn) d -= Math.max(0, eventStreak - 1)
  d += rng.randRange(-2, 2)
  return d
}

export interface ChurnResult { churned: number; installs: number; start: number }

/**
 * Churn the current players, then add new installs. Mutates `pop` (active flags,
 * churnMonth, new players). `round` is the month just played.
 */
export function churnAndInstall(
  rng: Rng, mk: MarketInfo, pop: Population, gw: number, payerSet: Record<number, 1>, round: number,
): ChurnResult {
  let churned = 0
  const start = activeIdx(pop.players).length
  const h0 = 0.075 + Math.max(0, 60 - gw) * 0.004 - Math.max(0, gw - 80) * 0.001
  pop.players.forEach((p) => {
    if (!p.active) return
    const h = h0 * (payerSet[p.id] ? 0.7 : 1) * (1.3 - p.eng * 0.5)
    if (rng.rand() < Math.max(0.005, Math.min(0.4, h))) { p.active = false; p.churnMonth = round; churned++ }
  })
  const acq = Math.max(0.02, 0.065 + Math.max(0, gw - 70) * 0.0015 - Math.max(0, 40 - gw) * 0.001)
  let installs = 0
  const n = Math.round(start * acq + rng.randRange(-1.5, 1.5))
  for (let i = 0; i < Math.max(0, n); i++) { pop.players.push(makePlayer(rng, mk, pop, round + 1)); installs++ }
  return { churned, installs, start }
}
