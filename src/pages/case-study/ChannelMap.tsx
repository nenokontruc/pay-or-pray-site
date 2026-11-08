// Section 01 · "Do these games sell chance differently?"
// A 2 × 2 map: each game × each sales channel, marking where uncertainty lives.
// Every label is taken from the original fact rows (src/data/caseStudy.tsx); nothing new is claimed.
import { PixelIcon } from '../../components/PixelIcon'

interface Cell { title: string; detail: string; status: string; uncertain: boolean }
const ROWS: { game: string; maker: string; shop: Cell; draw: Cell }[] = [
  {
    game: 'Honor of Kings', maker: 'Tencent',
    shop: { title: 'Skins at a fixed price', detail: 'Skin price ladder 288 – 1,788 pts', status: 'Known item · known price', uncertain: false },
    draw: { title: '积分夺宝 · Points Treasure Hunt', detail: 'Draws → Honor Crystal → skin of your choice', status: 'Uncertain: how many draws it takes', uncertain: true },
  },
  {
    game: 'Where Winds Meet', maker: 'Everstone Studio / NetEase',
    shop: { title: 'Fixed-price Echo Beads', detail: 'Direct purchase', status: 'Known item · known price', uncertain: false },
    draw: { title: 'Celestial / Solemn Echo', detail: 'Pulls → one specific named outfit', status: 'Uncertain: how many pulls — and, before the guarantee, whether you win at all', uncertain: true },
  },
]

function CellView({ c }: { c: Cell }) {
  return (
    <div className={`cs-ch-cell ${c.uncertain ? 'uncertain' : 'known'}`}>
      <b>{c.title}</b>
      <span className="cs-ch-detail">{c.detail}</span>
      <span className="cs-ch-status">{c.uncertain ? '?' : '✓'} {c.status}</span>
    </div>
  )
}

export function ChannelMap() {
  return (
    <div className="cs-channels" role="table" aria-label="Sales channels in each game">
      <div className="cs-ch-row cs-ch-head" role="row">
        <span role="columnheader" className="cs-ch-corner" />
        <span role="columnheader" className="cs-ch-col"><PixelIcon name="cart" size={22} />Fixed-price shop</span>
        <span role="columnheader" className="cs-ch-col draw"><PixelIcon name="capsule" size={22} />Lucky draw <em className="cs-ch-flag">randomness lives here</em></span>
      </div>
      {ROWS.map((r) => (
        <div className="cs-ch-row" role="row" key={r.game}>
          <span role="rowheader" className="cs-ch-game"><b>{r.game}</b><span>{r.maker}</span></span>
          <span role="cell"><CellView c={r.shop} /></span>
          <span role="cell"><CellView c={r.draw} /></span>
        </div>
      ))}
    </div>
  )
}
