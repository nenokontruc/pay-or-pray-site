import { useState } from 'react'
import { ECONOMIES, BENCHMARKS, LOCALIZATION_TEXT } from '../../data/industry'
import { classifyPrice, distanceToRange, priceToX, type RangeVerdict } from '../../lib/industryCalc'

const fmt = (n: number) => `$${Number.isInteger(n) ? n : n.toFixed(1)}`
const VERDICT: Record<RangeVerdict, string> = { inside: 'Inside the benchmark range', below: 'Below the benchmark range', above: 'Above the benchmark range' }

function Compare() {
  const [tab, setTab] = useState<'in' | 'out'>('in')
  return (
    <div className="eco">
      <div className="eco-tabs" role="tablist" aria-label="Two economies">
        {(['in', 'out'] as const).map((k) => (
          <button key={k} role="tab" type="button" id={`eco-tab-${k}`} aria-controls={`eco-panel-${k}`} aria-selected={tab === k} className={`eco-tab ${k} ${tab === k ? 'on' : ''}`} onClick={() => setTab(k)}>
            <span className={`badge ${k === 'in' ? 'solid' : 'outline'}`}>{ECONOMIES[k].badge}</span>
            <strong>{ECONOMIES[k].keywords.join(' · ')}</strong>
          </button>
        ))}
      </div>
      {/* Both panels stay in the page (the inactive one hidden), so both original texts remain available. */}
      {(['in', 'out'] as const).map((k) => (
        <div key={k} className={`eco-panel ${k}`} role="tabpanel" id={`eco-panel-${k}`} aria-labelledby={`eco-tab-${k}`} hidden={tab !== k}>
          <h3>{ECONOMIES[k].title}</h3>
          <p>{ECONOMIES[k].text}</p>
        </div>
      ))}
    </div>
  )
}

const X0 = 70, X1 = 580, MAX = BENCHMARKS.axisMax
function PriceRange() {
  const [price, setPrice] = useState(BENCHMARKS.flat)
  const x = (p: number) => priceToX(p, 0, MAX, X0, X1)
  const rows = [
    { key: 'us', ...BENCHMARKS.us, y: 56, fill: 'var(--navy)', stroke: 'none' },
    { key: 'vn', ...BENCHMARKS.vn, y: 116, fill: 'var(--lightgray)', stroke: 'var(--silver)' },
  ]
  return (
    <div className="viz-card wide">
      <div className="viz-head-row">
        <h3 className="viz-title">Best-selling price tier by market</h3>
        <span className="badge outline" style={{ borderStyle: 'solid' }}>Interview-based benchmark</span>
      </div>
      <svg viewBox="0 0 640 200" className="range-chart" role="img" aria-label={`Typical best-selling price range: United States $10 to $19, Vietnam $5 to $7. Reference price line at ${fmt(price)}.`}>
        {[0, 5, 10, 15, 20, 25].map((t) => (
          <g key={t}><line x1={x(t)} x2={x(t)} y1="36" y2="166" stroke="var(--border)" strokeWidth="1" /><text x={x(t)} y="186" textAnchor="middle" className="axis-label">${t}</text></g>
        ))}
        {rows.map((r) => (
          <g key={r.key}>
            <text x={X0} y={r.y - 6} className="mkt-label">{r.label}</text>
            <rect x={x(r.lo)} y={r.y} width={x(r.hi) - x(r.lo)} height="26" rx="4" fill={r.fill} stroke={r.stroke} strokeWidth={r.stroke === 'none' ? 0 : 1.5} />
            <text x={(x(r.lo) + x(r.hi)) / 2} y={r.y + 17} textAnchor="middle" className="val-label" fill={r.key === 'us' ? 'var(--offwhite)' : 'var(--text)'}>${r.lo}–{r.hi}</text>
          </g>
        ))}
        <line x1={x(price)} x2={x(price)} y1="30" y2="166" stroke="var(--text)" strokeWidth="2" strokeDasharray="3,4" />
        <rect x={x(price) - 30} y="8" width="60" height="20" rx="3" fill="var(--text)" />
        <text x={x(price)} y="22" textAnchor="middle" className="ref-label" style={{ fill: 'var(--bg)' }}>{fmt(price)}</text>
      </svg>

      <div className="slider-row">
        <label htmlFor="price-slider">Illustrative price</label>
        <input id="price-slider" type="range" min={0} max={MAX} step={0.5} value={price} onChange={(e) => setPrice(+e.target.value)} />
        <output htmlFor="price-slider">{fmt(price)}</output>
        <button type="button" className="btn-ghost" onClick={() => setPrice(BENCHMARKS.flat)}>Reset to flat $15</button>
      </div>

      <div className="verdicts" aria-live="polite">
        {rows.map((r) => {
          const v = classifyPrice(price, r)
          const d = distanceToRange(price, r)
          return (
            <div key={r.key} className={`verdict ${v}`}>
              <span className="verdict-mkt">{r.label}</span>
              <b>{VERDICT[v]}</b>
              <span className="verdict-sub">{v === 'inside' ? `${fmt(r.lo)}–${fmt(r.hi)}` : `${fmt(d)} ${v === 'above' ? 'above' : 'below'} the ${v === 'above' ? 'top' : 'bottom'} of ${fmt(r.lo)}–${fmt(r.hi)}`}</span>
            </div>
          )
        })}
      </div>
      <p className="viz-foot">
        <b>What this shows:</b> practitioner benchmarks for the best-selling tier of one evergreen package line (6–8 tiers), from an anonymized industry interview — <b>not</b> statistically estimated optimal prices. The project's source contains no estimated optimal price for either market, so none is shown. The slider is illustrative and tests only range membership.
      </p>
    </div>
  )
}

export function Economies() {
  return (
    <div>
      <Compare />
      <PriceRange />
      <details className="disclosure">
        <summary><span className="chev" aria-hidden />Explore the analysis</summary>
        <div className="disclosure-body"><p>{LOCALIZATION_TEXT}</p>
          <p className="game-note">The dashed line marks a single flat $15 price — inside the US-like range, well above the VN-like one. This is the exact mismatch the <a href="#simulation">Simulation</a> lets you create and feel the revenue cost of.</p>
        </div>
      </details>
    </div>
  )
}
