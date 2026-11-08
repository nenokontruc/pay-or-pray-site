import assert from 'node:assert/strict'
import { classifyPrice, distanceToRange, donutArcs, barHeight, priceToX, pictogramSplit } from './industryCalc.ts'

const US = { lo: 10, hi: 19 }, VN = { lo: 5, hi: 7 }
assert.equal(classifyPrice(15, US), 'inside')
assert.equal(classifyPrice(15, VN), 'above')
assert.equal(classifyPrice(10, US), 'inside')
assert.equal(classifyPrice(19, US), 'inside')
assert.equal(classifyPrice(4.5, VN), 'below')
assert.equal(distanceToRange(15, VN), 8)
assert.equal(distanceToRange(6, VN), 0)
const arcs = donutArcs([{ id: 'm', value: 103 }, { id: 'o', value: 85.8 }])
assert.equal(Math.round(arcs[0].share * 100), 55)
assert.equal(Math.round(arcs[1].share * 100), 45)
assert.ok(Math.abs(arcs[1].start - arcs[0].share) < 1e-12)
assert.equal(+(103 + 85.8).toFixed(1), 188.8)
assert.equal(barHeight(21, 21, 130), 130)
assert.ok(barHeight(1.3, 21, 130) < 9)
assert.equal(priceToX(0, 0, 25, 70, 580), 70)
assert.equal(priceToX(25, 0, 25, 70, 580), 580)
assert.deepEqual(pictogramSplit(56), { nothing: 56, spend: 44 })
console.log('industryCalc: all assertions passed')
