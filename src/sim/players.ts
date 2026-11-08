// Player population (legacy/index.html:1223-1230).
import { ENG, PKGS, SAMPLE, WEIGHT, type MarketInfo, type PkgId, type SegIndex } from './params'
import type { Rng } from './rng'

export interface Player {
  id: number
  /** 0 minnow, 1 dolphin, 2 whale, 3 non-spender (index into SEG). */
  seg: SegIndex
  /** Base monthly budget in $ (0 for non-spenders). */
  base: number
  interest: Record<PkgId, number>
  /** Daily engagement probability. */
  eng: number
  install: number
  active: boolean
  churnMonth: number | null
}

/** Players plus the id counter. In the original these are closure variables. */
export interface Population {
  players: Player[]
  nextId: number
}

/**
 * RNG order (must match the original): non-spender draw, segment draw, one interest draw
 * per package (PKGS order), base budget (spenders only), engagement.
 */
export function makePlayer(rng: Rng, mk: MarketInfo, pop: Population, installMonth: number): Player {
  const ns = rng.rand() < mk.nonSpend, r = rng.rand()
  const s: SegIndex = ns ? 3 : (r < mk.weights[0] ? 0 : (r < mk.weights[1] ? 1 : 2))
  const interest = {} as Record<PkgId, number>
  PKGS.forEach((p) => { interest[p.id] = rng.randRange(0.3, 1.2) })
  return {
    id: pop.nextId++,
    seg: s,
    base: ns ? 0 : -mk.tiers[s as 0 | 1 | 2] * Math.log(1 - rng.rand()), // s < 3 whenever ns is false
    interest,
    eng: rng.randRange(ENG[s][0], ENG[s][1]),
    install: installMonth,
    active: true,
    churnMonth: null,
  }
}

export function initPlayers(rng: Rng, mk: MarketInfo, pop: Population): void {
  pop.players = []
  pop.nextId = 1
  for (let i = 0; i < SAMPLE; i++) pop.players.push(makePlayer(rng, mk, pop, 1))
}

export function activeIdx(players: readonly Player[]): number[] {
  const a: number[] = []
  players.forEach((p, i) => { if (p.active) a.push(i) })
  return a
}

export const population = (players: readonly Player[]): number => activeIdx(players).length * WEIGHT
