/**
 * Content preservation: every piece of research text in the original Case Study, Diagnostic and
 * About sections (legacy/index.html) must appear word for word in the React page — visible or inside
 * an expandable panel. Expected text is read from the original file, never typed into this test.
 */
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import App from '../../src/App'

const LEGACY = new DOMParser().parseFromString(readFileSync(resolve(__dirname, '../../legacy/index.html'), 'utf8'), 'text/html')
const norm = (s: string) => s.replace(/ /g, ' ').replace(/\s+/g, ' ').trim()

/**
 * Text-bearing elements of the original section (including its footer).
 * Whole facts, table rows and matrix cells are included so a value must appear next to ITS label
 * (a lone "0.747%" elsewhere on the page would not satisfy "Material odds0.747%").
 */
const SELECTORS = [
  '.fact', 'tr', '.mx-cell', '.formula', '.formula-note', '.term', '.formula-block .label span',
  '.kicker', 'h1', 'h2', 'h3', 'h4', 'p', 'li', 'th', 'td',
  '.fact .k', '.fact .v', '.case-sub', '.sub', '.badge', '.callout', '.case-note',
  '.risk', '.col-head', '.row-label span', '.am-k', '.about-meta div', '.link-card b', '.link-card span', '.tl-y',
  'footer h5', 'footer .refs div', 'footer .meta p', 'a',
].join(', ')

export function legacyTexts(pageId: string): string[] {
  const section = LEGACY.getElementById(`page-${pageId}`)
  if (!section) throw new Error(`legacy section page-${pageId} not found`)
  const out = new Set<string>()
  section.querySelectorAll(SELECTORS).forEach((el) => { const t = norm(el.textContent ?? ''); if (t.length > 1) out.add(t) })
  return [...out]
}

beforeAll(() => {
  window.scrollTo = () => {}
  window.matchMedia ??= ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia
})
afterEach(() => { cleanup(); window.location.hash = '' })

function reactText(pageId: string): string {
  window.location.hash = `#${pageId}`
  const { container } = render(<App />)
  return norm(container.textContent ?? '')
}

describe.each(['home', 'framework', 'case-study', 'diagnostic', 'about'])('%s: every original text item is preserved', (pageId) => {
  it('has a meaningful inventory', () => {
    expect(legacyTexts(pageId).length).toBeGreaterThan(pageId === 'about' || pageId === 'framework' ? 15 : 25)
  })
  it('each original item appears word for word', () => {
    // Whitespace between elements differs between hand-written HTML and React output, so
    // compare with all whitespace removed: the characters, in order, must still match exactly.
    const squash = (s: string) => s.replace(/\s+/g, '')
    const page = squash(reactText(pageId))
    const missing = legacyTexts(pageId).filter((t) => !page.includes(squash(t)))
    expect(missing, `missing from the React ${pageId} page`).toEqual([])
  })
})
