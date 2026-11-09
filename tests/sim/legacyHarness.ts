/**
 * Drives the ORIGINAL, UNMODIFIED Simulation in legacy/index.html inside jsdom.
 *
 * Nothing in the legacy file is edited. We only control the environment around it:
 *  - Date.now() is fixed before the page's scripts run, so the original seed rule
 *    `rngSeed = (Date.now() % 2147483646) + 1` produces a seed we choose;
 *  - window.Blob is replaced by a recorder, so the page's own download() hands us
 *    the CSV text it would have saved;
 *  - scrollTo is a no-op (jsdom has no layout).
 * Then we click the page's real buttons. Expected values in the equivalence tests
 * therefore always come from the original code.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { JSDOM, VirtualConsole } from 'jsdom'
import type { Plan, MarketId, PkgId } from '../../src/sim'

export const LEGACY_PATH = resolve(__dirname, '../../legacy/index.html')
const LEGACY_HTML = readFileSync(LEGACY_PATH, 'utf8')

export type ExportKind = 'months' | 'daily' | 'panel' | 'txns' | 'tests'

export interface LegacyPage {
  window: Window & typeof globalThis
  document: Document
  selectMarket(m: MarketId): void
  setPlan(plan: Plan): void
  setEvent(on: boolean): void
  launch(): void
  /**
   * Click a lab button, then "Run test" in the confirm box (if it appears).
   * Returns false (and clicks nothing) when the original button is disabled.
   */
  runTest(kind: 'cbt' | 'survey' | 'ab'): boolean
  saveA(): void
  exportCSV(kind: ExportKind): string
  text(selector: string): string
  texts(selector: string): string[]
  waitForDebrief(): Promise<void>
  replay(): void
  close(): void
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function openLegacy(seed: number): LegacyPage {
  if (!Number.isInteger(seed) || seed < 1 || seed > 2147483646) throw new Error('seed out of range')
  const captured: string[] = []
  const vc = new VirtualConsole()
  vc.on('jsdomError', (e: unknown) => {
    const msg = String((e as Error)?.message ?? e)
    // jsdom does not implement navigation (the download link click); everything else is a real error.
    if (!/Not implemented/.test(msg)) throw e
  })
  const dom = new JSDOM(LEGACY_HTML, {
    url: 'http://localhost/legacy/index.html',
    runScripts: 'dangerously',
    pretendToBeVisual: true, // provides requestAnimationFrame (used by the Industry count-up)
    virtualConsole: vc,
    beforeParse(win) {
      win.Date.now = () => seed - 1 // → original rngSeed === seed
      ;(win as unknown as { Blob: unknown }).Blob = class {
        constructor(parts: string[]) { captured.push(parts.join('')) }
      }
      win.URL.createObjectURL = () => 'blob:captured'
      win.URL.revokeObjectURL = () => {}
      win.scrollTo = () => {}
    },
  })
  const win = dom.window
  const doc = win.document
  const $ = (sel: string) => {
    const el = doc.querySelector(sel)
    if (!el) throw new Error(`legacy page: missing ${sel}`)
    return el as HTMLElement
  }
  const fire = (el: Element, type: string) => el.dispatchEvent(new win.Event(type, { bubbles: true }))

  return {
    window: win,
    document: doc,
    selectMarket(m) {
      const radio = $(`input[name="market"][value="${m}"]`) as HTMLInputElement
      radio.checked = true
      fire(radio, 'change')
      $('#market-confirm-btn').click()
    },
    setPlan(plan) {
      for (const id of Object.keys(plan) as PkgId[]) {
        const row = $(`.pkg-row[data-pkg="${id}"]`)
        const e = plan[id] as { on: boolean; tiers?: number[]; pull?: number; odds?: number }
        const on = row.querySelector('.pkg-on') as HTMLInputElement
        if (on.checked !== e.on) { on.checked = e.on; fire(on, 'change') }
        if (e.tiers) {
          row.querySelectorAll<HTMLButtonElement>('.tier').forEach((b) => {
            const want = e.tiers!.includes(parseFloat(b.dataset.price!))
            if (b.classList.contains('on') !== want) b.click()
          })
        } else {
          const pull = row.querySelector('.g-pull') as HTMLInputElement
          const odds = row.querySelector('.g-odds') as HTMLInputElement
          pull.value = String(e.pull); fire(pull, 'input')
          odds.value = String(e.odds); fire(odds, 'input')
          if (parseFloat(pull.value) !== e.pull || parseFloat(odds.value) !== e.odds) {
            throw new Error(`legacy slider rejected pull=${e.pull} odds=${e.odds} (outside the UI range)`)
          }
        }
      }
    },
    setEvent(on) {
      const c = $('#event-check') as HTMLInputElement
      c.checked = on
    },
    launch() { $('#launch-btn').click() },
    runTest(kind) {
      const id = kind === 'cbt' ? '#t-cbt' : kind === 'survey' ? '#t-survey' : '#t-ab'
      const btn = $(id) as HTMLButtonElement
      if (btn.disabled) return false
      btn.click()
      const run = doc.querySelector('#lc-run') as HTMLButtonElement | null
      if (run) run.click()
      return true
    },
    saveA() { $('#t-saveA').click() },
    exportCSV(kind) {
      const before = captured.length
      const btns = doc.querySelectorAll<HTMLElement>(`[data-export="${kind}"]`)
      if (!btns.length) throw new Error(`legacy: no export button for ${kind}`)
      btns[btns.length - 1].click()
      if (captured.length !== before + 1) throw new Error(`legacy: export ${kind} produced no file`)
      return captured[captured.length - 1]
    },
    text: (sel) => $(sel).textContent ?? '',
    texts: (sel) => Array.from(doc.querySelectorAll(sel), (e) => e.textContent ?? ''),
    async waitForDebrief() {
      // endGame() runs 350 ms after Month 8 and sets display:block and the new content together.
      // (After "Play again" the previous debrief stays in the DOM, hidden — so test visibility.)
      const go = $('#game-over')
      for (let i = 0; i < 80 && go.style.display !== 'block'; i++) await sleep(25)
      if (go.style.display !== 'block') throw new Error('legacy: debrief never appeared')
    },
    replay() { $('#replay-btn').click() },
    close() { win.close() },
  }
}
