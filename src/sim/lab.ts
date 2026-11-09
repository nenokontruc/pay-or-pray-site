// Test lab: closed beta, survey, A/B test, credits (legacy/index.html:1418-1522).
import { PKGS, type PkgId } from './params'
import { clonePlan, isLive, normalizePlan, normPlan, planIsValid, planSummary, type Plan } from './plan'
import { activeIdx } from './players'
import { meanSE, simulateMonth } from './simulate'
import { marketInfo, type Game } from './game'

export type LabKind = 'cbt' | 'survey' | 'ab'

/** Why "Run A vs. B" is unavailable, or '' when it can run (abState, :1418-1422). */
export function abReason(g: Game, planIn: Plan): string {
  const cur = normalizePlan(planIn), A = g.state.variantA
  const same = !!A && normPlan(A) === normPlan(cur)
  return !A ? 'Save a Variant A first.'
    : g.state.credits < 1 ? 'No test credits left.'
    : !planIsValid(cur) ? 'Your current shop (B) is empty.'
    : same ? 'B is still identical to A — change a tier, package or pull price first.'
    : ''
}

/** Which lab buttons the original enables (updateHUD, :1449-1453). '' = enabled. */
export function labAvailability(g: Game, plan: Plan): Record<LabKind | 'saveA', string> {
  const s = g.state
  const pre = s.launched ? 'Pre-launch only.' : s.credits < 1 ? 'No test credits left.' : ''
  return { cbt: pre, survey: pre, saveA: s.credits < 1 ? 'No test credits left.' : '', ab: abReason(g, plan) }
}

export interface CbtResult {
  kind: 'cbt'; n: number; summary: string; mean: number; se: number; lo: number; hi: number
  payingRate: number; arppu: number | null
  rows: { id: PkgId; label: string; buyers: number; revPerPlayer: number }[]
}
export interface SurveyRow { id: PkgId; label: string; share: number; p25: number; p50: number; p75: number; p90: number }
export interface SurveyResult { kind: 'survey'; n: number; rows: SurveyRow[] }
export interface AbArm { n: number; mean: number; se: number; payingRate: number; arppu: number | null; summary: string }
export interface AbResult { kind: 'ab'; a: AbArm; b: AbArm; z: number; significant: boolean; winner: 'A' | 'B' | null }
export type LabResult = CbtResult | SurveyResult | AbResult
export type LabOutcome = { ok: true; result: LabResult } | { ok: false; reason: string }

const cohortOf = (g: Game, n: number): number[] => g.rng.shuffle(activeIdx(g.players)).slice(0, n)

/**
 * Run one lab test, spending one credit — the original's confirm + "Run test" path
 * (askConfirm :1470, RUNNERS :1482). Refusals spend nothing and use no random numbers.
 */
export function runLabTest(g: Game, kind: LabKind, planIn: Plan): LabOutcome {
  const plan = normalizePlan(planIn), s = g.state
  const avail = labAvailability(g, plan)[kind]
  if (avail) return { ok: false, reason: avail }
  if (kind !== 'survey' && !planIsValid(plan)) return { ok: false, reason: 'Your shop is empty — add a package first.' }
  s.credits--
  return { ok: true, result: kind === 'cbt' ? runCBT(g, plan) : kind === 'survey' ? runSurvey(g) : runAB(g, plan) }
}

function runCBT(g: Game, plan: Plan): CbtResult {
  const mk = marketInfo(g)
  const r = simulateMonth(g.rng, mk, g.players, plan, false, 0, cohortOf(g, 150), false)
  const ms = meanSE(r.perPlayer), pr = r.payers / r.n
  g.state.tests.push({ test: 'CBT', when: 'pre-launch', details: planSummary(plan), metric: 'revenue_per_player', value: ms.mean.toFixed(3), extra: 'paying_rate=' + pr.toFixed(3) + ';n=150' })
  return {
    kind: 'cbt', n: r.n, summary: planSummary(plan), mean: ms.mean, se: ms.se,
    lo: Math.max(0, ms.mean - 1.96 * ms.se), hi: ms.mean + 1.96 * ms.se,
    payingRate: pr, arppu: r.payers ? r.revenue / r.payers : null,
    rows: PKGS.filter((p) => isLive(p, plan[p.id])).map((p) => ({ id: p.id, label: p.label, buyers: r.buys[p.id], revPerPlayer: r.byPkg[p.id] / r.n })),
  }
}

