import { describe, expect, it } from 'vitest'
import { classifyPrice, distanceToRange, donutArcs, barHeight, priceToX, pictogramSplit } from './industryCalc'

// Same assertions as the original Figma test (industryCalc.test.mts), now run by Vitest.
const US = { lo: 10, hi: 19 }
const VN = { lo: 5, hi: 7 }

describe('classifyPrice', () => {
  it('places a price relative to an inclusive range', () => {
    expect(classifyPrice(15, US)).toBe('inside')
    expect(classifyPrice(15, VN)).toBe('above')
    expect(classifyPrice(10, US)).toBe('inside')
    expect(classifyPrice(19, US)).toBe('inside')
    expect(classifyPrice(4.5, VN)).toBe('below')
  })
})

describe('distanceToRange', () => {
  it('is the gap to the nearest edge, 0 inside', () => {
    expect(distanceToRange(15, VN)).toBe(8)
    expect(distanceToRange(6, VN)).toBe(0)
  })
})

describe('donutArcs', () => {
  it('splits $188.8B into 55% mobile / 45% other', () => {
    const arcs = donutArcs([{ id: 'm', value: 103 }, { id: 'o', value: 85.8 }])
    expect(Math.round(arcs[0].share * 100)).toBe(55)
    expect(Math.round(arcs[1].share * 100)).toBe(45)
    expect(Math.abs(arcs[1].start - arcs[0].share)).toBeLessThan(1e-12)
    expect(+(103 + 85.8).toFixed(1)).toBe(188.8)
  })
})

describe('chart geometry', () => {
  it('scales bars and the price axis linearly', () => {
    expect(barHeight(21, 21, 130)).toBe(130)
    expect(barHeight(1.3, 21, 130)).toBeLessThan(9)
    expect(priceToX(0, 0, 25, 70, 580)).toBe(70)
    expect(priceToX(25, 0, 25, 70, 580)).toBe(580)
  })
})

describe('pictogramSplit', () => {
  it('shows 56 of 100 players spending nothing', () => {
    expect(pictogramSplit(56)).toEqual({ nothing: 56, spend: 44 })
  })
})
