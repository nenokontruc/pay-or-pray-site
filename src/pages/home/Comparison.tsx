// Home · C — after trying both: what was known, what was uncertain, what set the spending, which pricing problem.
import { DRAW_PRICE, ITEM_PRICE, PITY, expectedDrawsToFeatured, type GachaState } from '../../lib/homeGacha'

const gems = (n: number) => `${n.toLocaleString('en-US')} gems`

export function Comparison({ bought, g }: { bought: boolean; g: GachaState }) {
  const ready = bought && g.draws > 0
  if (!ready) {
    return (
      <div className="hd-compare-todo" aria-live="polite">
        <span className="hd-k">Try both to compare</span>
        <span className={`hd-check ${bought ? 'done' : ''}`}>{bought ? '✓' : '○'} Buy the crown</span>
        <span className={`hd-check ${g.draws > 0 ? 'done' : ''}`}>{g.draws > 0 ? '✓' : '○'} Draw at least once</span>
      </div>
    )
  }
  const exp = expectedDrawsToFeatured()
  const rows: [string, string, string][] = [
    ['Known before paying', 'The item and its price', 'The price per draw and the odds'],
    ['Still uncertain', 'Nothing', 'Which reward, and how many draws'],
    ['Final spending set by', `The price tag: ${gems(ITEM_PRICE)}`, `Luck: ${g.draws} draw${g.draws === 1 ? '' : 's'} = ${gems(g.spent)} so far`],
  ]
  return (
    <div className="hd-compare" aria-live="polite" data-testid="comparison">
      <h3 className="hd-compare-h">What just happened?</h3>
      <div className="hd-cmp" role="table" aria-label="Known item versus a chance at it">
        <div className="hd-cmp-row hd-cmp-head" role="row"><span role="columnheader" /><span role="columnheader">Known item</span><span role="columnheader">A chance at it</span></div>
        {rows.map(([k, a, b]) => (
          <div className="hd-cmp-row" role="row" key={k}>
            <span role="rowheader">{k}</span>
            <span role="cell" className="known">{a}</span>
            <span role="cell" className={k === 'Known before paying' ? 'known' : 'uncertain'}>{b}</span>
          </div>
        ))}
        <div className="hd-cmp-row" role="row">
          <span role="rowheader">Pricing problem</span>
          <span role="cell" className="known"><b>EVC applies directly</b></span>
          <span role="cell" className="uncertain"><b>EVC in expectation</b></span>
        </div>
      </div>
      <p className="hd-fine">Teaching odds: the featured outfit costs between {gems(DRAW_PRICE)} and {gems(DRAW_PRICE * PITY)}; about {exp.toFixed(1)} draws (≈ {gems(Math.round(exp * DRAW_PRICE))}) on average.</p>
      <p className="hd-next">See both calculators on the <a href="#framework">Framework</a> page, and how two real games design the draw in the <a href="#case-study">Case Study</a>.</p>
    </div>
  )
}
