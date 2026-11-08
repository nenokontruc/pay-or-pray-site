// Case Study (legacy/index.html:765-876). Every original sentence and figure is kept — visible or in a
// disclosure — and checked by tests/pages/contentPreservation.test.tsx.
import { useState } from 'react'
import { Disclosure, Takeaway } from '../components/Disclosure'
import { PixelIcon } from '../components/PixelIcon'
import { COMPARE, GAMES, WWM_GUARANTEE } from '../data/caseStudy'
import { PityChart, WWM_BEFORE_GUARANTEE, WWM_EXPECTED_PULLS } from './case-study/PityChart'
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

function Compare() {
  const [id, setId] = useState('win')
  const row = COMPARE.find((r) => r.id === id)!
  return (
    <div className="cs-compare">
      <div className="cs-dims" role="tablist" aria-label="Compare the two lucky draws">
        {COMPARE.map((r) => (
          <button key={r.id} type="button" role="tab" aria-selected={r.id === id} className={`chip ${r.id === id ? 'on' : ''}`} onClick={() => setId(r.id)}>{r.label}</button>
        ))}
      </div>
      <div className="cs-pair" role="tabpanel" aria-label={row.label} key={row.id}>
        <div className="cs-side solid"><span className="cs-side-k">Honor of Kings &middot; 积分夺宝</span><p>{row.hok}</p></div>
        <div className="cs-side outline"><span className="cs-side-k">Where Winds Meet &middot; Echo gacha</span><p>{row.wwm}</p></div>
      </div>
      {row.why && (
        <p className="cs-why"><span className="cs-why-k">Why it matters</span>{row.why}{row.whySource && <span className="cs-src"> &mdash; {row.whySource}</span>}</p>
      )}
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
  return (
    <div className="cs">
      <div className="wrap-wide page-hero">
        <div className="page-hero-grid">
          <div>
            <p className="kicker">Case Study</p>
            <h1 className="page-title">Two Chinese games, two ways to sell chance</h1>
            <p className="page-lede">Honor of Kings and Where Winds Meet both sell fixed-price skins <i>and</i> run lucky draws &mdash; like almost every top-grossing mobile game. So the useful question isn't which game is &ldquo;deterministic.&rdquo; It's how each one <b>designs the lucky draw</b> on top of its shop, and <b>where the randomness ends</b>.</p>
          </div>
          <div className="page-hero-art cs-hero-art" aria-hidden><PixelIcon name="cart" size={84} /><PixelIcon name="capsule" size={84} /></div>
        </div>
      </div>

      <section className="block slide" id="cs-both">
        <div className="wrap-wide">
          <header className="slide-head">
            <p className="kicker">01 &mdash; <b>Both sell both</b></p>
            <h2 className="sec-title">A fixed-price shop and a lucky draw, in each game</h2>
          </header>
          <GamePanels />
          <Takeaway>Both games sell known items at known prices and run a lucky draw &mdash; so the comparison is about how each one designs the draw.</Takeaway>
        </div>
      </section>

      <section className="block slide" id="cs-randomness">
        <div className="wrap-wide">
          <header className="slide-head">
            <p className="kicker">02 &mdash; <b>Where the randomness ends</b></p>
            <h2 className="sec-title">Same idea, opposite designs</h2>
            <p className="sec-lede">Both draws are (near-)cosmetic and both guarantee a prize eventually. The differences are in how the odds move, what you win, and what you pay with.</p>
          </header>
          <Compare />
          <Disclosure label="View the full comparison table">
            <div className="table-scroll">
              <table className="data-table compare-table">
                <thead><tr><th></th><th>Honor of Kings &middot; 积分夺宝</th><th>Where Winds Meet &middot; Echo gacha</th></tr></thead>
                <tbody>{COMPARE.map((r) => <tr key={r.id}><td>{r.label}</td><td>{r.hok}</td><td>{r.wwm}</td></tr>)}</tbody>
              </table>
            </div>
          </Disclosure>
          <div className="callout"><b>The key difference:</b> in Honor of Kings, chance decides <i>how much</i> you pay, but you choose <i>what</i> you get &mdash; the lottery turns back into a known purchase at the end. In Where Winds Meet, chance decides both how much you pay and, until the guarantee, whether you get the item at all.</div>

          <h3 className="cs-h3">How the odds play out</h3>
          <PityChart />
          <Takeaway>
            Derived from the published odds: only about {(WWM_BEFORE_GUARANTEE * 100).toFixed(0)}% of players chasing the Where Winds Meet outfit win it before the {WWM_GUARANTEE}-pull guarantee &mdash; for most, the price of the outfit is the full {WWM_GUARANTEE} pulls.
          </Takeaway>
          <Disclosure label="How the Where Winds Meet figures are derived">
            <p>With a fixed chance <i>p</i> = 0.0415% per pull, the chance of no win in the first <i>n</i> pulls is (1 &minus; <i>p</i>)<sup><i>n</i></sup>. So:</p>
            <ul className="cs-math">
              <li>Chance of winning within the first 149 pulls: 1 &minus; (1 &minus; 0.000415)<sup>149</sup> = <b>{(WWM_BEFORE_GUARANTEE * 100).toFixed(2)}%</b>.</li>
              <li>Expected pulls to win, with the guarantee on pull 150: (1 &minus; (1 &minus; <i>p</i>)<sup>150</sup>) / <i>p</i> = <b>{WWM_EXPECTED_PULLS.toFixed(1)}</b> pulls.</li>
            </ul>
            <p><b>Assumptions:</b> pulls are independent and all on one banner. The guarantee is shared across both banners in the game; the 0.747% material odds are not part of this calculation. These are derived figures, not numbers reported by the sources.</p>
            <p>For Honor of Kings, the only safe statement is a lower bound: because the odds start at 0.8% and only rise, the chance of having won by draw <i>n</i> is at least 1 &minus; (1 &minus; 0.008)<sup><i>n</i></sup>. The rise per draw (&ldquo;luck value&rdquo;) is not published, so the true curve is not shown.</p>
          </Disclosure>
        </div>
      </section>

      <section className="block slide" id="cs-pricing">
        <div className="wrap-wide">
          <header className="slide-head">
            <p className="kicker">03 &mdash; <b>What this means for pricing</b></p>
            <h2 className="sec-title">The item, not the game, sets the pricing tool</h2>
          </header>
          <div className="cs-impl" role="table" aria-label="Pricing implications by item">
            <div className="cs-impl-row cs-impl-head" role="row">
              <span role="columnheader" />
              {IMPLICATIONS.map((c) => <span key={c.head} role="columnheader" className={`cs-impl-col ${c.tone}`}>{c.head}</span>)}
            </div>
            {IMPL_ROWS.map((label, r) => (
              <div className="cs-impl-row" role="row" key={label}>
                <span role="rowheader" className="cs-impl-k">{label}</span>
                {IMPLICATIONS.map((c) => <span key={c.head} role="cell">{c.rows[r]}</span>)}
              </div>
            ))}
          </div>
          <Takeaway>That is why this project compares <b>what is being sold</b>, not whole games. The same storefront can need two different pricing tools.</Takeaway>

          <div className="cs-evidence">
            <div className="cs-ev">
              <div className="cs-ev-num">36.7%</div>
              <div className="case-note">A guaranteed prize matters economically, not just for goodwill. It moves a draw toward the &ldquo;unique box&rdquo; design, where every purchase yields an item the player doesn&rsquo;t already own. In Chen et al.&rsquo;s model, unique boxes approach the full revenue-optimal ceiling as the catalog grows, while duplicate-allowing boxes capture only about 36.7% of it. <span className="cs-src">&mdash; Chen, Elmachtoub, Hamilton &amp; Lei, 2021</span></div>
            </div>
            <div className="cs-ev">
              <div className="cs-ev-num">~$320M <small>/ 21 months</small></div>
              <div className="case-note">Staying cosmetic-only has a revenue cost: Wuthering Waves, which puts power-affecting characters in its gacha, earned roughly <b>$320M over 21 months</b> &mdash; nearly double Where Winds Meet's pace on a broadly comparable download base. <span className="cs-src">&mdash; Naavik, 2026</span></div>
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
