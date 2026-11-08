// @vitest-environment node
// Home teaching gacha — rules checked against the written spec (docs/PHASE7B_HOME_DEMO.md).
import { describe, expect, it } from 'vitest'
import {
  DRAW_PRICE, ODDS, PITY, drawMany, drawOnce, expectedDrawsToFeatured, initialGacha, isGuaranteedNext,
  nextFeaturedChance, tierFor, winBeforeGuarantee,
} from '../../src/lib/homeGacha'

const always = (u: number) => () => u
const MISS = always(0.99) // common every time

describe('distribution', () => {
  it('sums to exactly 100% with 5 / 20 / 75', () => {
    expect(ODDS.map((o) => o.p)).toEqual([0.05, 0.2, 0.75])
    expect(ODDS.reduce((a, o) => a + o.p, 0)).toBeCloseTo(1, 15)
  })
  it('maps uniform numbers to rewards at the right boundaries', () => {
    expect(tierFor(0)).toBe('featured')
    expect(tierFor(0.0499)).toBe('featured')
    expect(tierFor(0.05)).toBe('rare')
    expect(tierFor(0.2499)).toBe('rare')
    expect(tierFor(0.25)).toBe('common')
    expect(tierFor(0.999999)).toBe('common')
    for (const u of [-0.1, 1, NaN]) expect(() => tierFor(u)).toThrow(RangeError)
  })
  it('long-run frequencies match the odds (fixed-seed sequence)', () => {
    let x = 12345
    const lcg = () => { x = (x * 16807) % 2147483647; return x / 2147483647 }
    const counts = { featured: 0, rare: 0, common: 0 }
    for (let i = 0; i < 200000; i++) counts[tierFor(lcg())]++
    expect(counts.featured / 200000).toBeCloseTo(0.05, 2)
    expect(counts.rare / 200000).toBeCloseTo(0.2, 2)
    expect(counts.common / 200000).toBeCloseTo(0.75, 2)
  })
})

describe('guarantee (hard pity at 50)', () => {
  it('49 misses, then draw 50 is the featured outfit with certainty — without using the random number', () => {
    let s = drawMany(initialGacha(), 49, MISS)
    expect(s.sinceFeatured).toBe(49)
    expect(isGuaranteedNext(s)).toBe(true)
    expect(nextFeaturedChance(s)).toBe(1)
    let called = false
    s = drawOnce(s, () => { called = true; return 0.99 })
    expect(called).toBe(false)
    expect(s.history[49]).toEqual({ n: 50, tier: 'featured', guaranteed: true })
    expect(s.sinceFeatured).toBe(0) // reset
    expect(nextFeaturedChance(s)).toBe(0.05)
  })
  it('draw 49 is not guaranteed (boundary)', () => {
    const s = drawMany(initialGacha(), 48, MISS)
    expect(isGuaranteedNext(s)).toBe(false)
    expect(drawOnce(s, MISS).history[48].tier).toBe('common')
  })
  it('rare rewards do not reset the counter; a lucky featured win does', () => {
    let s = drawMany(initialGacha(), 10, always(0.1)) // rare ×10
    expect(s.sinceFeatured).toBe(10)
    s = drawOnce(s, always(0.01)) // featured by luck
    expect(s.history.at(-1)).toEqual({ n: 11, tier: 'featured', guaranteed: false })
    expect(s.sinceFeatured).toBe(0)
    expect(s.featuredWins).toBe(1)
  })
  it('after a reset, the next guarantee is 50 draws later', () => {
    const s = drawMany(initialGacha(), 100, MISS)
    expect(s.history.filter((d) => d.guaranteed).map((d) => d.n)).toEqual([50, 100])
    expect(s.featuredWins).toBe(2)
  })
})

describe('spending and state', () => {
  it('each draw adds 100 gems; state is never mutated', () => {
    const s0 = initialGacha()
    const s1 = drawOnce(s0, MISS)
    expect(s0).toEqual(initialGacha())
    expect(s1.spent).toBe(DRAW_PRICE)
    expect(drawMany(s1, 9, MISS).spent).toBe(1000)
  })
  it('the featured outfit always costs between 100 and 5,000 gems', () => {
    expect(drawOnce(initialGacha(), always(0)).spent).toBe(100)
    expect(drawMany(initialGacha(), PITY, MISS).spent).toBe(5000)
  })
})

describe('teaching figures (hand-checked)', () => {
  it('P(featured within 49 draws) = 1 − 0.95^49 ≈ 91.9%', () => expect(winBeforeGuarantee()).toBeCloseTo(0.9190, 4))
  it('expected draws = (1 − 0.95^50) / 0.05 ≈ 18.46', () => expect(expectedDrawsToFeatured()).toBeCloseTo(18.4611, 3))
})
