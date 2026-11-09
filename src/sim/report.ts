// Reporting: plan hints, HUD values, LiveOps rows, month log, debrief
// (legacy/index.html:1382-1409, 1440-1463, 1526-1559, 1593-1597, 1662-1712).
// Returns plain data and plain-text sentences with the original wording; the React UI
// decides how to lay them out. No random numbers are used here.
import { BASE_POP, CREDITS, PITY, PKGS, PIDS, pkgById, type MarketInfo, type PkgId } from './params'
import { fixedEntry, gachaEntry, isLive, liveCount, normalizePlan, planSummary, type Plan } from './plan'
import { population } from './players'
import type { SweetSpot } from './sweetSpot'
import { fmt2, fmtMoney, pct } from './format'
import { marketInfo, type Game, type MonthRecord } from './game'

/** Sentence under "Build this month's shop" once a market is chosen (:1750). */
export function sweetNote(mk: MarketInfo, sweet: SweetSpot): string {
  return 'In ' + mk.label + ', the model’s best single price for one cosmetic item is about $' + sweet.price.toFixed(0) +
    (mk.benchmark ? ' (real-world best-selling tier: ' + mk.benchmark + ').' : '.')
}

export interface PlanNotes { notes: Record<PkgId, string>; warning: string; liveCount: number }

/** Per-package hints and the plan warning shown while building the shop (refreshPlanUI, :1382). */
export function planNotes(planIn: Plan, mk: MarketInfo | null, sweet: SweetSpot | null): PlanNotes {
  const plan = normalizePlan(planIn)
  const notes = {} as Record<PkgId, string>
  for (const p of PKGS) {
    if (!p.gacha) {
      const e = fixedEntry(plan, p.id)
      let t = e.tiers.length + ' tier' + (e.tiers.length === 1 ? '' : 's') + ' offered.'
      if (e.tiers.length === 0) t = 'Pick at least one price tier, or turn this package off.'
      else if (e.tiers.length > 6) t += ' More than 6 tiers starts to overwhelm buyers (choice overload).'
      if (mk && sweet && e.tiers.length) {
        if (e.tiers[e.tiers.length - 1] > sweet.price * 4) t += ' Your top tier is far above what most players in ' + mk.label + ' can spend — only big spenders will reach it.'
        if (e.tiers[0] > sweet.price * 1.6) t += ' Your cheapest tier is high for ' + mk.label + ' — many players can’t afford any option.'
      }
      notes[p.id] = t
    } else {
      const e = gachaEntry(plan, p.id)
      notes[p.id] = 'Expected cost to win the featured item: about ' + fmt2(Math.min(100 / e.odds, PITY) * e.pull) + ' (worst case ' + fmt2(PITY * e.pull) + ' at the 50-pull pity).'
    }
  }
  const onCount = liveCount(plan)
  const warning = onCount === 0 ? 'Your shop is empty — turn on at least one package.'
    : onCount > 3 ? onCount + ' packages at once: more ways to spend, but players share one wallet, and a crowded store adds offer fatigue (goodwill cost).'
    : onCount + ' package' + (onCount === 1 ? '' : 's') + ' on. Players share one wallet across everything you sell.'
  return { notes, warning, liveCount: onCount }
}

export interface Hud { phase: string; population: string; goodwill: string; goodwillValue: number; revenue: string; credits: string }

export function hud(g: Game): Hud {
  const s = g.state
  return {
    phase: s.launched ? ('Month ' + Math.min(s.round, s.maxRounds) + ' / ' + s.maxRounds) : 'Pre-launch',
    population: Math.round(population(g.players)).toLocaleString('en-US'),
    goodwill: String(Math.round(s.goodwill)),
    goodwillValue: s.goodwill,
    revenue: fmtMoney(s.totalRevenue),
    credits: s.credits + ' credit' + (s.credits === 1 ? '' : 's'),
  }
}

