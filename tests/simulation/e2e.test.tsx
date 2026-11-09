/**
 * End-to-end: one scripted journey through the REACT page vs the same journey through the
 * ORIGINAL page (legacy/index.html, unmodified, via the Phase 3 harness). Same seed, same clicks.
 * Every export must be byte-identical, and what the player sees must match.
 */
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { cleanup } from '@testing-library/react'
import type { ExportKind, MarketId, Plan } from '../../src/sim'
import { openLegacy, type LegacyPage } from '../sim/legacyHarness'
import { plan } from '../sim/scenarioRunner'
import { captureDownloads, renderSimulation, type UiDriver } from './uiDriver'

beforeAll(() => { window.scrollTo = () => {} })
afterEach(() => cleanup())

type Step =
  | { t: 'market'; m: MarketId } | { t: 'plan'; plan: Plan } | { t: 'event'; on: boolean }
  | { t: 'launch'; times?: number } | { t: 'test'; kind: 'cbt' | 'survey' | 'ab' } | { t: 'saveA' } | { t: 'replay' }
  | { t: 'export'; kinds: ExportKind[] }

const norm = (s: string) => s.replace(/\s+/g, ' ').trim()
const KINDS: ExportKind[] = ['months', 'daily', 'panel', 'txns', 'tests']

async function journey(seed: number, steps: Step[]) {
  const L: LegacyPage = openLegacy(seed)
  const cap = captureDownloads()
  const { ui } = renderSimulation(seed)
  // After Month 8 the original HIDES the shop/lab/LiveOps panels; the React page removes them.
  // So panel fields are only read while those panels are on screen.
  const live = () => !!ui.root.querySelector('#game-live')
  const seen = (page: LegacyPage | UiDriver) => ({
    hud: ['#g-market', '#g-round', '#g-pop', '#g-goodwill', '#g-revenue'].map((s) => norm(page.text(s))),
    credits: live() ? norm(page.text('#credits')) : '',
    liveops: live() ? page.texts('#liveops-table tbody tr').map(norm) : [],
    log: live() ? page.texts('.log-entry').map(norm) : [],
    lab: live() ? page.texts('#lab-results .lab-result').map(norm) : [],
    notes: live() ? page.texts('.ladder-note').map(norm) : [],
    warning: live() ? norm(page.text('#plan-warning')) : '',
  })
  let exportsCompared = 0
  try {
    for (const [i, s] of steps.entries()) {
      const where = `step ${i + 1} (${s.t})`
      switch (s.t) {
        case 'market': L.selectMarket(s.m); ui.selectMarket(s.m); break
        case 'plan': L.setPlan(s.plan); ui.setPlan(s.plan); break
        case 'event': L.setEvent(s.on); ui.setEvent(s.on); break
        case 'test': expect(ui.runTest(s.kind), `${where}: button enabled state`).toBe(L.runTest(s.kind)); break
        case 'saveA': L.saveA(); ui.saveA(); break
        case 'replay': L.replay(); ui.replay(); break
        case 'launch':
          for (let k = 0; k < (s.times ?? 1); k++) {
            L.launch(); ui.launch()
            if (ui.root.querySelector('.debrief')) await L.waitForDebrief()
          }
          break
        case 'export':
          for (const k of s.kinds) {
            const legacy = L.exportCSV(k)
            const before = cap.files.length
            ui.clickExport(k)
            expect(cap.files.length, `${where}: React page downloaded ${k}`).toBe(before + 1)
            const mine = await cap.files[cap.files.length - 1].text
            expect(mine === legacy, `${where}: ${k}.csv byte-identical to the original`).toBe(true)
            exportsCompared++
          }
          break
      }
      if (ui.root.querySelector('#game-stats')) {
        const a = seen(ui), b = seen(L)
        expect(a.hud, `${where}: HUD`).toEqual(b.hud)
        if (ui.root.querySelector('#game-live')) {
          expect(a.credits, `${where}: credits`).toEqual(b.credits)
          expect(a.liveops, `${where}: LiveOps table`).toEqual(b.liveops)
          expect(a.log, `${where}: month log`).toEqual(b.log)
          expect(a.lab, `${where}: lab results`).toEqual(b.lab)
          expect(a.notes, `${where}: plan hints`).toEqual(b.notes)
          expect(a.warning, `${where}: plan warning`).toEqual(b.warning)
        }
      }
      if (ui.root.querySelector('.debrief')) {
        expect(norm(ui.text('.debrief .grade')), `${where}: grade`).toBe(norm(L.text('.debrief .grade')))
        expect(ui.texts('.debrief .d-stat .dv'), `${where}: headline stats`).toEqual(L.texts('.debrief .d-stat .dv'))
        expect(ui.texts('.debrief .share-bar').map(norm), `${where}: revenue shares`).toEqual(L.texts('.debrief .share-bar').map(norm))
        expect(ui.texts('.debrief > p').map(norm), `${where}: debrief paragraphs`).toEqual(L.texts('.debrief > p').map(norm))
      }
    }
  } finally {
    L.close(); cap.restore()
  }
  return exportsCompared
}

describe('React page vs original page — scripted journeys', () => {
  it('full journey: JP, lab tools (CBT, survey, A/B), events, mid-game shop changes, 8 months, all exports', async () => {
    const n = await journey(20261108, [
      { t: 'market', m: 'jp' },
      { t: 'plan', plan: plan({ skin: [1.99, 4.99, 9.99], cgacha: [2, 4] }) },
      { t: 'test', kind: 'cbt' }, { t: 'test', kind: 'survey' },
      { t: 'saveA' },
      { t: 'plan', plan: plan({ skin: [0.99, 4.99, 19.99], pass: [9.99], cgacha: [1.5, 6] }) },
      { t: 'test', kind: 'ab' },
      { t: 'event', on: true }, { t: 'launch', times: 2 },
      { t: 'export', kinds: ['months', 'daily', 'panel'] },
      { t: 'event', on: false },
      { t: 'plan', plan: plan({ skin: [0.99, 2.99, 4.99, 9.99, 19.99, 49.99, 99.99], pgacha: [5, 10] }) },
      { t: 'launch', times: 3 },
      { t: 'test', kind: 'cbt' }, // disabled after launch, on both
      { t: 'event', on: true }, { t: 'launch', times: 3 },
      { t: 'export', kinds: KINDS },
    ])
    expect(n).toBe(8)
  }, 120_000)

  it('replay journey: US with an empty-shop refusal, Play again, then VN; exports from both games', async () => {
    const n = await journey(77, [
      { t: 'market', m: 'us' },
      { t: 'plan', plan: plan({}) }, { t: 'test', kind: 'cbt' },
      { t: 'plan', plan: plan({ item: [4.99, 19.99], pgacha: [3, 5] }) },
      { t: 'launch', times: 8 },
      { t: 'export', kinds: KINDS },
      { t: 'replay' },
      { t: 'market', m: 'vn' },
      { t: 'launch', times: 8 },
      { t: 'export', kinds: KINDS },
    ])
    expect(n).toBe(10)
  }, 120_000)
})
