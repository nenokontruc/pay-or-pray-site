// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createGame, launchMonth, defaultPlan, selectMarket, EXPORTS } from '../../src/sim'

const SIM_DIR = resolve(__dirname, '../../src/sim')

describe('engine independence', () => {
  it('src/sim uses no React, DOM, clock or Math.random', () => {
    for (const f of readdirSync(SIM_DIR)) {
      const code = readFileSync(resolve(SIM_DIR, f), 'utf8').replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '')
      expect(code, f).not.toMatch(/\bfrom ['"]react|\bdocument\.|\bwindow\.|Date\.now|Math\.random|localStorage/)
    }
  })

  it('runs a full game in plain Node (this test runs without jsdom)', () => {
    const g = createGame(99)
    selectMarket(g, 'us')
    for (let i = 0; i < 8; i++) launchMonth(g, defaultPlan(), false)
    expect(g.state.history).toHaveLength(8)
    expect(EXPORTS.months.build(g.state).split('\n')).toHaveLength(9)
    expect(launchMonth(g, defaultPlan(), false)).toBeNull() // game over: the original button does nothing
  })

  it('two games with the same seed never interfere with each other', () => {
    const a = createGame(5), b = createGame(5)
    selectMarket(a, 'vn'); selectMarket(b, 'vn')
    launchMonth(a, defaultPlan(), true)
    launchMonth(b, defaultPlan(), true)
    expect(EXPORTS.panel.build(a.state)).toBe(EXPORTS.panel.build(b.state))
  })
})
