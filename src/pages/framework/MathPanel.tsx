// "Show the mathematics": original formulas verbatim, definitions, live steps, assumptions,
// interpretation, limitations, the general model with a worked example, and references.
import { useState } from 'react'
import { additiveValue, deterministicEVC, expectedMarginalValue, gachaEVC, money } from '../../lib/evc'
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
  const g = gachaEVC(prob.pSuccessPct / 100, prob.value, prob.cost)
  const p = r2(g.pSuccess), q = r2(g.pFailure)
  return (
    <details className="disclosure fw-math" id="fw-math">
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
          <div className="label"><span>Probabilistic goods</span><span className="badge outline">Consistent with published OR literature</span></div>
          <div className="formula notranslate" translate="no">EVC(gacha) = <span className="term-hl">P(success)</span> × Value − <span className="term-hl">P(failure)</span> × Cost</div>
          <div className="formula-note">{PROB_NOTE}</div>
          <div className="formula notranslate fw-formula-gen" translate="no">V(A,v,r) = <span className="term-hl">Σⱼ</span> rⱼ × [v(A∪{'{'}j{'}'}) − v(A)]</div>
          <div className="formula-note">{GENERAL_NOTE}</div>
        </div>

        <h3 className="fw-h3">2 &middot; What each symbol means</h3>
        <div className="table-scroll">
          <table className="data-table fw-table">
            <thead><tr><th>Symbol</th><th>Meaning</th><th>Not the same as</th></tr></thead>
            <tbody>
              <tr><td>RefP</td><td>Price of the next-best alternative (≥ $0)</td><td>The item&rsquo;s own price</td></tr>
              <tr><td>DiffV</td><td>Differentiated value over that alternative; negative if the item is worse on what the customer values</td><td>Total value of the item</td></tr>
              <tr><td>P(success)</td><td>Chance that this attempt yields the wanted item</td><td>The chance of getting <i>any</i> item</td></tr>
              <tr><td>P(failure)</td><td>1 − P(success)</td><td>—</td></tr>
              <tr><td>Value</td><td>What the player gains <b>if</b> the attempt succeeds</td><td>The item&rsquo;s list price</td></tr>
              <tr><td>Cost</td><td>What is lost, as a sunk cost, <b>if</b> the attempt fails</td><td>The price per draw; the expected cost of acquiring the item (price × expected draws)</td></tr>
              <tr><td>A, j, rⱼ, v</td><td>Items already owned; a possible reward; its probability; the player&rsquo;s value of a set of items</td><td>—</td></tr>
            </tbody>
          </table>
        </div>

        <h3 className="fw-h3">3 &middot; Step by step, with the values set above</h3>
        <ol className="fw-steps" data-testid="steps">
          <li>Deterministic: EVC = {money(det.refP)} + ({det.diffV < 0 ? '−' : ''}{money(Math.abs(det.diffV))}) = <b>{money(evc)}</b>.</li>
          <li>P(failure) = 1 − {p} = <b>{q}</b>.</li>
          <li>Expected gain = P(success) × Value = {p} × {money(prob.value)} = <b>{money(g.gain)}</b>.</li>
          <li>Expected sunk cost = P(failure) × Cost = {q} × {money(prob.cost)} = <b>{money(g.loss)}</b>.</li>
          <li>EVC(gacha) = {money(g.gain)} − {money(g.loss)} = <b>{money(g.evc)}</b>.</li>
        </ol>

        <h3 className="fw-h3">4 &middot; Assumptions</h3>
        <ul className="fw-list">
          <li>Deterministic: both terms are known before purchase &mdash; the good itself is certain.</li>
          <li>Probabilistic (simplified form): one attempt, one wanted item, two outcomes. Value and Cost are fixed amounts conditional on each outcome.</li>
          <li>General form: the value of a reward depends on what the player already owns; probabilities rⱼ form a distribution.</li>
          <li>All numbers on this page are illustrative teaching values, not game data.</li>
        </ul>

        <h3 className="fw-h3">5 &middot; Interpretation</h3>
        <ul className="fw-list">
          <li>EVC is a <b>ceiling</b> &mdash; the most a customer comparing against the reference would rationally pay. It is not necessarily the profit-maximizing price.</li>
          <li>For a chance-based good, the same question is answered in expectation: a positive EVC(gacha) means the expected gain outweighs the expected sunk cost under the stated amounts.</li>
          <li><b>One consistent reading</b> (an interpretation, not the definition): if an attempt costs <i>c</i> and the item is worth <i>W</i>, set Value = <i>W</i> − <i>c</i> and Cost = <i>c</i>; the expression becomes p&middot;<i>W</i> − <i>c</i>.</li>
        </ul>

        <h3 className="fw-h3">6 &middot; Limitations</h3>
        <ul className="fw-list">
          <li>The two-outcome expression ignores pity timers, duplicates and other prizes; it is not a complete model of every gacha system.</li>
          <li><b>How the two probabilistic formulas relate.</b> With one valued item (probability p, marginal value Value) and nothing else valued, the general form gives V = p × Value &mdash; exactly the <i>success term</i>. The failure term, −P(failure) × Cost, is not part of V, which measures expected value before any price is paid. The two are compatible in structure, but one is not derived from the other here.</li>
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
          <li>Newzoo (2025). Global Games Market Report 2025 &mdash; source of the 56% figure.</li>
        </ul>
      </div>
    </details>
  )
}
