import { useState } from 'react'
import { MODELS, type Kind } from '../../data/industry'
import { PixelIcon } from '../../components/PixelIcon'

const ZONES: Kind[] = ['Deterministic', 'Either', 'Probabilistic']

export function Models() {
  const [id, setId] = useState('loot')
  const m = MODELS.find((x) => x.id === id)!
  return (
    <div>
      <div className="model-grid" aria-label="Seven monetization models">
        {MODELS.map((x) => (
          <button key={x.id} type="button" aria-pressed={x.id === id} className={`model-btn ${x.id === id ? 'on' : ''}`} onClick={() => setId(x.id)}>
            <PixelIcon name={x.icon} size={40} />
            <span>{x.label}</span>
          </button>
        ))}
      </div>
      <div className="model-detail" key={id} aria-live="polite">
        <div className="model-detail-main">
          <div className="model-detail-top">
            <PixelIcon name={m.icon} size={56} />
            <div>
              <span className={`badge ${m.kind === 'Deterministic' ? 'solid' : 'outline'}`} style={m.kind === 'Either' ? { borderStyle: 'solid' } : undefined}>{m.kind}</span>
              <h3>{m.label}</h3>
            </div>
          </div>
          <dl>
            <dt>How it generates revenue</dt>
            <dd>{m.how}</dd>
            <dt>Example &amp; evidence</dt>
            <dd className="mono-note">{m.example}</dd>
          </dl>
        </div>
        <div className="continuum" aria-label={`Classification: ${m.kind}. A qualitative continuum, not a numerical scale.`}>
          <div className="continuum-bar">
            {ZONES.map((z) => (<div key={z} className={`zone ${z === m.kind ? 'on' : ''}`}><span>{z}</span></div>))}
          </div>
          <p className="game-note">Default classification only — a qualitative continuum, not a scale. “Either” means it can be built on a fixed price or a chance.</p>
        </div>
      </div>
    </div>
  )
}
