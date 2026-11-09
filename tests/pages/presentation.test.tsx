// PRESENT mode — what it hides, what it must never hide, and that switching modes keeps state.
// jsdom does not apply CSS, so the hide rules are read from src/index.css and applied with
// element.closest(): a test sees exactly the selectors the browser will hide in PRESENT mode.
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import App from '../../src/App'
import { uiDriver } from '../simulation/uiDriver'

const CSS = readFileSync(resolve(__dirname, '../../src/index.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
/** Selectors of every `.present …{display:none}` rule, with the leading `.present ` removed. */
const PRESENT_HIDES = [...CSS.matchAll(/([^{}]+)\{\s*display:\s*none;?\s*\}/g)]
  .flatMap((m) => m[1].split(','))
  .map((s) => s.trim())
  .filter((s) => s.startsWith('.present '))
  .map((s) => s.slice('.present '.length))
/** Selectors hidden in NORMAL mode (no `.present` prefix), e.g. `.present-only`. */
const NORMAL_HIDES = [...CSS.matchAll(/([^{}]+)\{\s*display:\s*none;?\s*\}/g)]
  .flatMap((m) => m[1].split(','))
  .map((s) => s.trim())
  .filter((s) => s === '.present-only')

const hiddenInPresent = (el: Element) => PRESENT_HIDES.some((sel) => el.closest(sel))
const hiddenInNormal = (el: Element) => NORMAL_HIDES.some((sel) => el.closest(sel))

beforeAll(() => {
  window.scrollTo = () => {}
  Element.prototype.scrollIntoView ??= () => {}
  window.matchMedia ??= ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia
})
afterEach(() => { cleanup(); window.location.hash = ''; document.documentElement.classList.remove('present') })
const open = (page: string) => { window.location.hash = `#${page}`; return render(<App simulationSeed={12345} />) }
const presentBtn = () => screen.getByRole('button', { name: /^(present|exit)$/i })
const togglePresent = () => fireEvent.click(document.querySelector('.present-btn')!)
const byText = (root: ParentNode, sel: string, text: string) =>
  Array.from(root.querySelectorAll(sel)).find((e) => (e.textContent ?? '').includes(text)) as HTMLElement | undefined

describe('PRESENT mode rules', () => {
  it('never hides notes by class alone (.game-note carries warnings, caveats and results)', () => {
    expect(PRESENT_HIDES).not.toContain('.game-note')
    expect(PRESENT_HIDES.some((s) => /(^|\s)\.game-note(\s|$|:)/.test(s))).toBe(false)
    expect(PRESENT_HIDES).toContain('.present-hide')
  })

  it('the toggle is a pressed/unpressed button and adds the class to <html>; Esc exits', () => {
    open('home')
    expect(presentBtn().getAttribute('aria-pressed')).toBe('false')
    togglePresent()
    expect(document.documentElement.classList.contains('present')).toBe(true)
    expect(document.querySelector('.present-btn')!.getAttribute('aria-pressed')).toBe('true')
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(document.documentElement.classList.contains('present')).toBe(false)
  })
})

describe('PRESENT mode keeps essential warnings, caveats and limitations visible', () => {
  it('Simulation: market consequence, plan warning, lab caveats, model assumptions', () => {
    const { container } = open('simulation')
    const ui = uiDriver(container)
    expect(hiddenInPresent(byText(container, '.game-note', 'Same game, same packages')!)).toBe(false)
    ui.selectMarket('us')
    const warning = container.querySelector('#plan-warning')!
    expect(warning).toBeTruthy()
    expect(hiddenInPresent(warning)).toBe(false)
    expect(hiddenInPresent(container.querySelector('#sweet-note')!)).toBe(false)
    // lab results and their caveats
    expect(ui.runTest('survey')).toBe(true)
    const bias = byText(container, '.game-note', 'hypothetical bias')!
    expect(bias).toBeTruthy()
    expect(hiddenInPresent(bias)).toBe(false)
    expect(ui.runTest('cbt')).toBe(true)
    expect(hiddenInPresent(byText(container, '.game-note', 'direction, not a forecast')!)).toBe(false)
    // "How this simulation works" (model assumptions) stays in PRESENT
    const foot = container.querySelector('footer.sim-foot')!
    expect(foot.textContent).toContain('illustrative calibrations')
    expect(hiddenInPresent(foot)).toBe(false)
  })

  it('Industry: classification and legal-nuance caveats stay visible', () => {
    const { container } = open('industry')
    expect(hiddenInPresent(byText(container, '.game-note', 'three categories, not a scale')!)).toBe(false)
    expect(hiddenInPresent(byText(container, '.game-note', 'the status line carries the legal nuance')!)).toBe(false)
    expect(hiddenInPresent(byText(container, '.viz-foot', 'statistically estimated optimal')!)).toBe(false)
  })

  it('Case Study: the teaching-model disclaimer and source check stay visible', () => {
    const { container } = open('case-study')
    expect(hiddenInPresent(byText(container, '.viz-foot', 'hypothetical teaching model')!)).toBe(false)
    const check = byText(container, 'details', 'Source check (November 2026)')!
    expect(hiddenInPresent(check)).toBe(false)
  })

  it('Diagnostic: "a screening tool, not a score" stays visible', () => {
    const { container } = open('diagnostic')
    expect(hiddenInPresent(container.querySelector('.dx-screen')!)).toBe(false)
  })
})

