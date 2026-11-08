// Framework page — interaction tests. Expected numbers are worked by hand, not read from the page code.
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import App from '../../src/App'

beforeAll(() => {
  window.scrollTo = () => {}
  window.matchMedia ??= ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia
})
afterEach(() => { cleanup(); window.location.hash = '' })
const open = () => { window.location.hash = '#framework'; return render(<App />) }
const panel = (id: 'det' | 'prob') => document.getElementById(`fw-panel-${id}`)!
const showTab = (id: 'det' | 'prob') => { if (panel(id).hidden) fireEvent.click(screen.getByRole('tab', { name: id === 'det' ? /Deterministic Goods/ : /Probabilistic Goods/ })) }
const box = (id: 'det' | 'prob', label: RegExp) => { showTab(id); return within(panel(id)).getByRole('spinbutton', { name: label }) as HTMLInputElement }
const slider = (id: 'det' | 'prob', label: RegExp) => { showTab(id); return within(panel(id)).getByRole('slider', { name: label }) as HTMLInputElement }

describe('Framework — deterministic tab', () => {
  it('shows the course example: $10 + $5 = $15 and the ceiling interpretation', () => {
    open()
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Two ways to value an in-game item')
    expect(screen.getByTestId('det-evc').textContent).toBe('$15')
    expect(screen.getByTestId('det-interp').textContent).toContain('The modeled value-based price ceiling is $15.')
    expect(screen.getByTestId('det-interp').textContent).toContain('not necessarily the profit-maximizing price')
  })

  it('slider and number box stay in sync, and the result updates', () => {
    open()
    fireEvent.change(slider('det', /RefP/), { target: { value: '20' } })
    expect(box('det', /RefP/).value).toBe('20')
    expect(screen.getByTestId('det-evc').textContent).toBe('$25')
    fireEvent.change(box('det', /DiffV/), { target: { value: '7.5' } })
    expect(slider('det', /DiffV/).value).toBe('7.5')
    expect(screen.getByTestId('det-evc').textContent).toBe('$27.50')
  })

  it('supports negative DiffV, including a negative EVC', () => {
    open()
    fireEvent.change(box('det', /DiffV/), { target: { value: '-4' } })
    expect(screen.getByTestId('det-evc').textContent).toBe('$6')
    fireEvent.change(box('det', /DiffV/), { target: { value: '-12' } })
    expect(screen.getByTestId('det-evc').textContent).toBe('−$2')
    expect(screen.getByTestId('det-interp').textContent).toContain('no positive price is defensible')
  })

  it('rejects invalid and out-of-range typing without changing the result', () => {
    open()
    fireEvent.change(box('det', /RefP/), { target: { value: '500' } })
    expect(box('det', /RefP/).getAttribute('aria-invalid')).toBe('true')
    expect(within(panel('det')).getByRole('alert').textContent).toBe('Enter a number from 0 to 100.')
    expect(screen.getByTestId('det-evc').textContent).toBe('$15')
    fireEvent.change(box('det', /RefP/), { target: { value: '' } })
    expect(screen.getByTestId('det-evc').textContent).toBe('$15')
    fireEvent.blur(box('det', /RefP/))
    expect(box('det', /RefP/).value).toBe('10') // restored on blur
  })

  it('reset restores $10 + $5', () => {
    open()
    fireEvent.change(slider('det', /RefP/), { target: { value: '40' } })
    fireEvent.click(screen.getByRole('button', { name: /Reset to \$10/ }))
    expect(screen.getByTestId('det-evc').textContent).toBe('$15')
    expect(box('det', /RefP/).value).toBe('10')
  })
})

