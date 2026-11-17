// RQ1 — when does freemium pay off compared with premium? Pure functions, no React.
// Model and inputs: FINAL REVIEW COPY, Section 3 (equations 3.1–3.4, Table 1). All inputs are HYPOTHETICAL:
// a round, reproducible teaching example, not data from Honor of Kings, Where Winds Meet or any real game.
//
//   Premium:  Π_P = D·b·[(1 − φ)·P0 − k_P − o·L_P] − F_P
//   Freemium: Π_F = D·s·[(1 − φ)·r·S − k_F − o·L_F] − F_F
//   Break-even payer share:        r_BE = (F_F/(D·s) + k_F + o·L_F) / ((1 − φ)·S)
//   Payer share that equals premium: r_P = r_BE + Π_P / (D·s·(1 − φ)·S)
// Same market D, same 24-month horizon, same cost categories for both models; expected values, no discounting.

export interface BreakEvenInputs {
  /** potential players */ D: number
  /** horizon, months */ T: number
  /** platform fee, share of gross revenue */ phi: number
  premium: { price: number; buyShare: number; acquisition: number; servingPerMonth: number; activeMonths: number; development: number; liveOpsPerMonth: number }
  freemium: { installShare: number; acquisition: number; servingPerMonth: number; activeMonths: number; development: number; liveOpsPerMonth: number; spendPerPayer: number }
}

/** Table 1 of the FINAL REVIEW COPY. S = $10 per paying month × 4 expected paying months = $40. */
export const EXAMPLE: BreakEvenInputs = {
  D: 1_000_000, T: 24, phi: 0.3,
  premium: { price: 20, buyShare: 0.1, acquisition: 2, servingPerMonth: 0.05, activeMonths: 6, development: 800_000, liveOpsPerMonth: 10_000 },
  freemium: { installShare: 0.6, acquisition: 0.5, servingPerMonth: 0.05, activeMonths: 4, development: 800_000, liveOpsPerMonth: 40_000, spendPerPayer: 40 },
}

/** The alternative spending level shown on the page: with $3 per payer both thresholds exceed 100%. */
export const LOW_SPEND = 3

function check(x: BreakEvenInputs) {
  const all = [x.D, x.T, x.phi, ...Object.values(x.premium), ...Object.values(x.freemium)]
  if (all.some((v) => typeof v !== 'number' || !Number.isFinite(v) || v < 0)) throw new RangeError('inputs must be finite and non-negative')
  if (x.phi >= 1) throw new RangeError('platform fee must be below 100%')
  if (x.freemium.spendPerPayer <= 0 || x.freemium.installShare <= 0) throw new RangeError('spending per payer and install share must be positive')
}

export const premiumFixed = (x: BreakEvenInputs = EXAMPLE) => x.premium.development + x.premium.liveOpsPerMonth * x.T
export const freemiumFixed = (x: BreakEvenInputs = EXAMPLE) => x.freemium.development + x.freemium.liveOpsPerMonth * x.T
export const installers = (x: BreakEvenInputs = EXAMPLE) => x.D * x.freemium.installShare
/** Net revenue per paying player, (1 − φ)·S. */
export const netPerPayer = (x: BreakEvenInputs = EXAMPLE) => (1 - x.phi) * x.freemium.spendPerPayer
/** Fixed cost per installer, F_F/(D·s). */
export const fixedPerInstaller = (x: BreakEvenInputs = EXAMPLE) => freemiumFixed(x) / installers(x)
/** Variable cost per installer, k_F + o·L_F — carried by every installer, paying or not. */
export const variablePerInstaller = (x: BreakEvenInputs = EXAMPLE) => x.freemium.acquisition + x.freemium.servingPerMonth * x.freemium.activeMonths

/** Equation 3.1: premium expected profit. */
export function premiumProfit(x: BreakEvenInputs = EXAMPLE): number {
  check(x)
  const p = x.premium
  return x.D * p.buyShare * ((1 - x.phi) * p.price - p.acquisition - p.servingPerMonth * p.activeMonths) - premiumFixed(x)
}

/** Equation 3.2: freemium expected profit at payer share r (0–1). */
export function freemiumProfit(r: number, x: BreakEvenInputs = EXAMPLE): number {
  check(x)
  if (!Number.isFinite(r) || r < 0 || r > 1) throw new RangeError('payer share must be between 0 and 1')
  return installers(x) * (netPerPayer(x) * r - variablePerInstaller(x)) - freemiumFixed(x)
}

/** Equation 3.3: payer share at which freemium breaks even. May exceed 1 (infeasible); never clipped. */
export function breakEvenShare(x: BreakEvenInputs = EXAMPLE): number {
  check(x)
  return (fixedPerInstaller(x) + variablePerInstaller(x)) / netPerPayer(x)
}

/** Equation 3.4: payer share at which freemium earns as much as premium. May exceed 1; never clipped. */
export function matchPremiumShare(x: BreakEvenInputs = EXAMPLE): number {
  return breakEvenShare(x) + premiumProfit(x) / (installers(x) * netPerPayer(x))
}

/** The same example with only spending per payer changed. */
export const withSpend = (spendPerPayer: number, x: BreakEvenInputs = EXAMPLE): BreakEvenInputs => ({ ...x, freemium: { ...x.freemium, spendPerPayer } })

export type Zone = 'loss' | 'below-premium' | 'beats-premium'
/** Which of the three outcomes a payer share falls in (requires premium to be profitable, as in the example). */
// Exactly at a threshold, floating-point rounding can leave a difference of about 1e-10 dollars
// (e.g. Π_F(13.75%) − Π_P ≈ −2.9e-11). Differences within one cent count as equal, so the slider
// shows "matches" at 13.75% and "breaks even" (not a loss) at r_BE.
const CENT = 0.01

export function zoneOf(r: number, x: BreakEvenInputs = EXAMPLE): Zone {
  const pi = freemiumProfit(r, x)
  if (pi < -CENT) return 'loss'
  return pi < premiumProfit(x) - CENT ? 'below-premium' : 'beats-premium'
}

/** "12.98%" — a share (0–1) as a percentage, never clipped to 100%. */
export const pct = (share: number, digits = 2) => `${(share * 100).toFixed(digits)}%`
/** "$130,000", "−$1,340,000" — whole dollars. */
export function usd(n: number): string {
  const r = Math.round(n)
  return `${r < 0 ? '−' : ''}$${Math.abs(r).toLocaleString('en-US')}`
}
