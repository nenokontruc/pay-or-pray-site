// Home interactive demonstration — interaction tests (rules: docs/PHASE7B_HOME_DEMO.md).
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import Home from '../../src/pages/Home'
import App from '../../src/App'

beforeAll(() => {
  window.scrollTo = () => {}
  window.matchMedia ??= ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia
})
afterEach(() => { cleanup(); window.location.hash = '' })

const seq = (...us: number[]) => { let i = 0; return () => us[Math.min(i++, us.length - 1)] }
const MISS = () => 0.99

describe('Slice 1 — known item (display case)', () => {
  it('open → inspect → buy → receipt with exactly the advertised item and price', () => {
    render(<Home rng={MISS} />)
    fireEvent.click(screen.getByRole('button', { name: 'Open the display case' }))
    expect(screen.getByTestId('item-price').textContent).toBe('800 gems')
    expect(screen.getByText('Silver Crown')).toBeTruthy()
    expect(screen.queryByTestId('inspect-details')).toBeNull()
    const inspect = screen.getByRole('button', { name: 'Inspect' })
    fireEvent.click(inspect)
    expect(screen.getByTestId('inspect-details').textContent).toContain('The item you see is the item you get')
    expect(screen.getByRole('button', { name: 'Hide details' }).getAttribute('aria-expanded')).toBe('true')
    fireEvent.click(screen.getByRole('button', { name: 'Buy for 800 gems' }))
    const receipt = screen.getByTestId('receipt').textContent!
    expect(receipt).toContain('You paid 800 gems')
    expect(receipt).toContain('Silver Crown — exactly the item shown.')
    expect(receipt).toContain('The outcome was known before you paid.')
  })

  it('reset returns to the closed display case', () => {
    render(<Home rng={MISS} />)
    fireEvent.click(screen.getByRole('button', { name: 'Open the display case' }))
    fireEvent.click(screen.getByRole('button', { name: 'Buy for 800 gems' }))
    fireEvent.click(screen.getAllByRole('button', { name: 'Reset' })[0])
    expect(screen.getByRole('button', { name: 'Open the display case' })).toBeTruthy()
    expect(screen.queryByTestId('receipt')).toBeNull()
  })

  it('says no real purchase happens', () => {
    render(<Home rng={MISS} />)
    expect(screen.getByText('Illustrative currency. Nothing is actually bought.')).toBeTruthy()
  })
})

