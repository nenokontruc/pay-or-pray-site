import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Regression guard: the React CSS must keep the original site's design tokens exactly.
const legacy = readFileSync(resolve(__dirname, '../legacy/index.html'), 'utf8')
const css = readFileSync(resolve(__dirname, '../src/index.css'), 'utf8')

/** Collect `--name:value` pairs from the first block that follows `selector {`. */
function tokens(source: string, selector: string): Record<string, string> {
  const start = source.indexOf(selector + ' {')
  if (start < 0) throw new Error(`selector not found: ${selector}`)
  const body = source.slice(source.indexOf('{', start) + 1, source.indexOf('}', start))
  const out: Record<string, string> = {}
  for (const m of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) out[m[1]] = m[2].trim()
  return out
}

describe('design tokens match the original site', () => {
  it.each([':root', ':root:not([data-theme="light"])', ':root[data-theme="dark"]'])('%s', (sel) => {
    const original = tokens(legacy, sel)
    expect(Object.keys(original).length).toBeGreaterThan(5)
    expect(tokens(css, sel)).toEqual(original)
  })
})
