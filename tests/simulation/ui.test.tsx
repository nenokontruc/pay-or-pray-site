/**
 * React Simulation page — interaction tests, slice by slice.
 * Each test clicks the real controls and checks that the right engine operation happened,
 * by comparing what the page shows with a reference engine game driven by the same actions
 * (the engine itself was verified against the original in Phase 3).
 */
import { StrictMode } from 'react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import Simulation from '../../src/pages/Simulation'
import { SimulationProvider } from '../../src/pages/simulation/controller'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import {
  createGame, debrief, defaultPlan, EXPORTS, hud, launchMonth, LADDER, liveOpsRow, MARKET_IDS, MARKET_INFO,
  ODDS_RANGE, planNotes, PULL_RANGE, resetGame, runLabTest, saveVariantA, selectMarket, sweetNote, fmt2, pct,
  type Game, type MarketId,
} from '../../src/sim'
import App from '../../src/App'
import { plan } from '../sim/scenarioRunner'
import { captureDownloads, renderSimulation, uiDriver, type UiDriver } from './uiDriver'

beforeAll(() => {
  window.scrollTo = () => {}
  window.matchMedia ??= ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia
})
afterEach(() => { cleanup(); window.location.hash = '' })

const SEED = 4242
const ref = (m: MarketId, seed = SEED): Game => { const g = createGame(seed); selectMarket(g, m); return g }
const hudOf = (ui: UiDriver) => ({ phase: ui.text('#g-round'), population: ui.text('#g-pop'), goodwill: ui.text('#g-goodwill'), revenue: ui.text('#g-revenue') })
const hudRef = (g: Game) => { const h = hud(g); return { phase: h.phase, population: h.population, goodwill: h.goodwill, revenue: h.revenue } }

describe('Slice A — market selection', () => {
  it.each(MARKET_IDS)('%s: confirm creates the panel and shows the market, sweet spot and HUD', (m) => {
    const { ui } = renderSimulation(SEED)
    ui.selectMarket(m)
    const g = ref(m)
    expect(ui.text('#g-market')).toBe(MARKET_INFO[m].label)
    expect(ui.text('#sweet-note')).toBe(sweetNote(MARKET_INFO[m], g.state.sweet!))
    expect(hudOf(ui)).toEqual(hudRef(g))
    expect(ui.text('#g-pop')).toBe('200,000')
    expect(ui.text('#credits')).toBe('3 credits')
  })

  it('starts on the market step with the US pre-selected, and shows the original assumptions', () => {
    const { ui } = renderSimulation(SEED)
    expect(ui.$<HTMLInputElement>('input[value="us"]').checked).toBe(true)
    expect(ui.root.querySelector('#game-stats')).toBeNull()
    expect(ui.text('details.profiles')).toContain('they are not measured market statistics'.replace('they', 'They'))
    expect(ui.root.querySelectorAll('details.profiles tbody tr')).toHaveLength(5)
  })
})

