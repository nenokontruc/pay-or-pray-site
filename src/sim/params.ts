// Market and scenario data — copied verbatim from legacy/index.html:1188-1207.
// These are the model's calibration values. Do not edit without updating the
// academic write-up: every number here drives the simulated outcomes.

export type MarketId = 'us' | 'cn' | 'jp' | 'vn' | 'id'

export interface MarketInfo {
  label: string
  /** Share of players who never spend at any price. */
  nonSpend: number
  /** Mean monthly budget scale for minnow / dolphin / whale (exponential distribution). */
  tiers: readonly [number, number, number]
  /** Cumulative segment cut-offs among spenders: minnow < w0 ≤ dolphin < w1 ≤ whale. */
  weights: readonly [number, number]
  p2wAppeal: number
  p2wPenalty: number
  gachaAffinity: number
  gachaPenalty: number
  benchmark: string | null
}

export const MARKET_INFO: Readonly<Record<MarketId, MarketInfo>> = {
  us: { label: 'United States', nonSpend: 0.75, tiers: [3.5, 15.4, 77], weights: [0.70, 0.95], p2wAppeal: 1.15, p2wPenalty: 1.5, gachaAffinity: 1.0, gachaPenalty: 1.3, benchmark: '$10–19 (practitioner benchmark)' },
  cn: { label: 'China', nonSpend: 0.75, tiers: [2.5, 12.5, 40], weights: [0.70, 0.94], p2wAppeal: 1.5, p2wPenalty: 0.5, gachaAffinity: 1.15, gachaPenalty: 0.6, benchmark: null },
  jp: { label: 'Japan', nonSpend: 0.72, tiers: [3.75, 20, 56.25], weights: [0.68, 0.93], p2wAppeal: 1.25, p2wPenalty: 1.0, gachaAffinity: 1.4, gachaPenalty: 0.3, benchmark: null },
  vn: { label: 'Vietnam', nonSpend: 0.78, tiers: [1, 5.5, 25], weights: [0.70, 0.95], p2wAppeal: 1.3, p2wPenalty: 0.8, gachaAffinity: 1.0, gachaPenalty: 0.9, benchmark: '$5–7 (practitioner benchmark)' },
  id: { label: 'Indonesia', nonSpend: 0.82, tiers: [0.8, 3.5, 10], weights: [0.72, 0.97], p2wAppeal: 1.3, p2wPenalty: 0.8, gachaAffinity: 0.9, gachaPenalty: 1.0, benchmark: null },
}
export const MARKET_IDS = Object.keys(MARKET_INFO) as MarketId[]

export const LADDER: readonly number[] = [0.99, 1.99, 2.99, 4.99, 9.99, 19.99, 49.99, 99.99]

export type PkgId = 'skin' | 'pass' | 'item' | 'cgacha' | 'pgacha'

export interface PkgDef {
  id: PkgId
  label: string
  desc: string
  power: boolean
  gacha: boolean
  ladder?: readonly number[]
  def?: readonly number[]
  defPull?: number
  defOdds?: number
  defOn: boolean
  valueBonus?: number
  badge: 'solid' | 'outline'
  badgeText: 'Deterministic' | 'Probabilistic'
}

/** Order matters: it is the iteration order the original uses everywhere (and so the RNG order). */
export const PKGS: readonly PkgDef[] = [
  { id: 'skin', label: 'Cosmetic Skins', desc: 'Outfits and looks. No gameplay advantage.', power: false, gacha: false, ladder: LADDER, def: [2.99, 9.99, 19.99], defOn: true, badge: 'solid', badgeText: 'Deterministic' },
  { id: 'pass', label: 'Battle Pass', desc: 'A monthly pass: fixed price, known rewards, feels like good value.', power: false, gacha: false, ladder: [4.99, 9.99, 19.99], def: [9.99], defOn: false, valueBonus: 1.15, badge: 'solid', badgeText: 'Deterministic' },
  { id: 'item', label: 'Power Items', desc: 'Shop items that raise competitive power. Pay-to-win.', power: true, gacha: false, ladder: LADDER, def: [4.99, 19.99], defOn: false, badge: 'solid', badgeText: 'Deterministic' },
  { id: 'cgacha', label: 'Cosmetic Gacha', desc: 'Paid lucky draw for rare looks. 50-pull pity guarantee.', power: false, gacha: true, defPull: 3, defOdds: 5, defOn: false, badge: 'outline', badgeText: 'Probabilistic' },
  { id: 'pgacha', label: 'Power Gacha', desc: 'Paid lucky draw for power. The riskiest combination.', power: true, gacha: true, defPull: 3, defOdds: 5, defOn: false, badge: 'outline', badgeText: 'Probabilistic' },
]
export const PIDS: readonly PkgId[] = PKGS.map((p) => p.id)
export const pkgById = (id: PkgId): PkgDef => PKGS[PIDS.indexOf(id)]

export const SAMPLE = 1000
export const PITY = 50
export const BASE_POP = 200000
export const CREDITS = 3
export const DAYS = 30
export const EVENT_DAYS = 7
export const MAX_ROUNDS = 8
export const START_GOODWILL = 70
/** Real players represented by each simulated player (200). */
export const WEIGHT = BASE_POP / SAMPLE

export const SEG = ['minnow', 'dolphin', 'whale', 'non_spender'] as const
export type SegIndex = 0 | 1 | 2 | 3
/** Daily engagement probability range per segment (same order as SEG). */
export const ENG: readonly (readonly [number, number])[] = [[0.30, 0.65], [0.45, 0.85], [0.60, 0.95], [0.25, 0.60]]

/** UI slider ranges in the original (legacy/index.html:1362-1363). */
export const PULL_RANGE = { min: 0.5, max: 10, step: 0.5 } as const
export const ODDS_RANGE = { min: 1, max: 15, step: 1 } as const
