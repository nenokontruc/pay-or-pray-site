/**
 * Runs one scripted scenario on BOTH the original page (via legacyHarness) and the new
 * engine, step by step, and compares everything the original shows or exports.
 * Expected values always come from the original page.
 */
import { expect } from 'vitest'
import {
  createGame, defaultPlan, EXPORTS, hud, isOver, labAvailability, launchMonth, liveOpsRow, logEntry,
  marketInfo, normalizePlan, planNotes, PIDS, resetGame, runLabTest, saveVariantA, selectMarket, sweetNote,
  debrief, fmt2, pct, fmtMoney, type ExportKind, type Game, type LabResult, type MarketId, type Plan,
} from '../../src/sim'
import { openLegacy, type LegacyPage } from './legacyHarness'

export type Action =
  | { t: 'market'; m: MarketId }
  | { t: 'plan'; plan: Plan }
  | { t: 'event'; on: boolean }
  | { t: 'launch'; times?: number }
  | { t: 'test'; kind: 'cbt' | 'survey' | 'ab' }
  | { t: 'saveA' }
  | { t: 'replay' }
  | { t: 'compareCSV'; kinds?: ExportKind[] }

export interface RunSummary { game: Game; csv: Record<string, string>; labResults: LabResult[]; refusals: string[] }

const ALL_EXPORTS: ExportKind[] = ['months', 'daily', 'panel', 'txns', 'tests']
const AB_DEFAULT = 'Compare A with your current shop (B) on two equal cohorts. Costs 1 credit.'
const norm = (s: string) => s.replace(/\s+/g, ' ').trim()

function compareHud(L: LegacyPage, g: Game, where: string) {
  const h = hud(g)
  expect(L.text('#g-round'), `${where}: phase`).toBe(h.phase)
  expect(L.text('#g-pop'), `${where}: population`).toBe(h.population)
  expect(L.text('#g-goodwill'), `${where}: goodwill`).toBe(h.goodwill)
  expect(L.text('#g-revenue'), `${where}: revenue`).toBe(h.revenue)
  expect(L.text('#credits'), `${where}: credits`).toBe(h.credits)
}

function comparePlanUI(L: LegacyPage, g: Game, plan: Plan, where: string) {
  const mk = g.state.market ? marketInfo(g) : null
  const n = planNotes(plan, mk, g.state.sweet)
  for (const id of PIDS) expect(L.text(`.pkg-row[data-pkg="${id}"] .ladder-note`), `${where}: note ${id}`).toBe(n.notes[id])
  expect(L.text('#plan-warning'), `${where}: plan warning`).toBe(n.warning)
  if (g.state.market) {
    const ab = labAvailability(g, plan).ab
    expect(L.text('#t-ab span'), `${where}: A/B availability`).toBe(ab || AB_DEFAULT)
  }
}

function compareLiveOps(L: LegacyPage, g: Game, where: string) {
  const h = g.state.history
  const rows = Array.from(L.document.querySelectorAll('#liveops-table tbody tr'), (tr) => Array.from(tr.querySelectorAll('td'), (td) => norm(td.textContent ?? '')))
  expect(rows, `${where}: LiveOps table`).toEqual(h.map((x, i) => liveOpsRow(x, h[i - 1]).map(norm)))
  const last = h[h.length - 1], e = logEntry(last, marketInfo(g))
  const top = L.document.querySelector('.log-entry')!
  expect(Array.from(top.querySelectorAll('.le-top span'), (s) => s.textContent), `${where}: log header`).toEqual([e.title, e.goodwill])
  expect(top.querySelector('.le-rev')!.textContent, `${where}: log revenue`).toBe(e.revenue)
  expect(norm(top.querySelector('.le-flavor')!.textContent ?? ''), `${where}: log flavor`).toBe(norm(e.flavor + ' ' + e.sub))
  expect(top.classList.contains('warn'), `${where}: log warn`).toBe(e.warn)
}

function compareLab(L: LegacyPage, r: LabResult, where: string) {
  const card = norm(L.document.querySelector('#lab-results .lab-result')?.textContent ?? '')
  const has = (s: string) => expect(card, `${where}: lab card should contain "${s}"`).toContain(norm(s))
  if (r.kind === 'cbt') {
    has(`Closed beta · ${r.n} testers`)
    has(`Revenue per player: ${fmt2(r.mean)} (95% range ${fmt2(r.lo)}–${fmt2(r.hi)}) · Paying rate ${pct(r.payingRate)} · ARPPU ${r.arppu === null ? '—' : fmt2(r.arppu)}`)
    for (const row of r.rows) has(`${row.label}${row.buyers}${fmt2(row.revPerPlayer)}`)
  } else if (r.kind === 'survey') {
    has(`In-game survey · ${r.n} respondents`)
    for (const row of r.rows) has(`${row.label}${pct(row.share)}${fmt2(row.p25)}${fmt2(row.p50)}${fmt2(row.p75)}${fmt2(row.p90)}`)
  } else {
    has(`A/B test · ${r.a.n} vs. ${r.b.n} players`)
    has(`A${fmt2(r.a.mean)}${pct(r.a.payingRate)}${r.a.arppu === null ? '—' : fmt2(r.a.arppu)}`)
    has(`B${fmt2(r.b.mean)}${pct(r.b.payingRate)}${r.b.arppu === null ? '—' : fmt2(r.b.arppu)}`)
    has(r.significant ? `${r.winner} earns more per player, and the gap is statistically clear (z = ${r.z.toFixed(2)}).`
      : `No statistically clear winner (|z| = ${Math.abs(r.z).toFixed(2)} < 1.96).`)
  }
}

