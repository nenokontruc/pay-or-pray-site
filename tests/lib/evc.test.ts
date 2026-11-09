// @vitest-environment node
// Independent numerical tests for the Framework calculations (expected values worked by hand).
import { describe, expect, it } from 'vitest'
import { additiveValue, deterministicEVC, expectedMarginalValue, gachaEVC, money } from '../../src/lib/evc'

describe('deterministic EVC = RefP + DiffV', () => {
  it('course example: RefP 10, DiffV 5 → 15', () => expect(deterministicEVC(10, 5)).toBe(15))
  it('zero values', () => {
    expect(deterministicEVC(0, 0)).toBe(0)
    expect(deterministicEVC(10, 0)).toBe(10)
    expect(deterministicEVC(0, 5)).toBe(5)
  })
  it('boundary values of the page ranges', () => {
    expect(deterministicEVC(100, 50)).toBe(150)
    expect(deterministicEVC(0, -50)).toBe(-50)
    expect(deterministicEVC(0.5, 0.5)).toBe(1)
  })
  it('negative differentiated value is allowed (item worse than the alternative)', () => {
    expect(deterministicEVC(10, -4)).toBe(6)
    expect(deterministicEVC(10, -12)).toBe(-2) // negative EVC: no positive price is defensible
  })
  it('rejects invalid inputs', () => {
    for (const [a, b] of [[-1, 0], [NaN, 1], [1, NaN], [Infinity, 0], [0, -Infinity]]) expect(() => deterministicEVC(a, b)).toThrow(RangeError)
  })
})

describe('probabilistic EVC = P(success)·Value − P(failure)·Cost', () => {
  it('P(success) = 0: only the failure term remains', () => {
    expect(gachaEVC(0, 15, 3)).toEqual({ pSuccess: 0, pFailure: 1, gain: 0, loss: 3, evc: -3 })
  })
  it('P(success) = 1: only the success term remains', () => {
    expect(gachaEVC(1, 15, 3)).toEqual({ pSuccess: 1, pFailure: 0, gain: 15, loss: 0, evc: 15 })
  })
  it('P(success) = 0.5', () => {
    const r = gachaEVC(0.5, 15, 3)
    expect(r.pFailure).toBe(0.5)
    expect(r.evc).toBe(6) // 7.5 − 1.5
  })
  it('page default: 20%, $15, $3 → 3.00 − 2.40 = 0.60', () => {
    const r = gachaEVC(0.2, 15, 3)
    expect(r.gain).toBeCloseTo(3, 12)
    expect(r.loss).toBeCloseTo(2.4, 12)
    expect(r.evc).toBeCloseTo(0.6, 12)
  })
  it('very low probability (0.0415%)', () => {
    const r = gachaEVC(0.000415, 100, 2.67)
    expect(r.pFailure).toBeCloseTo(0.999585, 12)
    expect(r.evc).toBeCloseTo(0.0415 - 0.999585 * 2.67, 10)
  })
  it('positive, zero and negative results', () => {
    expect(gachaEVC(0.5, 10, 2).evc).toBeGreaterThan(0)
    expect(gachaEVC(0.25, 3, 1).evc).toBe(0) // 0.75 − 0.75
    expect(gachaEVC(0.1, 10, 5).evc).toBeLessThan(0) // 1 − 4.5
  })
  it('failure probability is always 1 − P(success)', () => {
    for (const p of [0, 0.001, 0.2, 0.5, 0.999, 1]) expect(gachaEVC(p, 1, 1).pFailure).toBeCloseTo(1 - p, 15)
  })
  it('rejects invalid probabilities and negative amounts', () => {
    for (const p of [-0.01, 1.01, NaN, Infinity]) expect(() => gachaEVC(p, 1, 1)).toThrow(RangeError)
    expect(() => gachaEVC(0.5, -1, 1)).toThrow(RangeError)
    expect(() => gachaEVC(0.5, 1, -1)).toThrow(RangeError)
  })
})

describe('general expected utility V(A,v,r) = Σ rⱼ [v(A ∪ {j}) − v(A)]', () => {
  const v = additiveValue({ Outfit: 15, Mount: 10, Dye: 1 })
  const rewards = [{ item: 'Outfit', prob: 0.05 }, { item: 'Mount', prob: 0.05 }, { item: 'Dye', prob: 0.9 }]
  it('owning nothing: 0.05·15 + 0.05·10 + 0.9·1 = 2.15', () => {
    expect(expectedMarginalValue(new Set(), rewards, v)).toBeCloseTo(2.15, 12)
  })
  it('a duplicate adds zero: owning the Mount removes its 0.5 → 1.65', () => {
    expect(expectedMarginalValue(new Set(['Mount']), rewards, v)).toBeCloseTo(1.65, 12)
  })
  it('one-target special case equals P(success) × Value (the success term only)', () => {
    const one = expectedMarginalValue(new Set(), [{ item: 'Outfit', prob: 0.2 }], additiveValue({ Outfit: 15 }))
    expect(one).toBeCloseTo(gachaEVC(0.2, 15, 3).gain, 12)
  })
  it('rejects probabilities that do not form a distribution', () => {
    expect(() => expectedMarginalValue(new Set(), [{ item: 'a', prob: 0.7 }, { item: 'b', prob: 0.4 }], v)).toThrow(RangeError)
    expect(() => expectedMarginalValue(new Set(), [{ item: 'a', prob: -0.1 }], v)).toThrow(RangeError)
  })
})

describe('money formatting', () => {
  it('drops .00 and uses a true minus sign', () => {
    expect(money(15)).toBe('$15')
    expect(money(12.5)).toBe('$12.50')
    expect(money(0.6)).toBe('$0.60')
    expect(money(-3)).toBe('−$3')
    expect(money(-0.001)).toBe('$0')
  })
})