describe('Slice B — shop configuration', () => {
  it('defaults match the original (skins on at $2.99/$9.99/$19.99; gacha $3 at 5%)', () => {
    const { ui } = renderSimulation(SEED); ui.selectMarket('us')
    const pressed = ui.texts('.pkg-row[data-pkg="skin"] .tier[aria-pressed="true"]')
    expect(pressed).toEqual(['$2.99', '$9.99', '$19.99'])
    expect(ui.$<HTMLInputElement>('.pkg-row[data-pkg="cgacha"] .g-pull').value).toBe('3')
    expect(ui.$<HTMLInputElement>('.pkg-row[data-pkg="cgacha"] .g-odds').value).toBe('5')
    expect(ui.texts('.pkg-on').length).toBe(5)
  })

  it('tier toggles and package switches update the engine hints exactly', () => {
    const { ui } = renderSimulation(SEED); ui.selectMarket('vn')
    const g = ref('vn')
    const p = plan({ skin: [...LADDER], item: [49.99, 99.99], cgacha: [4.5, 2] })
    ui.setPlan(p)
    const n = planNotes(p, MARKET_INFO.vn, g.state.sweet)
    for (const id of ['skin', 'pass', 'item', 'cgacha', 'pgacha'] as const) expect(ui.text(`.pkg-row[data-pkg="${id}"] .ladder-note`)).toBe(n.notes[id])
    expect(ui.text('#plan-warning')).toBe(n.warning)
    expect(ui.text('.pkg-row[data-pkg="skin"] .ladder-note')).toContain('choice overload')
    expect(ui.text('.pkg-row[data-pkg="item"] .ladder-note')).toContain('far above what most players in Vietnam')
  })

  it('an empty shop disables launch and says why; reset restores the default', () => {
    const { ui } = renderSimulation(SEED); ui.selectMarket('us')
    ui.setPlan(plan({}))
    expect(ui.$<HTMLButtonElement>('#launch-btn').disabled).toBe(true)
    expect(ui.text('#plan-warning')).toBe('Your shop is empty — turn on at least one package.')
    fireEvent.click(screen.getByRole('button', { name: 'Reset to default' }))
    expect(ui.$<HTMLButtonElement>('#launch-btn').disabled).toBe(false)
    expect(ui.texts('.pkg-row[data-pkg="skin"] .tier[aria-pressed="true"]')).toEqual(['$2.99', '$9.99', '$19.99'])
  })

  it('gacha sliders use the original ranges and reject values outside them', () => {
    const { ui } = renderSimulation(SEED); ui.selectMarket('us')
    const pull = ui.$<HTMLInputElement>('.pkg-row[data-pkg="pgacha"] .g-pull')
    const odds = ui.$<HTMLInputElement>('.pkg-row[data-pkg="pgacha"] .g-odds')
    expect([pull.min, pull.max, pull.step].map(Number)).toEqual([PULL_RANGE.min, PULL_RANGE.max, PULL_RANGE.step])
    expect([odds.min, odds.max, odds.step].map(Number)).toEqual([ODDS_RANGE.min, ODDS_RANGE.max, ODDS_RANGE.step])
    fireEvent.change(pull, { target: { value: '99' } })
    fireEvent.change(odds, { target: { value: '0' } })
    expect(ui.text('.pkg-row[data-pkg="pgacha"] .g-pull-v')).toBe('$10.00') // clamped to max
    expect(ui.text('.pkg-row[data-pkg="pgacha"] .g-odds-v')).toBe('1%') // clamped to min
    expect(ui.text('.pkg-row[data-pkg="pgacha"] .ladder-note')).toBe('Expected cost to win the featured item: about $500.00 (worst case $500.00 at the 50-pull pity).')
  })
})

describe('Slice C — pre-launch lab and credits', () => {
  it('confirm step: cancel spends nothing; run spends one credit and shows the engine result', () => {
    const { ui } = renderSimulation(SEED); ui.selectMarket('jp')
    fireEvent.click(ui.$('#t-cbt'))
    expect(ui.text('#lab-confirm')).toContain('This spends 1 credit (2 left after)')
    expect(ui.$<HTMLButtonElement>('#t-survey').disabled).toBe(true) // busy while confirming
    fireEvent.click(ui.$('#lc-cancel'))
    expect(ui.text('#credits')).toBe('3 credits')
    expect(ui.runTest('cbt')).toBe(true)
    expect(ui.text('#credits')).toBe('2 credits')
    const g = ref('jp'), r = runLabTest(g, 'cbt', defaultPlan())
    if (!r.ok || r.result.kind !== 'cbt') throw new Error('reference CBT failed')
    expect(ui.text('#lab-results')).toContain(`Revenue per player: ${fmt2(r.result.mean)} (95% range ${fmt2(r.result.lo)}–${fmt2(r.result.hi)}) · Paying rate ${pct(r.result.payingRate)}`)
  })

  it('A/B: needs a saved A, refuses identical B, runs when B differs, and credits run out', () => {
    const { ui } = renderSimulation(SEED); ui.selectMarket('cn')
    expect(ui.text('#t-ab span')).toBe('Save a Variant A first.')
    ui.saveA()
    expect(ui.text('#t-ab span')).toBe('B is still identical to A — change a tier, package or pull price first.')
    expect(ui.runTest('ab')).toBe(false)
    const B = plan({ skin: [0.99, 2.99], pgacha: [2, 8] })
    ui.setPlan(B)
    expect(ui.text('#ab-status')).toContain('Ready. B differs from A')
    expect(ui.runTest('ab')).toBe(true)
    const g = ref('cn'); saveVariantA(g, defaultPlan()); const r = runLabTest(g, 'ab', B)
    if (!r.ok || r.result.kind !== 'ab') throw new Error('reference A/B failed')
    expect(ui.text('#lab-results')).toContain(`A${fmt2(r.result.a.mean)}`)
    expect(ui.runTest('survey')).toBe(true)
    expect(ui.runTest('cbt')).toBe(true)
    expect(ui.text('#credits')).toBe('0 credits')
    expect(ui.root.querySelector('#no-credits')).not.toBeNull()
    expect(ui.$<HTMLButtonElement>('#t-cbt').disabled).toBe(true)
  })

  it('an empty shop refuses CBT without spending, but the survey still runs', () => {
    const { ui } = renderSimulation(SEED); ui.selectMarket('us')
    ui.setPlan(plan({}))
    ui.runTest('cbt')
    expect(ui.text('#lab-results')).toContain('Your shop is empty — add a package first.')
    expect(ui.text('#credits')).toBe('3 credits')
    ui.runTest('survey')
    expect(ui.text('#credits')).toBe('2 credits')
    fireEvent.click(ui.$('#clear-results'))
    expect(ui.root.querySelectorAll('.lab-result')).toHaveLength(0)
  })
})

