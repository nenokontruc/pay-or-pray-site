// Home · A — known item. Open the display case, inspect the item, buy it, get exactly what was shown.
// Illustrative currency only; nothing is bought.
import { DisplayCase, ITEMS } from '../../components/Art'
import { Sprite } from '../../components/Pixel'
import { ITEM_PRICE } from '../../lib/homeGacha'

export type ShopStep = 'closed' | 'open' | 'bought'

export function CrownSprite({ size = 64 }: { size?: number }) {
  return (
    <svg viewBox="-1 -1 10 8" width={size} height={(size * 8) / 10} shapeRendering="crispEdges" aria-hidden>
      <Sprite rows={ITEMS.crown} />
    </svg>
  )
}

const gems = (n: number) => `${n.toLocaleString('en-US')} gems`

export function ShopDemo({ step, setStep, inspect, setInspect }: {
  step: ShopStep; setStep: (s: ShopStep) => void; inspect: boolean; setInspect: (b: boolean) => void
}) {
  return (
    <div className="hd-demo hd-shop" aria-live="polite">
      {step === 'closed' && (
        <button type="button" className="hd-art-btn" onClick={() => setStep('open')} aria-label="Open the display case">
          <DisplayCase />
          <span className="hd-cta">Tap the display case</span>
        </button>
      )}

      {step === 'open' && (
        <div className="hd-panel" data-testid="shop-open">
          <div className="hd-item">
            <CrownSprite />
            <div>
              <b className="hd-item-name">Silver Crown</b>
              <span className="hd-item-kind">Cosmetic</span>
            </div>
            <span className="hd-price" data-testid="item-price">{gems(ITEM_PRICE)}</span>
          </div>
          {inspect && (
            <ul className="hd-inspect" data-testid="inspect-details">
              <li>Cosmetic only &mdash; no gameplay advantage</li>
              <li>The item you see is the item you get</li>
              <li>Price shown before you pay: {gems(ITEM_PRICE)}</li>
            </ul>
          )}
          <div className="hd-actions">
            <button type="button" className="hd-btn ghost" aria-expanded={inspect} onClick={() => setInspect(!inspect)}>{inspect ? 'Hide details' : 'Inspect'}</button>
            <button type="button" className="hd-btn" onClick={() => setStep('bought')}>Buy for {gems(ITEM_PRICE)}</button>
          </div>
        </div>
      )}

      {step === 'bought' && (
        <div className="hd-panel hd-receipt" data-testid="receipt">
          <div className="hd-item">
            <CrownSprite size={48} />
            <p><b>&#10003; You paid {gems(ITEM_PRICE)}</b> and received: <b>Silver Crown</b> &mdash; exactly the item shown.</p>
          </div>
          <p className="hd-key"><span>Key idea</span>The outcome was known before you paid.</p>
          <div className="hd-actions"><button type="button" className="hd-btn ghost" onClick={() => { setStep('closed'); setInspect(false) }}>Reset</button></div>
        </div>
      )}
      <p className="hd-fine">Illustrative currency. Nothing is actually bought.</p>
    </div>
  )
}
