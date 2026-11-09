import type { ReactNode } from 'react'

// Shared palette: strictly the site's navy / slate / silver / lightgray family.
export const PAL: Record<string, string> = {
  n: '#1C2833',
  s: '#2E4053',
  m: '#5A6872',
  g: '#AAB7B8',
  l: '#D5DBDB',
  w: '#FFFFFF',
  o: '#F4F6F6',
}

type Props = { rows: string[]; x?: number; y?: number; mirror?: boolean }

/** Renders a character-map sprite as crisp 1-unit rects. `mirror` treats rows as left halves. */
export function Sprite({ rows, x = 0, y = 0, mirror = false }: Props) {
  const rects: ReactNode[] = []
  rows.forEach((row, j) => {
    const full = mirror ? row + [...row].reverse().join('') : row
    ;[...full].forEach((c, i) => {
      if (c === '.' || !PAL[c]) return
      rects.push(<rect key={`${i}-${j}`} x={x + i} y={y + j} width={1.02} height={1.02} fill={PAL[c]} />)
    })
  })
  return <g>{rects}</g>
}

export function R({ x, y, w, h, c }: { x: number; y: number; w: number; h: number; c: string }) {
  return <rect x={x} y={y} width={w} height={h} fill={PAL[c] ?? c} />
}

/** Pixel disc built from per-row spans. Edge pixels use `edge`, interior uses `fill`. */
export function Disc({ cx, cy, r, fill, edge }: { cx: number; cy: number; r: number; fill: string; edge: string }) {
  const out: ReactNode[] = []
  for (let j = -r; j <= r; j++) {
    for (let i = -r; i <= r; i++) {
      const d = Math.sqrt(i * i + j * j)
      if (d > r + 0.4) continue
      const isEdge = d > r - 1
      out.push(<rect key={`${i}-${j}`} x={cx + i} y={cy + j} width={1.02} height={1.02} fill={isEdge ? PAL[edge] : PAL[fill]} />)
    }
  }
  return <g>{out}</g>
}