describe('Slice D/E — launch, months, KPIs, LiveOps', () => {
  it('each launch advances exactly one month; table, log, HUD match the engine; CBT locks after launch', () => {
    const { ui } = renderSimulation(SEED); ui.selectMarket('us')
    const g = ref('us')
    for (let m = 1; m <= 3; m++) {
      ui.setEvent(m === 2)
      expect(ui.text('#launch-btn')).toBe(`Launch Month ${m} (30 days) →`)
      ui.launch(); launchMonth(g, defaultPlan(), m === 2)
      expect(hudOf(ui)).toEqual(hudRef(g))
      const rows = Array.from(ui.root.querySelectorAll('#liveops-table tbody tr'), (tr) => Array.from(tr.querySelectorAll('td'), (td) => td.textContent!.replace(/\s+/g, ' ').trim()))
      expect(rows).toEqual(g.state.history.map((h, i) => liveOpsRow(h, g.state.history[i - 1])))
      expect(ui.root.querySelectorAll('.log-entry')).toHaveLength(m)
    }
    expect(ui.text('.log-entry .le-top')).toContain('Month 3')
    expect(ui.text('.log-entry:nth-child(2) .le-top')).toContain('Month 2 · event')
    expect(ui.text('#spark-wrap')).toContain('Daily revenue · Month 3')
    expect(ui.$<HTMLButtonElement>('#t-cbt').disabled).toBe(true)
    expect(ui.$<HTMLButtonElement>('#t-survey').disabled).toBe(true)
  })

  it('"copy last month" restores the shop used last month', () => {
    const { ui } = renderSimulation(SEED); ui.selectMarket('us')
    ui.setPlan(plan({ skin: [0.99, 4.99] })); ui.launch()
    ui.setPlan(plan({ pass: [19.99] }))
    fireEvent.click(screen.getByRole('button', { name: /copy last month/ }))
    expect(ui.texts('.pkg-row[data-pkg="skin"] .tier[aria-pressed="true"]')).toEqual(['$0.99', '$4.99'])
    expect(ui.$<HTMLInputElement>('.pkg-row[data-pkg="pass"] .pkg-on').checked).toBe(false)
  })
})

