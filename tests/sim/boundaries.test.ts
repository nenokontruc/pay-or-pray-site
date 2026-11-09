// @vitest-environment node
/**
 * Boundary tests on the engine's building blocks, using a stub RNG that always returns the
 * same number, so each rule from the original can be checked in isolation.
 * Every expected value is derived by hand from the original formulas (legacy line refs given).
 */
import { describe, expect, it } from 'vitest'
import {
  MARKET_INFO, PIDS, churnAndInstall, goodwillDelta, simulateMonth, sweetSpot, planNotes,
  type Player, type Population, type Rng, type PkgId,
} from '../../src/sim'
import { plan } from './scenarioRunner'

const stub = (v: number): Rng => ({ rand: () => v, randRange: (a, b) => a + v * (b - a), shuffle: (a) => a, state: 0 })
const US = MARKET_INFO.us

function player(over: Partial<Player> = {}): Player {
  const interest = {} as Record<PkgId, number>
  PIDS.forEach((id) => { interest[id] = 1 })
  return { id: 1, seg: 2, base: 1000, interest, eng: 0.6, install: 1, active: true, churnMonth: null, ...over }
}

describe('fixed-price purchases (legacy :1295-1301)', () => {
  it('choice overload: 6 tiers convert fully, 7 tiers convert at 0.93', () => {
    const six = plan({ skin: [0.99, 1.99, 2.99, 4.99, 9.99, 19.99] })
    const seven = plan({ skin: [0.99, 1.99, 2.99, 4.99, 9.99, 19.99, 49.99] })
    // conversion draw 0.95: 0.95 > 1 is false (buy); 0.95 > 0.93 is true (skip)
    expect(simulateMonth(stub(0.95), US, [player()], six, false, 0, [0], false).payers).toBe(1)
    expect(simulateMonth(stub(0.95), US, [player()], seven, false, 0, [0], false).payers).toBe(0)
    // draw 0.93 is not > 0.93, so it still buys
    expect(simulateMonth(stub(0.93), US, [player()], seven, false, 0, [0], false).payers).toBe(1)
  })

  it('buys the highest tier that fits min(WTP × valueBonus, budget)', () => {
    // stub 0.5: shock = 1.015, budget noise = 1.0, WTP noise = 1.0 → budget = WTP = base × 1.015
    const r = simulateMonth(stub(0.5), US, [player({ base: 10 })], plan({ skin: [4.99, 9.99, 19.99] }), false, 0, [0], false)
    expect(r.txns.map((t) => t.tier)).toEqual([9.99]) // cap 10.15
    const pass = simulateMonth(stub(0.5), US, [player({ base: 18 })], plan({ pass: [4.99, 9.99, 19.99] }), false, 0, [0], false)
    // pass: cap = min(18.27 × 1.15, 18.27) = 18.27 → 9.99 (the bonus cannot exceed the budget)
    expect(pass.txns.map((t) => t.tier)).toEqual([9.99])
  })

  it('players with no active days spend nothing (withDays)', () => {
    const r = simulateMonth(stub(0.99), US, [player({ eng: 0.5 })], plan({ skin: [0.99] }), false, 0, [0], true)
    expect(r.rows[0].activeDays).toBe(0)
    expect(r.revenue).toBe(0)
  })
})

describe('gacha and pity (legacy :1302-1310, PITY = 50)', () => {
  const g = (pull: number, odds: number) => plan({ cgacha: [pull, odds] })

  it('never winning by luck → pity forces a win on pull 50', () => {
    const r = simulateMonth(stub(0.5), US, [player()], g(1, 1), false, 0, [0], false) // 0.5 < 0.01 never true
    expect(r.txns[0]).toMatchObject({ pulls: 50, won: 1, spend: 50 })
  })

  it('a draw below the odds wins on the first pull', () => {
    const r = simulateMonth(stub(0.001), US, [player()], g(2, 5), false, 0, [0], false)
    // threshold uses expected pulls min(1/0.05, 50) = 20 → 2 × 20 × 0.6503 = 26.01 < WTP
    expect(r.txns[0]).toMatchObject({ pulls: 1, won: 1, spend: 2 })
  })

  it('budget runs out before the pity → no win', () => {
    // base 40: budget = 40 × (0.85 + 0.5 × 0.33) × (0.85 + 0.5 × 0.3) = 40.6. With pull $1 and 1% odds the chase
    // threshold is 1 × 50 × 0.8 / 1.0 = 40 ≤ WTP 40.6, so the player starts, then stops at 40 pulls.
    const r = simulateMonth(stub(0.5), US, [player({ base: 40 })], g(1, 1), false, 0, [0], false)
    expect(r.txns[0]).toMatchObject({ pulls: 40, won: 0, spend: 40 })
  })

  it('does not start when WTP is below the expected-cost threshold', () => {
    const r = simulateMonth(stub(0.5), US, [player({ base: 39 })], g(1, 1), false, 0, [0], false)
    expect(r.txns).toHaveLength(0)
  })

  it('expected-cost hint uses min(100/odds, 50) pulls (legacy :1400)', () => {
    const n = planNotes(g(3, 5), null, null).notes.cgacha
    expect(n).toBe('Expected cost to win the featured item: about $60.00 (worst case $150.00 at the 50-pull pity).')
    expect(planNotes(g(3, 1), null, null).notes.cgacha).toContain('about $150.00')
  })
})