describe('Framework — probabilistic tab', () => {
  it('default 20%, $15, $3: failure 80%, +$3.00 − $2.40 = $0.60', () => {
    open()
    fireEvent.click(screen.getByRole('tab', { name: /Probabilistic Goods/ }))
    expect(screen.getByTestId('p-failure').textContent).toBe('80%')
    expect(screen.getByTestId('gain').textContent).toBe('+$3')
    expect(screen.getByTestId('loss').textContent).toBe('−$2.40')
    expect(screen.getByTestId('prob-evc').textContent).toBe('$0.60')
    expect(screen.getByTestId('prob-interp').textContent).toContain('A simplified two-outcome expression')
  })

  it('probability edges and very low probability', () => {
    open()
    fireEvent.change(box('prob', /P\(success\)/), { target: { value: '0' } })
    expect(screen.getByTestId('prob-evc').textContent).toBe('−$3')
    fireEvent.change(box('prob', /P\(success\)/), { target: { value: '100' } })
    expect(screen.getByTestId('prob-evc').textContent).toBe('$15')
    expect(screen.getByTestId('p-failure').textContent).toBe('0%')
    fireEvent.change(box('prob', /P\(success\)/), { target: { value: '0.0415' } })
    expect(screen.getByTestId('p-success').textContent).toBe('0.0415%')
    expect(screen.getByTestId('p-failure').textContent).toBe('99.9585%')
    fireEvent.change(box('prob', /P\(success\)/), { target: { value: '101' } })
    expect(within(panel('prob')).getByRole('alert').textContent).toBe('Enter a number from 0 to 100.')
  })

  it('positive, break-even and negative interpretations', () => {
    open()
    fireEvent.change(box('prob', /P\(success\)/), { target: { value: '25' } })
    fireEvent.change(box('prob', /Value/), { target: { value: '3' } })
    fireEvent.change(box('prob', /Cost/), { target: { value: '1' } })
    expect(screen.getByTestId('prob-interp').textContent).toContain('breaks even') // 0.75 − 0.75
    fireEvent.change(box('prob', /Cost/), { target: { value: '5' } })
    expect(screen.getByTestId('prob-interp').textContent).toContain('negative expected value') // 0.75 − 3.75
    expect(screen.getByTestId('prob-evc').textContent).toBe('−$3')
  })

  it('reset restores 20%, $15, $3', () => {
    open()
    fireEvent.change(box('prob', /Value/), { target: { value: '90' } })
    fireEvent.click(screen.getByRole('button', { name: /Reset to 20%/ }))
    expect(screen.getByTestId('prob-evc').textContent).toBe('$0.60')
  })
})

describe('Framework — tabs, mathematics, accessibility, navigation', () => {
  it('ARIA tabs: click and arrow keys switch panels; values survive switching', () => {
    open()
    const det = screen.getByRole('tab', { name: /Deterministic Goods/ }), prob = screen.getByRole('tab', { name: /Probabilistic Goods/ })
    fireEvent.change(slider('det', /RefP/), { target: { value: '30' } })
    expect(panel('prob').hidden).toBe(true)
    det.focus()
    fireEvent.keyDown(det, { key: 'ArrowRight' })
    expect(prob.getAttribute('aria-selected')).toBe('true')
    expect(document.activeElement).toBe(prob)
    expect(panel('det').hidden).toBe(true)
    fireEvent.keyDown(prob, { key: 'Home' })
    expect(det.getAttribute('aria-selected')).toBe('true')
    expect(screen.getByTestId('det-evc').textContent).toBe('$35') // kept
    expect([det.tabIndex, prob.tabIndex]).toEqual([0, -1])
  })

  it('every input has an accessible name and the number boxes accept typing', () => {
    open()
    expect(within(panel('det')).getAllByRole('slider')).toHaveLength(2)
    showTab('prob')
    expect(within(panel('prob')).getAllByRole('slider')).toHaveLength(3)
    for (const s of screen.getAllByRole('spinbutton')) expect(s.getAttribute('aria-label')).toBeTruthy()
  })

  it('"Show the mathematics" opens and shows live steps for the current inputs', () => {
    const { container } = open()
    const details = container.querySelector<HTMLDetailsElement>('#fw-math')!
    expect(details.open).toBe(false)
    fireEvent.click(details.querySelector('summary')!)
    expect(details.open).toBe(true)
    fireEvent.change(box('prob', /P\(success\)/), { target: { value: '50' } })
    const steps = screen.getByTestId('steps').textContent!
    expect(steps).toContain('EVC = $10 + ($5) = $15')
    expect(steps).toContain('P(failure) = 1 − 0.5 = 0.5')
    expect(steps).toContain('EVC(gacha) = $7.50 − $1.50 = $6')
  })

  it('general model worked example: duplicate adds zero (2.15 → 1.65)', () => {
    open()
    expect(screen.getByTestId('general-total').textContent).toBe('1.65')
    fireEvent.click(screen.getByLabelText(/already owns the Mount/))
    expect(screen.getByTestId('general-total').textContent).toBe('2.15')
  })

  it('"Open the mathematics" (toolkit step 3) stays on the Framework page (no hash navigation)', () => {
    const { container } = open()
    fireEvent.click(screen.getByRole('tab', { name: /So, how do we value it/ }))
    fireEvent.click(screen.getByRole('button', { name: /Open the mathematics/ }))
    expect(window.location.hash).toBe('#framework')
    expect(container.querySelector<HTMLDetailsElement>('#fw-math')!.open).toBe(true)
  })
})