describe('Slice F — debrief, exports, clipboard, replay', () => {
  it('after 8 months: debrief from the engine, all 5 exports with original names, content and type', async () => {
    const cap = captureDownloads()
    try {
      const { ui } = renderSimulation(SEED); ui.selectMarket('vn')
      const g = ref('vn')
      for (let m = 0; m < 8; m++) { ui.launch(); launchMonth(g, defaultPlan(), false) }
      expect(ui.root.querySelector('#game-live')).toBeNull()
      expect(ui.text('.debrief .grade')).toBe('Grade ' + debrief(g).grade)
      expect(Array.from(ui.root.querySelectorAll('.debrief > p'), (p) => p.textContent)).toEqual(debrief(g).paragraphs)
      for (const k of ['months', 'daily', 'panel', 'txns', 'tests'] as const) ui.clickExport(k)
      expect(cap.files.map((f) => f.name)).toEqual(['months', 'daily', 'player_panel', 'transactions', 'tests'].map((k) => `payorpray_vn_${k}.csv`))
      expect(cap.files.every((f) => f.type === 'text/csv;charset=utf-8')).toBe(true)
      const texts = await Promise.all(cap.files.map((f) => f.text))
      expect(texts).toEqual((['months', 'daily', 'panel', 'txns', 'tests'] as const).map((k) => EXPORTS[k].build(g.state)))
      expect(texts[1].split('\n')).toHaveLength(241) // header + 240 days
    } finally { cap.restore() }
  })

  it('live exports are available after month 1 (months, daily, panel)', async () => {
    const cap = captureDownloads()
    try {
      const { ui } = renderSimulation(SEED); ui.selectMarket('id'); ui.launch()
      ui.clickExport('months')
      const g = ref('id'); launchMonth(g, defaultPlan(), false)
      expect(await cap.files[0].text).toBe(EXPORTS.months.build(g.state))
    } finally { cap.restore() }
  })

  it('copy to clipboard uses the Clipboard API, falls back to execCommand, and reports failure', async () => {
    const { ui } = renderSimulation(SEED); ui.selectMarket('us')
    for (let m = 0; m < 8; m++) ui.launch()
    const g = ref('us'); for (let m = 0; m < 8; m++) launchMonth(g, defaultPlan(), false)
    const writeText = vi.fn(() => Promise.resolve())
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    ui.clickExport('copy')
    await waitFor(() => expect(ui.text('.debrief .export-msg')).toBe('Copied to clipboard — paste into Excel, Sheets, or a .csv file.'))
    expect(writeText).toHaveBeenCalledWith(EXPORTS.months.build(g.state))

    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true })
    const exec = vi.fn(() => false)
    ;(document as unknown as { execCommand: unknown }).execCommand = exec
    ui.clickExport('copy')
    await waitFor(() => expect(ui.text('.debrief .export-msg')).toBe('Copy failed — use the download buttons instead.'))
    expect(exec).toHaveBeenCalledWith('copy')
  })

  it('play again: back to market select with fresh credits and default shop; the random stream continues', () => {
    const { ui } = renderSimulation(SEED); ui.selectMarket('us')
    ui.runTest('cbt')
    for (let m = 0; m < 8; m++) ui.launch()
    ui.replay()
    expect(ui.root.querySelector('#market-select')).not.toBeNull()
    expect(ui.root.querySelector('.lab-result')).toBeNull()
    ui.selectMarket('jp')
    expect(ui.text('#credits')).toBe('3 credits')
    expect(ui.texts('.pkg-row[data-pkg="skin"] .tier[aria-pressed="true"]')).toEqual(['$2.99', '$9.99', '$19.99'])
    expect(ui.$<HTMLInputElement>('#event-check').checked).toBe(false)
    ui.launch()
    // Reference: same seed and actions on the engine, including the reset.
    const g = ref('us'); runLabTest(g, 'cbt', defaultPlan())
    for (let m = 0; m < 8; m++) launchMonth(g, defaultPlan(), false)
    resetGame(g); selectMarket(g, 'jp'); launchMonth(g, defaultPlan(), false)
    expect(hudOf(ui)).toEqual(hudRef(g))
  })
})

describe('React StrictMode (development double-rendering)', () => {
  it('engine calls run exactly once per click, so results still match the engine', () => {
    const { container } = render(<StrictMode><SimulationProvider seed={SEED}><Simulation /></SimulationProvider></StrictMode>)
    const ui = uiDriver(container)
    ui.selectMarket('cn'); ui.runTest('cbt'); ui.saveA(); ui.setPlan(plan({ item: [4.99] })); ui.runTest('ab')
    for (let m = 0; m < 3; m++) ui.launch()
    const g = ref('cn'); runLabTest(g, 'cbt', defaultPlan()); saveVariantA(g, defaultPlan()); runLabTest(g, 'ab', plan({ item: [4.99] }))
    for (let m = 0; m < 3; m++) launchMonth(g, plan({ item: [4.99] }), false)
    expect(hudOf(ui)).toEqual(hudRef(g))
    expect(ui.text('#credits')).toBe('1 credit')
    expect(ui.root.querySelectorAll('.lab-result')).toHaveLength(2)
  })
})

describe('navigation', () => {
  it('leaving the Simulation and coming back keeps the game', () => {
    window.location.hash = '#simulation'
    const { container } = render(<App simulationSeed={SEED} />)
    const ui = { root: container }
    fireEvent.click(container.querySelector('input[value="cn"]')!)
    fireEvent.click(screen.getByRole('button', { name: /Confirm market/ }))
    fireEvent.click(container.querySelector('#launch-btn')!)
    const before = container.querySelector('#g-revenue')!.textContent
    act(() => { window.location.hash = '#home'; window.dispatchEvent(new HashChangeEvent('hashchange')) })
    expect(container.querySelector('#game-stats')).toBeNull()
    act(() => { window.location.hash = '#simulation'; window.dispatchEvent(new HashChangeEvent('hashchange')) })
    expect(ui.root.querySelector('#g-market')!.textContent).toBe('China')
    expect(ui.root.querySelector('#g-round')!.textContent).toBe('Month 2 / 8')
    expect(ui.root.querySelector('#g-revenue')!.textContent).toBe(before)
    expect(container.querySelector('footer h5')!.textContent).toBe('How this simulation works')
  })
})
