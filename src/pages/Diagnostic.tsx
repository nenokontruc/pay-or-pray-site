// Diagnostic (legacy/index.html:878-946), matrix-first. Select → Locate → Understand → Explore evidence.
// Classification rule and all original cell text are unchanged (src/data/diagnostic.tsx).
import { useRef, useState, type KeyboardEvent } from 'react'
import { Disclosure, Takeaway } from '../components/Disclosure'
import { PixelIcon } from '../components/PixelIcon'
import { CELLS, CERTAINTY, COL_HEADS, EXAMPLES, ROW_LABELS, classify, type CellId, type ValueKind } from '../data/diagnostic'
import './diagnostic/diagnostic.css'

const ORDER: CellId[] = ['low', 'mod', 'high', 'vhigh'] // reading order: A B / C D

function YesNo({ name, legend, hint, value, onChange }: { name: string; legend: string; hint: string; value: boolean; onChange: (yes: boolean) => void }) {
  return (
    <fieldset className="dx-q">
      <legend>{legend}</legend>
      <div className="dx-yn" role="radiogroup" aria-label={legend}>
        <label className={value ? 'on' : ''}><input type="radio" name={name} checked={value} onChange={() => onChange(true)} />Yes</label>
        <label className={!value ? 'on' : ''}><input type="radio" name={name} checked={!value} onChange={() => onChange(false)} />No</label>
      </div>
      <p className="dx-hint">{hint}</p>
    </fieldset>
  )
}

