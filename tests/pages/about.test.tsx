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
  it('keeps every original link with the same destination', () => {
    const { container } = open()
    const links = Array.from(container.querySelectorAll('.ab a'), (a) => [a.textContent!.replace(/\s+/g, ' ').trim(), a.getAttribute('href')])
    expect(LEGACY_LINKS).toHaveLength(4)
    expect(links).toEqual(LEGACY_LINKS)
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

  it('shows the TT monogram when no headshot file exists (same fallback as the original)', () => {
    const { container } = open()
    const img = container.querySelector('.headshot')!
    fireEvent.error(img)
    expect(container.querySelector('.headshot')).toBeNull()
    expect(container.querySelector('.photo-frame .mono')!.textContent).toBe('TT')
  })
})
