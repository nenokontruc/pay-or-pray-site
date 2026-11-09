import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import App from '../../src/App'

const LEGACY = new DOMParser().parseFromString(readFileSync(resolve(__dirname, '../../legacy/index.html'), 'utf8'), 'text/html')
/** Every link in the original About section: [text, href]. */
const LEGACY_LINKS = Array.from(LEGACY.querySelectorAll('#page-about main a'), (a) => [a.textContent!.replace(/\s+/g, ' ').trim(), a.getAttribute('href')])

beforeAll(() => {
  window.scrollTo = () => {}
  window.matchMedia ??= ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia
})
afterEach(() => { cleanup(); window.location.hash = '' })
const open = () => { window.location.hash = '#about'; return render(<App />) }

describe('About page', () => {
  it('keeps every original link destination, with its original description word for word', () => {
    const { container } = open()
    const links = Array.from(container.querySelectorAll('.ab a'), (a) => [a.textContent!.replace(/\s+/g, ' ').trim(), a.getAttribute('href')])
    expect(LEGACY_LINKS).toHaveLength(4)
    expect(links.map(([, h]) => h).sort()).toEqual(LEGACY_LINKS.map(([, h]) => h).sort())
    // The capability rows replaced the link-card titles (docs/CONTENT_CORRECTIONS.md §6); each card's
    // description ("→ …") still appears inside a link to the same page.
    const legacyCards = Array.from(LEGACY.querySelectorAll('#page-about .link-card'), (a) => [a.querySelector('span')!.textContent!.replace(/\s+/g, ' ').trim(), a.getAttribute('href')])
    expect(legacyCards).toHaveLength(3)
    for (const [desc, href] of legacyCards) expect(links.some(([t, h]) => h === href && (t ?? "").includes(desc ?? "")), desc ?? "").toBe(true)
  })

  it('shows the name with its accents and narrates the biography in the first person', () => {
    const { container } = open()
    const copy = container.querySelector('.about-copy')!.textContent!.replace(/\s+/g, ' ')
    expect(copy).toContain('I’m Trúc Trịnh, a graduate student')
    expect(container.querySelector('.headshot')!.getAttribute('alt')).toBe('Portrait of Trúc Trịnh')
    expect(container.textContent).not.toMatch(/Trúc Trinh|Truc Anh Nha Trinh/)
    expect(copy).not.toMatch(/\b(she|her|She|Her)\b/)
    expect(copy).toContain('I hold a Bachelor of Business Administration in Marketing from Western Sydney University Vietnam')
    expect(copy).toContain('I spent two years at VNG Corporation as a Game Operation Collaborator on Revelation: New World and Dream & Lethe Record')
  })

  it('four capability rows link to research only where it models that experience; nothing is listed twice', () => {
    const { container } = open()
    const rows = Array.from(container.querySelectorAll('.ab-cap'))
    expect(rows.map((r) => r.querySelector('.ab-cap-name')!.textContent)).toEqual(['Live Operations & Events', 'Localization', 'Patch Testing & Patch-Note Delivery', 'Regional Collaboration'])
    expect(rows.map((r) => r.querySelector('a')?.getAttribute('href') ?? null)).toEqual(['#simulation', '#industry', '#simulation', null])
    expect(rows[3].textContent).toContain('No dedicated page')
    // patch-note delivery is not presented as A/B testing: the test-lab link is marked as testing only
    expect(rows[2].querySelector('a')!.textContent).toMatch(/^In this research · testing only/)
    // the responsibilities appear once — in the rows, not also in a biography paragraph
    const paras = Array.from(container.querySelectorAll('.about-copy > p'), (p) => p.textContent!)
    for (const s of ['patch notes', 'Philippines', 'event coordination', 'Ghost Story']) expect(paras.filter((p) => p.includes(s)), s).toHaveLength(0)
  })

  it('opens LinkedIn in a new tab safely', () => {
    open()
    const a = screen.getByRole('link', { name: /Connect on LinkedIn/ })
    expect(a.getAttribute('target')).toBe('_blank')
    expect(a.getAttribute('rel')).toContain('noopener')
  })

  it('keeps the academic context, education, experience and acknowledgments', () => {
    const { container } = open()
    const t = container.textContent!.replace(/\s+/g, ' ')
    for (const s of ['OPM 6600', 'Saint Louis University', 'Western Sydney University Vietnam', 'VNG Corporation', 'Game Operation Collaborator',
      '2019–2023', '2023–2025', '2025–now', 'Dr. Tim Smith of Wiglaf Pricing', 'anonymized']) expect(t, s).toContain(s)
  })

  it('names the course instructor and keeps the guest speaker as a separate person and role', () => {
    const { container } = open()
    const thanks = container.querySelector('.ab-thanks')!.textContent!.replace(/\s+/g, ' ')
    expect(thanks).toContain('Professor Xiao Zhang, instructor of OPM 6600 — Pricing and Revenue Optimization')
    expect(thanks).toContain('guest speaker Dr. Tim Smith of Wiglaf Pricing')
    expect(thanks).not.toMatch(/Tim Smith[^;]*instructor|Xiao Zhang[^;]*(guest speaker|Wiglaf)/)
    expect(thanks).toContain('(anonymized) for the industry interview')
    expect(thanks).not.toContain('the OPM 6600 instructor')
  })

  it('keeps every VNG responsibility, with patch testing and patch-note delivery distinct, and the events secondary', () => {
    const { container } = open()
    const did = Array.from(container.querySelectorAll('.ab-cap-did'), (d) => d.textContent!.replace(/\s+/g, ' '))
    expect(did).toEqual([
      'Live operations and event coordination.',
      'Chinese-to-Vietnamese and English localization, including English localization for Ghost Story.',
      'Testing game updates and patches; preparing, coordinating and delivering patch notes.',
      'Communicating with regional teams across the Philippines, Indonesia, Singapore and Thailand so that updates shipped on schedule.',
    ])
    const paras = Array.from(container.querySelectorAll('.about-copy p'), (p) => p.textContent!.replace(/\s+/g, ' '))
    const events = paras.filter((p) => p.includes('Vietnam Gameverse 2023'))
    expect(events).toEqual(['Additional event contributions included support for the Vietnam Gameverse 2023 launch and a one-year anniversary event.'])
    expect(container.querySelector('.ab-secondary')!.classList.contains('present-hide')).toBe(true)
  })

  it('shows the TT monogram when no headshot file exists (same fallback as the original)', () => {
    const { container } = open()
    const img = container.querySelector('.headshot')!
    fireEvent.error(img)
    expect(container.querySelector('.headshot')).toBeNull()
    expect(container.querySelector('.photo-frame .mono')!.textContent).toBe('TT')
  })
})
