// Framework (legacy/index.html:711-762) as an interactive pricing workbench.
// Calculations: src/lib/evc.ts. Original text: src/data/framework.tsx (verbatim).
import { useRef, useState, type KeyboardEvent } from 'react'
import { Seal } from '../components/Art'
import { PixelIcon } from '../components/PixelIcon'
import { Takeaway } from '../components/Disclosure'
import { DETERMINISTIC_DEFAULTS, PROBABILISTIC_DEFAULTS } from '../lib/evc'
import { ToolkitChain } from './framework/ToolkitChain'
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
  const smooth = (): ScrollBehavior => (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth')
  // Used by the toolkit chain: jump back up to the workbench with the right tab selected.
  const openTab = (id: TabId) => {
    setTab(id)
    document.getElementById('fw-workbench')?.scrollIntoView?.({ behavior: smooth(), block: 'start' })
    tabRefs.current[id]?.focus({ preventScroll: true })
  }
  // A button, not an "#anchor" link: the site's router uses the URL hash for pages.
  const openMath = () => {
    const d = document.getElementById('fw-math') as HTMLDetailsElement | null
    if (!d) return
    d.open = true
    d.scrollIntoView?.({ behavior: smooth(), block: 'start' })
  }
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
          <p className="kicker">The rest of the toolkit</p>
          <h2 className="sec-title">Why does chance change the pricing problem?</h2>
          <ToolkitChain onOpenTab={openTab} onOpenMath={openMath} />
        </div>
      </section>
    </div>
  )
}
