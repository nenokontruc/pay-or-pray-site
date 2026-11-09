import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import App from '../src/App'
import { PAGES } from '../src/lib/router'

// jsdom has no layout engine; the app calls these on navigation.
beforeAll(() => {
  window.scrollTo = () => {}
  window.matchMedia ??= ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia
})
afterEach(() => { cleanup(); window.location.hash = '' })

// Smoke test: every page in the nav renders a heading without crashing.
describe('routing', () => {
  it.each(PAGES)('renders #%s', (page) => {
    window.location.hash = `#${page}`
    render(<App />)
    expect(screen.getAllByRole('heading', { level: 1 }).length).toBeGreaterThan(0)
    const active = screen.getByRole('link', { current: 'page' })
    expect(active.getAttribute('href')).toBe(`#${page}`)
  })

  it('falls back to Home for an unknown hash', () => {
    window.location.hash = '#not-a-page'
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: /when does freemium make sense/i })).toBeTruthy()
  })
})
