/**
 * Drives the React Simulation page through its real controls (clicks, checkboxes, sliders),
 * with the same action vocabulary as tests/sim/legacyHarness.ts — so one scripted journey
 * can run on the original page, the React page and the engine, and be compared.
 */
import { fireEvent, render } from '@testing-library/react'
import { vi } from 'vitest'
import Simulation from '../../src/pages/Simulation'
import { SimulationProvider } from '../../src/pages/simulation/controller'
import type { ExportKind, MarketId, Plan, PkgId } from '../../src/sim'

export interface Captured { name: string; type: string; text: Promise<string> }

/** Records files the page downloads (Blob → object URL → <a download>.click()). */
export function captureDownloads() {
  const files: Captured[] = []
  const blobs = new Map<string, Blob>()
  let n = 0
  const origCreate = URL.createObjectURL, origRevoke = URL.revokeObjectURL
  URL.createObjectURL = ((b: Blob) => { const url = `blob:test/${++n}`; blobs.set(url, b); return url }) as typeof URL.createObjectURL
  URL.revokeObjectURL = () => {}
  const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
    const b = blobs.get(this.href)
    if (b) files.push({ name: this.download, type: b.type, text: readBlob(b) })
  })
  return {
    files,
    restore() { URL.createObjectURL = origCreate; URL.revokeObjectURL = origRevoke; click.mockRestore() },
  }
}

function readBlob(b: Blob): Promise<string> {
  if (typeof b.text === 'function') return b.text()
  return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = rej; r.readAsText(b) })
}

export function renderSimulation(seed: number) {
  const utils = render(<SimulationProvider seed={seed}><Simulation /></SimulationProvider>)
  return { ...utils, ui: uiDriver(utils.container) }
}

export function uiDriver(root: HTMLElement) {
  const $ = <T extends Element = HTMLElement>(sel: string) => {
    const el = root.querySelector<T>(sel)
    if (!el) throw new Error(`react page: missing ${sel}`)
    return el
  }
  const ui = {
    root,
    $,
    text: (sel: string) => $(sel).textContent ?? '',
    texts: (sel: string) => Array.from(root.querySelectorAll(sel), (e) => e.textContent ?? ''),
    selectMarket(m: MarketId) {
      fireEvent.click($(`input[name="market"][value="${m}"]`))
      fireEvent.click(Array.from(root.querySelectorAll('button')).find((b) => b.textContent?.startsWith('Confirm market'))!)
    },
    setPlan(plan: Plan) {
      for (const id of Object.keys(plan) as PkgId[]) {
        const row = $(`.pkg-row[data-pkg="${id}"]`)
        const e = plan[id] as { on: boolean; tiers?: number[]; pull?: number; odds?: number }
        const on = row.querySelector<HTMLInputElement>('.pkg-on')!
        if (on.checked !== e.on) fireEvent.click(on)
        if (e.tiers) {
          row.querySelectorAll<HTMLButtonElement>('.tier').forEach((b) => {
            const want = e.tiers!.includes(parseFloat(b.dataset.price!))
            if ((b.getAttribute('aria-pressed') === 'true') !== want) fireEvent.click(b)
          })
        } else {
          fireEvent.change(row.querySelector('.g-pull')!, { target: { value: String(e.pull) } })
          fireEvent.change(row.querySelector('.g-odds')!, { target: { value: String(e.odds) } })
        }
      }
    },
    setEvent(on: boolean) {
      const c = $<HTMLInputElement>('#event-check')
      if (c.checked !== on) fireEvent.click(c)
    },
    launch() { fireEvent.click($('#launch-btn')) },
    /** Click the lab button, then "Run test" if the confirm box opens. False if disabled. */
    runTest(kind: 'cbt' | 'survey' | 'ab'): boolean {
      const btn = $<HTMLButtonElement>(kind === 'cbt' ? '#t-cbt' : kind === 'survey' ? '#t-survey' : '#t-ab')
      if (btn.disabled) return false
      fireEvent.click(btn)
      const run = root.querySelector('#lc-run')
      if (run) fireEvent.click(run)
      return true
    },
    saveA() { fireEvent.click($('#t-saveA')) },
    replay() { fireEvent.click($('#replay-btn')) },
    clickExport(kind: ExportKind | 'copy') {
      const btns = root.querySelectorAll<HTMLElement>(`[data-export="${kind}"]`)
      if (!btns.length) throw new Error(`react page: no export button for ${kind}`)
      fireEvent.click(btns[btns.length - 1])
    },
  }
  return ui
}
export type UiDriver = ReturnType<typeof uiDriver>