export default function Diagnostic() {
  const [value, setValue] = useState<ValueKind>('det')
  const [power, setPower] = useState(false)
  const [example, setExample] = useState<string | null>(null)
  const cellRefs = useRef<Record<CellId, HTMLButtonElement | null>>({ low: null, mod: null, high: null, vhigh: null })
  const selected = classify(value, power)
  const cell = CELLS.find((c) => c.id === selected)!
  const ex = EXAMPLES.find((e) => e.id === example) ?? null

  const choose = (v: ValueKind, p: boolean, exId: string | null = null) => { setValue(v); setPower(p); setExample(exId) }
  const chooseCell = (id: CellId, focus = false) => {
    const c = CELLS.find((x) => x.id === id)!
    choose(c.value, c.power)
    if (focus) cellRefs.current[id]?.focus()
  }
  const onKey = (e: KeyboardEvent, id: CellId) => {
    const i = ORDER.indexOf(id), row = Math.floor(i / 2), col = i % 2
    const to = e.key === 'ArrowRight' ? [row, 1] : e.key === 'ArrowLeft' ? [row, 0] : e.key === 'ArrowDown' ? [1, col] : e.key === 'ArrowUp' ? [0, col] : null
    if (!to) return
    e.preventDefault()
    chooseCell(ORDER[to[0] * 2 + to[1]], true)
  }
  const cellBtn = (id: CellId) => {
    const c = CELLS.find((x) => x.id === id)!
    const on = id === selected
    return (
      <button key={id} ref={(el) => { cellRefs.current[id] = el }} type="button" role="radio" aria-checked={on} tabIndex={on ? 0 : -1}
        aria-label={`Position ${c.pos}: ${c.title}, ${c.risk}`}
        className={`mx-cell ${id} ${on ? 'on' : ''}`} data-cell={id} onClick={() => chooseCell(id)} onKeyDown={(e) => onKey(e, id)}>
        <span className="dx-cell-top" aria-hidden><span className="dx-pos">{c.pos}</span><PixelIcon name={c.icon} size={22} /></span>
        <span className="risk">{c.risk}</span>
        <h4>{c.title}</h4>
        <p>{c.text}</p>
      </button>
    )
  }
  const q1 = value === 'det' ? 'Yes' : 'No', q2 = power ? 'Yes' : 'No'

  return (
    <div className="dx">
      <div className="wrap-wide page-hero">
        <div className="page-hero-grid">
          <div>
            <p className="kicker">Diagnostic Framework</p>
            <h1 className="page-title">Where does your monetization design fall?</h1>
            <p className="page-lede">Answer two questions to understand its pricing and player-risk implications.</p>
          </div>
          <div className="page-hero-art dx-hero-art" aria-hidden><PixelIcon name="scales" size={96} /></div>
        </div>
      </div>

      <section className="block slide">
        <div className="wrap-wide">
          <div className="dx-bench">
            <div className="dx-qs">
              <YesNo name="dx-q1" legend="1 · Is the item’s value known before purchase?" hint="Yes = deterministic value · No = left to chance"
                value={value === 'det'} onChange={(yes) => choose(yes ? 'det' : 'prob', power)} />
              <YesNo name="dx-q2" legend="2 · Does it change competitive power?" hint="No = cosmetic · Yes = power-affecting"
                value={power} onChange={(yes) => choose(value, yes)} />
              <button type="button" className="dx-reset" onClick={() => choose('det', false)}>Reset</button>
            </div>

            <div className="dx-matrix">
              <div className="dx-matrix-head">
                <h2 className="dx-h2">Where any freemium good lands</h2>
                <p className="dx-sub">Two questions place any purchasable good in one of four risk positions — before a single price is set.</p>
              </div>
              <div className="dx-grid" role="radiogroup" aria-label="Risk positions (arrow keys move between them)">
                <span className="dx-corner" aria-hidden />
                {(['det', 'prob'] as ValueKind[]).map((v) => (
                  <div key={v} className={`col-head ${v === value ? 'on' : ''}`} data-col={v}>
                    {COL_HEADS[v]}{v === value && <span className="dx-ans">Q1 · {q1}</span>}
                  </div>
                ))}
                <div className={`row-label ${!power ? 'on' : ''}`} data-row="cosmetic"><span>{ROW_LABELS.cosmetic}</span>{!power && <span className="dx-ans">Q2 · {q2}</span>}</div>
                {cellBtn('low')}{cellBtn('mod')}
                <div className={`row-label ${power ? 'on' : ''}`} data-row="power"><span>{ROW_LABELS.power}</span>{power && <span className="dx-ans">Q2 · {q2}</span>}</div>
                {cellBtn('high')}{cellBtn('vhigh')}
              </div>
              <p className="dx-diag" aria-hidden>&#8600; risk rises along the diagonal, from A to D</p>
            </div>
          </div>

          <div className="dx-examples" role="group" aria-label="Try an example">
            <span className="dx-k">Try an example</span>
            {(['Case study', 'Simulation package'] as const).map((grp) => (
              <span key={grp} className="dx-ex-group">
                <span className="dx-ex-label">{grp}</span>
                {EXAMPLES.filter((e) => e.group === grp).map((e) => (
                  <button key={e.id} type="button" className={`chip ${example === e.id ? 'on' : ''}`} aria-pressed={example === e.id} data-example={e.id}
                    onClick={() => choose(e.value, e.power, e.id)}>{e.label}</button>
                ))}
              </span>
            ))}
          </div>

          <div className="dx-detail" aria-live="polite" data-selected={cell.id}>
            <div className="dx-detail-head">
              <span className="dx-pos big" aria-hidden>{cell.pos}</span>
              <h3>{cell.title}</h3>
              <span className={`dx-badge ${cell.id}`}>{cell.risk}</span>
            </div>
            {ex && (
              <div className="dx-ex-box" data-testid="example-result">
                <p className="dx-ex-note"><b>{ex.label}</b> &mdash; why here: {ex.note}</p>
                <p className="dx-ex-pricing"><span className="dx-field-k">Pricing implication</span>{ex.pricing} <span className="dx-src">({ex.pricingSource})</span></p>
              </div>
            )}
            <dl className="dx-fields">
              <div><dt>Value certainty</dt><dd>{CERTAINTY[cell.value]}</dd></div>
              <div><dt>Spending pressure</dt><dd>{cell.spending}</dd></div>
              <div><dt>Principal risk</dt><dd>{cell.primaryRisk}</dd></div>
              <div><dt>Operational implication</dt><dd>{cell.implication}</dd></div>
            </dl>
            <p className="dx-screen"><b>A screening tool, not a score.</b> The framework compares designs by two questions; the risk labels are ordinal positions, not a statistically validated measurement.</p>
          </div>

          <Takeaway>Freemium &ldquo;makes sense&rdquo; when a design deliberately stays in the top row &mdash; and, if it uses chance, prices it with the tools built for chance.</Takeaway>

          <Disclosure label="Reading the matrix">
            <div className="prose">
              <h2 className="sec-title">Reading the matrix</h2>
              <p>The diagonal from top-left to bottom-right is the one that matters most: it runs from the safest commercial position (known goods, no power) to the position regulators are actively targeting (chance-based goods that also confer competitive advantage). Both case-study games straddle the top row: their skin shops sit in the top-left cell (Honor of Kings right at its lower edge, given its small skin stat bonuses), and their lucky draws sit one cell over, in moderate risk — because removing power from a probabilistic mechanic reduces but does not eliminate its regulatory exposure. Honor of Kings' draw sits closer to the left edge of that cell than Where Winds Meet's, because players choose the final prize.</p>
              <p>Freemium "makes sense," in the terms this project set out to answer, when a design deliberately stays in the top row — and when, if it does use a probabilistic mechanic, the Choice Architecture and EVC model applied to it are the ones built for chance, not the ones built for certainty.</p>
              <p>How costly each cell is also depends on the market. Players in China have historically accepted paid power far more than Western players, so the same item can sit in a more dangerous position in the US than in China &mdash; a difference the <a href="#simulation">Simulation</a> lets you test.</p>
            </div>
          </Disclosure>
          <Disclosure label="Text version of the matrix">
            <div className="table-scroll">
              <table className="data-table">
                <thead><tr><th>Position</th><th>Value</th><th>Power</th><th>Risk</th><th>Explanation</th></tr></thead>
                <tbody>{CELLS.map((c) => (
                  <tr key={c.id}><td>{c.pos} · {c.title}</td><td>{c.value === 'det' ? 'Deterministic' : 'Probabilistic'}</td><td>{c.power ? 'Power-affecting' : 'Cosmetic / non-power'}</td><td>{c.risk}</td><td>{c.text}</td></tr>
                ))}</tbody>
              </table>
            </div>
          </Disclosure>
        </div>
      </section>
    </div>
  )
}