describe('Framework — toolkit chain (WTP → choice architecture → EVC)', () => {
  const steps = () => within(screen.getByRole('tablist', { name: 'Toolkit steps' })).getAllByRole('tab')
  const current = () => steps().findIndex((t) => t.getAttribute('aria-selected') === 'true')

  it('opens on step 1 with the question, and the price slider drives d(p) (hand-checked: 24, 39, 4 buyers)', () => {
    open()
    expect(current()).toBe(0)
    expect(screen.getByRole('tabpanel', { name: /Who pays/ }).textContent).toContain('how many of 100 players buy it?')
    expect(screen.getByTestId('buyers').textContent).toBe('24 buyers') // default $4.99
    expect(screen.getByTestId('paying-rate').textContent).toBe('24%')
    const price = screen.getByRole('slider', { name: 'Skin price' })
    fireEvent.change(price, { target: { value: '0.99' } })
    expect(screen.getByTestId('buyers').textContent).toBe('39 buyers')
    fireEvent.change(price, { target: { value: '19.99' } })
    expect(screen.getByTestId('buyers').textContent).toBe('4 buyers')
    expect(screen.getByTestId('wtp-price').textContent).toBe('$19.99')
  })

  it('labels the population as illustrative and the 56% as real (Newzoo)', () => {
    const { container } = open()
    const panel = container.querySelector('#fw-chain-panel-who')!.textContent!
    expect(panel).toContain('Illustrative population')
    expect(panel).toContain('Real 56% of players spend nothing on games in a year (Newzoo).')
    expect(panel).toContain('Illustrative The 44 dots are made-up willingness-to-pay values')
    expect(panel).toContain('d(p) = D·(1 − W(p))')
  })

  it('next/previous, arrow keys and Home/End move between the three steps', () => {
    open()
    fireEvent.click(screen.getByRole('button', { name: /Next/ })); expect(current()).toBe(1)
    steps()[1].focus()
    fireEvent.keyDown(steps()[1], { key: 'End' }); expect(current()).toBe(2); expect(document.activeElement).toBe(steps()[2])
    expect((screen.getByRole('button', { name: /Next/ }) as HTMLButtonElement).disabled).toBe(true)
    fireEvent.keyDown(steps()[2], { key: 'ArrowLeft' }); expect(current()).toBe(1)
    fireEvent.click(screen.getByRole('button', { name: /Previous/ })); expect(current()).toBe(0)
    expect(screen.getByText('1 / 3')).toBeTruthy()
  })

  it('step 2 contrasts known options (compromise, anchor) with a lucky draw (no comparison set)', () => {
    open()
    fireEvent.click(screen.getByRole('tab', { name: /What do they compare/ }))
    const p = screen.getByRole('tabpanel', { name: /What do they compare/ }).textContent!
    expect(p).toContain('compromise')
    expect(p).toContain('anchor')
    expect(p).toContain('near-miss effects, sunk-cost escalation and pity-timer anchoring')
  })

  it('step 3 routes back to the matching calculator tab', () => {
    open()
    fireEvent.click(screen.getByRole('tab', { name: /So, how do we value it/ }))
    fireEvent.click(screen.getByRole('button', { name: /Open the Probabilistic calculator/ }))
    expect(screen.getByRole('tab', { name: /Probabilistic Goods/ }).getAttribute('aria-selected')).toBe('true')
    fireEvent.click(screen.getByRole('tab', { name: /So, how do we value it/ }))
    fireEvent.click(screen.getByRole('button', { name: /Open the Deterministic calculator/ }))
    expect(screen.getByRole('tab', { name: /Deterministic Goods/ }).getAttribute('aria-selected')).toBe('true')
  })

  it('original WTP and Choice Architecture paragraphs remain available in full', () => {
    const { container } = open()
    const t = container.querySelector('.fw-chain')!.textContent!
    expect(t).toContain('Paying Rate is low not because prices are high, but because most players’ willingness to pay for extras is zero')
    expect(t).toContain('This is the mechanism this project\'s case study is built to isolate.')
  })

  it('keeps the rest of the toolkit and the original references', () => {
    const { container } = open()
    const t = container.textContent!
    for (const s of ['The rest of the toolkit', 'd(p) = D·(1 − W(p))', 'Paying Rate = P(wtp ≥ p)', 'pity-timer anchoring', 'Dr. Tim Smith',
      'Course materials: OPM 6600, Week 3–4, EVC Pricing & Choice Architecture slides.', 'Han, Ryan & Tong, 2026']) expect(t, s).toContain(s)
  })

  it('theme: Framework styles use only design-token colours', () => {
    const css = readFileSync(resolve(__dirname, '../../src/pages/framework/framework.css'), 'utf8')
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgb\(|hsl\(/)
    expect(css.split('\n').filter((l) => l.trim() && !l.trim().startsWith('/*') && !l.trim().startsWith('@media') && l.trim() !== '}')
      .every((l) => l.includes('.fw') || l.trim().startsWith('*') || !l.includes('{'))).toBe(true) // every rule is scoped under .fw
  })

  it('navigating away and back renders a fresh workbench; the Simulation is unaffected', () => {
    open()
    fireEvent.change(slider('det', /RefP/), { target: { value: '50' } })
    act(() => { window.location.hash = '#simulation'; window.dispatchEvent(new HashChangeEvent('hashchange')) })
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe("You're the new monetization manager")
    act(() => { window.location.hash = '#framework'; window.dispatchEvent(new HashChangeEvent('hashchange')) })
    expect(screen.getByTestId('det-evc').textContent).toBe('$15')
  })
})