function runSurvey(g: Game): SurveyResult {
  const mk = marketInfo(g), idx = cohortOf(g, 300), rows: SurveyRow[] = []
  PKGS.filter((p) => !p.gacha).forEach((p) => {
    const all = idx.map((i) => { const pl = g.players[i]; return pl.base * pl.interest[p.id] * (p.power ? mk.p2wAppeal : 1) * 1.35 * Math.exp(g.rng.randRange(-0.25, 0.25)) })
    const st = all.filter((v) => v >= 0.5).sort((a, b) => a - b), share = st.length / all.length
    const q = (f: number) => st.length ? st[Math.floor(f * (st.length - 1))] : 0
    rows.push({ id: p.id, label: p.label, share, p25: q(0.25), p50: q(0.5), p75: q(0.75), p90: q(0.9) })
    g.state.tests.push({ test: 'Survey', when: 'pre-launch', details: p.label, metric: 'stated_wtp_median_among_would_pay', value: q(0.5).toFixed(3), extra: 'share_would_pay=' + share.toFixed(3) + ';p25=' + q(0.25).toFixed(2) + ';p75=' + q(0.75).toFixed(2) + ';p90=' + q(0.9).toFixed(2) + ';n=300' })
  })
  return { kind: 'survey', n: idx.length, rows }
}

function runAB(g: Game, B: Plan): AbResult {
  const mk = marketInfo(g), s = g.state, A = s.variantA!
  const all = g.rng.shuffle(activeIdx(g.players)), half = Math.floor(all.length / 2)
  const ra = simulateMonth(g.rng, mk, g.players, A, false, 0, all.slice(0, half), false)
  const rb = simulateMonth(g.rng, mk, g.players, B, false, 0, all.slice(half), false)
  const a = meanSE(ra.perPlayer), b = meanSE(rb.perPlayer)
  const z = (b.mean - a.mean) / (Math.sqrt(a.se * a.se + b.se * b.se) || 1e-9)
  s.tests.push({ test: 'AB', when: s.launched ? 'after month ' + (s.round - 1) : 'pre-launch', details: 'A=' + planSummary(A) + ' | B=' + planSummary(B), metric: 'z_B_minus_A', value: z.toFixed(3), extra: 'revA=' + a.mean.toFixed(3) + ';revB=' + b.mean.toFixed(3) })
  const significant = !(Math.abs(z) < 1.96)
  return {
    kind: 'ab', z, significant, winner: significant ? (z > 0 ? 'B' : 'A') : null,
    a: { n: ra.n, mean: a.mean, se: a.se, payingRate: ra.payers / ra.n, arppu: ra.payers ? ra.revenue / ra.payers : null, summary: planSummary(A) },
    b: { n: rb.n, mean: b.mean, se: b.se, payingRate: rb.payers / rb.n, arppu: rb.payers ? rb.revenue / rb.payers : null, summary: planSummary(B) },
  }
}

/**
 * "Save Variant A" (:1517). Free, but — like the original button — unavailable at 0 credits.
 * Uses no random numbers.
 */
export function saveVariantA(g: Game, planIn: Plan): { ok: true } | { ok: false; reason: string } {
  const plan = normalizePlan(planIn)
  if (g.state.credits < 1) return { ok: false, reason: 'No test credits left.' }
  if (!planIsValid(plan)) return { ok: false, reason: 'Your shop is empty — add a package first.' }
  g.state.variantA = clonePlan(plan)
  return { ok: true }
}

export function clearVariantA(g: Game): void { g.state.variantA = null }
