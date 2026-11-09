// Industry — narrative flow, interactions, preservation of figures, accessibility.
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { ReactNode } from 'react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import App from '../../src/App'
import { STORY } from '../../src/pages/Industry'
import { BENCHMARKS, HISTORY, INSTRUMENTS, IAP_GROWTH, JURISDICTIONS, MARKET, MODELS } from '../../src/data/industry'

beforeAll(() => {
  window.scrollTo = () => {}
  window.matchMedia ??= ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia
})
afterEach(() => { cleanup(); window.location.hash = ''; vi.restoreAllMocks() })
const open = () => { window.location.hash = '#industry'; return render(<App />) }
const norm = (s: string | null) => (s ?? '').replace(/\s+/g, ' ').trim()
const text = (n: ReactNode) => norm(renderToStaticMarkup(<>{n}</>).replace(/<[^>]+>/g, '').replace(/&#x27;/g, "'").replace(/&amp;/g, '&').replace(/&quot;/g, '"'))
const section = (c: HTMLElement, id: string) => c.querySelector<HTMLElement>(`section#${id}`)!

const QUESTIONS = [
  'Why does this market matter?',
  'How did freemium evolve?',
  'How do free games generate revenue?',
  'Why does pricing differ across markets?',
  'Why does regulation affect monetization strategy?',
]

describe('Industry — narrative flow', () => {
  it('asks the five questions in order, one per section, as h2 headings', () => {
    const { container } = open()
    const sections = Array.from(container.querySelectorAll('section.slide'))
    expect(sections.map((s) => s.id)).toEqual(['market', 'history', 'models', 'economies', 'rules'])
    expect(sections.map((s) => norm(s.querySelector('h2')!.textContent))).toEqual(QUESTIONS)
    expect(STORY.map((s) => s.question)).toEqual(QUESTIONS)
    sections.forEach((s) => expect(s.querySelectorAll('h2')).toHaveLength(1))
  })

  it('each section is question → visual → takeaway → explanation on demand → bridge, with no Key Finding strip', () => {
    const { container } = open()
    expect(container.querySelectorAll('[aria-label="Key finding"], .ind-key')).toHaveLength(0)
    expect(container.textContent).not.toContain('Key finding')
    for (const s of STORY) {
      const el = section(container, s.id)
      const q = el.querySelector('h2')!, take = el.querySelector('.takeaway, [class*="takeaway"]')!, bridge = el.querySelector('.ind-bridge')!
      expect(take, s.id).toBeTruthy()
      expect(el.querySelector('details.disclosure'), s.id).toBeTruthy()
      expect(el.querySelectorAll('.ind-bridge'), s.id).toHaveLength(1)
      expect(q.compareDocumentPosition(take) & Node.DOCUMENT_POSITION_FOLLOWING, s.id).toBeTruthy()
      expect(take.compareDocumentPosition(bridge) & Node.DOCUMENT_POSITION_FOLLOWING, s.id).toBeTruthy()
    }
  })

  it('each bridge names the next question and scrolls to that section; the last leads to Framework', () => {
    const { container } = open()
    const spy = vi.fn()
    Element.prototype.scrollIntoView = spy
    for (let i = 0; i < STORY.length - 1; i++) {
      const btn = section(container, STORY[i].id).querySelector<HTMLButtonElement>('.ind-bridge button')!
      expect(btn.textContent).toContain(STORY[i + 1].question)
      spy.mockClear()
      fireEvent.click(btn)
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy.mock.contexts[0]).toBe(section(container, STORY[i + 1].id))
    }
    const last = section(container, 'rules').querySelector('.ind-bridge a')!
    expect(last.getAttribute('href')).toBe('#framework')
  })

  it('the route nav lists the five sections as buttons (hash routing is reserved for pages)', () => {
    open()
    const nav = screen.getByRole('navigation', { name: 'Five questions on this page' })
    const btns = within(nav).getAllByRole('button')
    expect(btns.map((b) => b.getAttribute('title'))).toEqual(QUESTIONS)
    expect(within(nav).queryAllByRole('link')).toHaveLength(0)
  })
})

describe('Industry — the figures stay in the charts and takeaways, unchanged', () => {
  it('market: $188.8B, 56% and +1.3% remain in the three charts and the takeaway', () => {
    const { container } = open()
    const el = section(container, 'market')
    expect(el.querySelector('svg.donut')!.textContent).toContain(`$${MARKET.total}B`)
    expect(el.querySelector('.picto-stat .big-stat')!.textContent).toBe(`${MARKET.spendNothingPct}%`)
    expect(el.querySelector('svg.bars')!.textContent).toContain(`+${IAP_GROWTH.mobileGamesPct}%`)
    expect(norm(el.querySelector('[class*="takeaway"]')!.textContent)).toContain('Mobile is 55% of a $188.8B games market — yet 56% of players spend nothing, and mobile game in-app purchases grew just 1.3% in 2025.')
    expect([MARKET.total, MARKET.spendNothingPct, IAP_GROWTH.mobileGamesPct].map(String)).toEqual(['188.8', '56', '1.3'])
  })

  it('models: the three groups still show 3 / 1 / 3 from the classifications', () => {
    const { container } = open()
    const groups = Array.from(section(container, 'models').querySelectorAll('.ind-model-group'))
    expect(groups.map((g) => g.querySelectorAll('.model-btn').length)).toEqual(['Deterministic', 'Probabilistic', 'Either'].map((k) => MODELS.filter((m) => m.kind === k).length))
  })

  it('economies: the chart still labels the benchmark as interview-derived, not an estimated optimum', () => {
    const { container } = open()
    const el = section(container, 'economies')
    expect(el.querySelector('.range-chart')!.getAttribute('aria-label')).toContain(`$${BENCHMARKS.us.lo} to $${BENCHMARKS.us.hi}`)
    expect(el.textContent).toContain('Interview-based benchmark')
    expect(norm(el.querySelector('.viz-foot')!.textContent)).toContain('not statistically estimated optimal prices')
  })
})

describe('Industry — players-who-spend pictogram', () => {
  it('encodes the two groups by shape (filled vs outlined), not colour alone; values unchanged', () => {
    const { container } = open()
    const svg = container.querySelector('svg.picto')!
    expect(svg.querySelectorAll('.pp')).toHaveLength(100)
    expect(svg.querySelectorAll('.pp-spend')).toHaveLength(44)
    expect(svg.querySelectorAll('.pp-none')).toHaveLength(56)
    // outlined figures carry a stroke width; filled ones do not
    svg.querySelectorAll('.pp-none rect').forEach((r) => expect(r.getAttribute('stroke-width')).toBe('0.7'))
    svg.querySelectorAll('.pp-spend rect').forEach((r) => expect(r.getAttribute('stroke-width')).toBeNull())
    expect(svg.getAttribute('aria-label')).toBe('100 player icons: 56 spend nothing on games in a year, 44 spend something')
    expect(container.textContent).toContain('1 icon = 1 of every 100 players. The 44 is the remainder (100 − 56). Source:')
  })

  it('selecting a group keeps it at full strength and fades only the other group', () => {
    const { container } = open()
    const svg = container.querySelector('svg.picto')!
    const [none, spend] = Array.from(container.querySelectorAll<HTMLButtonElement>('.picto-toggles .chip'))
    expect(svg.querySelectorAll('.pp-dim')).toHaveLength(0)
    fireEvent.click(none)
    expect(none.getAttribute('aria-pressed')).toBe('true')
    expect(none.classList.contains('on')).toBe(true)
    expect(none.querySelector('.ind-check')).toBeTruthy()
    expect(svg.querySelectorAll('.pp-none.pp-dim')).toHaveLength(0)
    expect(svg.querySelectorAll('.pp-spend.pp-dim')).toHaveLength(44)
    fireEvent.click(spend)
    expect(none.getAttribute('aria-pressed')).toBe('false')
    expect(spend.getAttribute('aria-pressed')).toBe('true')
    expect(svg.querySelectorAll('.pp-spend.pp-dim')).toHaveLength(0)
    expect(svg.querySelectorAll('.pp-none.pp-dim')).toHaveLength(56)
    fireEvent.click(spend)
    expect(svg.querySelectorAll('.pp-dim')).toHaveLength(0)
  })

  it('pictogram colours come from tokens, with a dark-mode fill that is not --slate', () => {
    const css = readFileSync(resolve(__dirname, '../../src/pages/industry/industry.css'), 'utf8')
    expect(css).toContain('.ind { --picto-fill:var(--slate); --picto-line:var(--text-muted); }')
    expect(css).toContain('@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) .ind { --picto-fill:var(--silver); } }')
    expect(css).toContain(':root[data-theme="dark"] .ind { --picto-fill:var(--silver); }')
    expect(css).toContain('.ind .picto-toggles .chip.on { background:var(--text); color:var(--bg); border-color:var(--text);')
  })
})

describe('Industry — timeline', () => {
  it('keeps all eight milestones interactive, with era context and pricing-manager guidance', () => {
    const { container } = open()
    const el = section(container, 'history')
    const tabs = within(el).getAllByRole('tab')
    expect(tabs).toHaveLength(HISTORY.length)
    expect(HISTORY).toHaveLength(8)
    const panel = el.querySelector('#tl-panel')!
    expect(panel.textContent).toContain('Era 1 of 3')
    expect(panel.textContent).toContain('What changed for pricing managers')
    expect(norm(panel.textContent)).toContain(text(HISTORY[0].lesson))

    const next = within(el).getByRole('button', { name: 'Next milestone →' })
    const prev = within(el).getByRole('button', { name: '← Previous milestone' })
    expect((prev as HTMLButtonElement).disabled).toBe(true)
    fireEvent.click(next)
    expect(tabs[1].getAttribute('aria-selected')).toBe('true')
    expect(el.querySelector('#tl-panel')!.textContent).toContain(HISTORY[1].title)
    fireEvent.click(prev)
    expect(tabs[0].getAttribute('aria-selected')).toBe('true')
    fireEvent.keyDown(within(el).getByRole('tablist'), { key: 'ArrowRight' })
    expect(tabs[1].getAttribute('aria-selected')).toBe('true')
  })

  it('lists all eight milestones in a text version', () => {
    const { container } = open()
    const items = section(container, 'history').querySelectorAll('.ind-history li')
    expect(items).toHaveLength(8)
    HISTORY.forEach((h, k) => {
      expect(items[k].textContent).toContain(h.year)
      expect(norm(items[k].textContent)).toContain(text(h.body))
      expect(norm(items[k].textContent)).toContain(text(h.lesson))
    })
  })
})

describe('Industry — models', () => {
  it('groups the seven models into three categories with no continuum bar', () => {
    const { container } = open()
    const el = section(container, 'models')
    const groups = Array.from(el.querySelectorAll<HTMLElement>('.ind-model-group[role="group"]'))
    expect(groups.map((g) => g.getAttribute('aria-label')!.split(':')[0])).toEqual(['Deterministic', 'Probabilistic', 'Either'])
    expect(groups.map((g) => g.querySelectorAll('.model-btn').length)).toEqual([3, 1, 3])
    for (const g of groups) {
      const kind = g.getAttribute('aria-label')!.split(':')[0]
      g.querySelectorAll('.model-btn').forEach((b) => expect(MODELS.find((m) => m.id === b.getAttribute('data-model'))!.kind).toBe(kind))
    }
    expect(el.querySelector('.continuum, .model-continuum, [class*="continuum"]')).toBeNull()
    expect(el.textContent).toContain('three categories, not a scale')
  })

  it('selecting a model updates the detail and pressed state', () => {
    const { container } = open()
    const el = section(container, 'models')
    for (const m of MODELS) {
      const btn = el.querySelector<HTMLButtonElement>(`.model-btn[data-model="${m.id}"]`)!
      fireEvent.click(btn)
      expect(btn.getAttribute('aria-pressed')).toBe('true')
      const detail = el.querySelector('.ind-model-detail')!
      expect(detail.getAttribute('data-selected')).toBe(m.id)
      expect(detail.textContent).toContain(m.how)
    }
  })

  it('lists all seven models with classification in a text version', () => {
    const { container } = open()
    const items = section(container, 'models').querySelectorAll('.ind-model-list li')
    expect(items).toHaveLength(7)
    MODELS.forEach((m, k) => {
      expect(items[k].textContent).toContain(m.label)
      expect(items[k].querySelector('.ind-kind')!.textContent).toBe(m.kind)
      expect(items[k].textContent).toContain(m.how)
    })
  })
})

describe('Industry — economies', () => {
  it('keeps both in-game and out-of-game panels in the page and switches between them', () => {
    const { container } = open()
    const el = section(container, 'economies')
    const panels = el.querySelectorAll<HTMLElement>('[role="tabpanel"]')
    expect(panels).toHaveLength(2)
    expect(panels[0].hidden).toBe(false)
    expect(panels[1].hidden).toBe(true)
    const tabs = within(el).getAllByRole('tab')
    tabs.forEach((t, k) => expect(t.getAttribute('aria-controls')).toBe(panels[k].id))
    fireEvent.click(tabs[1])
    expect(panels[0].hidden).toBe(true)
    expect(panels[1].hidden).toBe(false)
    expect(tabs[1].getAttribute('aria-selected')).toBe('true')
  })
})

describe('Industry — regulation', () => {
  it('distinguishes enacted rules, interpretations, proposals and litigation', () => {
    const expected: Record<string, string> = { cn: 'enacted', be: 'interpretation', nl: 'interpretation', kr: 'enacted', us: 'litigation', eu: 'proposal' }
    expect(Object.fromEntries(JURISDICTIONS.map((j) => [j.id, j.instrument]))).toEqual(expected)
    const { container } = open()
    const el = section(container, 'rules')
    // chips show each jurisdiction's type
    const chips = el.querySelectorAll('.reg-chip')
    expect(chips).toHaveLength(6)
    JURISDICTIONS.forEach((j, k) => expect(chips[k].querySelector('.ind-inst')!.textContent).toBe(INSTRUMENTS[j.instrument].short))
    // legend lists all four types
    const legend = within(el).getByRole('list', { name: 'Types of rule' })
    expect(within(legend).getAllByRole('listitem')).toHaveLength(4)
    // detail updates on selection
    fireEvent.click(chips[1])
    expect(el.querySelector('.reg-detail')!.textContent).toContain(INSTRUMENTS.interpretation.label)
    // full table has the new column for every jurisdiction, statuses unchanged
    const rows = el.querySelectorAll('tbody tr')
    expect(rows).toHaveLength(6)
    expect(Array.from(el.querySelectorAll('thead th'), (t) => t.textContent)).toEqual(['Jurisdiction', 'Approach', 'Status, 2026', 'Type of rule'])
    JURISDICTIONS.forEach((j, k) => {
      expect(rows[k].textContent).toContain(j.status)
      expect(rows[k].lastElementChild!.textContent).toBe(INSTRUMENTS[j.instrument].label)
    })
  })
})

describe('Industry — accessibility and scope', () => {
  it('has one h1, labelled landmarks and no unnamed buttons', () => {
    const { container } = open()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    container.querySelectorAll('.ind button').forEach((b) => {
      expect(norm(b.textContent) || b.getAttribute('aria-label'), b.outerHTML.slice(0, 80)).toBeTruthy()
      expect(b.getAttribute('type')).toBe('button')
    })
  })

  it('styles are scoped under .ind and use design tokens only', () => {
    const css = readFileSync(resolve(__dirname, '../../src/pages/industry/industry.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
    const selectors = css.replace(/\{[^}]*\}/g, '\n').split(/[\n,]/).map((s) => s.trim()).filter((s) => s && !s.startsWith('@') && s !== '}')
    selectors.forEach((s) => expect(s, s).toMatch(/(^|\s)\.ind(\s|$)/))
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(css).not.toMatch(/rgba?\(|hsla?\(/)
  })
})
