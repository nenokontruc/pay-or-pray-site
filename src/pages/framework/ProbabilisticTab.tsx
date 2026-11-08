// Tab B — probabilistic goods: EVC(gacha) = P(success)·Value − P(failure)·Cost. Numbers from src/lib/evc.ts.
import { Gashapon } from '../../components/Art'
import { COST_RANGE, P_RANGE_PCT, VALUE_RANGE, gachaEVC, money } from '../../lib/evc'
import { NumberSlider } from './NumberSlider'

export interface ProbState { pSuccessPct: number; value: number; cost: number }
const pc = (p: number) => `${(Math.round(p * 1e6) / 1e4).toString()}%`

export function ProbabilisticTab({ s, set, reset }: { s: ProbState; set: (s: ProbState) => void; reset: () => void }) {
  const r = gachaEVC(s.pSuccessPct / 100, s.value, s.cost)
  const scale = Math.max(r.gain, r.loss, 0.01)
  const w = (v: number) => `${(v / scale) * 50}%`
  return (
    <div className="fw-work">
      <div className="fw-inputs">
        <div className="fw-formula small" aria-label="EVC of gacha equals P success times Value minus P failure times Cost">
          <i>EVC</i>(gacha) = <b>P(success)</b> &times; Value &minus; <b>P(failure)</b> &times; Cost
        </div>
        <p className="fw-lead">Expected gain from success, minus the expected sunk cost of failing &mdash; for one attempt at one specific item.</p>
        <NumberSlider label="P(success)" sub="chance this attempt wins the item" {...P_RANGE_PCT} value={s.pSuccessPct} suffix="%" onChange={(pSuccessPct) => set({ ...s, pSuccessPct })} />
        <NumberSlider label="Value" sub="gain if it succeeds" {...VALUE_RANGE} value={s.value} prefix="$" onChange={(value) => set({ ...s, value })} />
        <NumberSlider label="Cost" sub="sunk cost if it fails" {...COST_RANGE} value={s.cost} prefix="$" onChange={(cost) => set({ ...s, cost })} />
        <p className="fw-hint">Value and Cost are conditional amounts &mdash; not the price per draw, and not the expected cost of acquiring the item (price &times; expected draws; see the Case Study).</p>
        <div className="fw-actions"><button type="button" className="btn-ghost" onClick={reset}>Reset to 20%, $15, $3</button><span className="fw-tag">Illustrative values</span></div>
      </div>
      <div className="fw-result" aria-live="polite">
        <div className="fw-result-head">
          <div>
            <span className="fw-result-k">Expected value of the attempt</span>
            <div className="fw-big" data-testid="prob-evc">{money(r.evc)}</div>
          </div>
          <div className="fw-art" aria-hidden><Gashapon /></div>
        </div>

        <span className="fw-mini-k">Probability</span>
        <div className="fw-pbar" role="img" aria-label={`Success ${pc(r.pSuccess)}, failure ${pc(r.pFailure)}`}>
          <span className="seg win" style={{ width: `${r.pSuccess * 100}%` }} />
          <span className="seg lose" style={{ width: `${r.pFailure * 100}%` }} />
        </div>
        <div className="fw-bar-legend"><span><i className="sw win" />Success <b data-testid="p-success">{pc(r.pSuccess)}</b></span><span><i className="sw lose" />Failure <b data-testid="p-failure">{pc(r.pFailure)}</b></span></div>

        <span className="fw-mini-k">Expected contributions</span>
        <div className="fw-diverge" role="img" aria-label={`Expected sunk cost minus ${money(r.loss)}, expected gain plus ${money(r.gain)}, net ${money(r.evc)}`}>
          <span className="axis" />
          <span className="seg lose" style={{ width: w(r.loss), right: '50%' }} />
          <span className="seg win" style={{ width: w(r.gain), left: '50%' }} />
        </div>
        <div className="fw-bar-legend fw-split">
          <span>&minus;P(failure) &times; Cost = <b data-testid="loss">&minus;{money(r.loss)}</b></span>
          <span>P(success) &times; Value = <b data-testid="gain">+{money(r.gain)}</b></span>
        </div>
        <p className="fw-interp" data-testid="prob-interp">
          {Math.abs(r.evc) < 0.005
            ? <>Under these assumptions the attempt <b>breaks even</b>: the expected gain equals the expected sunk cost.</>
            : r.evc > 0
              ? <>Under these assumptions one attempt is worth <b>{money(r.evc)}</b> in expectation: the expected gain from success outweighs the expected sunk cost of failing.</>
              : <>Under these assumptions one attempt has a <b>negative</b> expected value ({money(r.evc)}): the expected sunk cost of failing outweighs the expected gain.</>}
          {' '}A simplified two-outcome expression &mdash; no pity timer, duplicates or other prizes.
        </p>
      </div>
    </div>
  )
}