/** One-line reaction after a month (:1526). */
export function flavorText(plan: Plan, d: number, mk: MarketInfo): string {
  const pw = isLive(pkgById('item'), plan.item) || plan.pgacha.on, pg = plan.pgacha.on, ga = plan.cgacha.on || plan.pgacha.on
  if (pg && d < -3) return 'Players are furious — a lucky draw for power is the riskiest combination on the diagnostic matrix.'
  if (pw && mk.p2wPenalty < 0.7 && d > -2) return 'Pay-to-win drew little complaint here — this market tolerates it far more than the West.'
  if (pw && d < -1) return 'Non-paying players feel the competitive gap widening. The big spenders loved it.'
  if (ga && mk.gachaPenalty < 0.5) return 'Lucky draws are part of the fun here — almost no backlash.'
  if (ga) return 'The lucky draw drew some gambling-adjacent criticism.'
  if (d > 1) return 'Clean, fair, well received — steady revenue without burning trust.'
  return 'A quiet month. Revenue came in, nobody complained much.'
}

export interface LogEntry { title: string; goodwill: string; revenue: string; flavor: string; sub: string; warn: boolean }

export function logEntry(h: MonthRecord, mk: MarketInfo): LogEntry {
  const d = h.dGoodwill
  return {
    title: 'Month ' + h.season + (h.event ? ' · event' : ''),
    goodwill: 'Goodwill ' + (d >= 0 ? '+' : '') + Math.round(d),
    revenue: fmtMoney(h.revenue),
    flavor: flavorText(h.plan, d, mk),
    sub: Math.round(h.churned).toLocaleString('en-US') + ' players left, ' + Math.round(h.installs).toLocaleString('en-US') + ' joined.',
    warn: d < -2,
  }
}

/** Month-over-month change label, e.g. "▲12%" — '' for the first month or a zero base (:1551). */
export function momArrow(cur: number, old: number | undefined): string {
  if (!old) return ''
  const c = (cur - old) / old
  return (c >= 0 ? '▲' : '▼') + Math.abs(c * 100).toFixed(0) + '%'
}

/** The 8 cells of one LiveOps row, as text (:1549-1555). */
export function liveOpsRow(h: MonthRecord, prev: MonthRecord | undefined): string[] {
  const arrow = (cur: number, old: number | undefined) => { const a = prev ? momArrow(cur, old) : ''; return a ? ' ' + a : '' }
  return [
    String(h.season), fmtMoney(h.revenue), pct(h.payingRate) + arrow(h.payingRate, prev && prev.payingRate),
    fmt2(h.arppu) + arrow(h.arppu, prev && prev.arppu), Math.round(h.avgDau).toLocaleString('en-US'),
    pct(h.churnRate), h.event ? 'Yes' : '—', String(Math.round(h.gwEnd)),
  ]
}

export type Grade = 'S' | 'A' | 'B' | 'C' | 'D'

export interface Debrief {
  grade: Grade
  ratio: number
  baseline: number
  avgGW: number
  totalRevenue: number
  finalPopulation: number
  retention: number
  shares: { id: PkgId; label: string; share: number }[]
  best: MonthRecord
  lift: { week1: number; lastWeek: number } | null
  deadTiers: string[]
  testsUsed: number
  /** The debrief paragraphs, as plain text with the original wording, in display order. */
  paragraphs: string[]
}

