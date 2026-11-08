// Game state and transitions (legacy/index.html:1219, 1561-1603, 1731-1753).
// The original keeps `state`, `players`, `nextId` and the RNG seed in closure variables;
// here they live in one explicit Game object, so games never share state.
import { DAYS, EVENT_DAYS, MARKET_INFO, MAX_ROUNDS, PIDS, SEG, START_GOODWILL, CREDITS, WEIGHT, type MarketId, type MarketInfo, type PkgId } from './params'
import { clonePlan, normalizePlan, planIsValid, type Plan } from './plan'
import { initPlayers, population, type Population } from './players'
import { createRng, type Rng } from './rng'
import { simulateMonth, type Txn } from './simulate'
import { churnAndInstall, goodwillDelta } from './dynamics'
import { sweetSpot, type SweetSpot } from './sweetSpot'

export interface DailyRow {
  month: number; day: number; abs: number; event: 0 | 1
  dau: number; revenue: number; purchases: number; payers: number
}

export interface PanelRow {
  month: number; pid: number; install: number; seg: string; base: number; eng: number
  interest: Record<PkgId, number>; activeDays: number; budget: number; buys: number
  spent: number; spend: Record<PkgId, number>; payer: 0 | 1; churned: 0 | 1
}

export interface TestRecord { test: string; when: string; details: string; metric: string; value: string; extra: string }

export interface MonthRecord {
  season: number; plan: Plan; event: boolean; revenue: number
  byPkg: Record<PkgId, number>; buys: Record<PkgId, number>
  payingRate: number; arppu: number; payersEst: number
  gwStart: number; gwEnd: number; popStart: number; popEnd: number; dGoodwill: number
  avgDau: number; mau: number; stickiness: number
  churned: number; installs: number; churnRate: number
  daily: DailyRow[]
}

export interface GameState {
  round: number
  maxRounds: number
  goodwill: number
  totalRevenue: number
  eventStreak: number
  history: MonthRecord[]
  market: MarketId | null
  credits: number
  launched: boolean
  variantA: Plan | null
  txns: Txn[]
  panel: PanelRow[]
  daily: DailyRow[]
  tests: TestRecord[]
  sweet: SweetSpot | null
}

export interface Game extends Population {
  rng: Rng
  state: GameState
}

export function newState(): GameState {
  return {
    round: 1, maxRounds: MAX_ROUNDS, goodwill: START_GOODWILL, totalRevenue: 0, eventStreak: 0, history: [],
    market: null, credits: CREDITS, launched: false, variantA: null, txns: [], panel: [], daily: [], tests: [], sweet: null,
  }
}

export function createGame(seed: number): Game {
  return { rng: createRng(seed), state: newState(), players: [], nextId: 1 }
}

export function marketInfo(g: Game): MarketInfo {
  if (!g.state.market) throw new Error('No market selected yet')
  return MARKET_INFO[g.state.market]
}

/** "Confirm market" (:1745): create the 1,000-player panel and the sweet spot. */
export function selectMarket(g: Game, m: MarketId): void {
  g.state.market = m
  const mk = MARKET_INFO[m]
  initPlayers(g.rng, mk, g)
  g.state.sweet = sweetSpot(mk)
}

export const isOver = (g: Game): boolean => g.state.round > g.state.maxRounds

/**
 * "Launch Month n" (:1561-1603). Returns null in the two cases where the original button
 * does nothing: the game is over, or the shop is empty.
 */
export function launchMonth(g: Game, planIn: Plan, eventOn: boolean): MonthRecord | null {
  const state = g.state
  if (state.round > state.maxRounds) return null
  const plan = normalizePlan(planIn)
  if (!planIsValid(plan)) return null
  const mk = marketInfo(g)
  state.launched = true
  state.eventStreak = eventOn ? state.eventStreak + 1 : 0
  const popStart = population(g.players)
  const r = simulateMonth(g.rng, mk, g.players, plan, eventOn, state.eventStreak, null, true)
  const d = goodwillDelta(g.rng, mk, plan, eventOn, state.eventStreak)
  const gwStart = state.goodwill, rev = r.revenue * WEIGHT
  const byPkg = {} as Record<PkgId, number>
  PIDS.forEach((id) => { byPkg[id] = r.byPkg[id] * WEIGHT })
  state.totalRevenue += rev
  state.goodwill = Math.max(0, Math.min(100, state.goodwill + d))
  const payerSet: Record<number, 1> = {}
  r.rows.forEach((row) => { if (row.spent > 0) payerSet[row.pid] = 1 })
  const ci = churnAndInstall(g.rng, mk, g, state.goodwill, payerSet, state.round)
  const churnedSet: Record<number, 1> = {}
  g.players.forEach((p) => { if (p.churnMonth === state.round) churnedSet[p.id] = 1 })

  const byId = new Map(g.players.map((p) => [p.id, p]))
  r.rows.forEach((row) => {
    const pl = byId.get(row.pid)!
    state.panel.push({
      month: state.round, pid: pl.id, install: pl.install, seg: SEG[pl.seg], base: pl.base, eng: pl.eng, interest: pl.interest,
      activeDays: row.activeDays, budget: row.budget, buys: row.buys, spent: row.spent, spend: row.spend,
      payer: row.spent > 0 ? 1 : 0, churned: churnedSet[pl.id] ? 1 : 0,
    })
  })
  const dailyOut: DailyRow[] = r.daily.map((dd, i) => ({
    month: state.round, day: i + 1, abs: (state.round - 1) * DAYS + i + 1, event: eventOn && i < EVENT_DAYS ? 1 : 0,
    dau: dd.dau * WEIGHT, revenue: dd.revenue * WEIGHT, purchases: dd.purchases * WEIGHT, payers: Object.keys(dd.payerSet).length * WEIGHT,
  }))
  dailyOut.forEach((x) => state.daily.push(x))
  r.txns.forEach((t) => {
    t.month = state.round
    t.abs = t.day ? (state.round - 1) * DAYS + t.day : ''
    t.weight = WEIGHT
    state.txns.push(t)
  })

  const avgDau = dailyOut.reduce((a, x) => a + x.dau, 0) / DAYS
  const mau = r.rows.filter((x) => x.activeDays > 0).length * WEIGHT
  const h: MonthRecord = {
    season: state.round, plan: clonePlan(plan), event: eventOn, revenue: rev, byPkg, buys: r.buys,
    payingRate: r.payers / r.n, arppu: r.payers ? r.revenue / r.payers : 0, payersEst: Math.round(r.payers * WEIGHT),
    gwStart, gwEnd: state.goodwill, popStart, popEnd: population(g.players), dGoodwill: d,
    avgDau, mau, stickiness: mau ? avgDau / mau : 0, churned: ci.churned * WEIGHT, installs: ci.installs * WEIGHT,
    churnRate: ci.start ? ci.churned / ci.start : 0, daily: dailyOut,
  }
  state.history.push(h)
  state.round++
  return h
}

/** "Play again" (:1731): fresh state and players. The RNG stream continues, as in the original. */
export function resetGame(g: Game): void {
  g.state = newState()
  g.players = []
}
