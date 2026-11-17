// Tab B — probabilistic goods: expected net payoff of one draw, ENP = p × G − c (FINAL REVIEW COPY, eq. 2.3).
// Numbers from src/lib/evc.ts. The original draft's two-outcome form is shown, with its condition, in MathPanel.
import { Gashapon } from '../../components/Art'
import { COST_RANGE, P_RANGE_PCT, VALUE_RANGE, expectedNetPayoff, money } from '../../lib/evc'
import { NumberSlider } from './NumberSlider'

/** pSuccessPct = p (%), value = G (item's value to the player), cost = c (price of one draw). */
export interface ProbState { pSuccessPct: number; value: number; cost: number }
const pc = (p: number) => `${(Math.round(p * 1e6) / 1e4).toString()}%`

export function ProbabilisticTab({ s, set, reset }: { s: ProbState; set: (s: ProbState) => void; reset: () => void }) {
  const r = expectedNetPayoff(s.pSuccessPct / 100, s.value, s.cost)
  const scale = Math.max(r.ceiling, r.price, 0.01)
  const w = (v: number) => `${(v / scale) * 50}%`
  return (
    <div className="fw-work">
      <div className="fw-inputs">
        <div className="fw-formula small" aria-label="Expected net payoff equals p times G minus c">
          Expected net payoff = <b>p</b> &times; <b>G</b> &minus; <b>c</b>
        </div>
        <p className="fw-lead">For one draw at one specific item: the chance of winning it, times what it is worth to the player, minus the price of the draw.</p>
        <NumberSlider label="p" sub="chance this draw wins the item" {...P_RANGE_PCT} value={s.pSuccessPct} suffix="%" onChange={(pSuccessPct) => set({ ...s, pSuccessPct })} />
        <NumberSlider label="G" sub="item's value to the player" {...VALUE_RANGE} value={s.value} prefix="$" onChange={(value) => set({ ...s, value })} />
        <NumberSlider label="c" sub="price of one draw" {...COST_RANGE} value={s.cost} prefix="$" onChange={(cost) => set({ ...s, cost })} />
        <p className="fw-hint">Not EVC: EVC (left tab) is a price ceiling. Here the ceiling for one draw is p &times; G, and the expected net payoff is what remains after paying c. It is not the expected cost of acquiring the item over many draws (see the Case Study).</p>
        <div className="fw-actions"><button type="button" className="btn-ghost" onClick={reset}>Reset to 20%, $18, $3</button><span className="fw-tag">Illustrative values</span></div>
      </div>
      <div className="fw-result" aria-live="polite">
        <div className="fw-result-head">
          <div>
            <span className="fw-result-k">Expected net payoff of one draw</span>
            <div className="fw-big" data-testid="prob-enp">{money(r.netPayoff)}</div>
          </div>
          <div className="fw-art" aria-hidden><Gashapon /></div>
        </div>

        <span className="fw-mini-k">Probability</span>
        <div className="fw-pbar" role="img" aria-label={`Win ${pc(r.pSuccess)}, miss ${pc(r.pFailure)}`}>
          <span className="seg win" style={{ width: `${r.pSuccess * 100}%` }} />
          <span className="seg lose" style={{ width: `${r.pFailure * 100}%` }} />
        </div>
        <div className="fw-bar-legend"><span><i className="sw win" />Win <b data-testid="p-success">{pc(r.pSuccess)}</b></span><span><i className="sw lose" />Miss <b data-testid="p-failure">{pc(r.pFailure)}</b></span></div>

        <span className="fw-mini-k">Expected value of the draw vs. its price</span>
        <div className="fw-diverge" role="img" aria-label={`Price minus ${money(r.price)}, expected value plus ${money(r.ceiling)}, net ${money(r.netPayoff)}`}>
          <span className="axis" />
          <span className="seg lose" style={{ width: w(r.price), right: '50%' }} />
          <span className="seg win" style={{ width: w(r.ceiling), left: '50%' }} />
        </div>
        <div className="fw-bar-legend fw-split">
          <span>Price &minus;c = <b data-testid="price">&minus;{money(r.price)}</b></span>
          <span>p &times; G = <b data-testid="ceiling">+{money(r.ceiling)}</b></span>
        </div>
        <p className="fw-interp" data-testid="prob-interp">
          {Math.abs(r.netPayoff) < 0.005
            ? <>Under these assumptions the draw <b>breaks even</b>: its expected value equals its price.</>
            : r.netPayoff > 0
              ? <>Under these assumptions the draw is worth <b>{money(r.netPayoff)}</b> more than its price in expectation.</>
              : <>Under these assumptions the draw has a <b>negative</b> expected net payoff ({money(r.netPayoff)}): its price exceeds its expected value.</>}
          {' '}The most a risk-neutral player would pay for it is <b data-testid="ceiling-read">{money(r.ceiling)}</b> (p &times; G). One draw only &mdash; no guarantee, duplicates or other prizes.
        </p>
      </div>
    </div>
  )
}
