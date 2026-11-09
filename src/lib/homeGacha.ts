// Home-page teaching gacha — a HYPOTHETICAL model in illustrative "gems". Not game data.
// Deliberately independent of the verified Simulation engine in src/sim/.
// Rules (see docs/PHASE7B_HOME_DEMO.md):
//  - each draw costs DRAW_PRICE; outcomes 5% featured / 20% rare / 75% common;
//  - a counter counts draws since the featured outfit was last won (rare/common don't reset it);
//  - the PITY-th draw without the featured outfit gives it with certainty (no random number used);
//  - winning the featured outfit (luck or guarantee) resets the counter to 0.

export const DRAW_PRICE = 100
export const ITEM_PRICE = 800
export const PITY = 50

export type Tier = 'featured' | 'rare' | 'common'
export const ODDS: readonly { tier: Tier; label: string; p: number }[] = [
  { tier: 'featured', label: 'Featured outfit', p: 0.05 },
  { tier: 'rare', label: 'Rare accessory', p: 0.20 },
  { tier: 'common', label: 'Common emote', p: 0.75 },
]
export const FEATURED_P = ODDS[0].p

export interface Draw { n: number; tier: Tier; guaranteed: boolean }
export interface GachaState {
  draws: number
  spent: number
  /** Draws since the featured outfit was last won (0 … PITY − 1). */
  sinceFeatured: number
  featuredWins: number
  history: Draw[]
}

export const initialGacha = (): GachaState => ({ draws: 0, spent: 0, sinceFeatured: 0, featuredWins: 0, history: [] })

/** Map a uniform number in [0, 1) to a reward using the cumulative odds. */
export function tierFor(u: number): Tier {
  if (!(u >= 0 && u < 1)) throw new RangeError('random number must be in [0, 1)')
  let acc = 0
  for (const o of ODDS) { acc += o.p; if (u < acc) return o.tier }
  return ODDS[ODDS.length - 1].tier // guards against floating-point rounding at the top end
}

export const isGuaranteedNext = (s: GachaState): boolean => s.sinceFeatured === PITY - 1
export const nextFeaturedChance = (s: GachaState): number => (isGuaranteedNext(s) ? 1 : FEATURED_P)

/** One draw. Pure: returns a new state. `rng` is only called when the draw is not guaranteed. */
export function drawOnce(s: GachaState, rng: () => number): GachaState {
  const guaranteed = isGuaranteedNext(s)
  const tier: Tier = guaranteed ? 'featured' : tierFor(rng())
  const n = s.draws + 1
  return {
    draws: n,
    spent: s.spent + DRAW_PRICE,
    sinceFeatured: tier === 'featured' ? 0 : s.sinceFeatured + 1,
    featuredWins: s.featuredWins + (tier === 'featured' ? 1 : 0),
    history: [...s.history, { n, tier, guaranteed }],
  }
}

export function drawMany(s: GachaState, k: number, rng: () => number): GachaState {
  let out = s
  for (let i = 0; i < k; i++) out = drawOnce(out, rng)
  return out
}

/** P(featured within the first PITY − 1 draws), before the guarantee. */
export const winBeforeGuarantee = (p = FEATURED_P, pity = PITY): number => 1 - Math.pow(1 - p, pity - 1)
/** Expected draws to the featured outfit with the hard guarantee (truncated geometric). */
export const expectedDrawsToFeatured = (p = FEATURED_P, pity = PITY): number => (1 - Math.pow(1 - p, pity)) / p