function compareDebrief(L: LegacyPage, g: Game, where: string) {
  const d = debrief(g)
  expect(L.text('.debrief .grade'), `${where}: grade`).toBe('Grade ' + d.grade)
  expect(L.texts('.debrief .d-stat .dv'), `${where}: headline stats`).toEqual([fmtMoney(d.totalRevenue), Math.round(d.finalPopulation).toLocaleString('en-US'), pct(d.retention)])
  expect(L.texts('.debrief .share-bar span:first-child'), `${where}: share labels`).toEqual(d.shares.map((s) => s.label))
  expect(L.texts('.debrief .share-bar .sb-v'), `${where}: share values`).toEqual(d.shares.map((s) => (s.share * 100).toFixed(0) + '%'))
  const paras = Array.from(L.document.querySelectorAll('.debrief > p'), (p) => norm(p.textContent ?? ''))
  expect(paras, `${where}: debrief paragraphs`).toEqual(d.paragraphs.map(norm))
}

export async function runScenario(seed: number, actions: Action[]): Promise<RunSummary> {
  const L = openLegacy(seed)
  const g = createGame(seed)
  let plan = defaultPlan(), event = false
  const csv: Record<string, string> = {}, labResults: LabResult[] = [], refusals: string[] = []
  let step = 0
  const compareCSV = (kinds: ExportKind[], where: string) => {
    for (const k of kinds) {
      const legacy = L.exportCSV(k), mine = EXPORTS[k].build(g.state)
      expect(mine.length, `${where}: ${k}.csv length`).toBe(legacy.length)
      expect(mine === legacy, `${where}: ${k}.csv must be byte-identical`).toBe(true)
      csv[k] = mine
    }
  }
  try {
    for (const a of actions) {
      const where = `step ${++step} (${a.t})`
      switch (a.t) {
        case 'market':
          L.selectMarket(a.m); selectMarket(g, a.m)
          expect(L.text('#sweet-note'), `${where}: sweet note`).toBe(sweetNote(marketInfo(g), g.state.sweet!))
          compareHud(L, g, where); comparePlanUI(L, g, plan, where)
          break
        case 'plan':
          L.setPlan(a.plan); plan = normalizePlan(a.plan)
          comparePlanUI(L, g, plan, where)
          break
        case 'event':
          L.setEvent(a.on); event = a.on
          break
        case 'launch':
          for (let i = 0; i < (a.times ?? 1); i++) {
            const before = g.state.history.length
            L.launch(); launchMonth(g, plan, event)
            const w = `${where} month ${g.state.history.length}`
            compareHud(L, g, w)
            if (g.state.history.length > before) compareLiveOps(L, g, w)
            if (isOver(g)) { await L.waitForDebrief(); compareDebrief(L, g, w) }
          }
          break
        case 'test': {
          const credits = g.state.credits
          const clicked = L.runTest(a.kind)
          const out = runLabTest(g, a.kind, plan)
          // A disabled original button must correspond to an engine refusal.
          if (!clicked) expect(out.ok, `${where}: original button disabled, engine must refuse`).toBe(false)
          if (out.ok) { labResults.push(out.result); compareLab(L, out.result, where) } else refusals.push(out.reason)
          expect(g.state.credits, `${where}: credits spent`).toBe(out.ok ? credits - 1 : credits)
          compareHud(L, g, where); comparePlanUI(L, g, plan, where)
          break
        }
        case 'saveA':
          L.saveA(); saveVariantA(g, plan)
          comparePlanUI(L, g, plan, where)
          break
        case 'replay':
          L.replay(); resetGame(g); plan = defaultPlan(); event = false
          expect(L.document.querySelector<HTMLElement>('#market-select')!.style.display, `${where}: back to market select`).toBe('block')
          comparePlanUI(L, g, plan, where)
          break
        case 'compareCSV':
          compareCSV(a.kinds ?? ALL_EXPORTS, where)
          break
      }
    }
  } finally {
    L.close()
  }
  return { game: g, csv, labResults, refusals }
}

// Plan builders for readable scenarios.
type P = Partial<{ skin: number[] | false; pass: number[] | false; item: number[] | false; cgacha: [number, number] | false; pgacha: [number, number] | false }>
export function plan(p: P): Plan {
  const base = defaultPlan()
  const fixed = (v: number[] | false | undefined, d: { on: boolean; tiers: number[] }) => v === undefined ? { on: false, tiers: d.tiers } : v === false ? { on: false, tiers: d.tiers } : { on: true, tiers: v }
  const gacha = (v: [number, number] | false | undefined, d: { on: boolean; pull: number; odds: number }) => v === undefined || v === false ? { on: false, pull: d.pull, odds: d.odds } : { on: true, pull: v[0], odds: v[1] }
  return {
    skin: fixed(p.skin, base.skin), pass: fixed(p.pass, base.pass), item: fixed(p.item, base.item),
    cgacha: gacha(p.cgacha, base.cgacha), pgacha: gacha(p.pgacha, base.pgacha),
  }
}
