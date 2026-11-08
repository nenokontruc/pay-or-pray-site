// CSV exports (legacy/index.html:1605-1643). Column names, order, rounding and quoting
// are identical to the original, so analyses written against old files keep working.
import { MARKET_INFO, PIDS, PKGS, WEIGHT, pkgById, type PkgId } from './params'
import { fixedEntry, isLive } from './plan'
import type { GameState } from './game'

export type ExportKind = 'months' | 'daily' | 'panel' | 'txns' | 'tests'

export function csvCell(v: unknown): string {
  const s = (v === null || v === undefined) ? '' : String(v)
  return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
}
export const toCSV = (rows: unknown[][]): string => rows.map((r) => r.map(csvCell).join(',')).join('\n')

const mkLabel = (s: GameState) => MARKET_INFO[s.market!].label

export function monthsCSV(s: GameState): string {
  const rows: unknown[][] = [['month', 'market', 'event', 'packages_offered', 'skin_tiers', 'pass_tiers', 'item_tiers', 'cgacha_price_per_pull', 'cgacha_odds_pct', 'pgacha_price_per_pull', 'pgacha_odds_pct', 'revenue_total', 'rev_skin', 'rev_pass', 'rev_item', 'rev_cgacha', 'rev_pgacha', 'paying_rate', 'arppu', 'payers_est', 'avg_dau', 'mau', 'dau_mau_stickiness', 'churned_est', 'new_installs_est', 'churn_rate', 'goodwill_start', 'goodwill_end', 'population_start', 'population_end']]
  s.history.forEach((h) => {
    const p = h.plan
    const on = PKGS.filter((k) => isLive(k, p[k.id])).map((k) => k.id).join('|')
    const t = (id: PkgId) => isLive(pkgById(id), p[id]) ? fixedEntry(p, id).tiers.join('|') : ''
    const g = (id: 'cgacha' | 'pgacha', f: 'pull' | 'odds') => p[id].on ? p[id][f] : ''
    rows.push([h.season, mkLabel(s), h.event ? 1 : 0, on, t('skin'), t('pass'), t('item'), g('cgacha', 'pull'), g('cgacha', 'odds'), g('pgacha', 'pull'), g('pgacha', 'odds'),
      h.revenue.toFixed(2), h.byPkg.skin.toFixed(2), h.byPkg.pass.toFixed(2), h.byPkg.item.toFixed(2), h.byPkg.cgacha.toFixed(2), h.byPkg.pgacha.toFixed(2),
      h.payingRate.toFixed(4), h.arppu.toFixed(3), h.payersEst, Math.round(h.avgDau), Math.round(h.mau), h.stickiness.toFixed(3), Math.round(h.churned), Math.round(h.installs), h.churnRate.toFixed(4),
      h.gwStart.toFixed(2), h.gwEnd.toFixed(2), Math.round(h.popStart), Math.round(h.popEnd)])
  })
  return toCSV(rows)
}

export function dailyCSV(s: GameState): string {
  const rows: unknown[][] = [['month', 'day_of_month', 'day_overall', 'event_active', 'dau_est', 'revenue_est', 'purchases_est', 'payers_est']]
  s.daily.forEach((x) => { rows.push([x.month, x.day, x.abs, x.event, Math.round(x.dau), x.revenue.toFixed(2), Math.round(x.purchases), Math.round(x.payers)]) })
  return toCSV(rows)
}

export function panelCSV(s: GameState): string {
  const head: unknown[] = ['month', 'player_id', 'install_month', 'segment', 'base_monthly_budget', 'engagement_daily_prob']
    .concat(PIDS.map((id) => 'interest_' + id)).concat(['active_days', 'month_budget', 'purchases', 'spend_total'])
    .concat(PIDS.map((id) => 'spend_' + id)).concat(['is_payer', 'churned_after_month', 'weight_players_represented'])
  const rows: unknown[][] = [head]
  s.panel.forEach((x) => {
    rows.push(([x.month, x.pid, x.install, x.seg, x.base.toFixed(3), x.eng.toFixed(3)] as unknown[])
      .concat(PIDS.map((id) => x.interest[id].toFixed(3))).concat([x.activeDays, x.budget.toFixed(3), x.buys, x.spent.toFixed(2)])
      .concat(PIDS.map((id) => x.spend[id].toFixed(2))).concat([x.payer, x.churned, WEIGHT.toFixed(2)]))
  })
  return toCSV(rows)
}

export function txnCSV(s: GameState): string {
  const rows: unknown[][] = [['month', 'day_of_month', 'day_overall', 'player_id', 'segment', 'package', 'tier_or_pull_price', 'pulls', 'won', 'spend', 'weight_players_represented']]
  s.txns.forEach((t) => { rows.push([t.month, t.day, t.abs, t.player, t.seg, t.pkg, t.tier, t.pulls, t.won, t.spend.toFixed(2), t.weight!.toFixed(2)]) })
  return toCSV(rows)
}

export function testsCSV(s: GameState): string {
  const rows: unknown[][] = [['test', 'when', 'details', 'metric', 'value', 'extra']]
  s.tests.forEach((t) => { rows.push([t.test, t.when, t.details, t.metric, t.value, t.extra]) })
  return toCSV(rows)
}

export const EXPORTS: Record<ExportKind, { file: string; build: (s: GameState) => string }> = {
  months: { file: 'months', build: monthsCSV },
  daily: { file: 'daily', build: dailyCSV },
  panel: { file: 'player_panel', build: panelCSV },
  txns: { file: 'transactions', build: txnCSV },
  tests: { file: 'tests', build: testsCSV },
}

/** Download file name used by the original: payorpray_<market>_<kind>.csv */
export const exportFileName = (s: GameState, kind: ExportKind): string => 'payorpray_' + s.market + '_' + EXPORTS[kind].file + '.csv'
