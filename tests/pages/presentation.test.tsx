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


/** Words a viewer can read in a mode: hidden elements and the bodies of closed panels removed. */
function visibleWords(root: HTMLElement, mode: 'normal' | 'present'): number {
  const clone = root.cloneNode(true) as HTMLElement
  const hidden = (el: Element) => (mode === 'present' ? hiddenInPresent(el) : hiddenInNormal(el))
  clone.querySelectorAll('*').forEach((el) => { if (clone.contains(el) && hidden(el)) el.remove() })
  clone.querySelectorAll('[hidden]').forEach((el) => el.remove()) // inactive tab panels: hidden in both modes
  clone.querySelectorAll('details:not([open])').forEach((d) => Array.from(d.children).forEach((c) => { if (c.tagName !== 'SUMMARY') c.remove() }))
  return (clone.querySelector('#main')?.textContent ?? '').split(/\s+/).filter(Boolean).length
}

describe('PRESENT mode is more concise; NORMAL mode keeps everything', () => {
  it('NORMAL mode hides nothing but the short PRESENT-only lines', () => {
    expect(NORMAL_HIDES).toEqual(['.present-only'])
  })

  // Not a rigid word budget: caveats and chart labels stay. Text-heavy pages must lose at least 15%.
  it.each(['home', 'industry', 'case-study', 'about'])('%s: PRESENT shows at least 15% fewer words than NORMAL', (page) => {
    const { container } = open(page)
    const normal = visibleWords(container, 'normal'), present = visibleWords(container, 'present')
    expect(present / normal, `${page}: ${present} of ${normal} words`).toBeLessThanOrEqual(0.85)
    console.info(`${page}: NORMAL ${normal} → PRESENT ${present} words`)
  })

  it.each(['framework', 'diagnostic', 'simulation'])('%s: PRESENT shows fewer or equal words, never more', (page) => {
    const { container } = open(page)
    expect(visibleWords(container, 'present')).toBeLessThanOrEqual(visibleWords(container, 'normal'))
  })

  it('Home: the short argument line replaces the long one only in PRESENT; both distinctions kept', () => {
    const { container } = open('home')
    const short = container.querySelector('.callout.present-only')!
    const full = container.querySelector('.callout.normal-only')!
    expect(short.textContent).toBe('A known item and a lucky draw are different pricing problems: different tools, different risks, different reactions by country.')
    expect(full.textContent).toContain('The argument in one sentence:')
    expect([hiddenInNormal(short), hiddenInPresent(short)]).toEqual([true, false])
    expect([hiddenInNormal(full), hiddenInPresent(full)]).toEqual([false, true])
    // the two demos (the primary visual) stay in PRESENT
    container.querySelectorAll('.duality .card').forEach((c) => expect(hiddenInPresent(c)).toBe(false))
  })

  it('marked items are hidden in PRESENT and visible in NORMAL', () => {
    const cases: [string, string][] = [
      ['home', '.hero .lede'], ['industry', '.page-lede'], ['case-study', '.page-lede'], ['case-study', '.cs-evidence'],
      ['simulation', '.page-lede'], ['about', '.timeline'],
    ]
    for (const [page, sel] of cases) {
      const { container, unmount } = open(page)
      const el = container.querySelector(sel)!
      expect(el, `${page} ${sel}`).toBeTruthy()
      expect([hiddenInNormal(el), hiddenInPresent(el)], `${page} ${sel}`).toEqual([false, true])
      unmount(); window.location.hash = ''
    }
  })

  it('analysis panels close up in PRESENT except the one with a material caveat', () => {
    const { container } = open('case-study')
    const panels = Array.from(container.querySelectorAll('details.disclosure'))
    const kept = panels.filter((d) => !hiddenInPresent(d))
    expect(kept.map((d) => d.querySelector('summary')!.textContent)).toEqual(['Teaching model: formula, assumptions and source check'])
    panels.forEach((d) => expect(hiddenInNormal(d)).toBe(false))
  })

  it('Framework: formula, inputs, result and interpretation stay; derivations hide', () => {
    const { container } = open('framework')
    expect(hiddenInPresent(byText(container, '.formula, [class*=formula]', 'EVC = RefP + DiffV')!)).toBe(false)
    expect(hiddenInPresent(container.querySelector('.fw-result')!)).toBe(false)
    expect(hiddenInPresent(container.querySelector('input[type="range"]')!)).toBe(false)
    expect(hiddenInPresent(container.querySelector('#fw-math')!)).toBe(true)
  })
})

describe('switching modes keeps state', () => {
  it('Framework calculator values and results survive PRESENT on/off', () => {
    const { container } = open('framework')
    const slider = container.querySelector<HTMLInputElement>('input[type="range"]')!
    const max = Number(slider.max), min = Number(slider.min)
    const next = String(Math.round((min + max) / 2))
    fireEvent.change(slider, { target: { value: next } })
    const result = container.querySelector('.fw-result')!.textContent
    togglePresent()
    expect(container.querySelector<HTMLInputElement>('input[type="range"]')!.value).toBe(slider.value)
    expect(container.querySelector('.fw-result')!.textContent).toBe(result)
    togglePresent()
    expect(container.querySelector('.fw-result')!.textContent).toBe(result)
  })

  it('Simulation stage, plan and lab results survive PRESENT on/off', () => {
    const { container } = open('simulation')
    const ui = uiDriver(container)
    ui.selectMarket('jp')
    ui.runTest('cbt')
    const before = { warning: ui.text('#plan-warning'), lab: container.querySelectorAll('.lab-card, .lab-result, [class*="lab-c"]').length, html: container.querySelector('#main')!.textContent }
    togglePresent()
    expect(document.documentElement.classList.contains('present')).toBe(true)
    expect(ui.text('#plan-warning')).toBe(before.warning)
    expect(container.querySelector('#main')!.textContent).toBe(before.html)
    togglePresent()
    expect(container.querySelector('#main')!.textContent).toBe(before.html)
    expect(before.lab).toBeGreaterThan(0)
  })

  it('Industry selections survive PRESENT on/off', () => {
    const { container } = open('industry')
    fireEvent.click(container.querySelector('.model-btn[data-model="pass"], .model-btn:not(.on)')!)
    const selected = container.querySelector('.ind-model-detail')!.getAttribute('data-selected')
    fireEvent.click(container.querySelectorAll('.picto-toggles .chip')[1])
    togglePresent()
    expect(container.querySelector('.ind-model-detail')!.getAttribute('data-selected')).toBe(selected)
    expect(container.querySelectorAll('.picto-toggles .chip')[1].getAttribute('aria-pressed')).toBe('true')
  })
})
