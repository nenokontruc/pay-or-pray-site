// Diagnostic (legacy/index.html:878-946): the original 2×2 risk framework, made selectable.
// Classification rule and all cell text are unchanged; see src/data/diagnostic.tsx.
import { useRef, useState, type KeyboardEvent } from 'react'
import { Disclosure, Takeaway } from '../components/Disclosure'
import { PixelIcon } from '../components/PixelIcon'
import { CELLS, COL_HEADS, EXAMPLES, ROW_LABELS, classify, type CellId, type ValueKind } from '../data/diagnostic'
import './diagnostic/diagnostic.css'

const ORDER: CellId[] = ['low', 'mod', 'high', 'vhigh'] // reading order: row 1 left→right, row 2 left→right

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
  // Arrow keys move between the four positions, like a grid.
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
        className={`mx-cell ${id} ${on ? 'on' : ''}`} data-cell={id} onClick={() => chooseCell(id)} onKeyDown={(e) => onKey(e, id)}>
        <span className="risk">{c.risk}</span>
        <h4>{c.title}</h4>
        <p>{c.text}</p>
      </button>
    )
  }

  return (
    <div className="dx">
      <div className="wrap-wide page-hero">
        <div className="page-hero-grid">
          <div>
            <p className="kicker">Diagnostic Framework</p>
            <h1 className="page-title">Where any freemium good lands</h1>
            <p className="page-lede">Two questions place any purchasable good in one of four risk positions — before a single price is set.</p>
          </div>
          <div className="page-hero-art dx-hero-art" aria-hidden><PixelIcon name="scales" size={96} /></div>
        </div>
      </div>

      <section className="block slide">
        <div className="wrap-wide">
          <div className="dx-layout">
            <div className="dx-controls">
              <fieldset className="dx-q">
                <legend>1 &middot; Is the item&rsquo;s value known before purchase?</legend>
                <label className={`chip ${value === 'det' ? 'on' : ''}`}><input type="radio" name="dx-value" checked={value === 'det'} onChange={() => choose('det', power)} />Yes &mdash; deterministic</label>
                <label className={`chip ${value === 'prob' ? 'on' : ''}`}><input type="radio" name="dx-value" checked={value === 'prob'} onChange={() => choose('prob', power)} />No &mdash; left to chance</label>
              </fieldset>
              <fieldset className="dx-q">
                <legend>2 &middot; Does it change competitive power?</legend>
                <label className={`chip ${!power ? 'on' : ''}`}><input type="radio" name="dx-power" checked={!power} onChange={() => choose(value, false)} />No &mdash; cosmetic</label>
                <label className={`chip ${power ? 'on' : ''}`}><input type="radio" name="dx-power" checked={power} onChange={() => choose(value, true)} />Yes &mdash; power-affecting</label>
              </fieldset>
              <div className="dx-examples">
                <span className="dx-k">Or pick an example</span>
                {(['Case study', 'Simulation package'] as const).map((grp) => (
                  <div key={grp} className="dx-ex-group" role="group" aria-label={`${grp} examples`}>
                    <span className="dx-ex-label">{grp}</span>
                    {EXAMPLES.filter((e) => e.group === grp).map((e) => (
                      <button key={e.id} type="button" className={`chip ${example === e.id ? 'on' : ''}`} aria-pressed={example === e.id} data-example={e.id}
                        onClick={() => choose(e.value, e.power, e.id)}>{e.label}</button>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="dx-matrix">
              <div className="mx-cols"><div className="col-head">{COL_HEADS.det}</div><div className="col-head">{COL_HEADS.prob}</div></div>
              <div role="radiogroup" aria-label="Risk positions (use arrow keys)">
                <div className="row-label"><span>{ROW_LABELS.cosmetic}</span><div className="line" /></div>
                <div className="mx-cols">{cellBtn('low')}{cellBtn('mod')}</div>
                <div className="row-label"><span>{ROW_LABELS.power}</span><div className="line" /></div>
                <div className="mx-cols">{cellBtn('high')}{cellBtn('vhigh')}</div>
              </div>
              <p className="dx-diag" aria-hidden>&#8600; risk rises along the diagonal</p>
            </div>
          </div>

          <div className="dx-detail" aria-live="polite" data-selected={cell.id}>
            <div className="dx-detail-head">
              <span className={`dx-badge ${cell.id}`}>{cell.risk}</span>
              <h3>{cell.title}</h3>
              <span className="dx-pos">{COL_HEADS[cell.value].toLowerCase()} &middot; {(cell.power ? ROW_LABELS.power : ROW_LABELS.cosmetic).toLowerCase()}</span>
            </div>
            {ex && <p className="dx-ex-note"><b>{ex.label}:</b> {ex.note}</p>}
            <dl>
              {cell.choice && <><dt>Choice architecture</dt><dd>{cell.choice}</dd></>}
              <dt>Primary risk</dt><dd>{cell.primaryRisk}</dd>
              <dt>Implication</dt><dd>{cell.implication}</dd>
            </dl>
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
                  <tr key={c.id}><td>{c.title}</td><td>{c.value === 'det' ? 'Deterministic' : 'Probabilistic'}</td><td>{c.power ? 'Power-affecting' : 'Cosmetic / non-power'}</td><td>{c.risk}</td><td>{c.text}</td></tr>
                ))}</tbody>
              </table>
            </div>
          </Disclosure>
        </div>
      </section>
    </div>
  )
}
