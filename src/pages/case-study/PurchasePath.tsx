// Section 02 · "Where does the randomness end?" — a five-step purchase path.
// Each step shows the two cells of the ORIGINAL comparison table that describe it, so no mechanic is
// added. The step state is owned by the page, so the full table below can highlight the same row.
import { useRef, type KeyboardEvent, type ReactNode } from 'react'
import { COMPARE } from '../../data/caseStudy'

export interface PathStep { id: string; label: string; question: string; row: string }
export const STEPS: PathStep[] = [
  { id: 'pay', label: 'Pay', question: 'What do you pay with?', row: 'pay' },
  { id: 'draw', label: 'Draw', question: 'What are the odds on the first try?', row: 'odds' },
  { id: 'miss', label: 'Miss', question: 'You missed. What happens to the odds?', row: 'change' },
  { id: 'guarantee', label: 'Guarantee', question: 'When is a win guaranteed?', row: 'guarantee' },
  { id: 'prize', label: 'What you get', question: 'What exactly do you win?', row: 'win' },
]

/**
 * What chance decides, and what it doesn't, in each game — from the original "key difference" callout
 * and the "What you win" table row.
 */
const SUMMARY: { game: string; chance: string[]; known: string }[] = [
  { game: 'Honor of Kings', chance: ['How much you pay'], known: 'What you get — you choose the skin' },
  { game: 'Where Winds Meet', chance: ['How much you pay', 'Whether you get it, until the guarantee'], known: 'Which outfit — the studio chose it' },
]

export function PurchasePath({ step, setStep }: { step: number; setStep: (i: number) => void }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const s = STEPS[step]
  const row = COMPARE.find((r) => r.id === s.row)!
  const go = (i: number, focus = false) => {
    const k = Math.max(0, Math.min(STEPS.length - 1, i))
    setStep(k)
    if (focus) refs.current[k]?.focus()
  }
  const onKey = (e: KeyboardEvent) => {
    const to = e.key === 'ArrowRight' ? step + 1 : e.key === 'ArrowLeft' ? step - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? STEPS.length - 1 : null
    if (to === null) return
    e.preventDefault()
    go(to, true)
  }
  const side = (game: string, tone: string, text: ReactNode) => (
    <div className={`cs-side ${tone}`}>
      <span className="cs-side-k">{game}</span>
      <p>{text}</p>
    </div>
  )

  return (
    <div className="cs-path">
      <div className="cs-rail" role="tablist" aria-label="Steps of a lucky-draw purchase" onKeyDown={onKey}>
        <span className="cs-rail-line" aria-hidden><span style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }} /></span>
        {STEPS.map((x, i) => (
          <button key={x.id} ref={(el) => { refs.current[i] = el }} type="button" role="tab" id={`cs-step-${x.id}`}
            aria-selected={i === step} aria-controls="cs-step-panel" tabIndex={i === step ? 0 : -1}
            className={`cs-node ${i === step ? 'on' : ''} ${i < step ? 'done' : ''}`} onClick={() => go(i)}>
            <span className="cs-node-dot" aria-hidden>{i + 1}</span>
            <span className="cs-node-label">{x.label}</span>
          </button>
        ))}
      </div>

      <div className="cs-step" id="cs-step-panel" role="tabpanel" aria-labelledby={`cs-step-${s.id}`} key={s.id}>
        <p className="cs-step-q"><span className="cs-step-n">Step {step + 1} of {STEPS.length}</span>{s.question}</p>
        <div className="cs-pair">
          {side('Honor of Kings · 积分夺宝', 'solid', row.hok)}
          {side('Where Winds Meet · Echo gacha', 'outline', row.wwm)}
        </div>
        {row.why && <p className="cs-why"><span className="cs-why-k">Why it matters</span>{row.why}{row.whySource && <span className="cs-src"> &mdash; {row.whySource}</span>}</p>}
        {s.id === 'guarantee' && <p className="cs-step-note">The guarantee rules are as reported by the sources; see the source note under the probability chart below.</p>}
      </div>

      <div className="cs-step-nav">
        <button type="button" className="btn-ghost" onClick={() => go(step - 1)} disabled={step === 0}>&larr; Previous step</button>
        <button type="button" className="btn-ghost" onClick={() => go(0)} disabled={step === 0}>Reset</button>
        <button type="button" className="btn-ghost" onClick={() => go(step + 1)} disabled={step === STEPS.length - 1}>Next step &rarr;</button>
      </div>

      {/* The visual that states the key difference; the sentence version is the callout below (NORMAL only). */}
      <h3 className="cs-open-title" id="cs-key-difference">The key difference</h3>
      <div className="cs-open" role="group" aria-labelledby="cs-key-difference">
        {SUMMARY.map((g) => (
          <div key={g.game} className="cs-open-game">
            <span className="cs-open-k">{g.game}</span>
            <span className="cs-open-l">Chance decides</span>
            {g.chance.map((c) => <span key={c} className="cs-chip-u on">? {c}</span>)}
            <span className="cs-open-l">Not left to chance</span>
            <span className="cs-chip-u off">✓ {g.known}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
