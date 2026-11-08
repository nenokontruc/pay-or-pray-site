// The shop plan as data (replaces reading checkboxes in legacy readPlan(), :1248).
import { PKGS, type PkgDef, type PkgId } from './params'
import { fmt2 } from './format'

export interface FixedEntry { on: boolean; tiers: number[] }
export interface GachaEntry { on: boolean; pull: number; odds: number }
export interface Plan {
  skin: FixedEntry
  pass: FixedEntry
  item: FixedEntry
  cgacha: GachaEntry
  pgacha: GachaEntry
}
export type PlanEntry = FixedEntry | GachaEntry

export const fixedEntry = (plan: Plan, id: PkgId): FixedEntry => plan[id] as FixedEntry
export const gachaEntry = (plan: Plan, id: PkgId): GachaEntry => plan[id] as GachaEntry

/** The shop the page starts with, and what "Reset to default" restores (:1410-1413). */
export function defaultPlan(): Plan {
  const out = {} as Record<PkgId, PlanEntry>
  for (const p of PKGS) {
    out[p.id] = p.gacha
      ? { on: p.defOn, pull: p.defPull!, odds: p.defOdds! }
      : { on: p.defOn, tiers: p.def!.slice().sort((a, b) => a - b) }
  }
  return out as unknown as Plan
}

/** Deep copy with tiers sorted ascending — exactly what readPlan() returns. */
export function normalizePlan(plan: Plan): Plan {
  const out = {} as Record<PkgId, PlanEntry>
  for (const p of PKGS) {
    const e = plan[p.id]
    out[p.id] = p.gacha
      ? { on: e.on, pull: (e as GachaEntry).pull, odds: (e as GachaEntry).odds }
      : { on: e.on, tiers: (e as FixedEntry).tiers.slice().sort((a, b) => a - b) }
  }
  return out as unknown as Plan
}

export const clonePlan = (plan: Plan): Plan => JSON.parse(JSON.stringify(plan))

/** A package is live when it is on and (for fixed-price) offers at least one tier (:1259). */
export function isLive(p: PkgDef, e: PlanEntry): boolean {
  return e.on && (p.gacha || (e as FixedEntry).tiers.length > 0)
}
export const planIsValid = (plan: Plan): boolean => PKGS.some((p) => isLive(p, plan[p.id]))
export const liveCount = (plan: Plan): number => PKGS.filter((p) => isLive(p, plan[p.id])).length

export function planSummary(plan: Plan): string {
  const parts: string[] = []
  for (const p of PKGS) {
    const e = plan[p.id]
    if (!isLive(p, e)) continue
    parts.push(p.gacha
      ? p.label + ' (' + fmt2((e as GachaEntry).pull) + '/pull, ' + (e as GachaEntry).odds + '%)'
      : p.label + ' [' + (e as FixedEntry).tiers.map(fmt2).join(', ') + ']')
  }
  return parts.join(' + ') || 'nothing'
}

/** Canonical string used to tell whether A/B variants differ (:1417). */
export function normPlan(plan: Plan): string {
  const o: Record<string, unknown> = {}
  for (const p of PKGS) {
    const e = plan[p.id]
    o[p.id] = !isLive(p, e) ? { on: false } : (p.gacha
      ? { on: true, pull: (e as GachaEntry).pull, odds: (e as GachaEntry).odds }
      : { on: true, tiers: (e as FixedEntry).tiers })
  }
  return JSON.stringify(o)
}
