// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { createRng, seedFromClock } from '../../src/sim/rng'

describe('rng (Park–Miller minimal standard, as in legacy/index.html:1209-1212)', () => {
  it('passes the published check value: seed 1 → state 1043618065 after 10,000 draws', () => {
    // Park & Miller (1988), "Random number generators: good ones are hard to find", CACM 31(10).
    const r = createRng(1)
    for (let i = 0; i < 10000; i++) r.rand()
    expect(r.state).toBe(1043618065)
  })

  it('reproduces the original clock seed rule', () => {
    expect(seedFromClock(0)).toBe(1)
    expect(seedFromClock(2147483645)).toBe(2147483646)
    expect(seedFromClock(2147483646)).toBe(1)
  })

  it('rejects seeds the generator cannot use', () => {
    for (const bad of [0, -1, 1.5, 2147483647, NaN]) expect(() => createRng(bad)).toThrow(RangeError)
  })

  it('randRange and shuffle consume exactly one draw each step', () => {
    const a = createRng(42), b = createRng(42)
    a.randRange(2, 5); b.rand()
    expect(a.state).toBe(b.state)
    a.shuffle([1, 2, 3, 4]); b.rand(); b.rand(); b.rand() // n−1 draws
    expect(a.state).toBe(b.state)
  })
})
