import { Sprite } from './Pixel'

const ICONS: Record<string, string[]> = {
  floppy: ['nnnnnnnnn.', 'nsggnnggsn', 'nsggnnggsn', 'nsggggggsn', 'nssssssssn', 'nswwwwwwsn', 'nswwwwwwsn', 'nswlwlwlsn', 'nnnnnnnnnn'],
  pad: ['.nnnnnnnn.', 'nsssssssgn', 'nsgsssmwsn', 'ngggsssmsn', 'nsgsssssgn', 'nssssssssn', 'nsnnnnnnsn', 'nnn....nnn'],
  bubble: ['.nnnnnnnn.', 'nwwwwwwwwn', 'nwsswsswwn', 'nwsswsswwn', 'nwwswwswwn', 'nwwwwwwwwn', '.nnnnnwnn.', '....nwn...', '.....n....'],
  phone: ['..nnnnnn..', '..nsssgn..', '..nwwwwn..', '..nwlwwn..', '..nwwwwn..', '..nwwlwn..', '..nwwwwn..', '..nsssgn..', '..nnnnnn..'],
  capsule: ['...nnnn...', '..nsswwn..', '.nsswwwwn.', '.nssssssn.', 'nnnnnnnnnn', 'nlllllllgn', '.nlllllgn.', '.nllllggn.', '..nggggn..', '...nnnn...'],
  crown: ['n..nn..n', 'nn.nn.nn', 'nsnnnnsn', 'nnnnnnnn', 'nglnnlgn', 'nnnnnnnn'],
  gavel: ['.nnnnn....', 'nsssssn...', 'nsgggsn...', 'nsssssnn..', '.nnnnnnmn.', '......nmn.', '.....nmn..', '....nmn...', 'nnnnnnnnnn', 'nssssssssn'],
  chart: ['n.......gs', 'n.......gs', 'n.......gs', 'n.....gsgs', 'n.....gsgs', 'n...gsgsgs', 'n...gsgsgs', 'n.gsgsgsgs', 'n.gsgsgsgs', 'nnnnnnnnnn'],
  cart: ['nn........', '.nnnnnnnnn', '..nsgsgsgn', '..nsgsgsgn', '...nssssn.', '...nnnnnn.', '...nn..nn.', '...nn..nn.'],
  gem: ['..gggggg..', '.gwwlllsg.', 'gwwwllllsg', '.glllllsg.', '..glllsg..', '...glsg...', '....gg....'],
  calendar: ['.n......n.', 'nnnnnnnnnn', 'nssssssssn', 'nwwwwwwwwn', 'nwswswswwn', 'nwwwwwwwwn', 'nwswwwswwn', 'nwwwwwwwwn', 'nnnnnnnnnn'],
  swords: ['ll......ll', 'lgl....lgl', '.lgl..lgl.', '..lgllgl..', '...lggl...', '..lgllgl..', '.nnlnnlnn.', 'nsn.nn.nsn', 'nn..nn..nn'],
  megaphone: ['.......n.n', '....nnn...', 'nnnnsgn.n.', 'nsssssgn.n', 'nsssssgn..', 'nnnnsgn.n.', '..nsn.....', '..nn......'],
  coins: ['..nnnnnn..', '.nllllllgn', '.nnnnnnnnn', '.nsssssssn', '.nnnnnnnnn', '.nsssssssn', '.nnnnnnnnn', '.nsssssssn', '.nnnnnnnnn'],
  scales: ['....nn....', 'nnnnnnnnnn', 'n...nn...n', 'n...nn...n', 'sss.nn.sss', 'sss.nn.sss', '....nn....', '..nnnnnn..', '.nnnnnnnn.'],
}

export function PixelIcon({ name, size = 40, className }: { name: string; size?: number; className?: string }) {
  const rows = ICONS[name] ?? []
  const w = Math.max(...rows.map((r) => r.length))
  const h = rows.length
  // Centre the sprite in a square 10x10 cell so all icons share the same footprint.
  const cell = Math.max(w, h, 10)
  const ox = Math.floor((cell - w) / 2)
  const oy = cell - h
  return (
    <svg viewBox={`0 0 ${cell} ${cell}`} width={size} height={size} shapeRendering="crispEdges" aria-hidden className={className}>
      <Sprite rows={rows} x={ox} y={oy} />
    </svg>
  )
}
