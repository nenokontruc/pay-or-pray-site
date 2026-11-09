// Section 03 in PRESENT mode: the pricing-implications table as three comparable scenarios.
// Labels are shortened from the table's own cells (IMPLICATIONS in CaseStudy.tsx) and the comparison
// table (src/data/caseStudy.tsx); nothing new is claimed. The full table stays in NORMAL mode.
import type { ReactNode } from 'react'
import { PixelIcon } from '../../components/PixelIcon'

interface Scenario { id: string; icon: string; name: string; sub: string; chance: { uncertain: boolean; text: ReactNode }[]; chooser: ReactNode; tool: string }

const SCENARIOS: Scenario[] = [
  { id: 'fixed', icon: 'cart', name: 'Fixed-price skins', sub: 'both games',
    chance: [{ uncertain: false, text: 'Nothing (value known up front)' }],
    chooser: 'You', tool: 'Standard EVC' },
  { id: 'hok', icon: 'capsule', name: 'Honor of Kings draw', sub: '积分夺宝',
    chance: [{ uncertain: true, text: 'How much you pay (1–361 draws)' }],
    chooser: 'You (crystal → skin of your choice)', tool: 'Close to deterministic at the end' },
  { id: 'wwm', icon: 'capsule', name: 'Where Winds Meet draw', sub: 'Echo gacha',
    chance: [
      { uncertain: true, text: 'How much you pay' },
      { uncertain: true, text: <>Whether you win the outfit, until the 150-pull guarantee <span className="cs-sc-qual">(source-reported, disputed)</span></> },
    ],
    chooser: 'The studio (one specific outfit)', tool: 'EVC in expectation, until the guarantee' },
]

export function ScenarioStrip() {
  return (
    <div className="present-only" data-testid="scenario-strip">
      <p className="cs-sc-axis"><span>Chance decides more</span> <span aria-hidden>&rarr;</span></p>
      <ul className="cs-sc" aria-label="Three things a player can buy: what chance decides, who chooses the prize, and which pricing tool applies">
        {SCENARIOS.map((s) => (
          <li key={s.id} className={`cs-sc-card sc-${s.id}`}>
            <h3 className="cs-sc-head"><PixelIcon name={s.icon} size={28} /><span>{s.name}<small>{s.sub}</small></span></h3>
            <dl>
              <dt>Chance decides</dt>
              {s.chance.map((c, i) => (
                <dd key={i} className={`cs-sc-chance ${c.uncertain ? 'uncertain' : 'known'}`}>
                  <span className="cs-sc-mark" aria-hidden>{c.uncertain ? '?' : '✓'}</span>
                  <span className="sr-only">{c.uncertain ? 'Uncertain: ' : 'Known: '}</span>{c.text}
                </dd>
              ))}
              <dt>Who chooses the prize</dt><dd>{s.chooser}</dd>
              <dt>Pricing tool</dt><dd className="cs-sc-tool">{s.tool}</dd>
            </dl>
          </li>
        ))}
      </ul>
    </div>
  )
}
