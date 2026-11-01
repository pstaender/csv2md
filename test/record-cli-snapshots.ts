// Records the CLI output matrix into test/cli-snapshots.json.
// Usage: node test/record-cli-snapshots.ts [path/to/bin/csv2md]
import { writeFileSync } from 'node:fs'
import { cliCases, defaultBin, runAll, snapshotFile } from './cli-cases.ts'

const bin = process.argv[2] ?? defaultBin
const cases = cliCases()
const results = await runAll(bin, cases)

const snapshots = Object.fromEntries(
  cases.map(c => {
    const { stdout, exitCode } = results.get(c.name)!
    return [c.name, { stdout, exitCode }]
  })
)
writeFileSync(snapshotFile, JSON.stringify(snapshots, null, 2) + '\n')
console.log(`recorded ${cases.length} cases from ${bin}`)
