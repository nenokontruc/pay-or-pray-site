// Seven monetization models, grouped by their default classification. Three separate groups (not a
// left-to-right scale), so no continuum is implied. All seven descriptions stay in the page.
import { useState } from 'react'
import { MODELS, type Kind } from '../../data/industry'
import { PixelIcon } from '../../components/PixelIcon'
import { Disclosure } from '../../components/Disclosure'

const GROUPS: { kind: Kind; title: string; note: string }[] = [
  { kind: 'Deterministic', title: 'Deterministic', note: 'You know what you get' },
  { kind: 'Probabilistic', title: 'Probabilistic', note: 'You pay for a chance' },
  { kind: 'Either', title: 'Either', note: 'Can be built on a fixed price or a chance' },
]

export function Models() {
  const [id, setId] = useState('loot')
  const m = MODELS.find((x) => x.id === id)!
  return (
    <div>
      <div className="ind-model-groups" aria-label="Seven monetization models, by default classification">
        {GROUPS.map((g) => (
          <div key={g.kind} className={`ind-model-group ${g.kind.toLowerCase()}`} role="group" aria-label={`${g.title}: ${g.note}`}>
            <div className="ind-group-head"><span className={`badge ${g.kind === 'Deterministic' ? 'solid' : 'outline'}`} style={g.kind === 'Either' ? { borderStyle: 'solid' } : undefined}>{g.title}</span><span>{g.note}</span></div>
            <div className="ind-group-btns">
              {MODELS.filter((x) => x.kind === g.kind).map((x) => (
                <button key={x.id} type="button" aria-pressed={x.id === id} className={`model-btn ${x.id === id ? 'on' : ''}`} data-model={x.id} onClick={() => setId(x.id)}>
                  <PixelIcon name={x.icon} size={36} />
                  <span>{x.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="model-detail ind-model-detail" key={id} aria-live="polite" data-selected={id}>
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
            <dt className="present-hide">Example &amp; evidence</dt>
            <dd className="mono-note present-hide">{m.example}</dd>
          </dl>
        </div>
      </div>
      <p className="game-note">Default classification only &mdash; three categories, not a scale. &ldquo;Either&rdquo; means it can be built on a fixed price or a chance.</p>
      <Disclosure label="All seven models (text version)">
        <ul className="ind-model-list">
          {MODELS.map((x) => (
            <li key={x.id}><b>{x.label}</b> <span className="ind-kind">{x.kind}</span><p>{x.how}</p><span className="mono-note">{x.example}</span></li>
          ))}
        </ul>
      </Disclosure>
    </div>
  )
}
