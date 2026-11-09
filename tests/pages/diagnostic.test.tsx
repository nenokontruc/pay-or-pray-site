// Diagnostic, matrix-first — interaction tests. Expected classifications come from the original framework
// (legacy cells) and from the documented mapping in docs/PHASE7B_DIAGNOSTIC.md.
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import App from '../../src/App'
import { CELLS, EXAMPLES, classify } from '../../src/data/diagnostic'

const LEGACY = new DOMParser().parseFromString(readFileSync(resolve(__dirname, '../../legacy/index.html'), 'utf8'), 'text/html')
const norm = (s: string) => s.replace(/ /g, ' ').replace(/\s+/g, ' ').trim()
const LEGACY_CELLS = Array.from(LEGACY.querySelectorAll('#page-diagnostic .mx-cell'), (c) => [
  norm(c.querySelector('.risk')!.textContent!), norm(c.querySelector('h4')!.textContent!), norm(c.querySelector('p')!.textContent!),
])

beforeAll(() => {
  window.scrollTo = () => {}
  window.matchMedia ??= ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia
})
afterEach(() => { cleanup(); window.location.hash = '' })
const open = () => { window.location.hash = '#diagnostic'; return render(<App />) }
const selected = (c: HTMLElement) => c.querySelector('.mx-cell[aria-checked="true"]')!.getAttribute('data-cell')
const q = (n: 1 | 2) => screen.getByRole('radiogroup', { name: n === 1 ? /value known before purchase/ : /change competitive power/ })
const answer = (n: 1 | 2, yes: boolean) => fireEvent.click(within(q(n)).getByLabelText(yes ? 'Yes' : 'No'))
const checked = (n: 1 | 2) => (within(q(n)).getByLabelText('Yes') as HTMLInputElement).checked ? 'Yes' : 'No'

