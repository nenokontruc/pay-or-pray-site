// Browser side of the exports, same behaviour as legacy/index.html:1644-1653.
// The CSV text itself always comes from the engine (src/sim/csv.ts).

/** Save text as a UTF-8 CSV file (no BOM, same MIME type as the original). */
export function downloadText(name: string, text: string): boolean {
  try {
    const blob = new Blob([text], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = name
    document.body.appendChild(a)
    a.click()
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove() }, 500)
    return true
  } catch {
    return false
  }
}

/** Copy text; falls back to a hidden textarea + execCommand when the Clipboard API is unavailable. */
export function copyText(text: string): Promise<boolean> {
  const fallback = (): boolean => {
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand('copy')
      ta.remove()
      return ok
    } catch {
      return false
    }
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text).then(() => true, () => fallback())
  }
  return Promise.resolve(fallback())
}
