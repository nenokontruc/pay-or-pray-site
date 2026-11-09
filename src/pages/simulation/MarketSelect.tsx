// Step 1 · market selection (legacy/index.html:966-993). Text is verbatim from the original.
import type { ReactNode } from 'react'
import { MARKET_IDS, type MarketId } from '../../sim'
import { useSimulation } from './controller'

const CARDS: Record<MarketId, { badge: 'solid' | 'outline'; badgeText: string; name: string; text: string }> = {
  us: { badge: 'solid', badgeText: 'High spend', name: 'United States', text: 'High willingness to pay. Strong backlash against pay-to-win and loot boxes.' },
  cn: { badge: 'solid', badgeText: 'High spend', name: 'China', text: 'Whale-driven spending. Pay-to-win far more accepted. Drop rates must be disclosed by law.' },
  jp: { badge: 'solid', badgeText: 'Highest spend', name: 'Japan', text: 'Highest spending per player. Gacha is culturally embraced, not just tolerated.' },
  vn: { badge: 'outline', badgeText: 'Mid spend', name: 'Vietnam', text: 'Roughly half US willingness to pay. Best-selling packages sit around $5–7.' },
  id: { badge: 'outline', badgeText: 'Low spend', name: 'Indonesia', text: 'Huge player base, small purchases. Many pay with prepaid phone credit, in bite-sized amounts.' },
}

const PROFILES: [string, string, string, string, ReactNode][] = [
  ['United States', 'High', 'Strong backlash', 'Moderate backlash', 'Pay-to-win generally not accepted by Western gamers (Newzoo via CNBC, 2018); Battlefront II loot-box backlash'],
  ['China', 'High, whale-heavy', 'Largely accepted', 'Mild', 'Higher acceptance of paid progress/boosts (Newzoo via CNBC, 2018); mandatory drop-rate disclosure since 2017'],
  ['Japan', 'Highest per player', 'Moderate', 'Embraced', <>&ldquo;Exceptionally high&rdquo; ARPU and gacha-led spending (Sensor Tower, 2025); ~90% of top-grossing titles use gacha (GameRefinery)</>],
  ['Vietnam', 'Mid', 'Moderate', 'Mild', <>Best-selling package tier ~$5&ndash;7 vs. $10&ndash;19 in the US (industry interview, 2026)</>],
  ['Indonesia', 'Low, small-ticket', 'Moderate', 'Moderate', 'Carrier-billing, bite-sized spending (Xsolla, 2025); Southeast Asia spend per user a fraction of Japan/Korea (Moloco, 2025)'],
]

export function MarketSelect() {
  const s = useSimulation()
  return (
    <div id="market-select">
      <h3 className="game-h3">Step 1 &middot; Choose your launch market</h3>
      <p className="game-note" style={{ marginBottom: 16 }}>Same game, same packages &mdash; but each country's players spend differently and react differently to lucky draws and pay-to-win. Your choice holds for all 8 months, like a real launch decision.</p>
      <div className="market-grid" role="radiogroup" aria-label="Launch market">
        {MARKET_IDS.map((m) => {
          const c = CARDS[m]
          return (
            <label key={m} className={`pkg-card ${s.marketChoice === m ? 'is-checked' : ''}`} data-market={m}>
              <input type="radio" name="market" value={m} checked={s.marketChoice === m} onChange={() => s.chooseMarket(m)} />
              <span className={`badge ${c.badge}`}>{c.badgeText}</span>
              <h4>{c.name}</h4>
              <p>{c.text}</p>
            </label>
          )
        })}
      </div>
      <details className="profiles">
        <summary>How each market is modeled &mdash; and where that comes from</summary>
        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>Market</th><th>Spending level</th><th>Pay-to-win reaction</th><th>Gacha reaction</th><th>Evidence</th></tr></thead>
            <tbody>{PROFILES.map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i}>{c}</td>)}</tr>)}</tbody>
          </table>
        </div>
        <p className="src-note"><b>Honesty note:</b> the direction of each difference comes from the sources above. The exact numbers inside the simulation are illustrative calibrations chosen to reproduce those directions &mdash; for example, the model&rsquo;s best single price lands near $12 in the US and near $6.50 in Vietnam, consistent with the practitioner benchmarks, and most simulated players (72&ndash;82%) never pay, with Japan converting the most and Indonesia the least. They are not measured market statistics.</p>
      </details>
      <button type="button" className="btn btn-wide" style={{ marginTop: 20 }} onClick={s.confirmMarket}>Confirm market &amp; open the pre-launch lab &rarr;</button>
    </div>
  )
}