describe('Diagnostic — matrix first', () => {
  it('opens with one question and the matrix as the centrepiece', () => {
    const { container } = open()
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Where does your monetization design fall?')
    expect(container.textContent).toContain('Answer two questions to understand its pricing and player-risk implications.')
    expect(screen.getByRole('radiogroup', { name: /Risk positions/ })).toBeTruthy()
    // One primary area: two questions + four cells + reset; examples are a separate compact row.
    expect(container.querySelectorAll('.dx-bench button, .dx-bench input')).toHaveLength(4 + 4 + 1)
  })

  it('shows the four original quadrants, in order, with unchanged text, positions A–D and an icon each', () => {
    const { container } = open()
    const cells = Array.from(container.querySelectorAll('.mx-cell'))
    expect(cells.map((c) => [norm(c.querySelector('.risk')!.textContent!), norm(c.querySelector('h4')!.textContent!), norm(c.querySelector('p')!.textContent!)])).toEqual(LEGACY_CELLS)
    expect(cells.map((c) => c.querySelector('.dx-pos')!.textContent)).toEqual(['A', 'B', 'C', 'D'])
    expect(cells.every((c) => c.querySelector('svg'))).toBe(true)
    const text = norm(container.textContent ?? '')
    for (const axis of ['DETERMINISTIC VALUE', 'PROBABILISTIC VALUE', 'COSMETIC / NON-POWER', 'POWER-AFFECTING']) expect(text).toContain(axis)
  })

  it.each([
    [true, false, 'low', 'det', 'cosmetic'], [false, false, 'mod', 'prob', 'cosmetic'],
    [true, true, 'high', 'det', 'power'], [false, true, 'vhigh', 'prob', 'power'],
  ])('Q1 %s, Q2 %s → %s; the matching column and row light up', (known, power, cell, col, row) => {
    const { container } = open()
    answer(1, known); answer(2, power)
    expect(selected(container)).toBe(cell)
    expect(classify(known ? 'det' : 'prob', power)).toBe(cell)
    expect(container.querySelector('.col-head.on')!.getAttribute('data-col')).toBe(col)
    expect(container.querySelector('.row-label.on')!.getAttribute('data-row')).toBe(row)
    expect(container.querySelector('.col-head.on .dx-ans')!.textContent).toBe(`Q1 · ${known ? 'Yes' : 'No'}`)
    expect(container.querySelector('.row-label.on .dx-ans')!.textContent).toBe(`Q2 · ${power ? 'Yes' : 'No'}`)
    expect(container.querySelector('.dx-detail')!.getAttribute('data-selected')).toBe(cell)
  })

  it('result panel separates value certainty, spending pressure, principal risk and implication — and says it is a screening tool', () => {
    const { container } = open()
    answer(1, false); answer(2, true)
    const fields = Array.from(container.querySelectorAll('.dx-fields div'), (d) => [d.querySelector('dt')!.textContent, d.querySelector('dd')!.textContent])
    expect(fields).toEqual([
      ['Value certainty', 'Resolved by probability after the transaction completes.'],
      ['Spending pressure', 'Gambling-adjacent mechanics combined with paid competitive power.'],
      ['Principal risk', 'Combines gambling-adjacent mechanics with competitive unfairness.'],
      ['Operational implication', 'The primary target of current loot-box regulation.'],
    ])
    expect(container.querySelector('.dx-screen')!.textContent).toContain('A screening tool, not a score.')
  })

  it('every cell has all four result fields filled', () => {
    for (const c of CELLS) expect([c.primaryRisk, c.implication, c.spending, c.spendingSource].every((s) => s.length > 5)).toBe(true)
  })

  const EXPECTED: Record<string, string> = {
    'hok-shop': 'low', 'wwm-shop': 'low', 'hok-draw': 'mod', 'wwm-draw': 'mod',
    'sim-skin': 'low', 'sim-pass': 'low', 'sim-item': 'high', 'sim-cgacha': 'mod', 'sim-pgacha': 'vhigh',
  }
  it('keeps all nine original examples', () => {
    expect(EXAMPLES.map((e) => e.id).sort()).toEqual(Object.keys(EXPECTED).sort())
  })
  it.each(Object.entries(EXPECTED))('example %s → updates both answers, highlights %s, explains why and gives a pricing implication', (id, cell) => {
    const { container } = open()
    fireEvent.click(container.querySelector(`[data-example="${id}"]`)!)
    expect(selected(container)).toBe(cell)
    const c = CELLS.find((x) => x.id === cell)!
    expect(checked(1)).toBe(c.value === 'det' ? 'Yes' : 'No')
    expect(checked(2)).toBe(c.power ? 'Yes' : 'No')
    const r = screen.getByTestId('example-result').textContent!
    expect(r).toContain('why here:')
    expect(r).toContain('Pricing implication')
    expect(container.querySelector(`[data-example="${id}"]`)!.getAttribute('aria-pressed')).toBe('true')
  })

  it('changing an answer clears the selected example (it no longer describes the selection)', () => {
    const { container } = open()
    fireEvent.click(container.querySelector('[data-example="wwm-draw"]')!)
    answer(2, true)
    expect(screen.queryByTestId('example-result')).toBeNull()
  })

  it('reset returns to position A with no example selected', () => {
    const { container } = open()
    fireEvent.click(container.querySelector('[data-example="sim-pgacha"]')!)
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(selected(container)).toBe('low')
    expect([checked(1), checked(2)]).toEqual(['Yes', 'No'])
    expect(screen.queryByTestId('example-result')).toBeNull()
  })

  it('keyboard: arrow keys move around the 2×2 (roving focus); cells and questions have accessible names', () => {
    const { container } = open()
    const cell = (id: string) => container.querySelector<HTMLElement>(`.mx-cell[data-cell="${id}"]`)!
    cell('low').focus()
    fireEvent.keyDown(cell('low'), { key: 'ArrowRight' }); expect(selected(container)).toBe('mod'); expect(document.activeElement).toBe(cell('mod'))
    fireEvent.keyDown(cell('mod'), { key: 'ArrowDown' }); expect(selected(container)).toBe('vhigh')
    fireEvent.keyDown(cell('vhigh'), { key: 'ArrowLeft' }); expect(selected(container)).toBe('high')
    fireEvent.keyDown(cell('high'), { key: 'ArrowUp' }); expect(selected(container)).toBe('low')
    expect(Array.from(container.querySelectorAll('.mx-cell'), (c) => c.getAttribute('tabindex'))).toEqual(['0', '-1', '-1', '-1'])
    expect(screen.getByRole('radio', { name: 'Position D: Power-affecting loot boxes, Highest risk' })).toBeTruthy()
    expect(within(q(1)).getAllByRole('radio')).toHaveLength(2)
    expect(within(q(2)).getAllByRole('radio')).toHaveLength(2)
  })

  it('keeps the text version and the full "Reading the matrix" explanation', () => {
    const { container } = open()
    expect(container.querySelectorAll('details table tbody tr')).toHaveLength(4)
    expect(container.querySelector('.prose a')!.getAttribute('href')).toBe('#simulation')
  })

  it('styles: scoped under .dx, design tokens only, 44px answer targets, phone layout keeps the 2×2', () => {
    const css = readFileSync(resolve(__dirname, '../../src/pages/diagnostic/diagnostic.css'), 'utf8')
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgb\(|hsl\(/)
    const sels = css.replace(/\/\*[\s\S]*?\*\//g, '').match(/[^{}]+(?=\{)/g)!.map((s) => s.trim()).filter((s) => !s.startsWith('@'))
    expect(sels.every((s) => s.split(',').every((p) => p.includes('.dx')))).toBe(true)
    expect(css).toMatch(/\.dx \.dx-yn label \{[^}]*min-height:44px/)
    expect(css).toMatch(/@media \(max-width:560px\)\{ \.dx \.dx-grid \{ grid-template-columns:1fr 1fr;/)
  })
})
