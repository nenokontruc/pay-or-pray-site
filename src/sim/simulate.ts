// One 30-day month of purchases (legacy/index.html:1269-1322), plus meanSE (:1323).
// Every expression and every random draw is in the original's order; changing the order
// of draws changes the results even if the maths looks identical.
import { DAYS, EVENT_DAYS, PIDS, PITY, PKGS, SEG, type MarketInfo, type PkgId } from './params'
import { isLive, type FixedEntry, type GachaEntry, type Plan } from './plan'
import { activeIdx, type Player } from './players'
import type { Rng } from './rng'

export interface Txn {
  day: number | ''
  player: number
  seg: string
  pkg: PkgId
  tier: number | ''
  pulls: number | ''
  won: 0 | 1 | ''
  spend: number
  // set when the month is recorded:
  month?: number
  abs?: number | ''
  weight?: number
}

export interface PlayerRow {
  pid: number
  buys: number
  spend: Record<PkgId, number>
  activeDays: number
  budget: number
  spent: number
}

export interface DayAcc { dau: number; revenue: number; purchases: number; payerSet: Record<number, 1> }

export interface MonthResult {
  byPkg: Record<PkgId, number>
  buys: Record<PkgId, number>
  revenue: number
  payers: number
  perPlayer: number[]
  txns: Txn[]
  rows: PlayerRow[]
  n: number
  daily: DayAcc[]
}

export function simulateMonth(
  rng: Rng, mk: MarketInfo, players: Player[], plan: Plan,
  eventOn: boolean, streak: number, cohort: number[] | null, withDays: boolean,
): MonthResult {
  const shock = rng.randRange(0.85, 1.18)
  const boost = eventOn ? (1.18 - Math.min(streak, 4) * 0.03) : 1.0
  const idx = cohort || activeIdx(players)
  const offered = PKGS.filter((p) => isLive(p, plan[p.id]))
  const res: MonthResult = {
    byPkg: {} as Record<PkgId, number>, buys: {} as Record<PkgId, number>,
    revenue: 0, payers: 0, perPlayer: [], txns: [], rows: [], n: idx.length, daily: [],
  }
  PIDS.forEach((id) => { res.byPkg[id] = 0; res.buys[id] = 0 })
  for (let d = 0; d < DAYS; d++) res.daily.push({ dau: 0, revenue: 0, purchases: 0, payerSet: {} })

  idx.forEach((i) => {
    const pl = players[i], days: number[] = []
    if (withDays) {
      for (let d = 0; d < DAYS; d++) if (rng.rand() < pl.eng) days.push(d)
      days.forEach((d) => { res.daily[d].dau++ })
    }
    let budget = pl.base * shock * boost * rng.randRange(0.85, 1.15)
    if (withDays && days.length === 0) budget = 0
    let remaining = budget, spent = 0
    const row: PlayerRow = { pid: pl.id, buys: 0, spend: {} as Record<PkgId, number>, activeDays: 0, budget: 0, spent: 0 }
    PIDS.forEach((id) => { row.spend[id] = 0 })

    const pickDay = (): number | '' => {
      if (!withDays) return ''
      if (eventOn && rng.rand() < 0.6) {
        const ev = days.filter((d) => d < EVENT_DAYS)
        if (ev.length) return ev[Math.floor(rng.rand() * ev.length)]
      }
      return days[Math.floor(rng.rand() * days.length)]
    }

    rng.shuffle(offered.slice()).forEach((p) => {
      if (remaining < 0.5) return
      const e = plan[p.id]
      const wtp = budget * pl.interest[p.id] * rng.randRange(0.9, 1.1) * (p.power ? mk.p2wAppeal : 1)
      let spend = 0, tier: number | '' = '', pulls: number | '' = '', won: 0 | 1 | '' = ''
      if (!p.gacha) {
        const tiers = (e as FixedEntry).tiers
        const conv = tiers.length > 6 ? Math.pow(0.93, tiers.length - 6) : 1
        if (rng.rand() > conv) return
        const cap = Math.min(wtp * (p.valueBonus || 1), remaining)
        let best = 0
        tiers.forEach((t) => { if (t <= cap && t > best) best = t })
        if (best <= 0) return
        spend = best; tier = best
      } else {
        const g = e as GachaEntry
        const odds = g.odds / 100, expPulls = Math.min(1 / odds, PITY)
        const thr = g.pull * expPulls * rng.randRange(0.65, 0.95) / mk.gachaAffinity
        if (!(wtp >= thr && remaining >= g.pull)) return
        let n = 0, hit = false
        while (n < PITY && !hit && remaining - n * g.pull >= g.pull) { n++; if (rng.rand() < odds) hit = true }
        if (n === PITY) hit = true
        spend = n * g.pull; tier = g.pull; pulls = n; won = hit ? 1 : 0
      }
      remaining -= spend; spent += spend; res.byPkg[p.id] += spend; res.buys[p.id]++; row.buys++; row.spend[p.id] += spend
      const day = pickDay()
      if (withDays) { const dd = res.daily[day as number]; dd.revenue += spend; dd.purchases++; dd.payerSet[pl.id] = 1 }
      res.txns.push({ day: withDays ? (day as number) + 1 : '', player: pl.id, seg: SEG[pl.seg], pkg: p.id, tier, pulls, won, spend })
    })
    if (spent > 0) res.payers++
    res.revenue += spent; res.perPlayer.push(spent)
    row.activeDays = days.length; row.budget = budget; row.spent = spent
    res.rows.push(row)
  })
  return res
}

export function meanSE(a: number[]): { mean: number; se: number } {
  const n = a.length, m = a.reduce((x, y) => x + y, 0) / n
  let v = 0
  a.forEach((x) => { v += (x - m) * (x - m) })
  v /= (n > 1 ? n - 1 : 1)
  return { mean: m, se: Math.sqrt(v / n) }
}
