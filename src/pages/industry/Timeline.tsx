import { useRef, useState } from 'react'
import { HISTORY, ERAS, HISTORY_SOURCES, type Era } from '../../data/industry'
import { PixelIcon } from '../../components/PixelIcon'

export function Timeline() {
  const [i, setI] = useState(0)
  const rail = useRef<HTMLDivElement>(null)
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const go = (n: number, focus = false) => {
    const k = Math.max(0, Math.min(HISTORY.length - 1, n))
    setI(k)
    const el = refs.current[k]
    if (el) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', inline: 'center', block: 'nearest' })
      if (focus) el.focus({ preventScroll: true })
    }
  }
  const m = HISTORY[i]
  return (
    <div>
      <div className="era-legend" aria-hidden>
        {(Object.keys(ERAS) as Era[]).map((e) => (<span key={e}><i className={`era-dot ${e}`} />{ERAS[e]}</span>))}
      </div>
      <div className="tl-wrap">
        <button type="button" className="tl-arrow" aria-label="Previous milestone" disabled={i === 0} onClick={() => go(i - 1, true)}>‹</button>
        <div className="tl-rail" ref={rail} role="tablist" aria-label="Freemium milestones" aria-orientation="horizontal"
          onKeyDown={(e) => { if (e.key === 'ArrowRight') { e.preventDefault(); go(i + 1, true) } if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1, true) } }}>
          <div className="tl-line" aria-hidden />
          {HISTORY.map((h, k) => (
            <button key={h.year} ref={(el) => { refs.current[k] = el }} type="button" role="tab" id={`tl-tab-${k}`} aria-selected={i === k} aria-controls="tl-panel"
              tabIndex={i === k ? 0 : -1} className={`tl-node ${h.era} ${i === k ? 'on' : ''}`} onClick={() => go(k)}>
              <PixelIcon name={h.icon} size={44} />
              <span className="tl-year">{h.year}</span>
              <span className="tl-short">{h.short}</span>
            </button>
          ))}
        </div>
        <button type="button" className="tl-arrow" aria-label="Next milestone" disabled={i === HISTORY.length - 1} onClick={() => go(i + 1, true)}>›</button>
      </div>
      <div className={`tl-panel ${m.era}`} id="tl-panel" role="tabpanel" aria-labelledby={`tl-tab-${i}`} key={i}>
        <div className="tl-panel-head"><span className="tl-panel-year">{m.year}</span><span className="tl-panel-era">{ERAS[m.era]}</span><span className="tl-count">{i + 1} / {HISTORY.length}</span></div>
        <h3>{m.title}</h3>
        <p>{m.body}</p>
        <p className="h-why">{m.lesson}</p>
      </div>
      <p className="game-note">{HISTORY_SOURCES}</p>
    </div>
  )
}
