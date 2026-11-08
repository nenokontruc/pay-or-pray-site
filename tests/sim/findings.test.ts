// @vitest-environment node
/**
 * Documented findings about the ORIGINAL model (see docs/PHASE3_SIMULATION.md §5).
 * These tests pin down the current, preserved behaviour and measure each issue.
 * Nothing here changes the engine; any correction needs the author's approval first.
 */
import { describe, expect, it } from 'vitest'
import { MARKET_INFO, PITY, sweetNote, sweetSpot } from '../../src/sim'

/** Exact expected number of pulls with per-pull odds p and a hard pity at N (truncated geometric). */
const exactExpectedPulls = (p: number, N: number) => (1 - Math.pow(1 - p, N)) / p
/** What the original uses (legacy :1303 and :1400). */
const modelExpectedPulls = (p: number) => Math.min(1 / p, PITY)

describe('F1 — expected pulls ignore the pity cut-off', () => {
  it.each([
    [0.01, 50, 39.499],
    [0.05, 20, 18.461],
    [0.15, 6.667, 6.665],
  ])('odds %f: model %f pulls vs exact %f', (p, model, exact) => {
    expect(modelExpectedPulls(p)).toBeCloseTo(model, 3)
    expect(exactExpectedPulls(p, PITY)).toBeCloseTo(exact, 3)
  })
  it('overstates the expected cost most at low odds (+27% at 1%, +8% at 5%)', () => {
    const over = (p: number) => modelExpectedPulls(p) / exactExpectedPulls(p, PITY) - 1
    expect(over(0.01)).toBeCloseTo(0.266, 3)
    expect(over(0.05)).toBeCloseTo(0.083, 3)
    expect(over(0.15)).toBeLessThan(0.001)
  })
})

describe('F3 — sweet-spot price is rounded to whole dollars in the on-page text', () => {
  it('Vietnam: model price $6.50 is shown as "$7"; Indonesia $1.50 as "$2"', () => {
    expect(sweetSpot(MARKET_INFO.vn).price).toBe(6.5)
    expect(sweetNote(MARKET_INFO.vn, sweetSpot(MARKET_INFO.vn))).toContain('about $7 ')
    expect(sweetSpot(MARKET_INFO.id).price).toBe(1.5)
    expect(sweetNote(MARKET_INFO.id, sweetSpot(MARKET_INFO.id))).toContain('about $2.')
  })
})
