// Step 3 · Test lab (legacy/index.html:1022-1036, renderAB :1423, updateHUD :1447-1460, RUNNERS :1482-1513).
// All numbers come from the engine's LabResult; this file only formats and lays them out.
import { fmt2, labAvailability, normalizePlan, normPlan, pct, planSummary, CREDITS, type LabResult } from '../../sim'
import { TEST_NAMES, useSimulation, type LabCard } from './controller'

const AB_DEFAULT = 'Compare A with your current shop (B) on two equal cohorts. Costs 1 credit.'
const money = (n: number | null) => (n === null ? '—' : fmt2(n))

function ResultBody({ r }: { r: LabResult }) {
  if (r.kind === 'cbt') {
    return (
      <>
        <b className="t">Closed beta &middot; 150 testers</b>Shop: {r.summary}<br />
        Revenue per player: <b>{fmt2(r.mean)}</b> (95% range {fmt2(r.lo)}&ndash;{fmt2(r.hi)}) &middot; Paying rate {pct(r.payingRate)} &middot; ARPPU {money(r.arppu)}
        <table><thead><tr><th>Package</th><th>Buyers</th><th>Rev / player</th></tr></thead>
          <tbody>{r.rows.map((x) => <tr key={x.id}><td>{x.label}</td><td>{x.buyers}</td><td>{fmt2(x.revPerPlayer)}</td></tr>)}</tbody></table>
        <span className="game-note">Small cohort: treat this as a direction, not a forecast. The wide range is the point.</span>
      </>
    )
  }
  if (r.kind === 'survey') {
    return (
      <>
        <b className="t">In-game survey &middot; 300 respondents</b>&ldquo;What&rsquo;s the most you&rsquo;d pay this month for&hellip;?&rdquo; Most players answer $0; percentiles are among those who&rsquo;d pay something.
        <table><thead><tr><th>Package</th><th>Would pay</th><th>25th pct</th><th>Median</th><th>75th pct</th><th>90th pct</th></tr></thead>
          <tbody>{r.rows.map((x) => <tr key={x.id}><td>{x.label}</td><td>{pct(x.share)}</td><td>{fmt2(x.p25)}</td><td>{fmt2(x.p50)}</td><td>{fmt2(x.p75)}</td><td>{fmt2(x.p90)}</td></tr>)}</tbody></table>
        <span className="game-note">Careful: people overstate what they&rsquo;d really spend (hypothetical bias). Stated answers typically run around 1.35&times; real behavior &mdash; discount before setting prices. The top 10% matter most: a few big spenders often carry the revenue.</span>
      </>
    )
  }
  const verdict = r.significant
    ? `${r.winner} earns more per player, and the gap is statistically clear (z = ${r.z.toFixed(2)}).`
    : `No statistically clear winner (|z| = ${Math.abs(r.z).toFixed(2)} < 1.96). The difference could be noise.`
  return (
    <>
      <b className="t">A/B test &middot; {r.a.n} vs. {r.b.n} players</b>
      <table><thead><tr><th></th><th>Rev / player</th><th>Paying rate</th><th>ARPPU</th></tr></thead>
        <tbody>
          <tr><td>A</td><td>{fmt2(r.a.mean)}</td><td>{pct(r.a.payingRate)}</td><td>{money(r.a.arppu)}</td></tr>
          <tr><td>B</td><td>{fmt2(r.b.mean)}</td><td>{pct(r.b.payingRate)}</td><td>{money(r.b.arppu)}</td></tr>
        </tbody></table>
      {verdict}<br />
      <span className="game-note">A: {r.a.summary}<br />B: {r.b.summary}</span>
    </>
  )
}

function Card({ c }: { c: LabCard }) {
  return (
    <div className="lab-result" data-kind={c.type === 'result' ? c.result.kind : 'message'}>
      {c.type === 'result' ? <ResultBody r={c.result} /> : <><b className="t">{c.title}</b>{c.text}</>}
    </div>
  )
}

