// "The rest of the toolkit" as one guided chain:
//   ① Who pays? (WTP, price response) → ② What do they compare? (choice architecture) → ③ How do we value it? (EVC)
// Original paragraphs stay verbatim in each step's "Full explanation". Step ① uses an ILLUSTRATIVE population
// (src/lib/wtp.ts), labelled as such; only the 56% non-payer share is a real figure (Newzoo).
import { useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Disclosure, Takeaway } from '../../components/Disclosure'
import { Gashapon, DisplayCase } from '../../components/Art'
import { CHOICE_PARAGRAPH, WTP_PARAGRAPH } from '../../data/framework'
import { illustrativePopulation, illustrativeSpenders, NON_PAYERS, priceResponse } from '../../lib/wtp'

type StepId = 'who' | 'compare' | 'value'
const STEPS: { id: StepId; n: string; label: string; short: string; question: string }[] = [
  { id: 'who', n: '1', label: 'Who pays?', short: 'Who pays', question: 'If a skin costs this much, how many of 100 players buy it?' },
  { id: 'compare', n: '2', label: 'What do they compare?', short: 'Compare', question: 'What does a buyer compare before paying?' },
  { id: 'value', n: '3', label: 'So, how do we value it?', short: 'Value it', question: 'Which form of EVC applies?' },
]

const POP = illustrativePopulation()
const SPENDERS = illustrativeSpenders()
const X0 = 230, X1 = 620, PMAX = 25
const px = (p: number) => X0 + (Math.min(p, PMAX) / PMAX) * (X1 - X0)
const BASE = 168 // y of the price axis inside the chart

function WhoPays() {
  const id = useId()
  const [price, setPrice] = useState(4.99)
  const r = priceResponse(POP, price)
  // Stack spenders into $1 bins so the dot plot reads as a distribution.
  const dots = useMemo(() => {
    const seen: Record<number, number> = {}
    return SPENDERS.map((w) => { const b = Math.min(Math.floor(w), PMAX - 1); const k = (seen[b] = (seen[b] ?? 0) + 1) - 1; return { w, x: px(b + 0.5), y: BASE - 10 - k * 11 } })
  }, [])
  // Price label: keep it inside the chart even at the ends of the axis.
  const labelX = Math.max(X0 + 34, Math.min(X1 - 34, px(price)))
  return (
    <div className="fw-chain-work">
      <div className="fw-chain-viz">
        {/* Headings and notes are HTML (they wrap and stay readable on phones); the chart holds only marks and the axis. */}
        <div className="fw-wtp-heads"><span><b>56 players</b> · willingness to pay $0</span><span><b>The other 44</b> · willingness to pay, illustrative</span></div>
        <svg viewBox="0 0 640 196" className="fw-wtp" role="img" aria-label={`100 illustrative players. 56 would pay nothing. At ${'$'}${price.toFixed(2)}, ${r.buyers} of 100 buy.`}>
          {Array.from({ length: NON_PAYERS }, (_, i) => (
            <rect key={i} x={14 + (i % 8) * 24} y={44 + Math.floor(i / 8) * 17} width="16" height="11" rx="2" className="fw-wtp-zero" />
          ))}
          <line x1={X0} x2={X1} y1={BASE} y2={BASE} className="fw-wtp-axis" />
          {[0, 5, 10, 15, 20, 25].map((t) => <text key={t} x={px(t)} y={BASE + 20} textAnchor={t === 25 ? 'end' : 'middle'} className="fw-wtp-tick">${t}{t === 25 ? '+' : ''}</text>)}
          {dots.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r="5" className={d.w >= price ? 'fw-wtp-buy' : 'fw-wtp-no'} />)}
          <line x1={px(price)} x2={px(price)} y1="30" y2={BASE + 4} className="fw-wtp-price" />
          <text x={labelX} y="22" textAnchor="middle" className="fw-wtp-tick strong">price ${price.toFixed(2)}</text>
        </svg>
        <p className="fw-wtp-notes"><span className="fw-tag real">Real</span> 56% of players spend nothing on games in a year (Newzoo). <span className="fw-tag">Illustrative</span> The 44 dots are made-up willingness-to-pay values; filled = buys at this price.</p>
        <div className="fw-field-row">
          <label htmlFor={`${id}-p`} className="fw-mini-k" style={{ margin: 0 }}>Skin price</label>
          <input id={`${id}-p`} type="range" min={0.99} max={24.99} step={1} value={price} onChange={(e) => setPrice(Number(e.target.value))} />
          <output htmlFor={`${id}-p`} className="fw-box" data-testid="wtp-price">${price.toFixed(2)}</output>
        </div>
      </div>
      <div className="fw-chain-side" aria-live="polite">
        <div className="fw-card-formula notranslate" translate="no">d(p) = D·(1 − W(p))</div>
        <p className="fw-chain-eq">Paying Rate = P(wtp ≥ p) = <b data-testid="paying-rate">{Math.round(r.payingRate * 100)}%</b></p>
        <p className="fw-chain-eq">d(p) = {r.D} × (1 − {r.W.toFixed(2)}) = <b data-testid="buyers">{r.buyers} buyers</b></p>
        <p className="fw-hint">D = 100 players. W(p) = share whose willingness to pay is below the price. Even at $0.99, at most 44 of 100 can buy.</p>
        <span className="fw-tag">Illustrative population</span>
      </div>
    </div>
  )
}

