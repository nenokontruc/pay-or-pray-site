// Top status bar (legacy/index.html:996-1002, updateHUD :1440-1446). Values come from report.hud().
import { hud, marketInfo } from '../../sim'
import { useSimulation } from './controller'

export function Hud() {
  const { game } = useSimulation()
  const h = hud(game)
  const gw = h.goodwillValue
  // Same colour thresholds as the original bar.
  const fill = gw < 35 ? 'var(--slate)' : gw < 60 ? 'var(--silver)' : 'var(--navy)'
  return (
    <div className="game-stats" id="game-stats" aria-label="Simulation status">
      <div className="game-stat"><div className="gs-label">Market</div><div className="gs-value" id="g-market" style={{ fontSize: 15 }}>{marketInfo(game).label}</div></div>
      <div className="game-stat"><div className="gs-label">Phase</div><div className="gs-value" id="g-round" style={{ fontSize: 17 }}>{h.phase}</div></div>
      <div className="game-stat"><div className="gs-label">Population</div><div className="gs-value" id="g-pop">{h.population}</div></div>
      <div className="game-stat">
        <div className="gs-label">Goodwill</div><div className="gs-value" id="g-goodwill">{h.goodwill}</div>
        <div className="gw-bar" role="meter" aria-label="Goodwill" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(gw)}>
          <div className="gw-fill" style={{ width: `${Math.max(0, Math.min(100, gw))}%`, background: fill }} />
        </div>
      </div>
      <div className="game-stat"><div className="gs-label">Total Revenue</div><div className="gs-value" id="g-revenue">{h.revenue}</div></div>
    </div>
  )
}