/** The 8-month report (endGame, :1662-1712). Call after Month 8. */
export function debrief(g: Game): Debrief {
  const s = g.state, mk = marketInfo(g), sweet = s.sweet!
  const avgGW = s.history.reduce((a, h) => a + h.gwEnd, 0) / s.history.length
  const baseline = sweet.revPerPlayer * (1 - mk.nonSpend) * BASE_POP * s.maxRounds
  const ratio = s.totalRevenue * (Math.max(20, avgGW) / 70) / baseline
  const grade: Grade = ratio >= 3.7 ? 'S' : ratio >= 3.1 ? 'A' : ratio >= 2.4 ? 'B' : ratio >= 1.3 ? 'C' : 'D'

  const tot = {} as Record<PkgId, number>
  PIDS.forEach((id) => { tot[id] = s.history.reduce((a, h) => a + h.byPkg[id], 0) })
  const shares = PKGS.filter((p) => tot[p.id] > 0).sort((a, b) => tot[b.id] - tot[a.id])
    .map((p) => ({ id: p.id, label: p.label, share: tot[p.id] / s.totalRevenue }))
  const best = s.history.slice().sort((a, b) => b.revenue - a.revenue)[0]
  const direct = s.txns.filter((t) => t.pulls === '')
  const avgPaid = direct.length ? direct.reduce((a, t) => a + t.spend, 0) / direct.length : 0
  let calib = direct.length ? ('Your average direct purchase was ' + fmt2(avgPaid) + ' against a model sweet spot of ~$' + sweet.price.toFixed(0) + ' for ' + mk.label + '.') : 'You sold no fixed-price items.'
  if (mk.benchmark) calib += ' Real-world best-selling tier: ' + mk.benchmark + '.'
  const dead: string[] = []
  PKGS.filter((p) => !p.gacha).forEach((p) => {
    const offered: Record<string, 1> = {}
    s.history.forEach((h) => { if (isLive(p, h.plan[p.id])) fixedEntry(h.plan, p.id).tiers.forEach((t) => { offered[t] = 1 }) })
    Object.keys(offered).forEach((t) => {
      const sold = direct.some((x) => x.pkg === p.id && Math.abs((x.tier as number) - parseFloat(t)) < 0.001)
      if (!sold) dead.push(p.label + ' ' + fmt2(parseFloat(t)))
    })
  })
  const deadNote = dead.length
    ? 'Tiers that never sold to a single sampled player: ' + dead.join(', ') + '. In ' + mk.label + ', those rungs were dead weight — exactly why a publisher localizes the ladder instead of copying it from another market.'
    : 'Every tier you offered sold at least once — a well-localized ladder.'
  const orig = g.players.filter((p) => p.install === 1), kept = orig.filter((p) => p.active).length
  const retention = kept / orig.length
  const evMonths = s.history.filter((h) => h.event), noEv = s.history.filter((h) => !h.event)
  let lift: Debrief['lift'] = null
  let liftText = ''
  if (evMonths.length && noEv.length) {
    const wk = (hs: MonthRecord[], from: number, to: number) => hs.reduce((a, h) => a + h.daily.slice(from, to).reduce((x, d) => x + d.revenue, 0) / (to - from), 0) / hs.length
    const l1 = wk(evMonths, 0, 7) / Math.max(1, wk(noEv, 0, 7)) - 1, l4 = wk(evMonths, 21, 30) / Math.max(1, wk(noEv, 21, 30)) - 1
    lift = { week1: l1, lastWeek: l4 }
    liftText = 'Event effect: in event months, average daily revenue in week 1 was ' + (l1 >= 0 ? '+' : '') + (l1 * 100).toFixed(0) + '% vs. non-event months, but ' + (l4 >= 0 ? '+' : '') + (l4 * 100).toFixed(0) + '% in the last week of the month. ' + (l4 < 0 ? 'Some of the event’s spending was pulled forward from later in the month, not purely new revenue.' : 'The boost held up across the month.')
  }
  let marketNote = ''
  if (mk.p2wPenalty < 0.7) marketNote += ' Players here tolerate pay-to-win far more than in Western markets — the same plan would cost much more goodwill in the US.'
  if (mk.gachaPenalty < 0.5) marketNote += ' Lucky draws are culturally embraced here — they would draw far more criticism in the US.'
  const testsUsed = CREDITS - s.credits

  const paragraphs = [
    'Where your revenue came from',
    'Best month: Month ' + best.season + ' (' + fmtMoney(best.revenue) + ') with ' + planSummary(best.plan) + (best.event ? ', plus an event' : '') + '.',
    ...(liftText ? [liftText] : []),
    'Retention: ' + pct(retention) + ' of the players who were there at launch were still playing after 8 months (average goodwill ' + Math.round(avgGW) + '). Players leave faster when goodwill drops below 60, and new installs slow down too.',
    'Price ladder check: ' + calib + ' ' + deadNote,
    ...(marketNote ? ['Market note:' + marketNote] : []),
    'Testing: you used ' + testsUsed + ' of ' + CREDITS + ' test credits. ' + (testsUsed === 0 ? 'Launching blind is how real studios get surprised — next time, try a closed beta or an A/B test first.' : 'Compare what your tests predicted with what actually happened in the monthly data.'),
    'Your grade compares revenue (weighted by the goodwill you kept) to a simple benchmark: one cosmetic item at this market’s sweet spot, every month. See the Diagnostic page for the risk framework and the Industry page for why markets need different ladders.',
  ]
  return {
    grade, ratio, baseline, avgGW, totalRevenue: s.totalRevenue, finalPopulation: population(g.players),
    retention, shares, best, lift, deadTiers: dead, testsUsed, paragraphs,
  }
}
