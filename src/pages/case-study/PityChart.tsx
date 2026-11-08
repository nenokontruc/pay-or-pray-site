// "How the odds play out": exact curve for Where Winds Meet, honest band for Honor of Kings.
import { useId, useState } from 'react'
import { HOK_GUARANTEE, HOK_START_ODDS, WWM_GUARANTEE, WWM_ODDS } from '../../data/caseStudy'
import { cumulativeFixed, cumulativeLowerBoundRising, expectedPullsWithPity, winBeforeGuarantee } from '../../lib/pityMath'

const W = 640, H = 270, L = 52, R = 18, T = 18, B = 42
const X_MAX = HOK_GUARANTEE
const x = (n: number) => L + (n / X_MAX) * (W - L - R)
const y = (v: number) => H - B - v * (H - T - B)
const p1 = (v: number) => (v * 100).toFixed(1) + '%'

export const WWM_BEFORE_GUARANTEE = winBeforeGuarantee(WWM_ODDS, WWM_GUARANTEE)
export const WWM_EXPECTED_PULLS = expectedPullsWithPity(WWM_ODDS, WWM_GUARANTEE)

export function PityChart() {
  const [n, setN] = useState(100)
  const id = useId()
  const wwmPts: string[] = []
  for (let k = 0; k < WWM_GUARANTEE; k++) wwmPts.push(`${x(k).toFixed(1)},${y(cumulativeFixed(WWM_ODDS, k, WWM_GUARANTEE)).toFixed(1)}`)
  wwmPts.push(`${x(WWM_GUARANTEE).toFixed(1)},${y(cumulativeFixed(WWM_ODDS, WWM_GUARANTEE - 1, WWM_GUARANTEE)).toFixed(1)}`, `${x(WWM_GUARANTEE).toFixed(1)},${y(1).toFixed(1)}`)
  const lower: string[] = []
  for (let k = 1; k < HOK_GUARANTEE; k++) lower.push(`${x(k).toFixed(1)},${y(cumulativeLowerBoundRising(HOK_START_ODDS, k, HOK_GUARANTEE)).toFixed(1)}`)
  const band = [...lower, `${x(HOK_GUARANTEE - 1).toFixed(1)},${y(1).toFixed(1)}`, `${x(1).toFixed(1)},${y(1).toFixed(1)}`].join(' ')
  const wwmAt = cumulativeFixed(WWM_ODDS, n, WWM_GUARANTEE)
  const hokAt = cumulativeLowerBoundRising(HOK_START_ODDS, n, HOK_GUARANTEE)

  return (
    <div className="viz-card cs-pity">
      <div className="cs-viz-head">
        <h3 className="viz-title">Chance of having won the top prize, by number of draws</h3>
        <span className="cs-legend">
          <span><i className="cs-key wwm" />Where Winds Meet &middot; <b>hypothetical teaching model</b></span>
          <span><i className="cs-key hok" />Honor of Kings &middot; <b>range only</b> (schedule not published)</span>
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="cs-chart" role="img"
        aria-label={`Line chart. Where Winds Meet, hypothetical teaching model: chance of the outfit reaches about ${p1(WWM_BEFORE_GUARANTEE)} by pull 149, then 100% on pull 150. Honor of Kings: exact curve unknown; at least 1 minus 0.992 to the power n, and 100% at draw 361.`}>
        <defs>
          <pattern id={`${id}-hatch`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="var(--silver)" strokeWidth="1.4" />
          </pattern>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((v) => (
          <g key={v}><line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="var(--border)" /><text x={L - 8} y={y(v) + 4} textAnchor="end" className="cs-axis">{v * 100}%</text></g>
        ))}
        {[0, 50, 100, 150, 200, 250, 300, 361].map((t) => (
          <text key={t} x={x(t)} y={H - B + 18} textAnchor="middle" className="cs-axis">{t}</text>
        ))}
        <text x={(L + W - R) / 2} y={H - 6} textAnchor="middle" className="cs-axis">draws / pulls</text>
        <polygon points={band} fill={`url(#${id}-hatch)`} opacity=".9" />
        <polyline points={lower.join(' ')} fill="none" stroke="var(--silver)" strokeWidth="1.5" strokeDasharray="4,4" />
        <text x={x(205)} y={y(0.6)} className="cs-note">HoK: true path lies somewhere in this band</text>
        <circle cx={x(HOK_GUARANTEE)} cy={y(1)} r="4" fill="var(--silver)" />
        <polyline points={wwmPts.join(' ')} fill="none" stroke="var(--navy)" strokeWidth="2.5" className="cs-wwm" />
        <circle cx={x(WWM_GUARANTEE)} cy={y(1)} r="4.5" fill="var(--navy)" className="cs-wwm-dot" />
        <text x={x(WWM_GUARANTEE) + 8} y={y(1) + 16} className="cs-note">WWM guaranteed at 150</text>
        <line x1={x(n)} x2={x(n)} y1={T} y2={H - B} stroke="var(--text)" strokeDasharray="3,4" />
      </svg>
      <div className="slider-row">
        <label htmlFor={`${id}-n`}>Draws so far</label>
        <input id={`${id}-n`} type="range" min={1} max={HOK_GUARANTEE} step={1} value={n} onChange={(e) => setN(+e.target.value)} />
        <output htmlFor={`${id}-n`}>{n}</output>
      </div>
      <div className="cs-readout" aria-live="polite">
        <div className="cs-read wwm">
          <span className="cs-read-k">Where Winds Meet</span>
          <b data-testid="wwm-readout">{n >= WWM_GUARANTEE ? '100%' : p1(wwmAt)}</b>
          <span>{n >= WWM_GUARANTEE ? 'in the model, guaranteed on pull 150' : 'model-derived chance the outfit has dropped (0.0415% per pull, teaching model)'}</span>
        </div>
        <div className="cs-read hok">
          <span className="cs-read-k">Honor of Kings</span>
          <b data-testid="hok-readout">{n >= HOK_GUARANTEE ? '100%' : `at least ${p1(hokAt)}`}</b>
          <span>{n >= HOK_GUARANTEE ? 'guaranteed by draw 361' : 'the true figure is higher: odds start at 0.8% and rise each draw by an amount the sources do not publish'}</span>
        </div>
      </div>
      <p className="viz-foot">
        <b>What this chart is.</b> The Where Winds Meet line is a <b>hypothetical teaching model</b>: it assumes the reported fixed odds (0.0415%) apply to every pull and that the 150-pull guarantee always delivers this outfit. Reseller guides disagree on how the guarantee resets, so the line is not an observed outcome (details below). Honor of Kings publishes its starting odds (0.8%) and guarantee (draw 361) but not how much the odds rise per draw, so no curve is drawn &mdash; only the range those two facts allow.
      </p>
    </div>
  )
}
