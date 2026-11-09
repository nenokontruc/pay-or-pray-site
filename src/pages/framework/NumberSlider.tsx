// A slider and a number box that always show the same value.
// Typing an invalid or out-of-range number shows a message and leaves the value unchanged.
import { useId, useState } from 'react'

interface Props {
  label: string
  sub: string
  min: number
  max: number
  step: number
  value: number
  onChange: (v: number) => void
  /** Shown before the number box, e.g. "$"; or after it, e.g. "%". */
  prefix?: string
  suffix?: string
}

const show = (v: number) => String(Math.round(v * 10000) / 10000)

export function NumberSlider({ label, sub, min, max, step, value, onChange, prefix, suffix }: Props) {
  const id = useId()
  const [text, setText] = useState(show(value))
  const [error, setError] = useState('')
  // Keep the box in step with outside changes (slider moves, reset) without fighting the user's typing.
  const [seen, setSeen] = useState(value)
  if (seen !== value) { setSeen(value); setText(show(value)); setError('') }

  const fromBox = (raw: string) => {
    setText(raw)
    const v = raw.trim() === '' ? NaN : Number(raw)
    if (!Number.isFinite(v)) { setError(`Enter a number from ${min} to ${max}.`); return }
    if (v < min || v > max) { setError(`Enter a number from ${min} to ${max}.`); return }
    setError('')
    setSeen(v)
    onChange(v)
  }

  return (
    <div className="fw-field">
      <label className="fw-label" htmlFor={`${id}-range`}><b>{label}</b> <span>({sub})</span></label>
      <div className="fw-field-row">
        <input id={`${id}-range`} type="range" min={min} max={max} step={step} value={value}
          aria-valuetext={`${prefix ?? ''}${show(value)}${suffix ?? ''}`}
          onChange={(e) => { const v = Number(e.target.value); setText(show(v)); setError(''); setSeen(v); onChange(v) }} />
        <span className={`fw-box ${error ? 'bad' : ''}`}>
          {prefix && <span aria-hidden>{prefix}</span>}
          <input type="number" inputMode="decimal" min={min} max={max} step="any" value={text}
            aria-label={`${label} (${sub})${prefix ? ', in dollars' : ''}${suffix === '%' ? ', in percent' : ''}`}
            aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined}
            onChange={(e) => fromBox(e.target.value)} onBlur={() => { setText(show(value)); setError('') }} />
          {suffix && <span aria-hidden>{suffix}</span>}
        </span>
      </div>
      <div className="fw-range-note">{error ? <span id={`${id}-err`} role="alert" className="fw-err">{error}</span> : <>Range {prefix}{min}{suffix} to {prefix}{max}{suffix}</>}</div>
    </div>
  )
}
