// Step 2 · "Build this month's shop" (legacy/index.html:1008-1018, buildPkgList :1350-1372,
// refreshPlanUI :1382-1409). Hints and warnings come from report.planNotes(); no maths here.
import { fmt2, marketInfo, ODDS_RANGE, PKGS, PULL_RANGE, planNotes, sweetNote, type FixedEntry, type GachaEntry, type PkgDef } from '../../sim'
import { useSimulation } from './controller'

function PackageRow({ p, note }: { p: PkgDef; note: string }) {
  const s = useSimulation()
  const e = s.plan[p.id]
  return (
    <div className={`pkg-row ${e.on ? 'on' : ''}`} data-pkg={p.id}>
      <label className="pkg-head">
        <input type="checkbox" className="pkg-on" checked={e.on} onChange={(ev) => s.setPackageOn(p.id, ev.target.checked)} aria-label={`Offer ${p.label}`} />
        <span className="ph-text"><h4>{p.label}</h4><p>{p.desc}</p></span>
        <span className={`badge ${p.badge}`}>{p.badgeText}</span>
      </label>
      <div className="pkg-body">
        {!p.gacha ? (
          <div className="ladder" role="group" aria-label={`${p.label} price ladder`}>
            {p.ladder!.map((t) => {
              const on = (e as FixedEntry).tiers.includes(t)
              return (
                <button key={t} type="button" className={`tier notranslate ${on ? 'on' : ''}`} translate="no" data-price={t} aria-pressed={on} onClick={() => s.toggleTier(p.id, t)}>{fmt2(t)}</button>
              )
            })}
          </div>
        ) : (
          <>
            <div className="gacha-ctl">
              <span>Price per pull</span>
              <input type="range" className="g-pull" min={PULL_RANGE.min} max={PULL_RANGE.max} step={PULL_RANGE.step} value={(e as GachaEntry).pull}
                aria-label={`${p.label} price per pull`} onChange={(ev) => s.setGacha(p.id, 'pull', parseFloat(ev.target.value))} />
              <span className="slider-val g-pull-v">{fmt2((e as GachaEntry).pull)}</span>
            </div>
            <div className="gacha-ctl">
              <span>Drop rate</span>
              <input type="range" className="g-odds" min={ODDS_RANGE.min} max={ODDS_RANGE.max} step={ODDS_RANGE.step} value={(e as GachaEntry).odds}
                aria-label={`${p.label} drop rate`} onChange={(ev) => s.setGacha(p.id, 'odds', parseFloat(ev.target.value))} />
              <span className="slider-val g-odds-v">{(e as GachaEntry).odds}%</span>
            </div>
          </>
        )}
        <div className="ladder-note">{note}</div>
      </div>
    </div>
  )
}

export function ShopBuilder() {
  const s = useSimulation()
  const st = s.game.state
  const mk = st.market ? marketInfo(s.game) : null
  const n = planNotes(s.plan, mk, st.sweet)
  const month = Math.min(st.round, st.maxRounds)
  return (
    <div className="game-panel">
      <div className="shop-head">
        <h3 className="game-h3" style={{ margin: 0 }}>Build this month's shop</h3>
        <span>
          {st.history.length > 0 && <button type="button" className="link-btn" onClick={s.copyLastMonth}>Undo changes &middot; copy last month</button>}
          <button type="button" className="link-btn" onClick={s.resetShop}>Reset to default</button>
        </span>
      </div>
      <p className="game-note" style={{ margin: '0 0 6px' }}>
        Turn on any combination of packages. For each one, choose which price tiers to offer.{' '}
        <span id="sweet-note">{mk && st.sweet ? sweetNote(mk, st.sweet) : ''}</span>
      </p>
      <div id="pkg-list">{PKGS.map((p) => <PackageRow key={p.id} p={p} note={n.notes[p.id]} />)}</div>

      <h3 className="game-h3" style={{ marginTop: 26 }}>Run a limited-time event?</h3>
      <label className="event-toggle">
        <input type="checkbox" id="event-check" checked={s.event} onChange={(ev) => s.setEvent(ev.target.checked)} />
        <span>Yes &mdash; a 7-day event at the start of the month boosts spending, but running events back-to-back causes fatigue</span>
      </label>

      <div id="plan-warning" className="game-note" style={{ marginTop: 14 }} aria-live="polite">{n.warning}</div>
      <button type="button" className="btn btn-wide" id="launch-btn" disabled={n.liveCount === 0} onClick={s.launch}>
        Launch Month {month} (30 days) &rarr;
      </button>
    </div>
  )
}