describe('goodwill (legacy :1325-1335)', () => {
  const noNoise = stub(0.5) // randRange(-2, 2) → 0
  it('cosmetic +0.6 each; power −3×p2wPenalty; gacha −gachaPenalty (×2 if power)', () => {
    expect(goodwillDelta(noNoise, US, plan({ skin: [0.99] }), false, 0)).toBeCloseTo(0.6, 12)
    expect(goodwillDelta(noNoise, US, plan({ item: [4.99] }), false, 0)).toBeCloseTo(-4.5, 12)
    expect(goodwillDelta(noNoise, US, plan({ pgacha: [3, 5] }), false, 0)).toBeCloseTo(-4.5 - 2.6, 12)
    expect(goodwillDelta(noNoise, US, plan({ cgacha: [3, 5] }), false, 0)).toBeCloseTo(-1.3, 12)
  })
  it('crowding: −0.8 per package beyond 3; event fatigue: −(streak − 1)', () => {
    const four = plan({ skin: [0.99], pass: [9.99], item: [4.99], cgacha: [3, 5] })
    expect(goodwillDelta(noNoise, US, four, false, 0)).toBeCloseTo(0.6 + 0.6 - 4.5 - 1.3 - 0.8, 12)
    expect(goodwillDelta(noNoise, US, plan({ skin: [0.99] }), true, 1)).toBeCloseTo(0.6, 12)
    expect(goodwillDelta(noNoise, US, plan({ skin: [0.99] }), true, 3)).toBeCloseTo(0.6 - 2, 12)
  })
})

describe('churn and installs (legacy :1336-1346)', () => {
  const pop = (n: number): Population => ({ players: Array.from({ length: n }, (_, i) => player({ id: i + 1, eng: 0.6 })), nextId: n + 1 })
  // eng 0.6 → factor (1.3 − 0.3) = 1, so the hazard equals h0 for non-payers.
  const churnedAt = (gw: number, draw: number) => { const p = pop(1); churnAndInstall(stub(draw), US, p, gw, {}, 1); return !p.players[0].active }

  it('hazard is 7.5% from goodwill 60 to 80, rising below 60 and falling above 80', () => {
    expect(churnedAt(60, 0.0749)).toBe(true)
    expect(churnedAt(60, 0.0751)).toBe(false)
    expect(churnedAt(59, 0.0789)).toBe(true) // 0.075 + 0.004
    expect(churnedAt(80, 0.0749)).toBe(true)
    expect(churnedAt(81, 0.0739)).toBe(true) // 0.075 − 0.001
    expect(churnedAt(81, 0.0741)).toBe(false)
  })
  it('payers churn at 0.7× the rate', () => {
    const p = pop(1); churnAndInstall(stub(0.06), US, p, 60, { 1: 1 }, 1)
    expect(p.players[0].active).toBe(true) // 0.06 ≥ 0.0525
  })
  it('installs: 6.5% at goodwill ≤ 70, more above 70, fewer below 40', () => {
    const installs = (gw: number) => churnAndInstall(stub(0.5), US, pop(1000), gw, {}, 1).installs
    expect(installs(70)).toBe(65)
    expect(installs(80)).toBe(80)
    expect(installs(30)).toBe(55)
  })
})

describe('sweet spot (legacy :1232-1245)', () => {
  it('matches the values recomputed independently in the Phase 0 audit', () => {
    expect(Object.fromEntries(Object.entries(MARKET_INFO).map(([k, mk]) => [k, sweetSpot(mk).price])))
      .toEqual({ us: 12, cn: 12, jp: 19, vn: 6.5, id: 1.5 })
  })
})