function Compare() {
  return (
    <div className="fw-chain-compare">
      <div className="fw-cmp">
        <div className="fw-cmp-art" aria-hidden><DisplayCase /></div>
        <b>Fixed-price shop</b>
        <div className="fw-cmp-tiers" aria-label="Three known options side by side">
          <span>$4.99</span><span className="mid">$9.99<em>compromise</em></span><span className="top">$19.99<em>anchor</em></span>
        </div>
        <p>Known options side by side &mdash; buyers compare and choose. <b>Compromise and anchor effects</b> work.</p>
      </div>
      <div className="fw-cmp-vs" aria-hidden>vs</div>
      <div className="fw-cmp uncertain">
        <div className="fw-cmp-art" aria-hidden><Gashapon /></div>
        <b>Lucky draw</b>
        <div className="fw-cmp-tiers" aria-label="No known options to compare">
          <span>?</span><span>?</span><span>?</span>
        </div>
        <p>No comparison set. The psychology shifts to <b>near-miss effects, sunk-cost escalation and pity-timer anchoring</b>.</p>
      </div>
    </div>
  )
}

function Value({ onOpenTab, onOpenMath }: { onOpenTab: (t: 'det' | 'prob') => void; onOpenMath: () => void }) {
  return (
    <div className="fw-chain-value">
      <button type="button" className="fw-route" onClick={() => onOpenTab('det')}>
        <span className="fw-card-k">Known value</span>
        <b>EVC applies directly</b>
        <span className="fw-route-f notranslate" translate="no">EVC = RefP + DiffV</span>
        <span className="fw-route-go">Open the Deterministic calculator &uarr;</span>
      </button>
      <button type="button" className="fw-route uncertain" onClick={() => onOpenTab('prob')}>
        <span className="fw-card-k">Left to chance</span>
        <b>EVC re-derived in expectation</b>
        <span className="fw-route-f notranslate" translate="no">P(success) × Value − P(failure) × Cost</span>
        <span className="fw-route-go">Open the Probabilistic calculator &uarr;</span>
      </button>
      <figure className="fw-chain-quote">
        <blockquote>Can EVC be applied to gaming? Yes &mdash; but it is trickier than a standard case.</blockquote>
        <figcaption>Guest speaker Dr. Tim Smith, Wiglaf Pricing &mdash; class Q&amp;A, Sept. 2026.</figcaption>
        <button type="button" className="fw-link" onClick={onOpenMath}>Open the mathematics &rarr;</button>
      </figure>
    </div>
  )
}

const TAKEAWAYS: Record<StepId, ReactNode> = {
  who: <>Paying Rate is low not because prices are high, but because most players&rsquo; willingness to pay for extras is zero.</>,
  compare: <>Anchors and compromise effects need known options to compare. A lucky draw has none &mdash; so different psychology takes over.</>,
  value: <>Certain value: EVC applies directly. Chance: re-derive it in expectation.</>,
}

export function ToolkitChain({ onOpenTab, onOpenMath }: { onOpenTab: (t: 'det' | 'prob') => void; onOpenMath: () => void }) {
  const [i, setI] = useState(0)
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const go = (k: number, focus = false) => { const n = Math.max(0, Math.min(2, k)); setI(n); if (focus) refs.current[n]?.focus() }
  const onKey = (e: KeyboardEvent) => {
    const to = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? 2 : null
    if (to === null) return
    e.preventDefault(); go(to, true)
  }
  return (
    <div className="fw-chain">
      <div className="fw-chain-steps" role="tablist" aria-label="Toolkit steps" onKeyDown={onKey}>
        {STEPS.map((s, k) => (
          <button key={s.id} ref={(el) => { refs.current[k] = el }} type="button" role="tab" id={`fw-chain-${s.id}`} aria-controls={`fw-chain-panel-${s.id}`}
            aria-selected={k === i} tabIndex={k === i ? 0 : -1} aria-label={s.label} className={`fw-chain-step ${k === i ? 'on' : ''} ${k < i ? 'done' : ''}`} onClick={() => go(k)}>
            <span className="fw-chain-n" aria-hidden>{s.n}</span>
            <span className="fw-chain-long" aria-hidden>{s.label}</span><span className="fw-chain-short" aria-hidden>{s.short}</span>
          </button>
        ))}
      </div>
      {/* All three panels stay mounted (state kept when switching); only the selected one is shown. */}
      {STEPS.map((s, k) => (
        <div key={s.id} role="tabpanel" id={`fw-chain-panel-${s.id}`} aria-labelledby={`fw-chain-${s.id}`} hidden={k !== i} className="fw-chain-panel">
          <p className="fw-chain-q">{s.question}</p>
          {s.id === 'who' && <WhoPays />}
          {s.id === 'compare' && <Compare />}
          {s.id === 'value' && <Value onOpenTab={onOpenTab} onOpenMath={onOpenMath} />}
          <Takeaway>{TAKEAWAYS[s.id]}</Takeaway>
          {s.id === 'who' && <Disclosure label="Full explanation — willingness to pay"><p>{WTP_PARAGRAPH}</p></Disclosure>}
          {s.id === 'compare' && <Disclosure label="Full explanation — choice architecture"><p>{CHOICE_PARAGRAPH}</p></Disclosure>}
        </div>
      ))}
      <div className="fw-chain-nav">
        <button type="button" className="btn-ghost" onClick={() => go(i - 1)} disabled={i === 0}>&larr; Previous</button>
        <span className="fw-chain-count">{i + 1} / 3</span>
        <button type="button" className="btn-ghost" onClick={() => go(i + 1)} disabled={i === 2}>Next &rarr;</button>
      </div>
    </div>
  )
}
