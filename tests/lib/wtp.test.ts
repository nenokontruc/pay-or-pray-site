// @vitest-environment node
// Hand-checked values for the illustrative price-response teaching model.
// Spender i (0–43) has wtp = −8·ln(1 − (i + 0.5)/44). Worked by hand:
//   p = $0.99 → spenders i = 5…43 buy (i = 4: $0.86 < 0.99; i = 5: $1.07)  → 39
//   p = $4.99 → i = 20…43 buy (i = 19: $4.68; i = 20: $5.02)               → 24
//   p = $19.99 → i = 40…43 buy (i = 39: $18.24; i = 40: $20.25)            → 4
import { describe, expect, it } from 'vitest'
import { buyersAt, illustrativePopulation, illustrativeSpenders, priceResponse } from '../../src/lib/wtp'

describe('illustrative population', () => {
  it('has 100 players: 56 at $0 (Newzoo share) and 44 illustrative spenders, ascending', () => {
    const pop = illustrativePopulation()
    expect(pop).toHaveLength(100)
    expect(pop.filter((w) => w === 0)).toHaveLength(56)
    const s = illustrativeSpenders()
    expect(s).toHaveLength(44)
    expect(s.every((w, i) => i === 0 || w >= s[i - 1])).toBe(true)
    expect(s[4]).toBe(0.86)
    expect(s[5]).toBe(1.07)
    expect(s[19]).toBe(4.68)
    expect(s[20]).toBe(5.02)
  })
})

describe('price response d(p) = D·(1 − W(p))', () => {
  const pop = illustrativePopulation()
  it.each([[0.99, 39], [4.99, 24], [19.99, 4]])('at $%f, %i of 100 buy', (p, n) => {
    const r = priceResponse(pop, p)
    expect(r.buyers).toBe(n)
    expect(r.payingRate).toBeCloseTo(n / 100, 12)
    expect(r.W).toBeCloseTo(1 - n / 100, 12)
    expect(r.D * (1 - r.W)).toBeCloseTo(n, 9)
  })
  it('even at a near-zero price, at most 44% pay: the 56 non-payers never buy', () => {
    expect(buyersAt(pop, 0.01)).toBe(44)
    expect(buyersAt(pop, 0)).toBe(44)
  })
  it('is non-increasing in price, and zero above every willingness to pay', () => {
    let last = Infinity
    for (let p = 0; p <= 40; p += 0.5) { const b = buyersAt(pop, p); expect(b).toBeLessThanOrEqual(last); last = b }
    expect(buyersAt(pop, 1000)).toBe(0)
  })
  it('rejects invalid prices', () => {
    for (const p of [-1, NaN, Infinity]) expect(() => buyersAt(pop, p)).toThrow(RangeError)
  })
})
