// "Show the mathematics": original formulas verbatim, definitions, live steps, assumptions,
// interpretation, limitations, the general model with a worked example, and references.
import { useState } from 'react'
import { additiveValue, deterministicEVC, expectedMarginalValue, expectedNetPayoff, gachaEVC, money } from '../../lib/evc'
import { DET_NOTE, GENERAL_NOTE, ORIGINAL_LEDE, ORIGINAL_TITLE, PROB_NOTE } from '../../data/framework'
import type { DetState } from './DeterministicTab'
import type { ProbState } from './ProbabilisticTab'

// Worked example for the general model (illustrative teaching values).
const ITEMS = { Outfit: 15, Mount: 10, Dye: 1 }
const REWARDS = [{ item: 'Outfit', prob: 0.05 }, { item: 'Mount', prob: 0.05 }, { item: 'Dye', prob: 0.9 }]
const r2 = (n: number) => (Math.round(n * 10000) / 10000).toString()

function GeneralExample() {
  const [ownMount, setOwnMount] = useState(true)
  const owned = new Set(ownMount ? ['Mount'] : [])
  const v = additiveValue(ITEMS)
  const total = expectedMarginalValue(owned, REWARDS, v)
  return (
    <div className="fw-example">
      <label className="fw-check"><input type="checkbox" checked={ownMount} onChange={(e) => setOwnMount(e.target.checked)} /> The player already owns the Mount</label>
      <div className="table-scroll">
        <table className="data-table fw-table">
          <thead><tr><th>Reward j</th><th>rⱼ</th><th>Value to player</th><th>v(A ∪ {'{'}j{'}'}) − v(A)</th><th>rⱼ × marginal value</th></tr></thead>
          <tbody>
            {REWARDS.map((x) => {
              const marg = v(new Set([...owned, x.item])) - v(owned)
              return <tr key={x.item}><td>{x.item}{owned.has(x.item) && ' (owned)'}</td><td>{x.prob}</td><td>{money(ITEMS[x.item as keyof typeof ITEMS])}</td><td>{money(marg)}</td><td>{r2(x.prob * marg)}</td></tr>
            })}
          </tbody>
        </table>
      </div>
      <p className="fw-step">V(A, v, r) = <b data-testid="general-total">{r2(total)}</b>{ownMount && <> &mdash; the owned Mount adds nothing, because A ∪ {'{'}Mount{'}'} = A.</>}</p>
    </div>
  )
}

