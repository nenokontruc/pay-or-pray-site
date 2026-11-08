import { Handheld, Seal } from '../components/Art'
import { PixelIcon } from '../components/PixelIcon'
import { Disclosure, Takeaway, SlideHead } from '../components/Disclosure'
import { MarketOverview } from './industry/MarketOverview'
import { Timeline } from './industry/Timeline'
import { Models } from './industry/Models'
import { Economies } from './industry/Economies'
import { Regulation } from './industry/Regulation'
import { PUBLISHERS_TEXT, SLOWDOWN_TEXT } from '../data/industry'

const SECTIONS = [
  ['market', 'Market'], ['history', 'History'], ['models', 'Models'], ['economies', 'Economies'], ['rules', 'Rules'],
] as const

export default function Industry() {
  const jump = (id: string) => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }
  return (
    <>
      <div className="wrap-wide page-hero">
        <div className="page-hero-grid">
          <div>
            <p className="kicker">Industry</p>
            <h1 className="page-title">The market, its models, and where the rules are headed</h1>
            <p className="page-lede">Four things worth knowing before the case study: how large this market is, how freemium got here, the full menu of ways a free game makes money, and the regulatory patchwork that happens to be the reason exact gacha odds are even public.</p>
          </div>
          <div className="page-hero-art"><Handheld /></div>
        </div>
        <nav className="subnav" aria-label="On this page">
          {SECTIONS.map(([id, label], i) => (
            <button key={id} type="button" onClick={() => jump(id)}><span>{String(i + 1).padStart(2, '0')}</span>{label}</button>
          ))}
        </nav>
      </div>

      <section className="block slide" id="market">
        <div className="wrap-wide">
          <SlideHead n="01" title="The market this argument sits inside" lede="Mobile gaming is huge, highly monetized, and still growing — slowly." />
          <MarketOverview />
          <Takeaway>Mobile is 55% of a $188.8B games market — yet 56% of players spend nothing, and mobile game in-app purchases grew just 1.3% in 2025.</Takeaway>
          <Disclosure label="Explore the analysis">
            <p>Mobile gaming is the largest single platform in the games industry, and freemium is why — nearly every top-grossing mobile title today is free to download. But the market is also showing its first signs of maturing.</p>
            <div className="ctx">
              <div className="ctx-text"><h4>More market context: publishers and the 2025 slowdown</h4><p>{PUBLISHERS_TEXT}</p><p>{SLOWDOWN_TEXT}</p></div>
              <PixelIcon name="coins" size={72} />
            </div>
          </Disclosure>
        </div>
      </section>

      <section className="block slide" id="history">
        <div className="wrap-wide">
          <SlideHead n="02" title="How freemium got here" lede="Eight milestones, three eras. Select one." />
          <Timeline />
          <Takeaway>Freemium moved through three eras, and each one changed what a pricing manager has to decide.</Takeaway>
          <Disclosure label="Explore the analysis">
            <p>Freemium wasn’t invented by mobile games. It moved through three eras — and each one changed what a pricing manager has to decide.</p>
          </Disclosure>
        </div>
      </section>

      <section className="block slide" id="models">
        <div className="wrap-wide">
          <SlideHead n="03" title="Seven ways to monetize a free game" lede="Tap a model to see how it works." />
          <Models />
          <Takeaway>Freemium is an umbrella over genuinely different pricing mechanisms — and the deterministic / probabilistic line is the one this project’s argument runs along.</Takeaway>
          <Disclosure label="Explore the analysis">
            <p>Freemium is an umbrella over genuinely different pricing mechanisms. The badge marks which side of the deterministic / probabilistic line each one sits on by default — the line this project’s argument runs along.</p>
          </Disclosure>
        </div>
      </section>

      <section className="block slide" id="economies">
        <div className="wrap-wide">
          <SlideHead n="04" title="Two economies, not one" lede="Two pricing problems a publisher solves at once — inside the game, and across countries." />
          <Economies />
          <Takeaway>Porting a US price ladder unchanged isn’t neutral — it is mispriced for the other market’s willingness to pay.</Takeaway>
          <Disclosure label="Explore the analysis — the practitioner interview">
            <p>Pricing an item isn't just about its role inside the game. An industry practitioner interviewed for this project draws a sharp line between two distinct pricing problems a publisher solves at once.</p>
            <div className="callout">This is precisely the variable the <a href="#simulation">Simulation</a> on this site now lets you test directly — pick a target market, then watch whether your pricing was actually calibrated to it or just carried over from habit.</div>
          </Disclosure>
        </div>
      </section>

      <section className="block slide" id="rules">
        <div className="wrap-wide">
          <SlideHead n="05" title="The rules are catching up to the mechanic" lede="Key regulations on gacha and loot boxes, by jurisdiction." />
          <Regulation />
          <Takeaway>China’s 2017 disclosure law is the reason Honor of Kings’ and Where Winds Meet’s exact probabilities are public at all.</Takeaway>
          <Disclosure label="Explore the analysis">
            <p>No two jurisdictions regulate gacha the same way — and that patchwork is precisely why this project can cite exact drop rates for Honor of Kings and Where Winds Meet in the first place.</p>
            <div className="callout"><b>Why this matters for the case study:</b> China's 2017 disclosure law is not incidental to this project — it's the reason Honor of Kings' and Where Winds Meet's exact probabilities are public at all. A regulatory requirement built for consumer protection turned out to be the dataset this entire pricing analysis depends on.</div>
          </Disclosure>
        </div>
      </section>
      <div className="wrap-wide seal-sign-row"><Seal size={72} /></div>
    </>
  )
}
