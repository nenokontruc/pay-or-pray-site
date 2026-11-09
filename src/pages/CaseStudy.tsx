// Case Study (legacy/index.html:765-876). Every original sentence and figure is kept — visible or in a
// disclosure — and checked by tests/pages/contentPreservation.test.tsx.
import { useState } from 'react'
import { Disclosure, Takeaway } from '../components/Disclosure'
import { PixelIcon } from '../components/PixelIcon'
import { COMPARE, GAMES, WWM_GUARANTEE } from '../data/caseStudy'
import { PityChart, WWM_BEFORE_GUARANTEE, WWM_EXPECTED_PULLS } from './case-study/PityChart'
import { ChannelMap } from './case-study/ChannelMap'
import { PurchasePath, STEPS } from './case-study/PurchasePath'
import './case-study/caseStudy.css'

function GamePanels() {
  return (
    <div className="case-grid">
      {GAMES.map((g) => (
        <article key={g.id} className={`case-col ${g.tone}`} aria-labelledby={`cs-${g.id}`}>
          <span className="badge outline">Dual channel</span>
          <h3 id={`cs-${g.id}`}>{g.name}</h3>
          <div className="sub">{g.sub}</div>
          {g.groups.map((grp, i) => (
            <div key={i} className="cs-group">
              <div className="case-sub"><PixelIcon name={grp.icon} size={20} />{grp.label}</div>
              {grp.facts.map((f, j) => <div key={j} className="fact"><span className="k">{f.k}</span><span className="v">{f.v}</span></div>)}
            </div>
          ))}
        </article>
      ))}
    </div>
  )
}

/** Short, source-faithful labels; the full paragraphs are in the disclosure below. */
const IMPLICATIONS = [
  { head: 'Fixed-price skins (both games)', tone: 'solid', rows: ['Nothing — the value of the item is known before purchase', 'You do', 'Standard EVC formula: compromise effects, anchors, tiered ladders'] },
  { head: 'Honor of Kings draw', tone: 'mid', rows: ['How much you pay — somewhere between 1 and 361 draws', 'You do (crystal → skin of your choice)', 'Close to deterministic at the end; works more like a loyalty rebate layered on the shop'] },
  { head: 'Where Winds Meet draw', tone: 'outline', rows: ['How much you pay and, until the guarantee, whether you get the item at all', 'The studio does', 'Fully probabilistic until the 150-pull guarantee: the expected-value form of EVC'] },
]
const IMPL_ROWS = ['What chance decides', 'Who chooses the prize', 'Pricing tool that applies']

