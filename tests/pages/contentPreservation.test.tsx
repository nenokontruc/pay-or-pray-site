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

/**
 * Deliberate, documented corrections (docs/CONTENT_CORRECTIONS.md). An original item containing
 * `original` may be absent only if `replacement` appears on that page instead. Nothing else is exempt.
 */
const CORRECTIONS: { page: string; original: string; replacement: string }[] = [
  { page: 'industry', original: 'Statutory odds disclosure since 2024, with 3x damages for violations',
    replacement: 'Statutory odds disclosure since March 2024; up to 3x damages for intentional violations since August 2025' },
  { page: 'case-study', original: 'Staying cosmetic-only has a revenue cost',
    replacement: 'Does staying cosmetic-only cost revenue? Not clearly.' },
  // Author-approved About revisions (Nov 2026): responsibilities listed separately, events made secondary,
  // and the course instructor named. Only these two original paragraphs are exempt.
  // Author's display name with its accents (Nov 2026).
  // (The Home byline is not in this inventory; tests/pages/home.test.tsx checks it.)
  { page: 'home', original: 'Final project companion site · Trúc Trinh', replacement: 'Final project companion site · Trúc Trịnh' },
  { page: 'about', original: 'Final project companion site · Trúc Trinh', replacement: 'Final project companion site · Trúc Trịnh' },
  // About in the first person, with capability rows replacing the three link cards (Nov 2026, §5–6).
  // The link cards' descriptions are kept word for word in the rows; only these headings and sentences changed.
  { page: 'about', original: 'is a graduate student in Logistics',
    replacement: 'I’m Trúc Trịnh, a graduate student in Logistics, Materials, and Supply Chain Management at Saint Louis University, where I completed this project' },
  { page: 'about', original: 'This project grew out of that work.',
    replacement: 'My experience in game live operations and localization shaped the questions behind this research' },
  { page: 'about', original: 'From experience to analysis', replacement: 'What I did, and where it shows up in this research' },
  { page: 'about', original: 'Localization across Southeast Asia', replacement: 'Chinese-to-Vietnamese and English localization, including English localization for Ghost Story.' },
  { page: 'about', original: 'Live operations & events', replacement: 'Live Operations & Events' },
  { page: 'about', original: 'Patch testing', replacement: 'Patch Testing & Patch-Note Delivery' },
  { page: 'about', original: 'including the Vietnam Gameverse 2023 launch and a one-year anniversary event',
    replacement: 'Additional event contributions included support for the Vietnam Gameverse 2023 launch and a one-year anniversary event.' },
  { page: 'about', original: 'and to the OPM 6600 instructor for guidance',
    replacement: 'Thanks to Professor Xiao Zhang, instructor of OPM 6600 — Pricing and Revenue Optimization, for guidance and access to the course’s research database' },
]

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

describe.each(['home', 'industry', 'framework', 'case-study', 'diagnostic', 'about'])('%s: every original text item is preserved', (pageId) => {
  it('has a meaningful inventory', () => {
    expect(legacyTexts(pageId).length).toBeGreaterThan(pageId === 'about' || pageId === 'framework' ? 15 : 25)
  })
  it('each original item appears word for word', () => {
    // Whitespace between elements differs between hand-written HTML and React output, so
    // compare with all whitespace removed: the characters, in order, must still match exactly.
    const squash = (s: string) => s.replace(/\s+/g, '')
    const page = squash(reactText(pageId))
    const corrected = CORRECTIONS.filter((c) => c.page === pageId && page.includes(squash(c.replacement)))
    const missing = legacyTexts(pageId).filter((t) => !page.includes(squash(t)) && !corrected.some((c) => t.includes(c.original)))
    expect(missing, `missing from the React ${pageId} page`).toEqual([])
  })
})

describe('documented corrections', () => {
  it.each(CORRECTIONS)('$page: the original wording is replaced, not just removed', ({ page, original, replacement }) => {
    expect(legacyTexts(page).some((t) => t.includes(original)), 'the original exists in legacy/').toBe(true)
    const text = reactText(page)
    expect(text).toContain(replacement)
    expect(text).not.toContain(original)
  })
})
