// Pure calculations for the Industry page. No React, no styling.

export type Range = { lo: number; hi: number }
export type RangeVerdict = 'below' | 'inside' | 'above'

/** Where a price sits relative to an inclusive benchmark range. */
export function classifyPrice(price: number, range: Range): RangeVerdict {
  if (price < range.lo) return 'below'
  if (price > range.hi) return 'above'
  return 'inside'
}

/** Distance (in $) to the nearest edge of the range; 0 when inside. */
export function distanceToRange(price: number, range: Range): number {
  if (price < range.lo) return range.lo - price
  if (price > range.hi) return price - range.hi
  return 0
}

export type Slice = { id: string; value: number }
export type Arc = { id: string; value: number; share: number; start: number; length: number }

/** Share of each slice (0-1) and its start offset along a unit-length ring. */
export function donutArcs(slices: Slice[]): Arc[] {
  const total = slices.reduce((s, x) => s + x.value, 0)
  let acc = 0
  return slices.map((s) => {
    const share = s.value / total
    const arc = { id: s.id, value: s.value, share, start: acc, length: share }
    acc += share
    return arc
  })
}

/** Linear bar height for value against a maximum, in pixels. */
export function barHeight(value: number, max: number, plotHeight: number): number {
  return (value / max) * plotHeight
}

/** Map a price to an x coordinate on a $min-$max axis. */
export function priceToX(price: number, min: number, max: number, x0: number, x1: number): number {
  return x0 + ((price - min) / (max - min)) * (x1 - x0)
}

/** Pictogram: how many of 100 icons belong to the "spend nothing" group. */
export function pictogramSplit(percentSpendNothing: number, total = 100) {
  const nothing = Math.round((percentSpendNothing / 100) * total)
  return { nothing, spend: total - nothing }
}
