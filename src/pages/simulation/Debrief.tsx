// Step 5–7 · 8-month report, exports and replay (legacy/index.html:1662-1727).
// Grade, numbers and sentences come from report.debrief(); this file only adds emphasis and links.
import type { ReactNode } from 'react'
import { debrief, fmtMoney, marketInfo, pct, WEIGHT } from '../../sim'
import { useSimulation } from './controller'
import { ExportMsg } from './LiveOps'

const LEADS = ['Best month:', 'Event effect:', 'Retention:', 'Price ladder check:', 'Market note:', 'Testing:']

/** Bold the lead-in, the dead-tier list, and link the two page names — text content is unchanged. */
function Para({ text, dead }: { text: string; dead: string }) {
  const lead = LEADS.find((l) => text.startsWith(l))
  let rest: ReactNode = lead ? text.slice(lead.length) : text
  if (dead && typeof rest === 'string' && rest.includes(dead)) {
    const [a, b] = rest.split(dead)
    rest = <>{a}<b>{dead}</b>{b}</>
  }
  if (typeof rest === 'string' && rest.includes('Diagnostic page') && rest.includes('Industry page')) {
    const [a, r1] = rest.split('Diagnostic page')
    const [b, c] = r1.split('Industry page')
    rest = <>{a}<a href="#diagnostic">Diagnostic page</a>{b}<a href="#industry">Industry page</a>{c}</>
  }
  return <p>{lead && <b>{lead}</b>}{rest}</p>
}

export function Debrief() {
  const s = useSimulation()
  const d = debrief(s.game)
  const mk = marketInfo(s.game)
  const [head, ...paras] = d.paragraphs
  const dead = d.deadTiers.join(', ')
  return (
    <div id="game-over">
      <div className="debrief">
        <span className="grade">Grade {d.grade}</span>
        <h2>8-month report &middot; {mk.label}</h2>
        <div className="d-stats">
          <div className="d-stat"><div className="dl">Total Revenue</div><div className="dv">{fmtMoney(d.totalRevenue)}</div></div>
          <div className="d-stat"><div className="dl">Final Population</div><div className="dv">{Math.round(d.finalPopulation).toLocaleString('en-US')}</div></div>
          <div className="d-stat"><div className="dl">Launch Cohort Retained</div><div className="dv">{pct(d.retention)}</div></div>
        </div>
        <p><b>{head}</b></p>
        <div className="share-bars">
          {d.shares.map((x) => (
            <div className="share-bar" key={x.id}>
              <span>{x.label}</span>
              <div className="sb-track"><div className="sb-fill" style={{ width: (x.share * 100).toFixed(1) + '%' }} /></div>
              <span className="sb-v">{(x.share * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
        {paras.map((t, i) => <Para key={i} text={t} dead={dead} />)}

        <div className="game-panel export-wrap" style={{ marginTop: 22, background: 'var(--bg)' }}>
          <h3 className="game-h3">Analyze your run</h3>
          <p className="game-note" style={{ margin: '0 0 6px' }}>Five files, ready for Python, R, Excel, or Tableau. Every simulated player represents {WEIGHT} real players (the <code>weight</code> column).</p>
          <div className="export-row">
            <button type="button" className="lab-mini" data-export="months" onClick={() => s.exportFile('months')}>Monthly KPIs</button>
            <button type="button" className="lab-mini" data-export="daily" onClick={() => s.exportFile('daily')}>Daily KPIs (240 days)</button>
            <button type="button" className="lab-mini" data-export="panel" onClick={() => s.exportFile('panel')}>Player panel (incl. non-payers)</button>
            <button type="button" className="lab-mini" data-export="txns" onClick={() => s.exportFile('txns')}>Transactions</button>
            <button type="button" className="lab-mini" data-export="tests" onClick={() => s.exportFile('tests')}>Test results</button>
            <button type="button" className="lab-mini ghost" data-export="copy" onClick={() => s.copyMonths('debrief')}>Copy monthly KPIs</button>
          </div>
          <ExportMsg text={s.exportMsg.debrief} />
          <details className="profiles" style={{ marginTop: 14 }}>
            <summary>What&rsquo;s in each file &amp; starter analyses</summary>
            <div className="src-note">
              <b>Monthly KPIs</b> &mdash; one row per month: your shop setup, revenue by package, paying rate, ARPPU, DAU, MAU, stickiness, churn, installs, goodwill.<br />
              <b>Daily KPIs</b> &mdash; one row per day: DAU, revenue, purchases, payers, and whether an event was running.<br />
              <b>Player panel</b> &mdash; one row per player per month, <i>including players who spent nothing</i>: segment, install month, budget, engagement, interest in each package, active days, spend by package, payer flag, and whether they churned.<br />
              <b>Transactions</b> &mdash; one row per purchase, with the day it happened.<br /><b>Test results</b> &mdash; what your closed beta, survey, and A/B tests reported.<br /><br />
              &bull; <b>Event lift:</b> plot daily revenue and shade <code>event_active</code> &mdash; is the spike new money, or spending pulled forward?<br />
              &bull; <b>Paying rate vs. ARPPU:</b> did revenue grow from more payers or bigger payers, month over month?<br />
              &bull; <b>Churn drivers:</b> in the player panel, compare <code>churned_after_month</code> for payers vs. non-payers, and by segment.<br />
              &bull; <b>Cohort retention:</b> group players by <code>install_month</code> and track how many are still active each month.<br />
              &bull; <b>Who pays for what:</b> sum <code>spend_*</code> by segment (weighted) &mdash; do whales carry the gacha?<br />
              &bull; <b>Test accuracy:</b> compare your closed-beta revenue per player with actual Month 1 revenue per player.
            </div>
          </details>
        </div>
        <button type="button" className="btn" id="replay-btn" style={{ marginTop: 20 }} onClick={s.replay}>Play again</button>
      </div>
    </div>
  )
}
