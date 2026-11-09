// Step 4–5 · LiveOps dashboard: monthly KPI table, daily revenue sparkline, month log, live exports
// (legacy/index.html:1038-1054, renderLiveOps :1547-1559, sparkline :1536-1546, log :1593-1597).
import { DAYS, EVENT_DAYS, fmtMoney, liveOpsRow, logEntry, marketInfo, type MonthRecord } from '../../sim'
import { useSimulation } from './controller'

function Cell({ text }: { text: string }) {
  // liveOpsRow gives "12.3% ▲5%"; show the arrow with the original up/down styling.
  const i = text.search(/ [▲▼]/)
  if (i < 0) return <td>{text}</td>
  const arrow = text.slice(i + 1)
  return <td>{text.slice(0, i)} <span className={arrow[0] === '▲' ? 'mom-up' : 'mom-dn'}>{arrow}</span></td>
}

/** Daily revenue of one month. Pure chart geometry (same layout as the original SVG). */
export function Sparkline({ h }: { h: MonthRecord }) {
  const W = 560, H = 110, pad = 22
  const max = Math.max(...h.daily.map((x) => x.revenue)) || 1
  const x = (i: number) => pad + i * (W - 2 * pad) / (DAYS - 1)
  const y = (v: number) => H - pad - v / max * (H - 2 * pad)
  const pts = h.daily.map((dd, i) => x(i).toFixed(1) + ',' + y(dd.revenue).toFixed(1)).join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="spark" role="img" aria-label={`Daily revenue for month ${h.season}`}>
      {h.event && <>
        <rect x={x(0) - 4} y={pad - 6} width={x(EVENT_DAYS - 1) - x(0) + 8} height={H - 2 * pad + 6} fill="var(--lightgray)" opacity=".55" />
        <text x={x(0)} y={pad - 9} className="sp-lbl">event week</text>
      </>}
      <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="var(--border)" />
      <polyline points={pts} fill="none" stroke="var(--navy)" strokeWidth="2" />
      <text x={pad} y={H - 6} className="sp-lbl">Day 1</text>
      <text x={W - pad} y={H - 6} textAnchor="end" className="sp-lbl">Day 30</text>
      <text x={W - pad} y={pad - 9} textAnchor="end" className="sp-lbl">peak {fmtMoney(max)}/day</text>
    </svg>
  )
}

export function ExportMsg({ text }: { text: string }) {
  return <div className="export-msg" aria-live="polite">{text}</div>
}

export function LiveOps() {
  const s = useSimulation()
  const hist = s.game.state.history
  const mk = s.game.state.market ? marketInfo(s.game) : null
  const last = hist[hist.length - 1]
  return (
    <div className="game-panel" style={{ marginTop: 20 }}>
      <h3 className="game-h3">LiveOps dashboard</h3>
      <p className="game-note" style={{ margin: '0 0 12px' }}>Post-launch analysis: track Paying Rate, ARPPU, daily active users and churn month over month, and map changes to your events &mdash; not just whether revenue went up.</p>
      <div className="table-scroll">
        <table className="data-table liveops" id="liveops-table">
          <thead><tr><th>Month</th><th>Revenue</th><th>Paying rate</th><th>ARPPU</th><th>Avg DAU</th><th>Churn</th><th>Event</th><th>Goodwill</th></tr></thead>
          <tbody>
            {hist.length === 0
              ? <tr><td colSpan={8} className="game-note">No months yet.</td></tr>
              : hist.map((h, i) => <tr key={h.season}>{liveOpsRow(h, hist[i - 1]).map((c, k) => <Cell key={k} text={c} />)}</tr>)}
          </tbody>
        </table>
      </div>
      {last && (
        <div id="spark-wrap">
          <div className="game-note" style={{ margin: '16px 0 4px' }}><b>Daily revenue &middot; Month {last.season}</b></div>
          <Sparkline h={last} />
        </div>
      )}
      <div id="game-log" className="game-log" style={{ marginTop: 14 }}>
        {mk && hist.slice().reverse().map((h) => {
          const e = logEntry(h, mk)
          return (
            <div key={h.season} className={`log-entry ${e.warn ? 'warn' : ''}`}>
              <div className="le-top"><span>{e.title}</span><span>{e.goodwill}</span></div>
              <div className="le-rev">{e.revenue}</div>
              <div className="le-flavor">{e.flavor} <span className="le-sub">{e.sub}</span></div>
            </div>
          )
        })}
      </div>
      {hist.length > 0 && (
        <div className="export-wrap">
          <div className="export-row" id="export-row-live">
            <button type="button" className="lab-mini" data-export="months" onClick={() => s.exportFile('months')}>Monthly KPIs (CSV)</button>
            <button type="button" className="lab-mini" data-export="daily" onClick={() => s.exportFile('daily')}>Daily KPIs (CSV)</button>
            <button type="button" className="lab-mini" data-export="panel" onClick={() => s.exportFile('panel')}>Player panel (CSV)</button>
          </div>
          <ExportMsg text={s.exportMsg.live} />
        </div>
      )}
    </div>
  )
}
