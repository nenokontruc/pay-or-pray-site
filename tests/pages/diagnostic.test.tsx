import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import App from '../../src/App'
import { classify } from '../../src/data/diagnostic'

const LEGACY = new DOMParser().parseFromString(readFileSync(resolve(__dirname, '../../legacy/index.html'), 'utf8'), 'text/html')
const norm = (s: string) => s.replace(/ /g, ' ').replace(/\s+/g, ' ').trim()
/** Original cells in reading order: [risk, title, text]. */
const LEGACY_CELLS = Array.from(LEGACY.querySelectorAll('#page-diagnostic .mx-cell'), (c) => [
  norm(c.querySelector('.risk')!.textContent!), norm(c.querySelector('h4')!.textContent!), norm(c.querySelector('p')!.textContent!),
])

beforeAll(() => {
  window.scrollTo = () => {}
  window.matchMedia ??= ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia
})
afterEach(() => { cleanup(); window.location.hash = '' })
const open = () => { window.location.hash = '#diagnostic'; return render(<App />) }
const selectedCell = (c: HTMLElement) => c.querySelector('.mx-cell[aria-checked="true"]')!.getAttribute('data-cell')

describe('Diagnostic page', () => {
  it('renders the four original quadrants, in order, with unchanged text and both axes', () => {
    const { container } = open()
    const cells = Array.from(container.querySelectorAll('.mx-cell'), (c) => [
      norm(c.querySelector('.risk')!.textContent!), norm(c.querySelector('h4')!.textContent!), norm(c.querySelector('p')!.textContent!),
    ])
    expect(LEGACY_CELLS).toHaveLength(4)
    expect(cells).toEqual(LEGACY_CELLS)
    const text = norm(container.textContent ?? '')
    for (const axis of ['DETERMINISTIC VALUE', 'PROBABILISTIC VALUE', 'COSMETIC / NON-POWER', 'POWER-AFFECTING']) expect(text).toContain(axis)
  })

  it('classification rule: value known? × power? → the four positions', () => {
    expect(classify('det', false)).toBe('low')
    expect(classify('prob', false)).toBe('mod')
    expect(classify('det', true)).toBe('high')
    expect(classify('prob', true)).toBe('vhigh')
  })

  it('answering the two questions highlights the matching quadrant and explains it', () => {
    const { container } = open()
    expect(selectedCell(container)).toBe('low')
    fireEvent.click(screen.getByLabelText(/left to chance/))
    fireEvent.click(screen.getByLabelText(/power-affecting/))
    expect(selectedCell(container)).toBe('vhigh')
    const detail = container.querySelector('.dx-detail')!
    expect(detail.querySelector('h3')!.textContent).toBe('Power-affecting loot boxes')
    expect(norm(detail.textContent!)).toContain('Combines gambling-adjacent mechanics with competitive unfairness')
    expect(norm(detail.textContent!)).toContain('The primary target of current loot-box regulation.')
  })

  it.each([
    ['hok-shop', 'low'], ['wwm-shop', 'low'], ['hok-draw', 'mod'], ['wwm-draw', 'mod'],
    // Simulation packages, by their own flags (src/sim/params.ts):
    ['sim-skin', 'low'], ['sim-pass', 'low'], ['sim-item', 'high'], ['sim-cgacha', 'mod'], ['sim-pgacha', 'vhigh'],
  ])('example %s lands in %s', (ex, cell) => {
    const { container } = open()
    fireEvent.click(container.querySelector(`[data-example="${ex}"]`)!)
    expect(selectedCell(container)).toBe(cell)
    expect(container.querySelector('.dx-detail')!.getAttribute('data-selected')).toBe(cell)
    expect(container.querySelector('.dx-ex-note')).not.toBeNull()
  })

  it('keyboard: arrow keys move the selection around the 2×2 grid and focus follows', () => {
    const { container } = open()
    const cell = (id: string) => container.querySelector<HTMLElement>(`.mx-cell[data-cell="${id}"]`)!
    cell('low').focus()
    fireEvent.keyDown(cell('low'), { key: 'ArrowRight' }); expect(selectedCell(container)).toBe('mod'); expect(document.activeElement).toBe(cell('mod'))
    fireEvent.keyDown(cell('mod'), { key: 'ArrowDown' }); expect(selectedCell(container)).toBe('vhigh')
    fireEvent.keyDown(cell('vhigh'), { key: 'ArrowLeft' }); expect(selectedCell(container)).toBe('high')
    fireEvent.keyDown(cell('high'), { key: 'ArrowUp' }); expect(selectedCell(container)).toBe('low')
    // Only the selected cell is in the Tab order (roving tabindex).
    expect(Array.from(container.querySelectorAll('.mx-cell'), (c) => c.getAttribute('tabindex'))).toEqual(['0', '-1', '-1', '-1'])
  })

  it('keeps a text version of the matrix and the full "Reading the matrix" explanation', () => {
    const { container } = open()
    const rows = container.querySelectorAll('details table tbody tr')
    expect(rows).toHaveLength(4)
    expect(container.querySelector('.prose a')!.getAttribute('href')).toBe('#simulation')
  })
})
