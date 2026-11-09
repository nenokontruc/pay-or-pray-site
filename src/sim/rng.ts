// Random numbers — same Park–Miller "minimal standard" generator as the original
// (legacy/index.html:1209-1212): seed ← seed × 16807 mod (2³¹ − 1).
// The original seeds from the clock; here the seed is a parameter, and
// seedFromClock() reproduces the original rule for the live UI.
//
// Exactness: seed < 2³¹ and 16807 < 2¹⁵, so every product is < 2⁴⁶ — well inside
// the 2⁵³ range where JavaScript numbers are exact integers. Same seed → same stream.

export const RNG_MODULUS = 2147483647

export interface Rng {
  rand(): number
  randRange(a: number, b: number): number
  /** In-place Fisher–Yates shuffle; returns the same array (as the original). */
  shuffle<T>(a: T[]): T[]
  /** Current internal state (useful for checkpoints in tests). */
  readonly state: number
}

/** The original seed rule: `(Date.now() % 2147483646) + 1`. */
export function seedFromClock(nowMs: number): number {
  return (nowMs % 2147483646) + 1
}

export function createRng(seed: number): Rng {
  if (!Number.isInteger(seed) || seed < 1 || seed >= RNG_MODULUS) {
    throw new RangeError(`seed must be an integer in [1, ${RNG_MODULUS - 1}], got ${seed}`)
  }
  let s = seed
  const rand = () => { s = (s * 16807) % RNG_MODULUS; return s / RNG_MODULUS }
  const randRange = (a: number, b: number) => a + rand() * (b - a)
  function shuffle<T>(a: T[]): T[] {
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t }
    return a
  }
  return { rand, randRange, shuffle, get state() { return s } }
}
