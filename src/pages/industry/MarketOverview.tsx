import { useState } from 'react'
import { MARKET, IAP_GROWTH } from '../../data/industry'
import { donutArcs, barHeight, pictogramSplit } from '../../lib/industryCalc'

const other = +(MARKET.total - MARKET.mobile).toFixed(1)

/* ---------- Donut ---------- */
type SliceId = 'mobile' | 'other'
function Donut() {
  const [sel, setSel] = useState<SliceId | null>(null)
  const arcs = donutArcs([{ id: 'mobile', value: MARKET.mobile }, { id: 'other', value: other }])
  const R = 70, C = 2 * Math.PI * R
  const info = {
    mobile: { name: 'Mobile gaming', value: `$${MARKET.mobile}B`, pct: MARKET.mobileShareLabel, note: 'Reported by Newzoo.' },
    other: { name: 'Other platforms', value: `$${other}B`, pct: MARKET.otherShareLabel, note: 'Derived: total minus mobile.' },
  }
  const active = sel ? info[sel] : null
  return (
    <div className="viz-card">
      <h3 className="viz-title">Global games market · {MARKET.year}</h3>
      <div className="donut-row">
        <svg viewBox="0 0 200 200" className="donut" role="group" aria-label="Donut chart: mobile gaming 55 percent, other platforms 45 percent of a $188.8 billion market">
          <g transform="rotate(-90 100 100)">
            {arcs.map((a) => (
              <circle key={a.id} cx="100" cy="100" r={R} fill="none"
                stroke={a.id === 'mobile' ? 'var(--slate)' : 'var(--lightgray)'}
                strokeWidth={sel === a.id ? 34 : 28}
                strokeDasharray={`${a.length * C - 1.5} ${C}`} strokeDashoffset={-a.start * C}
                tabIndex={0} role="button" aria-label={`${info[a.id as SliceId].name}: ${info[a.id as SliceId].value}, ${info[a.id as SliceId].pct} percent`}
                style={{ cursor: 'pointer', opacity: sel && sel !== a.id ? 0.55 : 1, transition: 'stroke-width .2s, opacity .2s' }}
                onClick={() => setSel(sel === a.id ? null : (a.id as SliceId))}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setSel(sel === a.id ? null : (a.id as SliceId)))}
                onMouseEnter={() => setSel(a.id as SliceId)} onMouseLeave={() => setSel(null)} />
            ))}
          </g>
          <text x="100" y="96" textAnchor="middle" className="donut-big">{active ? active.value : `$${MARKET.total}B`}</text>
          <text x="100" y="116" textAnchor="middle" className="donut-small">{active ? `${active.pct}% of market` : 'Total market'}</text>
        </svg>
        <ul className="legend">
          {(['mobile', 'other'] as SliceId[]).map((id) => (
            <li key={id}>
              <button type="button" className={`legend-btn ${sel === id ? 'on' : ''}`} onClick={() => setSel(sel === id ? null : id)} aria-pressed={sel === id}>
                <i className="swatch" style={{ background: id === 'mobile' ? 'var(--slate)' : 'var(--lightgray)' }} />
                <span>{info[id].name}<br /><b>{info[id].value}</b> ({info[id].pct}%)</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <p className="viz-foot" aria-live="polite">
        {active ? `${active.name}, ${MARKET.year}. ${active.note}` : `Select a slice. Year: ${MARKET.year}.`} Source: {MARKET.source}.
      </p>
    </div>
  )
}

/* ---------- Pictogram ---------- */
function Person({ x, y, on, dim }: { x: number; y: number; on: boolean; dim: boolean }) {
  const c = on ? 'var(--slate)' : 'var(--lightgray)'
  return (
    <g transform={`translate(${x} ${y})`} opacity={dim ? 0.25 : 1} fill={c}>
      <rect x="2" y="0" width="3" height="3" />
      <rect x="1" y="3.4" width="5" height="3.6" />
      <rect x="1" y="7" width="2" height="2.6" />
      <rect x="4" y="7" width="2" height="2.6" />
    </g>
  )
}
function Pictogram() {
  const { nothing, spend } = pictogramSplit(MARKET.spendNothingPct)
  const [focus, setFocus] = useState<'nothing' | 'spend' | null>(null)
  // First `spend` icons are spenders (dark); the rest spend nothing (light).
  const icons = Array.from({ length: 100 }, (_, i) => i < spend)
  return (
    <div className="viz-card">
      <h3 className="viz-title">Players who spend · {MARKET.year}</h3>
      <div className="picto-row">
        <svg viewBox="0 0 80 100" className="picto" role="img" aria-label={`100 player icons: ${nothing} spend nothing on games in a year, ${spend} spend something`}>
          {icons.map((isSpender, i) => (
            <Person key={i} x={(i % 10) * 8} y={Math.floor(i / 10) * 10} on={isSpender}
              dim={focus !== null && (focus === 'spend') !== isSpender} />
          ))}
        </svg>
        <div className="picto-stat">
          <div className="big-stat">{MARKET.spendNothingPct}%</div>
          <p>of players spend nothing on games in a year</p>
          <div className="picto-toggles">
            <button type="button" className={`chip ${focus === 'nothing' ? 'on' : ''}`} aria-pressed={focus === 'nothing'} onClick={() => setFocus(focus === 'nothing' ? null : 'nothing')}>
              <i className="swatch" style={{ background: 'var(--lightgray)' }} />Spend nothing · {nothing}
            </button>
            <button type="button" className={`chip ${focus === 'spend' ? 'on' : ''}`} aria-pressed={focus === 'spend'} onClick={() => setFocus(focus === 'spend' ? null : 'spend')}>
              <i className="swatch" style={{ background: 'var(--slate)' }} />Spend something · {spend}
            </button>
          </div>
        </div>
      </div>
      <p className="viz-foot">1 icon = 1 of every 100 players. The 44 is the remainder (100 − 56). Source: {MARKET.source}.</p>
    </div>
  )
}

/* ---------- Growth bars ---------- */
function GrowthBars() {
  const [sel, setSel] = useState<'mobile' | 'apps' | null>(null)
  const H = 130, max = IAP_GROWTH.nonGameAppsPct
  const bars = [
    { id: 'mobile' as const, label: 'Mobile games', v: IAP_GROWTH.mobileGamesPct, x: 30, fill: 'var(--slate)' },
    { id: 'apps' as const, label: 'Non-game apps', v: IAP_GROWTH.nonGameAppsPct, x: 150, fill: 'var(--silver)' },
  ]
  return (
    <div className="viz-card">
      <h3 className="viz-title">IAP revenue growth · {IAP_GROWTH.year}</h3>
      <svg viewBox="0 0 270 210" className="bars" role="group" aria-label="Bar chart of in-app purchase revenue growth in 2025: mobile games plus 1.3 percent, non-game apps plus 21 percent">
        {bars.map((b) => {
          const h = barHeight(b.v, max, H)
          const y = 170 - h
          return (
            <g key={b.id} tabIndex={0} role="button" aria-label={`${b.label}: plus ${b.v} percent`} style={{ cursor: 'pointer', opacity: sel && sel !== b.id ? 0.5 : 1 }}
              onClick={() => setSel(sel === b.id ? null : b.id)} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setSel(sel === b.id ? null : b.id))}>
              <rect x={b.x} y={y} width="90" height={h} fill={b.fill} rx="1" />
              <text x={b.x + 45} y={y - 8} textAnchor="middle" className="bar-val">+{b.v}%</text>
              <text x={b.x + 45} y="192" textAnchor="middle" className="bar-lbl">{b.label}</text>
            </g>
          )
        })}
        <line x1="10" y1="170" x2="260" y2="170" stroke="var(--text-muted)" strokeWidth="1.5" />
      </svg>
      <p className="viz-foot" aria-live="polite">
        {sel === 'mobile' ? `Mobile game IAP grew ${IAP_GROWTH.mobileGamesPct}% in ${IAP_GROWTH.year} (about $${IAP_GROWTH.mobileGamesIapApproxB}B). ` : sel === 'apps' ? `Non-game app IAP grew ${IAP_GROWTH.nonGameAppsPct}% in ${IAP_GROWTH.year}. ` : 'Growth in in-app purchase (IAP) revenue, %. Select a bar. '}
        Source: {IAP_GROWTH.source}.
      </p>
    </div>
  )
}

export function MarketOverview() {
  return (
    <div className="viz-grid">
      <Donut />
      <Pictogram />
      <GrowthBars />
    </div>
  )
}
