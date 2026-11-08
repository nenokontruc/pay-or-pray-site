import { Sprite, R, Disc } from './Pixel'

const svgProps = { shapeRendering: 'crispEdges' as const, xmlns: 'http://www.w3.org/2000/svg', role: 'img' as const }

const ITEMS = {
  crown: ['n..nn..n', 'nn.nn.nn', 'nsnnnnsn', 'nnnnnnnn', 'nglnnlgn', 'nnnnnnnn'],
  gem: ['.gggggg.', 'gwwlllsg', '.glllsg.', '..glsg..', '...gg...'],
  sword: ['...ll...', '...lg...', '...lg...', '...lg...', '..nnnn..', '...ss...', '...ss...', '...nn...'],
  potion: ['...nn...', '...ll...', '..gllg..', '.gmmmmg.', 'gmmwmmmg', 'gmmmmmmg', '.gggggg.'],
  shield: ['nnnnnnnn', 'nlllsssn', 'nlllsssn', 'nlllsssn', '.nllssn.', '..nlsn..', '...nn...'],
  cap: ['...nn...', '..nssn..', '..nssn..', '.nsssgn.', 'nsssssgn', 'nnnnnnnn'],
}

/** Deterministic: a glass display case, every item visible and priced. */
export function DisplayCase() {
  const shelves = [14, 27]
  const place = (rows: string[], cx: number, shelfY: number) => (
    <Sprite rows={rows} x={cx - 4} y={shelfY - rows.length} />
  )
  const tag = (cx: number, y: number) => (
    <g>
      <R x={cx - 3} y={y} w={6} h={4} c="o" />
      <R x={cx - 3} y={y} w={6} h={1} c="n" />
      <R x={cx - 3} y={y + 3} w={6} h={1} c="n" />
      <R x={cx - 3} y={y} w={1} h={4} c="n" />
      <R x={cx + 2} y={y} w={1} h={4} c="n" />
      <R x={cx - 1} y={y + 1} w={2} h={2} c="m" />
    </g>
  )
  return (
    <svg viewBox="0 0 52 48" aria-label="Pixel-art glass display case with fixed-price cosmetic items" {...svgProps}>
      {/* roof sign */}
      <R x={10} y={0} w={32} h={4} c="n" />
      <R x={12} y={1} w={28} h={2} c="s" />
      <R x={21} y={1} w={2} h={2} c="g" />
      <R x={25} y={1} w={6} h={2} c="l" />
      {/* frame + glass */}
      <R x={6} y={4} w={40} h={36} c="n" />
      <R x={8} y={6} w={36} h={32} c="w" />
      {/* glass glare */}
      <R x={11} y={8} w={2} h={8} c="o" />
      <R x={14} y={8} w={1} h={4} c="o" />
      <R x={36} y={26} w={2} h={9} c="o" />
      <R x={39} y={30} w={1} h={5} c="o" />
      {/* shelves */}
      {shelves.map((y) => (
        <g key={y}>
          <R x={8} y={y} w={36} h={2} c="s" />
          <R x={8} y={y + 2} w={36} h={1} c="g" />
        </g>
      ))}
      {place(ITEMS.crown, 15, 14)}
      {place(ITEMS.gem, 26, 14)}
      {place(ITEMS.sword, 37, 14)}
      {place(ITEMS.potion, 15, 27)}
      {place(ITEMS.shield, 26, 27)}
      {place(ITEMS.cap, 37, 27)}
      {/* price tags hang below top-shelf items & sit on lower shelf */}
      {tag(15, 17)}
      {tag(26, 17)}
      {tag(37, 17)}
      {tag(15, 30)}
      {tag(26, 30)}
      {tag(37, 30)}
      {/* base */}
      <R x={4} y={40} w={44} h={4} c="s" />
      <R x={4} y={40} w={44} h={1} c="m" />
      <R x={6} y={44} w={4} h={4} c="n" />
      <R x={42} y={44} w={4} h={4} c="n" />
    </svg>
  )
}

const CAPSULE = ['.nnn.', 'nsssn', 'nwwwn', 'nlllg', '.ggg.']

