// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { LEGACY_PATH, openLegacy } from './legacyHarness'

// The reference must never change. This is git's blob id for legacy/index.html at tag
// html-baseline (commit ea3a782), i.e. the live site. If this fails, the reference was edited.
const BASELINE_BLOB = '06378f08381144eb7a9eae1e0b06419b876d3f35'

function gitBlobId(path: string): string {
  const raw = readFileSync(path)
  // git normalises CRLF to LF on commit (core.autocrlf); hash the committed form.
  const body = Buffer.from(raw.toString('binary').replace(/\r\n/g, '\n'), 'binary')
  return createHash('sha1').update(`blob ${body.length}\0`).update(body).digest('hex')
}

describe('legacy reference', () => {
  it('legacy/index.html is byte-identical to the live site (html-baseline)', () => {
    expect(gitBlobId(LEGACY_PATH)).toBe(BASELINE_BLOB)
  })

  it('the harness controls the original seed: same seed → same run, different seed → different run', () => {
    const run = (seed: number) => {
      const p = openLegacy(seed)
      p.selectMarket('us')
      p.launch(); p.launch()
      const csv = p.exportCSV('months')
      p.close()
      return csv
    }
    const a = run(12345), b = run(12345), c = run(54321)
    expect(a.split('\n')).toHaveLength(3) // header + 2 months
    expect(a).toBe(b)
    expect(a).not.toBe(c)
  })
})
