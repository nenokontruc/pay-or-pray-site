// @vitest-environment node
/**
 * Stored baseline fingerprints (SHA-256 of each CSV) produced by the ORIGINAL page only.
 * They let the engine be checked even if the jsdom harness or jsdom itself changes, and
 * they record what the original produced on the day of the migration.
 *
 * Regenerate (from the original page, never from the engine):
 *   $env:UPDATE_FIXTURES=1; pnpm exec vitest run tests/sim/fixtures.test.ts
 */
import { describe, expect, it } from 'vitest'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createGame, launchMonth, normalizePlan, selectMarket, EXPORTS, type ExportKind, type MarketId, type Plan } from '../../src/sim'
import { openLegacy } from './legacyHarness'
import { plan } from './scenarioRunner'

const FILE = resolve(__dirname, 'fixtures/baseline-hashes.json')
const KINDS: ExportKind[] = ['months', 'daily', 'panel', 'txns', 'tests']
const sha = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex')

interface Fixture { name: string; seed: number; market: MarketId; plan: Plan; months: number }
const FIXTURES: Fixture[] = [
  { name: 'us-default', seed: 12345, market: 'us', plan: plan({ skin: [2.99, 9.99, 19.99] }), months: 8 },
  { name: 'jp-gacha-boundaries', seed: 2024, market: 'jp', plan: plan({ skin: [0.99, 4.99], cgacha: [0.5, 1], pgacha: [10, 15] }), months: 8 },
  { name: 'cn-all-five', seed: 55555, market: 'cn', plan: plan({ skin: [2.99, 9.99, 19.99], pass: [9.99], item: [4.99, 19.99], cgacha: [3, 5], pgacha: [3, 5] }), months: 8 },
]

async function legacyHashes(f: Fixture): Promise<Record<string, string>> {
  const L = openLegacy(f.seed)
  try {
    L.selectMarket(f.market); L.setPlan(f.plan)
    for (let i = 0; i < f.months; i++) L.launch()
    await L.waitForDebrief()
    return Object.fromEntries(KINDS.map((k) => [k, sha(L.exportCSV(k))]))
  } finally { L.close() }
}

function engineHashes(f: Fixture): Record<string, string> {
  const g = createGame(f.seed)
  selectMarket(g, f.market)
  for (let i = 0; i < f.months; i++) launchMonth(g, normalizePlan(f.plan), false)
  return Object.fromEntries(KINDS.map((k) => [k, sha(EXPORTS[k].build(g.state))]))
}

describe('stored baseline fingerprints', () => {
  if (process.env.UPDATE_FIXTURES) {
    it('regenerates fixtures from the original page', async () => {
      const out: Record<string, Record<string, string>> = {}
      for (const f of FIXTURES) out[f.name] = await legacyHashes(f)
      writeFileSync(FILE, JSON.stringify(out, null, 2) + '\n')
    }, 60_000)
    return
  }

  const stored: Record<string, Record<string, string>> = existsSync(FILE) ? JSON.parse(readFileSync(FILE, 'utf8')) : {}
  for (const f of FIXTURES) {
    it(`${f.name}: engine reproduces the stored original exports`, () => {
      expect(stored[f.name], 'fixture missing — regenerate from the original page').toBeDefined()
      expect(engineHashes(f)).toEqual(stored[f.name])
    })
    it(`${f.name}: the original page still produces the stored exports`, async () => {
      expect(await legacyHashes(f)).toEqual(stored[f.name])
    }, 60_000)
  }
})
