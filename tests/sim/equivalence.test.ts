// @vitest-environment node
/**
 * Behavioural equivalence: original Simulation (legacy/index.html, unmodified) vs src/sim.
 * Same seed + same clicks → the engine must reproduce every exported byte and every
 * number the original shows. Exact equality only; no tolerances anywhere.
 */
import { describe, expect, it } from 'vitest'
import { LADDER, MARKET_IDS, type MarketId } from '../../src/sim'
import { plan, runScenario, type Action } from './scenarioRunner'

const T = 60_000 // each scenario runs the original page in jsdom; allow time on slow machines

const pulls = (txns: string) => txns.split('\n').slice(1).map((l) => l.split(',')).filter((c) => c[7] !== '')
  .map((c) => ({ pkg: c[5], pulls: Number(c[7]), won: Number(c[8]) }))

describe('equivalence with the original Simulation', () => {
  it('deterministic only: default shop, US, 8 months, no tests', async () => {
    const r = await runScenario(12345, [{ t: 'market', m: 'us' }, { t: 'launch', times: 8 }, { t: 'compareCSV' }])
    expect(r.game.state.history).toHaveLength(8)
    expect(r.csv.txns.split('\n').length).toBeGreaterThan(100)
  }, T)

  it('deterministic: full 8-tier ladder (choice overload) + battle pass, event streak, CBT + survey (VN)', async () => {
    const r = await runScenario(987654321, [
      { t: 'market', m: 'vn' },
      { t: 'plan', plan: plan({ skin: [...LADDER], pass: [4.99, 9.99, 19.99] }) },
      { t: 'test', kind: 'cbt' }, { t: 'test', kind: 'survey' },
      { t: 'event', on: true }, { t: 'launch', times: 3 },
      { t: 'event', on: false }, { t: 'launch', times: 5 },
      { t: 'compareCSV' },
    ])
    expect(r.labResults.map((x) => x.kind)).toEqual(['cbt', 'survey'])
  }, T)

  it('probabilistic boundaries: 1% odds (pity at 50) and 15% odds at $10/pull (JP)', async () => {
    const r = await runScenario(2024, [
      { t: 'market', m: 'jp' },
      { t: 'plan', plan: plan({ cgacha: [0.5, 1], pgacha: [10, 15] }) },
      { t: 'event', on: true }, { t: 'launch', times: 2 },
      { t: 'event', on: false }, { t: 'launch', times: 2 },
      { t: 'plan', plan: plan({ skin: [0.99, 4.99], cgacha: [0.5, 1] }) }, { t: 'launch', times: 4 },
      { t: 'compareCSV' },
    ])
    const p = pulls(r.csv.txns)
    // Make sure the boundaries were actually exercised (not just "equal because nothing happened").
    expect(p.some((x) => x.pulls === 50 && x.won === 1), 'some players hit the 50-pull pity').toBe(true)
    expect(p.some((x) => x.pulls < 50 && x.won === 0), 'some players ran out of budget before winning').toBe(true)
    expect(p.some((x) => x.pkg === 'pgacha' && x.pulls < 50 && x.won === 1), 'some players won early at 15%').toBe(true)
  }, T)

  it('mixed + pay-to-win, all 5 packages (crowding), A/B pre- and post-launch until credits run out (CN)', async () => {
    const all5 = plan({ skin: [2.99, 9.99, 19.99], pass: [9.99], item: [4.99, 19.99], cgacha: [3, 5], pgacha: [3, 5] })
    const r = await runScenario(55555, [
      { t: 'market', m: 'cn' },
      { t: 'plan', plan: all5 }, { t: 'saveA' },
      { t: 'test', kind: 'ab' }, // refused: B identical to A
      { t: 'plan', plan: plan({ skin: [2.99, 9.99, 19.99], item: [4.99, 19.99, 49.99], pgacha: [2, 8] }) },
      { t: 'test', kind: 'ab' },
      { t: 'launch', times: 2 },
      { t: 'saveA' }, { t: 'plan', plan: all5 }, { t: 'test', kind: 'ab' },
      { t: 'launch' },
      { t: 'test', kind: 'cbt' }, // refused: after launch, and no credits left
      { t: 'event', on: true }, { t: 'launch', times: 5 },
      { t: 'compareCSV' },
    ])
    expect(r.labResults.map((x) => x.kind)).toEqual(['ab', 'ab'])
    expect(r.refusals).toEqual(['B is still identical to A — change a tier, package or pull price first.', 'Pre-launch only.'])
    expect(r.csv.tests).toContain('after month 2')
  }, T)

  it('probabilistic only, expensive pulls, survey on a gacha-only shop (ID)', async () => {
    await runScenario(31337, [
      { t: 'market', m: 'id' },
      { t: 'plan', plan: plan({ cgacha: [10, 1], pgacha: [0.5, 15] }) },
      { t: 'test', kind: 'survey' }, { t: 'test', kind: 'cbt' }, { t: 'test', kind: 'survey' },
      { t: 'launch', times: 8 },
      { t: 'compareCSV' },
    ])
  }, T)

  it('empty shop: launch does nothing, closed beta refused without spending a credit (US)', async () => {
    const r = await runScenario(777, [
      { t: 'market', m: 'us' },
      { t: 'plan', plan: plan({}) },
      { t: 'launch' }, { t: 'test', kind: 'cbt' },
      { t: 'plan', plan: plan({ skin: [0.99] }) }, { t: 'launch', times: 8 },
      { t: 'compareCSV' },
    ])
    expect(r.refusals).toEqual(['Your shop is empty — add a package first.'])
    expect(r.game.state.credits).toBe(3)
  }, T)

  it('reset: play again continues the random stream; second game also matches (US → JP)', async () => {
    const r = await runScenario(424242, [
      { t: 'market', m: 'us' }, { t: 'test', kind: 'cbt' }, { t: 'launch', times: 8 }, { t: 'compareCSV' },
      { t: 'replay' },
      { t: 'market', m: 'jp' }, { t: 'plan', plan: plan({ skin: [4.99, 9.99], cgacha: [2, 4] }) },
      { t: 'launch', times: 8 }, { t: 'compareCSV' },
    ])
    expect(r.game.state.market).toBe('jp')
    expect(r.game.state.credits).toBe(3) // fresh credits after reset
  }, T)

  it('mid-game exports match after each month (UK-style checkpointing, VN)', async () => {
    const steps: Action[] = [{ t: 'market', m: 'vn' }, { t: 'plan', plan: plan({ skin: [0.99, 2.99, 4.99], cgacha: [1, 3] }) }]
    for (let i = 0; i < 3; i++) steps.push({ t: 'launch' }, { t: 'compareCSV', kinds: ['months', 'daily', 'panel'] })
    await runScenario(1, steps)
  }, T)

  // Every market × several seeds with one mixed shop and an event month.
  const markets: MarketId[] = MARKET_IDS
  for (const m of markets) {
    for (const seed of [2, 1000003, 2147483646]) {
      it(`matrix: ${m}, seed ${seed}`, async () => {
        await runScenario(seed, [
          { t: 'market', m },
          { t: 'plan', plan: plan({ skin: [1.99, 4.99, 9.99, 19.99], cgacha: [2.5, 6] }) },
          { t: 'launch', times: 2 }, { t: 'event', on: true }, { t: 'launch' }, { t: 'event', on: false }, { t: 'launch', times: 5 },
          { t: 'compareCSV' },
        ])
      }, T)
    }
  }
})
