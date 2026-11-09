// Simulation page (legacy/index.html:948-1063). State lives in SimulationProvider (App.tsx).
import { Seal } from '../components/Art'
import { useSimulation } from './simulation/controller'
import { MarketSelect } from './simulation/MarketSelect'
import { Hud } from './simulation/Hud'
import { ShopBuilder } from './simulation/ShopBuilder'
import { LabPanel } from './simulation/LabPanel'
import { LiveOps } from './simulation/LiveOps'
import { Debrief } from './simulation/Debrief'
import './simulation/simulation.css'

const STEPS: [string, string][] = [
  ['Choose a market', 'Each country spends and reacts differently.'],
  ['Test before launch', 'Closed beta, survey, A/B test — limited credits.'],
  ['Run 8 months', '30 simulated days each. Track paying rate, ARPPU, DAU & churn.'],
  ['Download the data', 'Analyze your moves in Python, R, Excel or Tableau.'],
]

export default function Simulation() {
  const s = useSimulation()
  const current = s.stage === 'market' ? 0 : s.stage === 'over' ? 3 : s.game.state.launched ? 2 : 1
  return (
    <div className="sim">
      <div className="page-hero wrap-wide">
        <div className="sim-head">
          <div>
            <p className="kicker">Simulation</p>
            <h1 className="page-title">You're the new monetization manager</h1>
          </div>
          <div className="mascot" aria-hidden><Seal size={88} /></div>
        </div>
        <p className="page-lede">Pick a country, test your plan before launch, then run eight months of live operations &mdash; each month simulated day by day. Like a real game, your shop can sell several things at once &mdash; skins, a battle pass, power items, lucky draws &mdash; each with its own price ladder. But every player has one wallet, so your packages compete with each other. Earn the most without wrecking trust.</p>
        <ol className="flow-steps" aria-label="Progress">
          {STEPS.map(([b, t], i) => (
            <li key={b} className={i === current ? 'current' : i < current ? 'done' : ''} aria-current={i === current ? 'step' : undefined}>
              <b>{b}</b><span>{t}</span>
            </li>
          ))}
        </ol>
      </div>

      <section className="block">
        <div className="wrap-wide">
          {s.stage === 'market' ? <MarketSelect /> : (
            <>
              <Hud />
              {s.stage === 'live' ? (
                <div id="game-live" className="game-grid">
                  <ShopBuilder />
                  <div>
                    <LabPanel />
                    <LiveOps />
                  </div>
                </div>
              ) : <Debrief />}
            </>
          )}
        </div>
      </section>
    </div>
  )
}