/** Probabilistic: a gashapon machine, contents hidden inside identical capsules. */
export function Gashapon() {
  const caps: [number, number][] = [
    [14, 6], [20, 4], [26, 6], [31, 9], [12, 12], [18, 11], [24, 12], [30, 15], [15, 17], [21, 17], [26, 19],
  ]
  return (
    <svg viewBox="0 0 52 62" aria-label="Pixel-art gashapon capsule machine" {...svgProps}>
      {/* globe */}
      <Disc cx={26} cy={17} r={16} fill="o" edge="n" />
      <R x={14} y={8} w={3} h={1} c="w" />
      <R x={12} y={10} w={1} h={4} c="w" />
      {caps.map(([x, y], i) => (
        <Sprite key={i} rows={CAPSULE} x={x} y={y} />
      ))}
      {/* cap ring */}
      <R x={8} y={31} w={36} h={3} c="n" />
      <R x={10} y={32} w={32} h={1} c="m" />
      {/* body */}
      <R x={6} y={34} w={40} h={24} c="n" />
      <R x={8} y={36} w={36} h={20} c="s" />
      {/* coin slot panel */}
      <R x={11} y={38} w={14} h={12} c="n" />
      <R x={13} y={40} w={10} h={8} c="m" />
      <R x={17} y={41} w={2} h={6} c="n" />
      <R x={13} y={40} w={10} h={1} c="g" />
      {/* knob */}
      <Disc cx={35} cy={44} r={5} fill="l" edge="n" />
      <R x={31} y={43} w={8} h={2} c="n" />
      <R x={34} y={40} w={2} h={8} c="n" />
      <R x={32} y={41} w={1} h={1} c="w" />
      {/* chute */}
      <R x={15} y={51} w={22} h={7} c="n" />
      <R x={17} y={52} w={18} h={5} c="s" />
      <Sprite rows={CAPSULE} x={24} y={52} />
      {/* feet */}
      <R x={4} y={58} w={44} h={3} c="n" />
      <R x={4} y={58} w={44} h={1} c="m" />
    </svg>
  )
}

const SEAL = [
  '........',
  '....nnnn',
  '..nlllll',
  '.nllllll',
  '.nlnwlll',
  '.nlnnlll',
  '.nllwwwn',
  '.nlwwwww',
  '.nlgwwww',
  '.nnlwwww',
  '.nlllwww',
  '..nnllll',
  '....nnnn',
]

/** Baby seal mascot. `sign` adds a held post for the signboard. */
export function Seal({ size = 96, flipper = false, label }: { size?: number; flipper?: boolean; label?: string }) {
  return (
    <svg viewBox="0 0 16 13" width={size} height={(size * 13) / 16} aria-label={label} aria-hidden={label ? undefined : true} {...svgProps}>
      <Sprite rows={SEAL} mirror />
      {/* blush */}
      <R x={3} y={6} w={1} h={1} c="g" />
      <R x={12} y={6} w={1} h={1} c="g" />
      {/* whiskers */}
      <R x={1} y={7} w={1} h={1} c="m" />
      <R x={14} y={7} w={1} h={1} c="m" />
      {flipper && (
        <>
          <R x={0} y={9} w={2} h={2} c="n" />
          <R x={1} y={9} w={1} h={2} c="l" />
        </>
      )}
    </svg>
  )
}

/** Pixel handheld console with the seal on screen — Industry hero accent. */
export function Handheld() {
  return (
    <svg viewBox="0 0 44 30" aria-hidden {...svgProps}>
      <R x={2} y={2} w={40} h={26} c="n" />
      <R x={4} y={4} w={36} h={22} c="g" />
      <R x={4} y={4} w={36} h={2} c="l" />
      <R x={9} y={7} w={26} h={17} c="n" />
      <R x={10} y={8} w={24} h={15} c="o" />
      <g transform="translate(14 9) scale(0.875)"><Sprite rows={SEAL} mirror /></g>
      <R x={5} y={12} w={3} h={7} c="s" /><R x={3} y={14} w={7} h={3} c="s" />
      <R x={36} y={13} w={2} h={2} c="s" /><R x={38} y={16} w={2} h={2} c="s" />
      {/* sparkles */}
      <R x={0} y={0} w={1} h={3} c="g" /><R x={-1} y={1} w={3} h={1} c="g" />
      <R x={42} y={26} w={1} h={3} c="g" /><R x={41} y={27} w={3} h={1} c="g" />
    </svg>
  )
}