export default function CaseStudy() {
  // Current step of the purchase path; the full table highlights the same row.
  const [step, setStep] = useState(0)
  const activeRow = STEPS[step].row
  return (
    <div className="cs">
      <div className="wrap-wide page-hero">
        <div className="page-hero-grid">
          <div>
            <p className="kicker">Case Study</p>
            <h1 className="page-title">Two Chinese games, two ways to sell chance</h1>
            <p className="page-lede present-hide">Honor of Kings and Where Winds Meet both sell fixed-price skins <i>and</i> run lucky draws &mdash; like almost every top-grossing mobile game. So the useful question isn't which game is &ldquo;deterministic.&rdquo; It's how each one <b>designs the lucky draw</b> on top of its shop, and <b>where the randomness ends</b>.</p>
          </div>
          <div className="page-hero-art cs-hero-art" aria-hidden><PixelIcon name="cart" size={84} /><PixelIcon name="capsule" size={84} /></div>
        </div>
      </div>

      <section className="block slide" id="cs-both">
        <div className="wrap-wide">
          <header className="slide-head">
            <p className="kicker">01 &mdash; <b>Both sell both</b></p>
            <h2 className="sec-title">Do these games sell chance differently?</h2>
          </header>
          <ChannelMap />
          <Takeaway>Both games sell known items at known prices and run a lucky draw &mdash; so the comparison is about how each one designs the draw.</Takeaway>
          <Disclosure label="All figures for both games (prices, odds, guarantees, revenue)">
            <GamePanels />
          </Disclosure>
        </div>
      </section>

      <section className="block slide" id="cs-randomness">
        <div className="wrap-wide">
          <header className="slide-head">
            <p className="kicker">02 &mdash; <b>Where the randomness ends</b></p>
            <h2 className="sec-title">Same idea, opposite designs</h2>
            <p className="sec-lede">Both draws are (near-)cosmetic and both guarantee a prize eventually. The differences are in how the odds move, what you win, and what you pay with.</p>
          </header>
          <PurchasePath step={step} setStep={setStep} />
          <div className="callout"><b>The key difference:</b> in Honor of Kings, chance decides <i>how much</i> you pay, but you choose <i>what</i> you get &mdash; the lottery turns back into a known purchase at the end. In Where Winds Meet, chance decides both how much you pay and, until the guarantee, whether you get the item at all.</div>
          <Disclosure label="View the full comparison table">
            <div className="table-scroll">
              <table className="data-table compare-table">
                <thead><tr><th></th><th>Honor of Kings &middot; 积分夺宝</th><th>Where Winds Meet &middot; Echo gacha</th></tr></thead>
                <tbody>{COMPARE.map((r) => <tr key={r.id} className={r.id === activeRow ? 'cs-row-on' : undefined} aria-current={r.id === activeRow ? 'true' : undefined}><td>{r.label}</td><td>{r.hok}</td><td>{r.wwm}</td></tr>)}</tbody>
              </table>
            </div>
            <p className="game-note">The highlighted row is the step selected above. &ldquo;Pay-to-win&rdquo; is not a step of the purchase; it is compared here and under &ldquo;Why this pairing&rdquo;.</p>
          </Disclosure>

          <h3 className="cs-h3">How the odds play out</h3>
          <PityChart />
          <Takeaway>
            Teaching model, not an observed outcome: if 0.0415% applied to every pull and the guarantee always gave this outfit, about {(WWM_BEFORE_GUARANTEE * 100).toFixed(1)}% of players would win it within the first 149 pulls; the other {((1 - WWM_BEFORE_GUARANTEE) * 100).toFixed(1)}% would get it on the guaranteed 150th pull. By pull 150, 100% have it.
          </Takeaway>
          <Disclosure label="Teaching model: formula, assumptions and source check" className="present-keep">
            <p>These are <b>model-derived estimates</b>, not observed outcomes or numbers reported by the sources.</p>
            <p>With a fixed chance <i>p</i> = 0.0415% per pull, the chance of no win in the first <i>n</i> pulls is (1 &minus; <i>p</i>)<sup><i>n</i></sup>. So:</p>
            <ul className="cs-math">
              <li><b>Win before the guarantee</b> (within pulls 1&ndash;149): 1 &minus; (1 &minus; 0.000415)<sup>149</sup> = <b>{(WWM_BEFORE_GUARANTEE * 100).toFixed(2)}%</b>.</li>
              <li><b>Reach the guaranteed pull</b> without an earlier win: (1 &minus; 0.000415)<sup>149</sup> = <b>{((1 - WWM_BEFORE_GUARANTEE) * 100).toFixed(2)}%</b>.</li>
              <li><b>Win on or before the guaranteed pull</b> (by pull 150): <b>100%</b>, by the guarantee.</li>
              <li><b>Expected pulls until the outfit</b>: (1 &minus; (1 &minus; <i>p</i>)<sup>150</sup>) / <i>p</i> = <b>{WWM_EXPECTED_PULLS.toFixed(1)}</b> pulls.</li>
            </ul>
            <p><b>Assumptions.</b> (1) Every pull has the same 0.0415% chance for this outfit, independent of earlier pulls &mdash; consistent with the source&rsquo;s &ldquo;0.0415%, fixed&rdquo; and &ldquo;fixed until the guarantee&rdquo;. (2) The 150-pull guarantee always delivers this outfit, and nothing else resets the counter. (3) All pulls are on one banner. The 0.747% material odds are not part of the calculation.</p>
            <p><b>Source check (November 2026) &mdash; unresolved.</b> The cited guide (BitTopup, 2025) supports the fixed 0.0415% outfit rate, the absence of soft pity and a 150-pull hard pity for a specific outfit. But the same guide says the shared counter resets when the player obtains <i>any</i> Legendary, and a second BitTopup guide gives a 0.83% featured-Legendary rate and says the guarantee awards <i>any</i> Legendary. Both are top-up reseller pages, not official game disclosures. If other Legendaries reset the counter, assumption (2) fails and the figures above do not hold. That is why the line is shown only as a hypothetical teaching model.</p>
            <p>The arithmetic was checked three ways (closed form, step-by-step product, and a 2-million-player simulation), all giving 6.00% and 145.5 pulls.</p>
            <p>For Honor of Kings, the only safe statement is a lower bound: because the odds start at 0.8% and only rise, the chance of having won by draw <i>n</i> is at least 1 &minus; (1 &minus; 0.008)<sup><i>n</i></sup>. The rise per draw (&ldquo;luck value&rdquo;) is not published, so the true curve is not shown.</p>
          </Disclosure>
        </div>
      </section>

      <section className="block slide" id="cs-pricing">
        <div className="wrap-wide">
          <header className="slide-head">
            <p className="kicker">03 &mdash; <b>What this means for pricing</b></p>
            <h2 className="sec-title">The item, not the game, sets the pricing tool</h2>
            <p className="sec-lede cs-impl-guide">Read each row left to right. Start with what chance decides, then who chooses the prize and which pricing tool applies.</p>
          </header>
          <div className="cs-impl" role="table" aria-label="Pricing implications by item">
            <div className="cs-impl-row cs-impl-head" role="row">
              <span role="columnheader" />
              {IMPLICATIONS.map((c) => <span key={c.head} role="columnheader" className={`cs-impl-col ${c.tone}`}>{c.head}</span>)}
            </div>
            {IMPL_ROWS.map((label, r) => (
              // The first row carries the main difference; it is emphasised by weight and rules, not colour alone.
              <div className={`cs-impl-row${r === 0 ? ' cs-impl-key' : ''}`} role="row" key={label}>
                <span role="rowheader" className="cs-impl-k">{label}</span>
                {IMPLICATIONS.map((c) => <span key={c.head} role="cell">{c.rows[r]}</span>)}
              </div>
            ))}
          </div>
          <Takeaway>That is why this project compares <b>what is being sold</b>, not whole games. The same storefront can need two different pricing tools.</Takeaway>

          <div className="cs-evidence present-hide">
            <div className="cs-ev">
              <div className="cs-ev-num">36.7%</div>
              <div className="case-note">A guaranteed prize matters economically, not just for goodwill. It moves a draw toward the &ldquo;unique box&rdquo; design, where every purchase yields an item the player doesn&rsquo;t already own. In Chen et al.&rsquo;s model, unique boxes approach the full revenue-optimal ceiling as the catalog grows, while duplicate-allowing boxes capture only about 36.7% of it. <span className="cs-src">&mdash; Chen, Elmachtoub, Hamilton &amp; Lei, 2021</span></div>
            </div>
            <div className="cs-ev">
              <div className="cs-ev-num">~$320M <small>/ 21 months</small></div>
              {/* Corrected Nov 2026 (docs/CONTENT_CORRECTIONS.md): the cited source does not conclude that cosmetic-only costs revenue. */}
              <div className="case-note">Does staying cosmetic-only cost revenue? Not clearly. Wuthering Waves, which puts power-affecting characters in its gacha, earned roughly <b>$320M over 21 months</b> (about $15M a month, on about 29M downloads), against about $8M a month (on about 20M downloads) for Where Winds Meet &mdash; both mobile only, excluding China Android. But the same analysis finds Where Winds Meet&rsquo;s long-term revenue efficiency on iOS China &ldquo;tracks closely&rdquo; with Wuthering Waves&rsquo;, and concludes that its cosmetic-only model has not radically undermined unit economics. <span className="cs-src">&mdash; Naavik, 2026</span></div>
            </div>
          </div>

          <Disclosure label="Read the full analysis">
            <div className="prose">
              <p><b>The fixed-price skins in both games</b> are priced with the standard EVC formula: the value of the item is known before purchase, so compromise effects, anchors, and tiered ladders do the work.</p>
              <p><b>Honor of Kings' draw is close to deterministic at the end.</b> Because players pick the final skin, the uncertainty is mostly about <i>price</i> &mdash; somewhere between 1 and 361 draws &mdash; not about value. And because much of the draw currency builds up as a side effect of spending, the lottery works more like a loyalty rebate layered on the shop than a standalone product.</p>
              <p><b>Where Winds Meet's draw is fully probabilistic</b> until the 150-pull guarantee: both the cost and the outcome are uncertain, so the expected-value form of EVC on the <a href="#framework">Framework</a> page is the one that applies.</p>
              <p>That is why this project compares <b>what is being sold</b>, not whole games. The same storefront can need two different pricing tools.</p>
            </div>
          </Disclosure>
          <Disclosure label="Why this pairing, specifically">
            <div className="prose">
              <p>Almost every top-grossing game sells both fixed-price items and lucky draws, so no clean &ldquo;deterministic game vs. probabilistic game&rdquo; pair exists. What can be held (approximately) constant is <b>power</b>: Where Winds Meet sells none in any channel, and Honor of Kings&rsquo; skins add only small stat bonuses &mdash; small enough that academic work on the game treats skins as not affecting match outcomes. That isolates the design of the lucky draw itself as the main variable being compared. This near-match on power is a limitation worth stating, not a perfect control.</p>
              <p>Genshin Impact was considered and rejected. It also sells both, but its draws grant characters and weapons that make players stronger &mdash; so any difference could come from the randomness or from the power, not cleanly from either.</p>
            </div>
          </Disclosure>
        </div>
      </section>
    </div>
  )
}
