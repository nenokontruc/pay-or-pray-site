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

  it('comparison tabs show exactly the original table values for each row', () => {
    open()
    expect(LEGACY_ROWS).toHaveLength(6)
    const tabs = screen.getByRole('tablist', { name: 'Compare the two lucky draws' })
    for (const [label, hok, wwm] of LEGACY_ROWS) {
      fireEvent.click(within(tabs).getByRole('tab', { name: label }))
      expect(within(tabs).getByRole('tab', { name: label }).getAttribute('aria-selected')).toBe('true')
      const panel = screen.getByRole('tabpanel', { name: label })
      expect(norm(panel.textContent ?? '')).toContain(hok)
      expect(norm(panel.textContent ?? '')).toContain(wwm)
    }
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
