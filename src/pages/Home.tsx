import { DisplayCase, Gashapon, Seal } from '../components/Art'

const STEPS = [
  ['Freemium', <>&ldquo;Free + premium.&rdquo; The game is free to play; the company earns money by selling optional extras inside it. Most players never pay &mdash; a small share pays a lot.</>],
  ['Gacha / loot box', <>A paid lucky draw inside a game. You spend money for a <i>chance</i> at a rare item. Named after Japanese capsule-toy machines.</>],
  ['Pay-to-win', <>When money buys a real competitive advantage, not just a new look. Players who don't pay often feel this is unfair &mdash; and leave.</>],
  ['Willingness to pay', <>The most a person would pay for something. It differs between people, and between countries &mdash; which is why one global price rarely works.</>],
] as const

const CARDS = [
  ['industry', 'Industry', 'How big the market is, how freemium got here, the main ways free games make money, and how governments regulate it.'],
  ['framework', 'Framework', 'The pricing tools behind the analysis — how to work out the most a player would rationally pay.'],
  ['case-study', 'Case Study', 'Two real Chinese games that both sell fixed-price skins and lucky draws — but design the draw in opposite ways.'],
  ['diagnostic', 'Diagnostic', 'A simple 2×2 grid for judging how risky any in-game product is before it launches.'],
  ['simulation', 'Simulation', 'Play the manager: pick a country, test your shop before launch, run 8 months day by day, then download the data.'],
  ['about', 'About', 'Who built this project and why.'],
] as const

export default function Home() {
  return (
    <>
        <div className="wrap-wide">
          <section className="hero">
            <h1>When does <em>freemium</em> make sense?</h1>
            <p className="lede">
              Most of today's biggest mobile games are free to download &mdash; yet they earn billions. This project explains how, and asks one question: <b>when does &ldquo;free&rdquo; actually pay off?</b> The short answer depends on one thing most people never notice: whether players <b>know exactly what they're buying</b>, or are <b>paying for a chance</b> at it.
            </p>

            <div className="duality">
              <div className="card solid">
                <div className="stage"><DisplayCase /></div>
                <div className="body">
                  <span className="badge solid">Deterministic</span>
                  <h3>Fixed Price</h3>
                  <p>Like buying a specific trading card from a shop: you see it, you pay, you get it. Players compare options and choose.</p>
                </div>
              </div>
              <div className="card outline">
                <div className="stage"><Gashapon /></div>
                <div className="body">
                  <span className="badge outline">Probabilistic</span>
                  <h3>Random Draw</h3>
                  <p>Like buying a sealed pack of cards: you pay first and find out what's inside after. Luck, near-misses, and &ldquo;just one more&rdquo; drive spending.</p>
                </div>
              </div>
            </div>

            <div className="byline">OPM 6600 — Pricing &amp; Revenue Optimization · Final Project · Trúc Trinh</div>
          </section>
        </div>

        <div className="wrap-wide">
          <section className="block" style={{ paddingTop: 8 }}>
            <div className="roadmap-head">
              <div>
                <h2 className="sec-title">New here? The 60-second version</h2>
                <p className="sec-lede">No gaming or pricing background needed. Four ideas are enough to follow everything on this site.</p>
              </div>
              <div className="mascot"><Seal size={112} /></div>
            </div>
            <ol className="steps">
              {STEPS.map(([title, body], i) => (
                <li className="step" key={title}>
                  <div className="n">{i + 1}</div>
                  <h4>{title}</h4>
                  <p>{body}</p>
                </li>
              ))}
            </ol>
            <div className="callout"><b>The argument in one sentence:</b> selling a known item and selling a lucky draw are two different pricing problems &mdash; they need different tools, carry different risks, and players in different countries react to them differently. The rest of the site shows the evidence.</div>
          </section>

          <section className="block" style={{ paddingTop: 0 }}>
            <div className="cards-head">
              <div>
                <h2 className="sec-title">Read it in order, or jump to what you need</h2>
                <p className="sec-lede">Six pages beyond this one. If you're short on time, start with the <a href="#case-study">Case Study</a>, then try the <a href="#simulation">Simulation</a> yourself.</p>
              </div>
              <div className="mascot mascot-sign">
                <div className="sign">Start here</div>
                <div className="pole" />
                <Seal size={104} flipper label="Baby seal holding a Start here sign" />
              </div>
            </div>
            <div className="nav-cards">
              {CARDS.map(([id, title, text], i) => (
                <a className="nav-card" href={`#${id}`} key={id}>
                  <div className="n">{String(i + 1).padStart(2, '0')}</div>
                  <h4>{title}</h4>
                  <p>{text}</p>
                </a>
              ))}
            </div>
          </section>
        </div>
      </>
  )
}
