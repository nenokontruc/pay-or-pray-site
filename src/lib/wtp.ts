// Teaching helpers for the willingness-to-pay step of the Framework toolkit. Pure functions.
//
// The 100-player population is ILLUSTRATIVE, built to show the course's price-response function
//   d(p) = D · (1 − W(p)),   Paying Rate = P(wtp ≥ p)
// Only one ingredient is a real figure: 56 of the 100 have willingness to pay $0, mirroring Newzoo's
// estimate that 56% of players spend nothing on games in a year (as the original Framework text uses it).
// The other 44 values are made up: evenly spaced quantiles of an exponential distribution, mean $8.

export const D_PLAYERS = 100
export const NON_PAYERS = 56 // Newzoo (2025): 56% spend nothing in a year
export const ILLUSTRATIVE_MEAN = 8

/** Willingness to pay of the 44 illustrative spenders, ascending, rounded to cents. */
export function illustrativeSpenders(n = D_PLAYERS - NON_PAYERS, mean = ILLUSTRATIVE_MEAN): number[] {
  return Array.from({ length: n }, (_, i) => Math.round(-mean * Math.log(1 - (i + 0.5) / n) * 100) / 100)
}

/** Full illustrative population: 56 zeros followed by the 44 spenders. */
export function illustrativePopulation(): number[] {
  return [...Array<number>(NON_PAYERS).fill(0), ...illustrativeSpenders()]
}

/** Number of players whose willingness to pay is at least the price (buyers at price p). */
export function buyersAt(wtp: readonly number[], price: number): number {
  if (!Number.isFinite(price) || price < 0) throw new RangeError('price must be a finite number ≥ 0')
  return wtp.filter((w) => w > 0 && w >= price).length
}

export interface PriceResponse { price: number; D: number; buyers: number; W: number; payingRate: number }

/** d(p) = D·(1 − W(p)) for a population; W(p) = share whose willingness to pay is below p. */
export function priceResponse(wtp: readonly number[], price: number): PriceResponse {
  const D = wtp.length
  const buyers = buyersAt(wtp, price)
  const payingRate = buyers / D
  return { price, D, buyers, W: 1 - payingRate, payingRate }
}
