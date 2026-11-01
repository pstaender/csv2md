// Ensures the CLI output (stdout + exit code) stays byte-identical to the
// recorded snapshots. Re-record with `npm run test:record` only on intended changes.
import { expect } from 'chai'
import { readFileSync } from 'node:fs'
import {
  cliCases,
  defaultBin,
  runAll,
  snapshotFile,
  type CliResult
} from './cli-cases.ts'

type Snapshot = Pick<CliResult, 'stdout' | 'exitCode'>

const snapshots: Record<string, Snapshot> = JSON.parse(
  readFileSync(snapshotFile, 'utf8')
)
const cases = cliCases()

describe('cli output snapshots', function () {
  this.timeout(180_000)
  let results: Map<string, CliResult>

  before(async () => {
    results = await runAll(defaultBin, cases)
  })

  it('has a snapshot for every case', () => {
    expect(Object.keys(snapshots).sort()).to.deep.equal(
      cases.map(c => c.name).sort()
    )
  })

  for (const c of cases) {
    it(c.name, () => {
      const actual = results.get(c.name)!
      const expected = snapshots[c.name]
      expect(actual.stdout).to.equal(expected.stdout)
      expect(actual.exitCode).to.equal(expected.exitCode)
      if (expected.exitCode === 0) expect(actual.stderr).to.equal('')
    })
  }
})
