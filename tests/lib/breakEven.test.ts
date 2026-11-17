// RQ1 model — every expected number is worked by hand from Table 1 of the FINAL REVIEW COPY,
// not read from the code under test.
import { describe, expect, it } from 'vitest'
import { EXAMPLE, LOW_SPEND, breakEvenShare, freemiumProfit, matchPremiumShare, pct, premiumProfit, usd, withSpend, zoneOf } from '../../src/lib/breakEven'

describe('break-even example (FINAL REVIEW COPY, Section 3)', () => {
  it('premium: 100,000 buyers × ($14.00 − $2.00 − $0.30) − $1,040,000 = $130,000', () => {
    expect(premiumProfit()).toBeCloseTo(130_000, 6)
  })

  it('break-even payer share: ($1,760,000 / 600,000 + $0.70) / $28 = 12.976%', () => {
    expect(breakEvenShare()).toBeCloseTo((1_760_000 / 600_000 + 0.7) / 28, 12)
    expect(pct(breakEvenShare())).toBe('12.98%')
  })

  it('payer share that matches premium: (($1,760,000 + $130,000) / 600,000 + $0.70) / $28 = 13.75%', () => {
    expect(matchPremiumShare()).toBeCloseTo(3.85 / 28, 12)
    expect(pct(matchPremiumShare())).toBe('13.75%')
    expect((matchPremiumShare() - breakEvenShare()) * 100).toBeCloseTo(0.774, 3) // gap = Π_P / (D·s·(1−φ)·S)
  })

  it('freemium profit at 5%, 10%, 15%, 20% (Table 2)', () => {
    expect(freemiumProfit(0.05)).toBeCloseTo(-1_340_000, 4)
    expect(freemiumProfit(0.10)).toBeCloseTo(-500_000, 4)
    expect(freemiumProfit(0.15)).toBeCloseTo(340_000, 4)
    expect(freemiumProfit(0.20)).toBeCloseTo(1_180_000, 4)
  })

  it('profit is zero at the break-even share and equals premium at the matching share', () => {
    expect(freemiumProfit(breakEvenShare())).toBeCloseTo(0, 4)
    expect(freemiumProfit(matchPremiumShare())).toBeCloseTo(130_000, 4)
  })

  it('profit conditions just below, at and just above each threshold (±0.01 percentage point = ±$1,680)', () => {
    const e = 0.0001, rBE = breakEvenShare(), rP = matchPremiumShare(), piP = premiumProfit()
    // 600,000 installers × $28 × 0.0001 = $1,680 per 0.01 percentage point
    expect(freemiumProfit(rBE - e)).toBeCloseTo(-1_680, 4)
    expect(freemiumProfit(rBE)).toBeCloseTo(0, 4)
    expect(freemiumProfit(rBE + e)).toBeCloseTo(1_680, 4)
    expect(freemiumProfit(rP - e) - piP).toBeCloseTo(-1_680, 4)
    expect(freemiumProfit(rP) - piP).toBeCloseTo(0, 4)
    expect(freemiumProfit(rP + e) - piP).toBeCloseTo(1_680, 4)
    expect([zoneOf(rBE - e), zoneOf(rBE), zoneOf(rBE + e)]).toEqual(['loss', 'below-premium', 'below-premium'])
    expect([zoneOf(rP - e), zoneOf(rP), zoneOf(rP + e)]).toEqual(['below-premium', 'beats-premium', 'beats-premium'])
    expect(zoneOf(0.1375)).toBe('beats-premium') // the slider reaches 13.75% exactly: "matches or beats premium"
  })

  it('three zones', () => {
    expect(zoneOf(0.10)).toBe('loss')
    expect(zoneOf(0.135)).toBe('below-premium')
    expect(zoneOf(0.15)).toBe('beats-premium')
  })

  it('$3 per payer: 173.0% and 183.3%, reported as they are (infeasible, never clipped)', () => {
    expect(breakEvenShare(withSpend(LOW_SPEND))).toBeCloseTo((1_760_000 / 600_000 + 0.7) / 2.1, 12)
    expect(pct(breakEvenShare(withSpend(LOW_SPEND)), 1)).toBe('173.0%')
    expect(pct(matchPremiumShare(withSpend(LOW_SPEND)), 1)).toBe('183.3%')
  })

  it('$80 per payer halves both thresholds (6.49% and 6.88%)', () => {
    expect(breakEvenShare(withSpend(80))).toBeCloseTo(breakEvenShare() / 2, 12)
    expect(matchPremiumShare(withSpend(80))).toBeCloseTo(matchPremiumShare() / 2, 12)
  })

  it('inputs match Table 1 and invalid inputs are rejected', () => {
    expect(EXAMPLE.D).toBe(1_000_000)
    expect(EXAMPLE.T).toBe(24)
    expect(EXAMPLE.freemium.spendPerPayer).toBe(40)
    expect(() => freemiumProfit(1.2)).toThrow(RangeError)
    expect(() => freemiumProfit(-0.1)).toThrow(RangeError)
    expect(() => premiumProfit({ ...EXAMPLE, phi: 1 })).toThrow(RangeError)
    expect(() => breakEvenShare(withSpend(0))).toThrow(RangeError)
  })

  it('formatting', () => {
    expect(usd(130_000)).toBe('$130,000')
    expect(usd(-1_340_000)).toBe('−$1,340,000')
    expect(usd(-0.4)).toBe('$0')
  })
})
