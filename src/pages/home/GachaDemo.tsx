// Home · B — a chance at it. A teaching gashapon: 100 gems per draw, 5 / 20 / 75 %, hard guarantee at 50.
// Hypothetical teaching model (src/lib/homeGacha.ts) — not Honor of Kings or Where Winds Meet data.
import { CAPSULE, Gashapon } from '../../components/Art'
import { Sprite } from '../../components/Pixel'
import { DRAW_PRICE, ODDS, PITY, nextFeaturedChance, type GachaState, type Tier } from '../../lib/homeGacha'

const LABEL: Record<Tier, string> = { featured: 'Featured outfit', rare: 'Rare accessory', common: 'Common emote' }
const gems = (n: number) => `${n.toLocaleString('en-US')} gems`
const pct = (p: number) => `${Math.round(p * 100)}%`

export function GachaDemo({ g, onDraw, onReset }: { g: GachaState; onDraw: (k: number) => void; onReset: () => void }) {
  const last = g.history[g.history.length - 1]
  return (
    <div className="hd-demo hd-gacha">
      <div className="hd-machine-row">
        <button type="button" className="hd-art-btn hd-machine" onClick={() => onDraw(1)} aria-label={`Draw once for ${gems(DRAW_PRICE)}`}>
          <Gashapon />
          <span className="hd-cta">{g.draws === 0 ? 'Tap the machine to draw' : 'Tap to draw again'}</span>
        </button>
        <div className="hd-result" aria-live="polite" data-testid="last-result">
          {last ? (
            <div key={last.n} className={`hd-capsule-out ${last.tier}`}>
              <svg viewBox="-1 -1 7 7" width="44" height="44" shapeRendering="crispEdges" aria-hidden className="hd-capsule"><Sprite rows={CAPSULE} /></svg>
              <span className="hd-out-n">Draw {last.n}</span>
              <b className="hd-out-tier">{LABEL[last.tier]}</b>
              {last.guaranteed && <span className="hd-out-g">guaranteed (draw 50 without the featured outfit)</span>}
            </div>
          ) : <p className="hd-out-empty">Your capsule will appear here.</p>}
        </div>
      </div>

      <div className="hd-odds" role="img" aria-label="Chance per draw: featured outfit 5%, rare accessory 20%, common emote 75%">
        {ODDS.map((o) => <span key={o.tier} className={`hd-odd ${o.tier}`} style={{ flexGrow: o.p * 100 }}>{pct(o.p)}</span>)}
      </div>
      <ul className="hd-odds-legend" aria-hidden>
        {ODDS.map((o) => <li key={o.tier}><i className={`hd-sw ${o.tier}`} />{o.label} <b>{pct(o.p)}</b></li>)}
      </ul>
      <p className="hd-fine">{gems(DRAW_PRICE)} per draw. If 49 draws miss the featured outfit, draw 50 gives it for certain; winning it resets the count.</p>

      {/* Progressive disclosure: the running totals appear only once there is something to count. */}
      {g.draws > 0 && (
        <>
          <dl className="hd-stats">
            <div><dt>Draws</dt><dd data-testid="g-draws">{g.draws}</dd></div>
            <div><dt>Gems spent</dt><dd data-testid="g-spent">{g.spent.toLocaleString('en-US')}</dd></div>
            <div><dt>Featured won</dt><dd data-testid="g-wins">{g.featuredWins}</dd></div>
            <div><dt>Next draw</dt><dd data-testid="g-next">{pct(nextFeaturedChance(g))} featured</dd></div>
          </dl>
          <div className="hd-pity" aria-label={`${g.sinceFeatured} of ${PITY} draws since the featured outfit`}>
            <span className="hd-pity-k">Since featured</span>
            <span className="hd-pity-bar"><span style={{ width: `${(g.sinceFeatured / PITY) * 100}%` }} /></span>
            <span className="hd-pity-v" data-testid="g-pity">{g.sinceFeatured} / {PITY}</span>
          </div>
          <ol className="hd-history" aria-label="Last 10 results">
            {g.history.slice(-10).map((d) => <li key={d.n} className={d.tier} title={`Draw ${d.n}: ${LABEL[d.tier]}`}><span className="hd-sr">{`Draw ${d.n}: ${LABEL[d.tier]}`}</span></li>)}
          </ol>
        </>
      )}

      <div className="hd-actions">
        <button type="button" className="hd-btn" onClick={() => onDraw(1)}>Draw &middot; {gems(DRAW_PRICE)}</button>
        {g.draws > 0 && <>
          <button type="button" className="hd-btn ghost" onClick={() => onDraw(10)}>Draw &times;10</button>
          <button type="button" className="hd-btn ghost" onClick={onReset}>Reset</button>
        </>}
      </div>
      {g.draws > 0 && <p className="hd-key"><span>Key idea</span>You paid before you knew what you would get &mdash; and how much you spend depends on luck.</p>}
      <p className="hd-fine"><b>Teaching odds</b> &mdash; hypothetical, not Honor of Kings or Where Winds Meet data.</p>
    </div>
  )
}
