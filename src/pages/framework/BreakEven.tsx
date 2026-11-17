// Framework, first section — RQ1: when does freemium pay off compared with premium?
// Every number is computed by src/lib/breakEven.ts (FINAL REVIEW COPY, Section 3). Hypothetical inputs only.
import { useId, useState } from 'react'
import { Disclosure } from '../../components/Disclosure'
import {
  EXAMPLE, LOW_SPEND, breakEvenShare, fixedPerInstaller, freemiumFixed, freemiumProfit, installers, matchPremiumShare, netPerPayer,
  pct, premiumFixed, premiumProfit, usd, variablePerInstaller, withSpend, zoneOf, type Zone,
} from '../../lib/breakEven'

const AXIS_MAX = 0.2 // the bar shows payer shares from 0% to 20%
const STEP_PCT = 0.25
const rBE = breakEvenShare(), rP = matchPremiumShare(), piP = premiumProfit()
const low = withSpend(LOW_SPEND)
const at = (share: number) => `${(Math.min(share, AXIS_MAX) / AXIS_MAX) * 100}%`
const money2 = (n: number) => `$${n.toFixed(2)}`

const ZONES: { id: Zone; label: string; range: string }[] = [
  { id: 'loss', label: 'Freemium loses money', range: `below ${pct(rBE)}` },
  { id: 'below-premium', label: 'Profitable, but worse than premium', range: `${pct(rBE)} to ${pct(rP)}` },
  { id: 'beats-premium', label: 'Matches or beats premium', range: `${pct(rP)} or more` },
]