export function MathPanel({ det, prob }: { det: DetState; prob: ProbState }) {
  const evc = deterministicEVC(det.refP, det.diffV)
  const e = expectedNetPayoff(prob.pSuccessPct / 100, prob.value, prob.cost)
  // The draft form gives the same answer only with Value = G − c (net gain) and Cost = c.
  const net = Math.max(0, prob.value - prob.cost)
  const g = gachaEVC(e.pSuccess, net, prob.cost)
  const p = r2(e.pSuccess), q = r2(e.pFailure)
  return (
    // present-keep: stays available in PRESENT, so "Open the mathematics" (toolkit step 3) has something to open.
    <details className="disclosure fw-math present-keep" id="fw-math">
      <summary><span className="chev" aria-hidden />Show the mathematics<span className="fw-math-cite">(Han, Ryan &amp; Tong, 2026)</span></summary>
      <div className="disclosure-body">
        <h2 className="fw-h2">{ORIGINAL_TITLE}</h2>
        <p className="fw-p">{ORIGINAL_LEDE}</p>

        <h3 className="fw-h3">1 &middot; The original formulas</h3>
        <div className="formula-block">
          <div className="label"><span>Deterministic goods</span><span className="badge solid">Applies directly</span></div>
          <div className="formula notranslate" translate="no">EVC = <span className="term-hl">RefP</span> + <span className="term-hl">DiffV</span></div>
          <div className="formula-note">{DET_NOTE}</div>
          <div className="term-grid">
            <div className="term"><b>RefP</b> — reference price of the next-best alternative</div>
            <div className="term"><b>DiffV</b> — differentiated value over that alternative</div>
          </div>
        </div>
        <div className="formula-block">
          <div className="label"><span>Probabilistic goods</span><span className="badge outline">Original draft form — valid only if Value is the net gain</span></div>
          <div className="formula notranslate" translate="no">EVC(gacha) = <span className="term-hl">P(success)</span> × Value − <span className="term-hl">P(failure)</span> × Cost</div>
          <div className="formula-note">{PROB_NOTE}</div>
          <div className="formula notranslate fw-formula-gen" translate="no">V(A,v,r) = <span className="term-hl">Σⱼ</span> rⱼ × [v(A∪{'{'}j{'}'}) − v(A)]</div>
          <div className="formula-note">{GENERAL_NOTE}</div>
        </div>
        <div className="formula-block">
          <div className="label"><span>Used on this page</span><span className="badge solid">Expected net payoff</span></div>
          <div className="formula notranslate" translate="no">Expected net payoff = <span className="term-hl">p</span> × G − c &nbsp;&middot;&nbsp; ceiling for one draw = <span className="term-hl">p</span> × G</div>
          <div className="formula-note">With Value = G − c and Cost = c, the draft form gives p(G − c) − (1 − p)c = pG − c. EVC answers a different question: the highest price for a known item (RefP + DiffV). For one draw, the matching ceiling is p × G &mdash; the course&rsquo;s probability weighting (tulip example: 10% &times; $80 = $8).</div>
        </div>

        <h3 className="fw-h3">2 &middot; What each symbol means</h3>
        <div className="table-scroll">
          <table className="data-table fw-table">
            <thead><tr><th>Symbol</th><th>Meaning</th><th>Not the same as</th></tr></thead>
            <tbody>
              <tr><td>RefP</td><td>Price of the next-best alternative (≥ $0)</td><td>The item&rsquo;s own price</td></tr>
              <tr><td>DiffV</td><td>Differentiated value over that alternative; negative if the item is worse on what the customer values</td><td>Total value of the item</td></tr>
              <tr><td>p = P(success)</td><td>Chance that this draw yields the wanted item</td><td>The chance of getting <i>any</i> item</td></tr>
              <tr><td>G</td><td>The wanted item&rsquo;s full (gross) value to this player</td><td>The item&rsquo;s list price</td></tr>
              <tr><td>c</td><td>The price of one draw</td><td>The expected cost of acquiring the item over many draws (price × expected draws; see the Case Study)</td></tr>
              <tr><td>Value, Cost (draft form)</td><td>Valid only as Value = G − c (net gain if the draw wins) and Cost = c</td><td>Value = G, which would overstate the payoff by p × c</td></tr>
              <tr><td>A, j, rⱼ, v</td><td>Items already owned; a possible reward; its probability; the player&rsquo;s value of a set of items</td><td>—</td></tr>
            </tbody>
          </table>
        </div>

        <h3 className="fw-h3">3 &middot; Step by step, with the values set above</h3>
        <ol className="fw-steps" data-testid="steps">
          <li>Deterministic: EVC = {money(det.refP)} + ({det.diffV < 0 ? '−' : ''}{money(Math.abs(det.diffV))}) = <b>{money(evc)}</b>.</li>
          <li>Ceiling for one draw = p × G = {p} × {money(prob.value)} = <b>{money(e.ceiling)}</b>.</li>
          <li>Expected net payoff = p × G − c = {money(e.ceiling)} − {money(e.price)} = <b>{money(e.netPayoff)}</b>.</li>
          {prob.value >= prob.cost
            ? <li>Check with the draft form, Value = G − c = {money(net)} and Cost = c: {p} × {money(net)} − {q} × {money(prob.cost)} = <b>{money(g.evc)}</b>.</li>
            : <li>The draft form cannot be checked here: with G below c, the net gain G − c is negative.</li>}
        </ol>

        <h3 className="fw-h3">4 &middot; Assumptions</h3>
        <ul className="fw-list">
          <li>Deterministic: both terms are known before purchase &mdash; the good itself is certain.</li>
          <li>Probabilistic: one draw, one wanted item, a risk-neutral player; every other prize is valued at zero; no guarantee.</li>
          <li>General form: the value of a reward depends on what the player already owns; probabilities rⱼ form a distribution.</li>
          <li>All numbers on this page are illustrative teaching values, not game data.</li>
        </ul>

        <h3 className="fw-h3">5 &middot; Interpretation</h3>
        <ul className="fw-list">
          <li>EVC is a <b>ceiling</b> &mdash; the most a customer comparing against the reference would rationally pay. It is not necessarily the profit-maximizing price.</li>
          <li>For a chance-based good, the ceiling is answered in expectation: one draw is worth at most p × G to a risk-neutral player.</li>
          <li>The expected net payoff subtracts the price: a positive value means the draw is worth more than it costs, in expectation, for this player. It describes the offer, not why players buy.</li>
        </ul>

        <h3 className="fw-h3">6 &middot; Limitations</h3>
        <ul className="fw-list">
          <li>The two-outcome expression ignores pity timers, duplicates and other prizes; it is not a complete model of every gacha system.</li>
          <li><b>How the two probabilistic formulas relate.</b> With one valued item (probability p, marginal value Value) and nothing else valued, the general form gives V = p × G &mdash; exactly the ceiling. The expected net payoff then subtracts the price c; V itself measures expected value before any price is paid.</li>
          <li>&ldquo;A duplicate contributes zero&rdquo; holds because the model values <i>sets</i>: if j is already in A, then A ∪ {'{'}j{'}'} = A. A game where duplicates convert into currency or upgrades would need a different value function.</li>
        </ul>

        <h3 className="fw-h3">7 &middot; The general form, worked</h3>
        <p className="fw-p">V(A, v, r) = &Sigma;<sub>j</sub> r<sub>j</sub> &times; [ v(A &cup; {'{'}j{'}'}) &minus; v(A) ] &mdash; illustrative values, additive value function.</p>
        <GeneralExample />

        <h3 className="fw-h3">8 &middot; References</h3>
        <ul className="fw-list fw-refs notranslate" translate="no">
          <li>Course materials: OPM 6600, Week 3–4, EVC Pricing &amp; Choice Architecture slides.</li>
          <li>Guest speaker: Dr. Tim Smith, Wiglaf Pricing &mdash; class Q&amp;A on applying EVC to gaming, Sept. 2026.</li>
          <li>Han, Ryan &amp; Tong (2026) &mdash; general loot-box expected-utility form, cited as in the original site; full bibliographic details are in the written report.</li>
          <li>Newzoo (2025). Global Games Market Report 2025, as reported in secondary coverage &mdash; share of players who do not pay (a spending outcome, not a measure of willingness to pay).</li>
        </ul>
      </div>
    </details>
  )
}
