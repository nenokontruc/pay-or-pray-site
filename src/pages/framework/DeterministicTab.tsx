// Tab A — deterministic goods: EVC = RefP + DiffV. All numbers come from src/lib/evc.ts.
import { DisplayCase } from '../../components/Art'
import { DIFFV_RANGE, REFP_RANGE, deterministicEVC, money } from '../../lib/evc'
import { NumberSlider } from './NumberSlider'

export interface DetState { refP: number; diffV: number }

export function DeterministicTab({ s, set, reset }: { s: DetState; set: (s: DetState) => void; reset: () => void }) {
  const evc = deterministicEVC(s.refP, s.diffV)
  // Segmented bar: RefP, then DiffV added (or subtracted) at its end.
  const scale = Math.max(s.refP, evc, s.refP + Math.max(0, s.diffV), 1)
  const pct = (v: number) => `${(Math.max(0, v) / scale) * 100}%`
  const kept = Math.max(0, Math.min(s.refP, evc))
  return (
    <div className="fw-work">
      <div className="fw-inputs">
        <div className="fw-formula" aria-label="EVC equals RefP plus DiffV"><i>EVC</i> = <b>RefP</b> + <b>DiffV</b></div>
        <p className="fw-lead">The maximum defensible price: the next-best reference price, plus the extra value it adds.</p>
        <NumberSlider label="RefP" sub="reference price" {...REFP_RANGE} value={s.refP} prefix="$" onChange={(refP) => set({ ...s, refP })} />
        <NumberSlider label="DiffV" sub="added value" {...DIFFV_RANGE} value={s.diffV} prefix="$" onChange={(diffV) => set({ ...s, diffV })} />
        <p className="fw-hint">DiffV can be negative when the item is worse than the alternative on what the customer values.</p>
        <div className="fw-actions"><button type="button" className="btn-ghost" onClick={reset}>Reset to $10 + $5</button><span className="fw-tag">Illustrative values</span></div>
      </div>
      <div className="fw-result" aria-live="polite">
        <div className="fw-result-head">
          <div>
            <span className="fw-result-k">Expected value to customer (EVC)</span>
            <div className="fw-big" data-testid="det-evc">{money(evc)}</div>
          </div>
          <div className="fw-art" aria-hidden><DisplayCase /></div>
        </div>
        <div className="fw-bar" role="img" aria-label={`Reference price ${money(s.refP)} ${s.diffV >= 0 ? 'plus' : 'minus'} ${money(Math.abs(s.diffV))} gives EVC ${money(evc)}`}>
          <span className="seg ref" style={{ width: pct(kept) }} />
          {s.diffV >= 0
            ? <span className="seg add" style={{ width: pct(s.diffV) }} />
            : <span className="seg sub" style={{ width: pct(s.refP - kept) }} />}
        </div>
        <div className="fw-bar-legend">
          <span><i className="sw ref" />RefP {money(s.refP)}</span>
          <span><i className={`sw ${s.diffV >= 0 ? 'add' : 'sub'}`} />DiffV {s.diffV >= 0 ? '+' : '−'}{money(Math.abs(s.diffV))}</span>
          <span><b>= EVC {money(evc)}</b></span>
        </div>
        <p className="fw-interp" data-testid="det-interp">
          {evc > 0
            ? <>The modeled value-based price ceiling is <b>{money(evc)}</b>. Compared with a {money(s.refP)} alternative, no customer would rationally pay more &mdash; but the ceiling is not necessarily the profit-maximizing price.</>
            : <>EVC is <b>{money(evc)}</b>: compared with the {money(s.refP)} alternative, no positive price is defensible.</>}
        </p>
      </div>
    </div>
  )
}
