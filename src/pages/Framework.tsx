// Framework (legacy/index.html:711-762) as an interactive pricing workbench.
// Calculations: src/lib/evc.ts. Original text: src/data/framework.tsx (verbatim).
import { useRef, useState, type KeyboardEvent } from 'react'
import { Seal } from '../components/Art'
import { PixelIcon } from '../components/PixelIcon'
import { Disclosure, Takeaway } from '../components/Disclosure'
import { DETERMINISTIC_DEFAULTS, PROBABILISTIC_DEFAULTS } from '../lib/evc'
import { CHOICE_PARAGRAPH, WTP_PARAGRAPH } from '../data/framework'
import { DeterministicTab, type DetState } from './framework/DeterministicTab'
import { ProbabilisticTab, type ProbState } from './framework/ProbabilisticTab'
import { MathPanel } from './framework/MathPanel'
import './framework/framework.css'

type TabId = 'det' | 'prob'
const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'det', label: 'Deterministic Goods', icon: 'gem' },
  { id: 'prob', label: 'Probabilistic Goods', icon: 'capsule' },
]

export default function Framework() {
  const [tab, setTab] = useState<TabId>('det')
  const [det, setDet] = useState<DetState>({ ...DETERMINISTIC_DEFAULTS })
  const [prob, setProb] = useState<ProbState>({ ...PROBABILISTIC_DEFAULTS })
  const tabRefs = useRef<Record<TabId, HTMLButtonElement | null>>({ det: null, prob: null })
  const go = (id: TabId) => { setTab(id); tabRefs.current[id]?.focus() }
  const onKey = (e: KeyboardEvent) => {
    const i = TABS.findIndex((t) => t.id === tab)
    const next = e.key === 'ArrowRight' ? TABS[(i + 1) % 2] : e.key === 'ArrowLeft' ? TABS[(i + 1) % 2] : e.key === 'Home' ? TABS[0] : e.key === 'End' ? TABS[1] : null
    if (next) { e.preventDefault(); go(next.id) }
  }

  return (
    <div className="fw">
      <div className="wrap-wide page-hero">
        <div className="page-hero-grid">
          <div>
            <p className="kicker">Framework</p>
            <h1 className="page-title">Two ways to value an in-game item</h1>
            <p className="page-lede">The same economic question, two different pricing mechanisms.</p>
          </div>
          <div className="page-hero-art fw-hero-art" aria-hidden><Seal size={110} /></div>
        </div>
      </div>

      <section className="block slide" id="fw-workbench">
        <div className="wrap-wide">
          <div className="fw-bench">
            <div className="fw-tabs" role="tablist" aria-label="Type of good" onKeyDown={onKey}>
              {TABS.map((t) => (
                <button key={t.id} ref={(el) => { tabRefs.current[t.id] = el }} type="button" role="tab" id={`fw-tab-${t.id}`}
                  aria-selected={tab === t.id} aria-controls={`fw-panel-${t.id}`} tabIndex={tab === t.id ? 0 : -1}
                  className={`fw-tab ${tab === t.id ? 'on' : ''}`} onClick={() => setTab(t.id)}>
                  <span className="fw-tab-icon" aria-hidden><PixelIcon name={t.icon} size={28} /></span>{t.label}
                </button>
              ))}
            </div>
            {/* Both panels stay mounted so each keeps its values when you switch tabs. */}
            <div role="tabpanel" id="fw-panel-det" aria-labelledby="fw-tab-det" hidden={tab !== 'det'}>
              <DeterministicTab s={det} set={setDet} reset={() => setDet({ ...DETERMINISTIC_DEFAULTS })} />
            </div>
            <div role="tabpanel" id="fw-panel-prob" aria-labelledby="fw-tab-prob" hidden={tab !== 'prob'}>
              <ProbabilisticTab s={prob} set={setProb} reset={() => setProb({ ...PROBABILISTIC_DEFAULTS })} />
            </div>
          </div>
          <MathPanel det={det} prob={prob} />
          <Takeaway>Same question &mdash; what is the item worth to the player? When the good is certain, EVC applies directly; when it is left to chance, EVC has to be re-derived in expectation.</Takeaway>
        </div>
      </section>

      <section className="block slide" id="fw-toolkit">
        <div className="wrap-wide">
          <h2 className="sec-title">The rest of the toolkit</h2>
          <div className="fw-cards">
            <article className="fw-card">
              <span className="fw-card-k">Willingness-to-pay &amp; price response</span>
              <div className="fw-card-formula notranslate" translate="no">d(p) = D·(1 − W(p))</div>
              <p>Paying Rate = P(wtp ≥ p): the share of players whose willingness to pay exceeds the price.</p>
              <p className="fw-card-ex"><b>56%</b> of players spend nothing on games in a year (Newzoo).</p>
              <Disclosure label="Full explanation"><p>{WTP_PARAGRAPH}</p></Disclosure>
            </article>
            <article className="fw-card">
              <span className="fw-card-k">Choice architecture</span>
              <div className="fw-card-vs">
                <div><b>Fixed-price shop</b><span>Compromise &amp; anchor effects</span></div>
                <div><b>Gacha</b><span>Near-miss, sunk-cost escalation, pity-timer anchoring</span></div>
              </div>
              <p>Anchors need a set of known-value alternatives to compare &mdash; a lucky draw has none.</p>
              <Disclosure label="Full explanation"><p>{CHOICE_PARAGRAPH}</p></Disclosure>
            </article>
            <article className="fw-card">
              <span className="fw-card-k">EVC and gaming</span>
              <p className="fw-quote">Can EVC be applied to gaming? Yes &mdash; but it is trickier than a standard case.</p>
              <p className="fw-card-ex">Guest speaker Dr. Tim Smith, Wiglaf Pricing &mdash; class Q&amp;A, Sept. 2026.</p>
              <p>That is why the probabilistic tab re-derives EVC in expectation, and why the full mathematics sits one click away.</p>
              {/* A button, not an "#anchor" link: the site's router uses the URL hash for pages. */}
              <button type="button" className="fw-link" onClick={() => {
                const d = document.getElementById('fw-math') as HTMLDetailsElement | null
                if (!d) return
                d.open = true
                const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
                d.scrollIntoView?.({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
              }}>Open the mathematics &rarr;</button>
            </article>
          </div>
        </div>
      </section>
    </div>
  )
}