export function LabPanel() {
  const s = useSimulation()
  const st = s.game.state
  const busy = !!s.pending
  const avail = labAvailability(s.game, s.plan)
  const cur = normalizePlan(s.plan)
  const same = !!st.variantA && normPlan(st.variantA) === normPlan(cur)
  return (
    <div className="game-panel" id="lab-panel">
      <h3 className="game-h3">Test lab <span className="credits" id="credits">{st.credits} credit{st.credits === 1 ? '' : 's'}</span></h3>
      <p className="game-note" style={{ margin: '0 0 14px' }}>How a publisher validates a plan before and after launch, per the industry practitioner interviewed for this project. Each test costs one credit. Tests don't earn revenue and don't affect goodwill.</p>
      <div className="lab-actions">
        <button type="button" className="lab-btn" id="t-cbt" disabled={busy || !!avail.cbt} onClick={() => s.askTest('cbt')}>
          <b>Closed beta test</b><span>Run your current shop on a small cohort. Real behavior &mdash; but a small, noisy sample. Pre-launch only.</span>
        </button>
        <button type="button" className="lab-btn" id="t-survey" disabled={busy || !!avail.survey} onClick={() => s.askTest('survey')}>
          <b>In-game survey</b><span>Ask players what they'd pay. Cheap insight &mdash; but people overstate what they'd really spend. Pre-launch only.</span>
        </button>
        <button type="button" className="lab-btn" id="t-saveA" disabled={busy || !!avail.saveA} onClick={s.saveA}>
          <b>{st.variantA ? 'A/B test · re-save Variant A' : 'A/B test · save Variant A'}</b>
          <span>{st.credits < 1 ? 'No test credits left.' : st.variantA ? 'Replaces the saved A with your current shop. Free.' : 'Snapshot your current shop as A. Free.'}</span>
        </button>
        <button type="button" className="lab-btn" id="t-ab" disabled={busy || !!avail.ab} onClick={() => s.askTest('ab')}>
          <b>A/B test &middot; run A vs. B</b><span>{avail.ab || AB_DEFAULT}</span>
        </button>
      </div>
      {st.credits < 1 && <div id="no-credits" className="lab-empty">You&rsquo;ve used all {CREDITS} test credits for this run. Tests are locked &mdash; play again for a fresh set.</div>}

      {st.variantA && (
        <div id="ab-status" className="ab-box">
          <b className="t">A/B test setup</b>
          <div className="ab-row"><span className="ab-k">A &middot; saved</span><span>{planSummary(st.variantA)}</span></div>
          <div className="ab-row"><span className="ab-k">B &middot; your shop now</span><span>{same ? <i>Same as A</i> : planSummary(cur)}</span></div>
          <div className="ab-actions">
            <button type="button" className="lab-mini" disabled={busy || !!avail.ab} onClick={() => s.askTest('ab')}>Run A vs. B &middot; 1 credit</button>
            <button type="button" className="link-btn" onClick={s.clearA}>Clear A</button>
          </div>
          <div className="game-note" style={{ marginTop: 8 }}>{avail.ab || 'Ready. B differs from A, so the test can tell you which earns more.'}</div>
        </div>
      )}

      {s.pending && (
        <div className="lab-confirm" id="lab-confirm">
          <div className="lab-confirm-inner" role="alertdialog" aria-label="Confirm test">
            <span>Run <b>{TEST_NAMES[s.pending]}</b>? This spends 1 credit ({st.credits - 1} left after). Results can&rsquo;t be un-seen, so credits aren&rsquo;t refunded.</span>
            <span className="lc-btns">
              <button type="button" className="lab-mini" id="lc-run" onClick={s.confirmTest}>Run test</button>
              <button type="button" className="lab-mini ghost" id="lc-cancel" onClick={s.cancelTest}>Cancel</button>
            </span>
          </div>
        </div>
      )}

      <div id="lab-results" aria-live="polite">{s.labCards.map((c) => <Card key={c.id} c={c} />)}</div>
      {s.labCards.length > 0 && <div className="lab-tools"><button type="button" className="link-btn" id="clear-results" onClick={s.clearResults}>Clear results</button></div>}
    </div>
  )
}
