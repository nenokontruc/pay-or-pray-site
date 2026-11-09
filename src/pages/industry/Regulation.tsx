import { useMemo, useState } from 'react'
import { INSTRUMENTS, INSTRUMENT_CHECK_SOURCES, JURISDICTIONS, type Instrument } from '../../data/industry'
import { PixelIcon } from '../../components/PixelIcon'

type Pt = [number, number][]
// Rough continent outlines (lon, lat) rasterised into a dot-matrix map.
const LAND: Pt[] = [
  [[-168, 66], [-155, 71], [-125, 70], [-95, 72], [-80, 68], [-62, 60], [-55, 50], [-67, 44], [-76, 35], [-81, 25], [-97, 20], [-82, 9], [-92, 15], [-105, 22], [-117, 32], [-125, 42], [-125, 50], [-140, 60], [-165, 60]],
  [[-55, 60], [-45, 60], [-20, 70], [-20, 82], [-60, 82], [-70, 76]],
  [[-78, 10], [-62, 11], [-50, 0], [-35, -6], [-40, -22], [-55, -35], [-65, -42], [-68, -55], [-75, -50], [-72, -20], [-81, -5]],
  [[-10, 36], [-10, 44], [-5, 50], [5, 58], [10, 64], [22, 70], [40, 68], [70, 73], [100, 77], [140, 72], [170, 68], [160, 58], [142, 52], [135, 43], [127, 38], [122, 30], [120, 22], [108, 10], [104, 2], [98, 10], [93, 20], [80, 8], [72, 20], [58, 24], [50, 28], [40, 36], [28, 36], [20, 38], [12, 40], [5, 43], [-5, 36]],
  [[35, 30], [44, 12], [52, 16], [58, 22], [50, 28]],
  [[-17, 21], [-10, 35], [10, 37], [32, 31], [43, 12], [51, 11], [40, -10], [35, -25], [20, -35], [12, -18], [9, 4], [-8, 5], [-17, 14]],
  [[114, -22], [122, -18], [135, -12], [142, -11], [153, -26], [146, -39], [135, -35], [115, -34]],
  [[-6, 50], [2, 52], [-2, 58], [-6, 56]],
  [[130, 32], [140, 36], [142, 44], [138, 38]],
]
const inside = (x: number, y: number, poly: Pt) => {
  let c = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c
  }
  return c
}
const COLS = 80, ROWS = 34, LAT_TOP = 84, LAT_BOT = -58
const lonX = (lon: number) => ((lon + 180) / 360) * 100
const latY = (lat: number) => ((LAT_TOP - lat) / (LAT_TOP - LAT_BOT)) * 100

export function Regulation() {
  const [id, setId] = useState('cn')
  const dots = useMemo(() => {
    const out: [number, number][] = []
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const lon = -180 + ((c + 0.5) / COLS) * 360, lat = LAT_TOP - ((r + 0.5) / ROWS) * (LAT_TOP - LAT_BOT)
      if (LAND.some((p) => inside(lon, lat, p))) out.push([c, r])
    }
    return out
  }, [])
  const j = JURISDICTIONS.find((x) => x.id === id)!
  return (
    <div>
      <div className="reg-grid">
        <div className="reg-map" role="group" aria-label="Schematic world map with six jurisdictions">
          <svg viewBox={`0 0 ${COLS * 10} ${ROWS * 10}`} aria-hidden preserveAspectRatio="xMidYMid meet">
            {dots.map(([c, r]) => (<circle key={`${c}-${r}`} cx={c * 10 + 5} cy={r * 10 + 5} r="3" fill="var(--lightgray)" />))}
          </svg>
          {JURISDICTIONS.map((x) => (
            <button key={x.id} type="button" className={`pin ${x.id === id ? 'on' : ''} ${x.stance}`} style={{ left: `${lonX(x.lon)}%`, top: `${latY(x.lat)}%` }}
              aria-label={`${x.name}: ${x.approach}`} aria-pressed={x.id === id} onClick={() => setId(x.id)} />
          ))}
          <span className="map-note">Schematic map. European pins are offset so each can be selected.</span>
        </div>
        <div className="reg-detail" aria-live="polite" key={id}>
          <div className="reg-detail-head"><h3>{j.name}</h3><span className={`stance ${j.stance}`}>{j.approach}</span></div>
          <dl>
            <dt>Type of rule</dt><dd><span className={`ind-inst ${j.instrument}`}>{INSTRUMENTS[j.instrument].label}</span></dd>
            <dt>Relevant year</dt><dd>{j.year}</dd>
            <dt>Documented status</dt><dd>{j.status}</dd>
            <dt className="present-hide">Supporting source</dt><dd className="mono-note present-hide">{j.source}</dd>
          </dl>
          <p className="game-note">Labels summarize; the status line carries the legal nuance.</p>
        </div>
      </div>
      <div className="reg-chips" role="group" aria-label="Choose a jurisdiction">
        {JURISDICTIONS.map((x) => (
          <button key={x.id} type="button" className={`reg-chip ${x.id === id ? 'on' : ''}`} aria-pressed={x.id === id} onClick={() => setId(x.id)}>
            <span>{x.name}</span><span className={`stance ${x.stance}`}>{x.approach}</span><span className={`ind-inst ${x.instrument}`}>{INSTRUMENTS[x.instrument].short}</span>
          </button>
        ))}
        <span className="reg-scales"><PixelIcon name="scales" size={40} /></span>
      </div>
      <ul className="ind-inst-legend" aria-label="Types of rule">
        {(Object.keys(INSTRUMENTS) as Instrument[]).map((k) => <li key={k}><span className={`ind-inst ${k}`}>{INSTRUMENTS[k].short}</span> {INSTRUMENTS[k].label}</li>)}
      </ul>
      <details className="disclosure">
        <summary><span className="chev" aria-hidden />View sources — the full regulation table</summary>
        <div className="disclosure-body">
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr><th>Jurisdiction</th><th>Approach</th><th>Status, 2026</th><th>Type of rule</th></tr></thead>
              <tbody>
                {JURISDICTIONS.map((x) => (<tr key={x.id}><td>{x.name}</td><td><span className={`stance ${x.stance}`}>{x.approach}</span></td><td>{x.status}</td><td>{INSTRUMENTS[x.instrument].label}</td></tr>))}
              </tbody>
            </table>
          </div>
          <p className="game-note">{INSTRUMENT_CHECK_SOURCES}</p>
        </div>
      </details>
    </div>
  )
}
