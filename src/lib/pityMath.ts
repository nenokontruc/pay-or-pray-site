// Probability helpers for the Case Study chart. Pure functions, no React.
//
// Only quantities that follow EXACTLY from published numbers are computed here:
// - Where Winds Meet: fixed per-pull odds p and a guarantee on pull N → exact curve.
// - Honor of Kings: odds start at p0 and only rise, with a guarantee on draw N. The rise
//   schedule is not published, so the exact curve is unknown. What IS implied: on every draw
//   the odds are at least p0, so the chance of having won by draw n is at least 1 − (1 − p0)^n.

/** P(featured item won by pull n) with fixed odds p and a hard guarantee on pull `pity`. */
export function cumulativeFixed(p: number, n: number, pity: number): number {
  if (n <= 0) return 0
  if (n >= pity) return 1
  return 1 - Math.pow(1 - p, n)
}

/** P(won before the guarantee pull), i.e. within the first pity − 1 pulls. */
export const winBeforeGuarantee = (p: number, pity: number): number => 1 - Math.pow(1 - p, pity - 1)

/** Expected pulls to win with fixed odds p and a hard guarantee (truncated geometric). */
export const expectedPullsWithPity = (p: number, pity: number): number => (1 - Math.pow(1 - p, pity)) / p

/** Lower bound on P(won by draw n) when odds start at p0 and never fall; 1 at the guarantee. */
export function cumulativeLowerBoundRising(p0: number, n: number, pity: number): number {
  if (n <= 0) return 0
  if (n >= pity) return 1
  return 1 - Math.pow(1 - p0, n)
}