describe('Slice 2 — a chance at it (gashapon)', () => {
  const stat = (id: string) => screen.getByTestId(id).textContent
  it('shows price and the 5 / 20 / 75 distribution before any draw, labelled as teaching odds', () => {
    render(<Home rng={MISS} />)
    expect(screen.getByRole('img', { name: 'Chance per draw: featured outfit 5%, rare accessory 20%, common emote 75%' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Draw · 100 gems' })).toBeTruthy()
    expect(document.body.textContent).toContain('Teaching odds — hypothetical, not Honor of Kings or Where Winds Meet data.')
    // Progressive disclosure: no totals, ×10 or Reset until the first draw.
    expect(screen.queryByTestId('g-draws')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Draw ×10' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Draw · 100 gems' }))
    expect(stat('g-next')).toBe('5% featured')
    expect(screen.getByRole('button', { name: 'Draw ×10' })).toBeTruthy()
  })

  it('a draw reveals the outcome and updates draws, spending and the pity counter', () => {
    render(<Home rng={seq(0.1, 0.01)} />) // rare, then featured
    fireEvent.click(screen.getByRole('button', { name: 'Draw once for 100 gems' })) // the machine itself
    expect(stat('last-result')).toContain('Draw 1')
    expect(stat('last-result')).toContain('Rare accessory')
    expect([stat('g-draws'), stat('g-spent'), stat('g-pity')]).toEqual(['1', '100', '1 / 50'])
    fireEvent.click(screen.getByRole('button', { name: 'Draw · 100 gems' }))
    expect(stat('last-result')).toContain('Featured outfit')
    expect([stat('g-draws'), stat('g-spent'), stat('g-wins'), stat('g-pity')]).toEqual(['2', '200', '1', '0 / 50'])
  })

  it('guarantee boundary: 49 misses → next draw shows 100%, draw 50 is the featured outfit', () => {
    render(<Home rng={MISS} />)
    fireEvent.click(screen.getByRole('button', { name: 'Draw · 100 gems' }))
    for (let i = 0; i < 4; i++) fireEvent.click(screen.getByRole('button', { name: 'Draw ×10' }))
    for (let i = 0; i < 8; i++) fireEvent.click(screen.getByRole('button', { name: 'Draw · 100 gems' }))
    expect([stat('g-draws'), stat('g-pity'), stat('g-next')]).toEqual(['49', '49 / 50', '100% featured'])
    fireEvent.click(screen.getByRole('button', { name: 'Draw · 100 gems' }))
    expect(stat('last-result')).toContain('Featured outfit')
    expect(stat('last-result')).toContain('guaranteed (draw 50 without the featured outfit)')
    expect([stat('g-spent'), stat('g-wins'), stat('g-pity'), stat('g-next')]).toEqual(['5,000', '1', '0 / 50', '5% featured'])
  })

  it('history shows the last 10 results, each with an accessible label', () => {
    render(<Home rng={MISS} />)
    fireEvent.click(screen.getByRole('button', { name: 'Draw · 100 gems' }))
    fireEvent.click(screen.getByRole('button', { name: 'Draw ×10' }))
    const items = screen.getByRole('list', { name: 'Last 10 results' }).querySelectorAll('li')
    expect(items).toHaveLength(10)
    expect(items[0].textContent).toBe('Draw 2: Common emote')
  })

  it('reset clears the gacha (Reset only appears once there is something to reset)', () => {
    render(<Home rng={MISS} />)
    expect(screen.queryAllByRole('button', { name: 'Reset' })).toHaveLength(0)
    fireEvent.click(screen.getByRole('button', { name: 'Draw · 100 gems' }))
    fireEvent.click(screen.getByRole('button', { name: 'Draw ×10' }))
    expect(stat('g-draws')).toBe('11')
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(screen.queryByTestId('g-draws')).toBeNull()
    expect(stat('last-result')).toContain('Your capsule will appear here.')
    fireEvent.click(screen.getByRole('button', { name: 'Draw · 100 gems' }))
    expect([stat('g-draws'), stat('g-spent'), stat('g-pity')]).toEqual(['1', '100', '1 / 50'])
  })
})

describe('Slice 3 — comparison, accessibility, regression', () => {
  const buyCrown = () => {
    fireEvent.click(screen.getByRole('button', { name: 'Open the display case' }))
    fireEvent.click(screen.getByRole('button', { name: 'Buy for 800 gems' }))
  }
  it('comparison appears only after trying both; a checklist shows progress until then', () => {
    render(<Home rng={MISS} />)
    expect(screen.queryByTestId('comparison')).toBeNull()
    expect(document.body.textContent).toContain('○ Buy the crown')
    buyCrown()
    expect(document.body.textContent).toContain('✓ Buy the crown')
    expect(screen.queryByTestId('comparison')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Draw · 100 gems' }))
    expect(screen.getByTestId('comparison')).toBeTruthy()
  })

  it('comparison contrasts known vs uncertain, spending and the pricing problem, using live numbers', () => {
    render(<Home rng={MISS} />)
    buyCrown()
    fireEvent.click(screen.getByRole('button', { name: 'Draw · 100 gems' }))
    fireEvent.click(screen.getByRole('button', { name: 'Draw ×10' }))
    const rows = Array.from(screen.getByRole('table', { name: 'Known item versus a chance at it' }).querySelectorAll('[role="row"]'))
      .slice(1).map((r) => Array.from(r.children, (c) => c.textContent))
    expect(rows).toEqual([
      ['Known before paying', 'The item and its price', 'The price per draw and the odds'],
      ['Still uncertain', 'Nothing', 'Which reward, and how many draws'],
      ['Final spending set by', 'The price tag: 800 gems', 'Luck: 11 draws = 1,100 gems so far'],
      ['Pricing problem', 'EVC applies directly', 'EVC in expectation'],
    ])
    const c = screen.getByTestId('comparison')
    expect(c.textContent).toContain('between 100 gems and 5,000 gems; about 18.5 draws (≈ 1,846 gems) on average')
    expect(Array.from(c.querySelectorAll('a'), (a) => a.getAttribute('href'))).toEqual(['#framework', '#case-study'])
  })

  it('keyboard and touch: every control is a real button; touch targets are at least 44px', () => {
    const { container } = render(<Home rng={MISS} />)
    const demo = container.querySelector('.duality')!
    expect(demo.querySelectorAll('[onclick], div[role="button"], span[role="button"]')).toHaveLength(0)
    for (const b of demo.querySelectorAll('button')) expect(b.getAttribute('type')).toBe('button')
    const css = readFileSync(resolve(__dirname, '../../src/pages/home/home.css'), 'utf8')
    expect(css).toMatch(/\.hd-btn \{[^}]*min-height:44px/)
    expect(css).toMatch(/\.hd-art-btn \{[^}]*min-height:44px/)
  })

  it('small sprites have explicit sizes (the shared card rule sets width:auto on every svg)', () => {
    // Found in the real-browser check: without these, the crown and capsule filled the whole card.
    const css = readFileSync(resolve(__dirname, '../../src/pages/home/home.css'), 'utf8')
    expect(css).toMatch(/\.duality \.hd-stage \.hd-item svg \{ width:64px;/)
    expect(css).toMatch(/\.duality \.hd-stage \.hd-capsule \{ width:44px; height:44px; \}/)
  })

  it('respects reduced motion and uses only design-token colours', () => {
    const css = readFileSync(resolve(__dirname, '../../src/pages/home/home.css'), 'utf8')
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\) \{[^@]*\.hd-capsule, \.hd-out-tier \{ animation:none; \}/)
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgb\(|hsl\(/)
    // every rule targets hd-* classes (Home only)
    const selectors = css.replace(/\/\*[\s\S]*?\*\//g, '').match(/[^{}]+(?=\{)/g)!.map((s) => s.trim()).filter((s) => !s.startsWith('@') && !/^(from|to)$/.test(s))
    expect(selectors.every((s) => s.split(',').every((p) => /hd-/.test(p)))).toBe(true)
  })

  it('React StrictMode does not draw twice per click', async () => {
    const { StrictMode } = await import('react')
    let calls = 0
    render(<StrictMode><Home rng={() => { calls++; return 0.99 }} /></StrictMode>)
    fireEvent.click(screen.getByRole('button', { name: 'Draw · 100 gems' }))
    expect(calls).toBe(1)
    expect(screen.getByTestId('g-draws').textContent).toBe('1')
  })

  it('the rest of Home is unchanged: primer, roadmap to all six pages, byline', () => {
    window.location.hash = '#home'
    const { container } = render(<App />)
    expect(container.querySelectorAll('.step')).toHaveLength(4)
    expect(Array.from(container.querySelectorAll('.nav-card'), (a) => a.getAttribute('href'))).toEqual(['#industry', '#framework', '#case-study', '#diagnostic', '#simulation', '#about'])
    expect(container.textContent).toContain('OPM 6600 — Pricing & Revenue Optimization · Final Project · Trúc Trinh')
    act(() => { window.location.hash = '#industry'; window.dispatchEvent(new HashChangeEvent('hashchange')) })
    act(() => { window.location.hash = '#home'; window.dispatchEvent(new HashChangeEvent('hashchange')) })
    expect(screen.getByRole('button', { name: 'Open the display case' })).toBeTruthy()
  })
})
