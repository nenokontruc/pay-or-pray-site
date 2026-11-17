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
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('From business model to item pricing')
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

describe('Framework — probabilistic tab (expected net payoff = p × G − c)', () => {
  it('default p 20%, G $18, c $3: ceiling $3.60, net payoff $0.60, labelled as not EVC', () => {
    open()
    fireEvent.click(screen.getByRole('tab', { name: /Probabilistic Goods/ }))
    expect(screen.getByTestId('p-failure').textContent).toBe('80%')
    expect(screen.getByTestId('ceiling').textContent).toBe('+$3.60')
    expect(screen.getByTestId('price').textContent).toBe('−$3')
    expect(screen.getByTestId('prob-enp').textContent).toBe('$0.60')
    expect(screen.getByTestId('ceiling-read').textContent).toBe('$3.60')
    const t = panel('prob').textContent!
    expect(t).toContain('Expected net payoff = p × G − c')
    expect(t).toContain('Not EVC: EVC (left tab) is a price ceiling.')
    expect(t).not.toContain('EVC(gacha)')
  })

  it('probability edges and very low probability (reported Where Winds Meet inputs: 0.0415%, $100, $2.6664 → −$2.62)', () => {
    open()
    fireEvent.change(box('prob', /^p/), { target: { value: '0' } })
    expect(screen.getByTestId('prob-enp').textContent).toBe('−$3')
    fireEvent.change(box('prob', /^p/), { target: { value: '100' } })
    expect(screen.getByTestId('prob-enp').textContent).toBe('$15')
    expect(screen.getByTestId('p-failure').textContent).toBe('0%')
    fireEvent.change(box('prob', /^p/), { target: { value: '0.0415' } })
    expect(screen.getByTestId('p-success').textContent).toBe('0.0415%')
    expect(screen.getByTestId('p-failure').textContent).toBe('99.9585%')
    fireEvent.change(box('prob', /^G/), { target: { value: '100' } })
    expect(screen.getByTestId('ceiling-read').textContent).toBe('$0.04') // 0.000415 × 100 = $0.0415
    fireEvent.change(box('prob', /^p/), { target: { value: '101' } })
    expect(within(panel('prob')).getByRole('alert').textContent).toBe('Enter a number from 0 to 100.')
  })

  it('positive, break-even and negative interpretations', () => {
    open()
    fireEvent.change(box('prob', /^p/), { target: { value: '25' } })
    fireEvent.change(box('prob', /^G/), { target: { value: '4' } })
    fireEvent.change(box('prob', /^c/), { target: { value: '1' } })
    expect(screen.getByTestId('prob-interp').textContent).toContain('breaks even') // 0.25 × 4 − 1 = 0
    fireEvent.change(box('prob', /^c/), { target: { value: '4' } })
    expect(screen.getByTestId('prob-interp').textContent).toContain('negative expected net payoff') // 1 − 4
    expect(screen.getByTestId('prob-enp').textContent).toBe('−$3')
    fireEvent.change(box('prob', /^c/), { target: { value: '0.5' } })
    expect(screen.getByTestId('prob-interp').textContent).toContain('worth $0.50 more than its price')
  })

  it('reset restores 20%, $18, $3', () => {
    open()
    fireEvent.change(box('prob', /^G/), { target: { value: '90' } })
    fireEvent.click(screen.getByRole('button', { name: /Reset to 20%/ }))
    expect(screen.getByTestId('prob-enp').textContent).toBe('$0.60')
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
    fireEvent.change(box('prob', /^p/), { target: { value: '50' } })
    const steps = screen.getByTestId('steps').textContent!
    expect(steps).toContain('EVC = $10 + ($5) = $15')
    expect(steps).toContain('Ceiling for one draw = p × G = 0.5 × $18 = $9')
    expect(steps).toContain('Expected net payoff = p × G − c = $9 − $3 = $6')
    // the original draft form agrees only with Value = G − c = $15: 0.5 × 15 − 0.5 × 3 = $6
    expect(steps).toContain('0.5 × $15 − 0.5 × $3 = $6')
    const math = details.textContent!
    expect(math).toContain('EVC(gacha) = P(success) × Value − P(failure) × Cost') // kept, with its condition
    expect(math).toContain('Original draft form — valid only if Value is the net gain')
    expect(math).toContain('Expected net payoff = p × G − c')
  })

  it('general model worked example: duplicate adds zero (2.15 → 1.65)', () => {
    open()
    expect(screen.getByTestId('general-total').textContent).toBe('1.65')
    fireEvent.click(screen.getByLabelText(/already owns the Mount/))
    expect(screen.getByTestId('general-total').textContent).toBe('2.15')
  })

  it('"Open the mathematics" (toolkit step 3) stays on the Framework page (no hash navigation), also in PRESENT', () => {
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

  it('labels the whole population as illustrative and does not treat non-payers as zero willingness to pay', () => {
    const { container } = open()
    const panel = container.querySelector('#fw-chain-panel-who')!.textContent!
    expect(panel).toContain('Illustrative population')
    expect(panel).toContain('Illustrative All 100 players are made up')
    expect(panel).toContain('That is a spending outcome, not a measure of willingness to pay, so it is not used as one here.')
    expect(panel).toContain('d(p) = D·(1 − W(p))')
    expect(panel).not.toContain('Real 56%')
    expect(panel).not.toContain('willingness to pay for extras is zero')
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
    expect(t).toContain('a spending outcome, not evidence that their willingness to pay is zero')
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

const norm = (s: string | null) => (s ?? '').replace(/\s+/g, ' ').trim()

describe('Framework, first section — RQ1: when does freemium pay off? (FINAL REVIEW COPY, Section 3; hand-checked numbers)', () => {
  const payoff = () => document.getElementById('payoff')!

  it('shows the three headline results and labels the example as hypothetical', () => {
    open()
    expect(screen.getByTestId('be-premium').textContent).toBe('$130,000')
    expect(screen.getByTestId('be-rbe').textContent).toBe('12.98%')
    expect(screen.getByTestId('be-rp').textContent).toBe('13.75%')
    const t = norm(payoff().textContent)
    expect(t).toContain('A hypothetical 24-month pricing example — not observed game data.')
    expect(t).toContain('These are not the conversion rates of Honor of Kings, Where Winds Meet or any real game.')
    expect(t).toContain('Each paying player spends $40 over that time (assumed).')
  })

  it('the worked formula and the infeasible $3 case are on screen, never clipped to 100%', () => {
    open()
    expect(norm(screen.getByTestId('be-eq').textContent)).toContain('($2.93 + $0.70) ÷ $28.00 = 12.98%')
    expect(norm(screen.getByTestId('be-eq').textContent)).toContain('premium’s profit per installer ($0.22): 13.75%')
    const low = norm(screen.getByTestId('be-low').textContent)
    expect(low).toContain('173.0%')
    expect(low).toContain('183.3%')
    expect(low).toContain('no conversion rate could make that design profitable')
  })

  it('the payer-share slider moves through the three outcomes (−$1,340,000 → $0-ish → +$340,000)', () => {
    open()
    const s = within(payoff()).getByRole('slider', { name: 'Payer share' })
    expect(screen.getByTestId('be-share').textContent).toBe('5.00%')
    expect(screen.getByTestId('be-profit').textContent).toBe('−$1,340,000')
    expect(screen.getByTestId('be-zone').textContent).toBe('Freemium loses money')
    fireEvent.change(s, { target: { value: '13.5' } }) // between 12.98% and 13.75%
    expect(screen.getByTestId('be-profit').textContent).toBe('$88,000') // 600,000 × (28 × 0.135 − 0.70) − 1,760,000 = 600,000 × 3.08 − 1,760,000
    expect(screen.getByTestId('be-zone').textContent).toBe('Profitable, but worse than premium')
    fireEvent.change(s, { target: { value: '13.75' } }) // exactly the matching share
    expect(screen.getByTestId('be-profit').textContent).toBe('$130,000')
    expect(screen.getByTestId('be-zone').textContent).toBe('Matches or beats premium')
    fireEvent.change(s, { target: { value: '15' } })
    expect(screen.getByTestId('be-profit').textContent).toBe('$340,000')
    expect(screen.getByTestId('be-zone').textContent).toBe('Matches or beats premium')
  })

  it('ends with the required takeaway, and the model panel lists every input', () => {
    open()
    expect(norm(payoff().querySelector('.takeaway')!.textContent)).toContain('A profitable freemium game is not necessarily more profitable than a premium game.')
    expect(norm(payoff().querySelector('.fw-rq1-next')!.textContent)).toBe('Once a publisher chooses freemium, the next question is how individual items should be priced.')
    // RQ1 comes first on the page, before the item-pricing workbench (RQ2)
    expect(payoff().compareDocumentPosition(document.getElementById('fw-workbench')!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    const panel = norm(payoff().querySelector('details.disclosure')!.textContent)
    for (const s of ['1,000,000 players; 24 months', '30% of gross revenue', '$1,040,000', '$1,760,000', '$10 per paying month × 4 paying months', 'Payer share is cumulative over 24 months'])
      expect(panel, s).toContain(s)
  })
})
