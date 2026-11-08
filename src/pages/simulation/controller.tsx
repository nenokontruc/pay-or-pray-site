/**
 * Simulation controller — the only place the React UI talks to the engine (src/sim).
 *
 * Why it looks like this:
 * - The engine's Game object is mutated by engine functions (that is how the verified
 *   Phase 3 code works). We keep it in a ref and bump a `version` number after each
 *   engine call, so React re-renders from the real engine state. Nothing is copied or
 *   recomputed in React.
 * - Engine functions are called ONLY in event handlers, never during render or inside
 *   setState updaters. React's StrictMode runs render code twice in development; if an
 *   engine call ran there, it would consume random numbers twice and break equivalence.
 * - The provider sits in App (above the router), so leaving the Simulation page and
 *   coming back keeps the game — as in the original, where the page was only hidden.
 * - No global variables: each provider owns its own game (tests create their own).
 */
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  clearVariantA, clonePlan, createGame, defaultPlan, EXPORTS, exportFileName, isOver, launchMonth,
  normalizePlan, planIsValid, resetGame, runLabTest, saveVariantA, seedFromClock, selectMarket,
  type ExportKind, type Game, type LabKind, type LabResult, type MarketId, type Plan, type PkgId,
} from '../../sim'
import { copyText, downloadText } from './exports'

export const TEST_NAMES: Record<LabKind, string> = { cbt: 'Closed beta test', survey: 'In-game survey', ab: 'A/B test (A vs. B)' }

type NewCard =
  | { type: 'result'; result: LabResult }
  | { type: 'message'; title: string; text: string }
export type LabCard = NewCard & { id: number }

export type ExportWhere = 'live' | 'debrief'

export interface SimulationController {
  game: Game
  /** Increments after every engine call; components re-render from `game`. */
  version: number
  marketChoice: MarketId
  plan: Plan
  event: boolean
  labCards: LabCard[]
  pending: LabKind | null
  exportMsg: Record<ExportWhere, string>
  stage: 'market' | 'live' | 'over'
  chooseMarket(m: MarketId): void
  confirmMarket(): void
  setPackageOn(id: PkgId, on: boolean): void
  toggleTier(id: PkgId, price: number): void
  setGacha(id: PkgId, field: 'pull' | 'odds', value: number): void
  resetShop(): void
  copyLastMonth(): void
  setEvent(on: boolean): void
  askTest(kind: LabKind): void
  confirmTest(): void
  cancelTest(): void
  saveA(): void
  clearA(): void
  clearResults(): void
  launch(): void
  exportFile(kind: ExportKind): void
  copyMonths(where: ExportWhere): void
  replay(): void
}

const Ctx = createContext<SimulationController | null>(null)

export function useSimulation(): SimulationController {
  const c = useContext(Ctx)
  if (!c) throw new Error('useSimulation must be used inside <SimulationProvider>')
  return c
}

export function SimulationProvider({ seed, children }: { seed?: number; children: ReactNode }) {
  // Seed rule of the original page: taken once, when the page loads.
  const gameRef = useRef<Game | null>(null)
  if (!gameRef.current) gameRef.current = createGame(seed ?? seedFromClock(Date.now()))
  const game = gameRef.current

  const [version, setVersion] = useState(0)
  const bump = useCallback(() => setVersion((v) => v + 1), [])
  const [marketChoice, setMarketChoice] = useState<MarketId>('us')
  const [plan, setPlanState] = useState<Plan>(defaultPlan)
  const [event, setEventState] = useState(false)
  const [labCards, setLabCards] = useState<LabCard[]>([])
  const [pending, setPending] = useState<LabKind | null>(null)
  const [exportMsg, setExportMsg] = useState<Record<ExportWhere, string>>({ live: '', debrief: '' })
  const cardId = useRef(0)
  // Handlers read the latest plan through a ref, so a click always uses what is on screen.
  const planRef = useRef(plan)
  planRef.current = plan
  const setPlan = useCallback((p: Plan) => { planRef.current = p; setPlanState(p) }, [])

  const addCard = useCallback((c: NewCard) => {
    const card: LabCard = { ...c, id: ++cardId.current }
    setLabCards((cards) => [card, ...cards])
  }, [])

  const stage: SimulationController['stage'] = !game.state.market ? 'market' : isOver(game) ? 'over' : 'live'

  const ctl = useMemo<SimulationController>(() => ({
    game, version, marketChoice, plan, event, labCards, pending, exportMsg, stage,

    chooseMarket: (m) => setMarketChoice(m),
    confirmMarket: () => { selectMarket(game, marketChoice); bump() },

    setPackageOn: (id, on) => setPlan({ ...planRef.current, [id]: { ...planRef.current[id], on } }),
    toggleTier: (id, price) => {
      const e = planRef.current[id] as { on: boolean; tiers: number[] }
      const tiers = e.tiers.includes(price) ? e.tiers.filter((t) => t !== price) : [...e.tiers, price]
      setPlan(normalizePlan({ ...planRef.current, [id]: { ...e, tiers } }))
    },
    setGacha: (id, field, value) => setPlan({ ...planRef.current, [id]: { ...planRef.current[id], [field]: value } }),
    resetShop: () => setPlan(defaultPlan()),
    copyLastMonth: () => {
      const h = game.state.history
      if (h.length) setPlan(clonePlan(h[h.length - 1].plan))
    },
    setEvent: (on) => setEventState(on),

    // Lab: same flow as the original — validate, ask to confirm, then spend a credit.
    askTest: (kind) => {
      if (kind !== 'survey' && !planIsValid(normalizePlan(planRef.current))) {
        addCard({ type: 'message', title: TEST_NAMES[kind], text: 'Your shop is empty — add a package first.' })
        return
      }
      setPending(kind)
    },
    confirmTest: () => {
      if (!pending) return
      const out = runLabTest(game, pending, planRef.current)
      setPending(null)
      if (out.ok) addCard({ type: 'result', result: out.result })
      else addCard({ type: 'message', title: TEST_NAMES[pending], text: out.reason })
      bump()
    },
    cancelTest: () => setPending(null),
    saveA: () => {
      const out = saveVariantA(game, planRef.current)
      if (!out.ok) addCard({ type: 'message', title: 'A/B test', text: out.reason })
      bump()
    },
    clearA: () => { clearVariantA(game); bump() },
    clearResults: () => setLabCards([]),

    launch: () => {
      setPending(null) // the original closes an open confirm box when a month is launched
      launchMonth(game, planRef.current, event)
      bump()
    },

    exportFile: (kind) => {
      if (!game.state.market) return
      downloadText(exportFileName(game.state, kind), EXPORTS[kind].build(game.state))
    },
    copyMonths: (where) => {
      if (!game.state.market) return
      copyText(EXPORTS.months.build(game.state)).then((ok) => setExportMsg((m) => ({
        ...m, [where]: ok ? 'Copied to clipboard — paste into Excel, Sheets, or a .csv file.' : 'Copy failed — use the download buttons instead.',
      })))
    },

    replay: () => {
      resetGame(game) // RNG continues, as in the original
      setPlan(defaultPlan()); setEventState(false); setLabCards([]); setPending(null)
      setExportMsg({ live: '', debrief: '' })
      bump()
    },
  }), [game, version, marketChoice, plan, event, labCards, pending, exportMsg, stage, bump, setPlan, addCard])

  return <Ctx.Provider value={ctl}>{children}</Ctx.Provider>
}
