import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import App from '../../src/App'
import { cumulativeFixed, cumulativeLowerBoundRising, expectedPullsWithPity, winBeforeGuarantee } from '../../src/lib/pityMath'

const LEGACY = new DOMParser().parseFromString(readFileSync(resolve(__dirname, '../../legacy/index.html'), 'utf8'), 'text/html')
const norm = (s: string) => s.replace(/ /g, ' ').replace(/\s+/g, ' ').trim()
/** The original comparison table: [label, HoK, WWM] per row. */
const LEGACY_ROWS = Array.from(LEGACY.querySelectorAll('#page-case-study .compare-table tbody tr'), (tr) => Array.from(tr.querySelectorAll('td'), (td) => norm(td.textContent ?? '')))

beforeAll(() => {
  window.scrollTo = () => {}
  window.matchMedia ??= ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia
})
afterEach(() => { cleanup(); window.location.hash = '' })
const open = () => { window.location.hash = '#case-study'; return render(<App />) }

describe('Case Study page', () => {
  it('renders both games with every original key figure', () => {
    const { container } = open()
    expect(screen.getByRole('heading', { level: 3, name: 'Honor of Kings' })).toBeTruthy()
    expect(screen.getByRole('heading', { level: 3, name: 'Where Winds Meet' })).toBeTruthy()
    const text = norm(container.textContent ?? '')
    for (const v of ['288 – 1,788 pts', '¥6 / 30 / 68 / 128 / 328 / 648', '0.8%, rising each draw', 'by draw 361', '360 guarantee, random skin',
      '¥6.8B', '~¥100M/day', '0.0415%, fixed', '0.747%', 'by pull 150', '~$115M (~$8M/mo)', '36.7%', '$320M over 21 months']) {
      expect(text, v).toContain(v)
    }
  })

  it('channel map: both games × both channels; only the lucky draws are marked uncertain', () => {
    const { container } = open()
    expect(screen.getByRole('heading', { level: 2, name: 'Do these games sell chance differently?' })).toBeTruthy()
    const table = screen.getByRole('table', { name: 'Sales channels in each game' })
    const rows = within(table).getAllByRole('row').slice(1)
    expect(rows.map((r) => within(r).getByRole('rowheader').querySelector('b')!.textContent)).toEqual(['Honor of Kings', 'Where Winds Meet'])
    expect(container.querySelectorAll('.cs-ch-cell.known')).toHaveLength(2)
    expect(container.querySelectorAll('.cs-ch-cell.uncertain')).toHaveLength(2)
    // Figures moved behind a disclosure, unchanged.
    expect(container.querySelector('.case-grid')!.closest('details')).not.toBeNull()
  })

  // Steps of the purchase path → the original table row each one shows.
  const STEP_ROWS: [string, string][] = [['Pay', 'What you pay with'], ['Draw', 'Starting odds'], ['Miss', 'How odds change'], ['Guarantee', 'Guarantee'], ['What you get', 'What you win']]

  it('purchase path: each step shows exactly the original table cells for its row, and highlights that row', () => {
    const { container } = open()
    expect(LEGACY_ROWS).toHaveLength(6)
    const rail = screen.getByRole('tablist', { name: 'Steps of a lucky-draw purchase' })
    for (const [step, rowLabel] of STEP_ROWS) {
      fireEvent.click(within(rail).getByRole('tab', { name: new RegExp(`${step}$`) }))
      const [, hok, wwm] = LEGACY_ROWS.find((r) => r[0] === rowLabel)!
      const panel = screen.getByRole('tabpanel')
      expect(norm(panel.textContent ?? ''), `${step}: HoK`).toContain(hok)
      expect(norm(panel.textContent ?? ''), `${step}: WWM`).toContain(wwm)
      const on = container.querySelector('.compare-table tr.cs-row-on')!
      expect(norm(on.querySelector('td')!.textContent!)).toBe(rowLabel)
    }
  })

  it('purchase path: arrow keys, Home/End, previous/next and reset', () => {
    open()
    const rail = screen.getByRole('tablist', { name: 'Steps of a lucky-draw purchase' })
    const tabs = within(rail).getAllByRole('tab')
    const current = () => tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true')
    tabs[0].focus()
    fireEvent.keyDown(tabs[0], { key: 'ArrowRight' }); expect(current()).toBe(1); expect(document.activeElement).toBe(tabs[1])
    fireEvent.keyDown(tabs[1], { key: 'End' }); expect(current()).toBe(4)
    expect((screen.getByRole('button', { name: /Next step/ }) as HTMLButtonElement).disabled).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: /Previous step/ })); expect(current()).toBe(3)
    fireEvent.click(screen.getByRole('button', { name: 'Reset' })); expect(current()).toBe(0)
    expect(screen.getByRole('tabpanel').textContent).toContain('Step 1 of 5')
    expect(tabs.map((t) => t.tabIndex)).toEqual([0, -1, -1, -1, -1])
  })

  it('summary separates what chance decides from what it does not (original key-difference callout)', () => {
    const { container } = open()
    const games = Array.from(container.querySelectorAll('.cs-open-game'))
    const chance = (g: Element) => Array.from(g.querySelectorAll('.cs-chip-u.on'), (c) => norm(c.textContent!))
    const known = (g: Element) => Array.from(g.querySelectorAll('.cs-chip-u.off'), (c) => norm(c.textContent!))
    expect(chance(games[0])).toEqual(['? How much you pay'])
    expect(known(games[0])).toEqual(['✓ What you get — you choose the skin'])
    expect(chance(games[1])).toEqual(['? How much you pay', '? Whether you get it, until the guarantee'])
    expect(known(games[1])).toEqual(['✓ Which outfit — the studio chose it'])
  })

  it('keeps the original detailed comparison table available', () => {
    const { container } = open()
    const rows = Array.from(container.querySelectorAll('.compare-table tbody tr'), (tr) => Array.from(tr.querySelectorAll('td'), (td) => norm(td.textContent ?? '')))
    expect(rows).toEqual(LEGACY_ROWS)
    expect(container.querySelector('.compare-table')!.closest('details')).not.toBeNull()
  })

  it('probability readouts: WWM exact, HoK only a lower bound, both guaranteed at their thresholds', () => {
    open()
    const slider = screen.getByLabelText('Draws so far')
    const read = () => [screen.getByTestId('wwm-readout').textContent, screen.getByTestId('hok-readout').textContent]
    fireEvent.change(slider, { target: { value: '1' } }); expect(read()).toEqual(['0.0%', 'at least 0.8%'])
    fireEvent.change(slider, { target: { value: '100' } }); expect(read()).toEqual(['4.1%', 'at least 55.2%'])
    fireEvent.change(slider, { target: { value: '149' } }); expect(read()[0]).toBe('6.0%')
    fireEvent.change(slider, { target: { value: '150' } }); expect(read()[0]).toBe('100%')
    fireEvent.change(slider, { target: { value: '361' } }); expect(read()).toEqual(['100%', '100%'])
  })

  it('labels derived and unpublished quantities honestly', () => {
    const { container } = open()
    const text = norm(container.textContent ?? '')
    expect(text).toContain('These are model-derived estimates, not observed outcomes or numbers reported by the sources.')
    expect(text).toContain('hypothetical teaching model')
    expect(text).toContain('Source check (November 2026) — unresolved.')
    // Before the guarantee vs on-or-before the guaranteed pull are stated separately.
    expect(text).toContain('Win before the guarantee (within pulls 1–149): 1 − (1 − 0.000415)149 = 6.00%')
    expect(text).toContain('Win on or before the guaranteed pull (by pull 150): 100%')
    expect(text).toContain('Expected pulls until the outfit: (1 − (1 − p)150) / p = 145.5 pulls')
    expect(text).toContain('not how much the odds rise per draw, so no curve is drawn')
    expect(container.querySelector('.prose a')!.getAttribute('href')).toBe('#framework')
  })
})

describe('pity maths (hand-checked values)', () => {
  const p = 0.000415
  it('fixed odds with a guarantee', () => {
    expect(cumulativeFixed(p, 0, 150)).toBe(0)
    expect(cumulativeFixed(p, 150, 150)).toBe(1)
    expect(winBeforeGuarantee(p, 150)).toBeCloseTo(0.05997, 4) // 1 − 0.999585^149
    expect(expectedPullsWithPity(p, 150)).toBeCloseTo(145.45, 1) // (1 − 0.999585^150) / 0.000415
    for (let n = 1; n < 150; n++) expect(cumulativeFixed(p, n, 150)).toBeGreaterThan(cumulativeFixed(p, n - 1, 150))
  })
  it('rising odds: a lower bound only', () => {
    expect(cumulativeLowerBoundRising(0.008, 1, 361)).toBeCloseTo(0.008, 12)
    expect(cumulativeLowerBoundRising(0.008, 100, 361)).toBeCloseTo(0.5521, 3)
    expect(cumulativeLowerBoundRising(0.008, 361, 361)).toBe(1)
  })
})