export function BreakEven() {
  const id = useId()
  const [sharePct, setSharePct] = useState(5)
  const r = sharePct / 100
  const piF = freemiumProfit(r)
  const zone = ZONES.find((z) => z.id === zoneOf(r))!
  const perInstallerPremium = piP / installers()

  return (
    <div className="be">
      <div className="viz-grid be-figures">
        <div className="viz-card be-fig">
          <span className="be-k">Premium game · expected profit</span>
          <b className="be-num" data-testid="be-premium">{usd(piP)}</b>
          <span className="be-sub">$20 price, 10% of the market buys</span>
        </div>
        <div className="viz-card be-fig">
          <span className="be-k">Freemium breaks even at</span>
          <b className="be-num" data-testid="be-rbe">{pct(rBE)}</b>
          <span className="be-sub present-hide">payer share</span>
        </div>
        <div className="viz-card be-fig">
          <span className="be-k">Freemium matches premium at</span>
          <b className="be-num" data-testid="be-rp">{pct(rP)}</b>
          <span className="be-sub present-hide">payer share</span>
        </div>
      </div>

      <div className="viz-card wide be-card">
        <div className="viz-head-row">
          <h3 className="viz-title">Three outcomes, one variable: the payer share</h3>
          <span className="be-tag">Hypothetical example</span>
        </div>
        <p className="be-def"><b>Payer share</b> = the share of players who install the free game and pay at least once in 24 months. Each paying player spends <b>{usd(EXAMPLE.freemium.spendPerPayer)}</b> over that time (assumed).</p>

        <div className="be-bar-wrap">
          <div className="be-marks" aria-hidden>
            <span className="be-mark be-mark-be" style={{ left: at(rBE) }}><span className="be-long">break-even </span>{pct(rBE)}</span>
            <span className="be-mark be-mark-p" style={{ left: at(rP) }}><span className="be-long">matches premium </span>{pct(rP)}</span>
          </div>
          <div className="be-bar" role="img" aria-label={`Payer share from 0 to 20 percent. Below ${pct(rBE)} freemium loses money; from ${pct(rBE)} to ${pct(rP)} it is profitable but worse than premium; from ${pct(rP)} it matches or beats premium. Selected: ${pct(r)}.`}>
            <span className="be-zone loss" style={{ left: 0, width: at(rBE) }} />
            <span className="be-zone below-premium" style={{ left: at(rBE), width: `calc(${at(rP)} - ${at(rBE)})` }} />
            <span className="be-zone beats-premium" style={{ left: at(rP), right: 0 }} />
            <span className="be-line" style={{ left: at(rBE) }} />
            <span className="be-line" style={{ left: at(rP) }} />
            <span className="be-pin" style={{ left: at(r) }} />
          </div>
          <div className="be-ticks" aria-hidden>{[0, 5, 10, 15, 20].map((t) => <span key={t} style={{ left: `${(t / 20) * 100}%` }}>{t}%</span>)}</div>
        </div>

        <div className="be-field">
          <label htmlFor={`${id}-r`} className="be-k">Payer share</label>
          <input id={`${id}-r`} type="range" min={0} max={AXIS_MAX * 100} step={STEP_PCT} value={sharePct} onChange={(e) => setSharePct(Number(e.target.value))} />
          <output htmlFor={`${id}-r`} className="be-out" data-testid="be-share">{pct(r)}</output>
        </div>
        <p className="be-read" aria-live="polite" data-testid="be-read">
          Expected freemium profit <b data-testid="be-profit">{usd(piF)}</b> against {usd(piP)} for premium &mdash; <b data-testid="be-zone">{zone.label}</b>.
        </p>

        <ul className="be-legend">
          {ZONES.map((z) => (
            <li key={z.id} className={z.id === zone.id ? 'on' : ''}><i className={`be-sw ${z.id}`} aria-hidden /><span>{z.label}</span><span className="be-range present-hide">{z.range}</span></li>
          ))}
        </ul>

        <p className="be-eq notranslate" translate="no" data-testid="be-eq">
          Break-even payer share = cost per installer &divide; net spending per payer = ({money2(fixedPerInstaller())} + {money2(variablePerInstaller())}) &divide; {money2(netPerPayer())} = <b>{pct(rBE)}</b>.
          {' '}To match premium, add premium&rsquo;s profit per installer ({money2(perInstallerPremium)}): <b>{pct(rP)}</b>.
        </p>
        <p className="be-low" data-testid="be-low">
          <b>Same example, {usd(LOW_SPEND)} per paying player instead of {usd(EXAMPLE.freemium.spendPerPayer)}:</b> break-even would need a payer share of {pct(breakEvenShare(low), 1)} ({pct(matchPremiumShare(low), 1)} to match premium). A share above 100% is impossible, so in this model no conversion rate could make that design profitable.
        </p>
        <p className="viz-foot">All inputs are hypothetical. These are not the conversion rates of Honor of Kings, Where Winds Meet or any real game. Model: the project report (Final Review Copy), Section 3.</p>
      </div>

      <Disclosure label="Model, inputs and assumptions">
        <p className="be-formula notranslate" translate="no">Premium: &Pi;<sub>P</sub> = D&middot;b&middot;[(1 &minus; &phi;)&middot;P<sub>0</sub> &minus; k<sub>P</sub> &minus; o&middot;L<sub>P</sub>] &minus; F<sub>P</sub></p>
        <p className="be-formula notranslate" translate="no">Freemium: &Pi;<sub>F</sub> = D&middot;s&middot;[(1 &minus; &phi;)&middot;r&middot;S &minus; k<sub>F</sub> &minus; o&middot;L<sub>F</sub>] &minus; F<sub>F</sub></p>
        <p className="be-formula notranslate" translate="no">Break-even: r<sub>BE</sub> = (F<sub>F</sub>/(D&middot;s) + k<sub>F</sub> + o&middot;L<sub>F</sub>) / ((1 &minus; &phi;)&middot;S) &nbsp;&middot;&nbsp; Match premium: r<sub>P</sub> = r<sub>BE</sub> + &Pi;<sub>P</sub> / (D&middot;s&middot;(1 &minus; &phi;)&middot;S)</p>
        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>Input (hypothetical)</th><th>Premium</th><th>Freemium</th></tr></thead>
            <tbody>
              <tr><td>Potential players D; horizon</td><td colSpan={2}>{EXAMPLE.D.toLocaleString('en-US')} players; {EXAMPLE.T} months, same for both</td></tr>
              <tr><td>Platform fee &phi;</td><td colSpan={2}>{EXAMPLE.phi * 100}% of gross revenue</td></tr>
              <tr><td>Entry price</td><td>{usd(EXAMPLE.premium.price)}</td><td>$0</td></tr>
              <tr><td>Share of the market acquired (b, s)</td><td>{EXAMPLE.premium.buyShare * 100}%</td><td>{EXAMPLE.freemium.installShare * 100}%</td></tr>
              <tr><td>Acquisition cost per player (k)</td><td>{money2(EXAMPLE.premium.acquisition)}</td><td>{money2(EXAMPLE.freemium.acquisition)}</td></tr>
              <tr><td>Serving cost per active month (o) &times; active months (L)</td><td>{money2(EXAMPLE.premium.servingPerMonth)} &times; {EXAMPLE.premium.activeMonths}</td><td>{money2(EXAMPLE.freemium.servingPerMonth)} &times; {EXAMPLE.freemium.activeMonths}</td></tr>
              <tr><td>Fixed cost over 24 months (F): development + live operations</td><td>{usd(premiumFixed())}</td><td>{usd(freemiumFixed())}</td></tr>
              <tr><td>Spending per paying player within 24 months (S)</td><td>&mdash;</td><td>{usd(EXAMPLE.freemium.spendPerPayer)} ($10 per paying month &times; 4 paying months)</td></tr>
            </tbody>
          </table>
        </div>
        <ul>
          <li>Both models use the same market, the same 24-month horizon and the same cost categories. Marketing is counted once (per acquired player); live-operations staff once (fixed cost).</li>
          <li>Payer share is cumulative over 24 months, not a monthly rate. Non-paying players still carry acquisition and serving costs.</li>
          <li>These are expected values, with no discounting, advertising revenue or later premium sales. Install share, payer share and spending are treated as independent; in practice they are probably linked.</li>
          <li>A threshold above 100% is reported as infeasible, never rounded down to a valid share.</li>
        </ul>
      </Disclosure>
    </div>
  )
}
