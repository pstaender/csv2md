// Shared definition of the CLI snapshot matrix. Used by both
// `test/record-cli-snapshots.ts` (records expected output) and `test/cli.test.ts`.
import { spawn } from 'node:child_process'
import { createReadStream, readdirSync } from 'node:fs'
import { availableParallelism } from 'node:os'
import { basename, join } from 'node:path'

export const fixturesDir = join(import.meta.dirname, 'fixtures')
export const snapshotFile = join(import.meta.dirname, 'cli-snapshots.json')
export const defaultBin = join(import.meta.dirname, '..', 'bin', 'csv2md.js')

export const optionSets: string[][] = [
  [],
  ['-p'],
  ['--pretty'],
  ['--csvDelimiter=;'],
  ['-p', '--csvDelimiter=;'],
  ['--csvComment=#'],
  ['-p', '--csvComment=#'],
  ["--csvQuote='", '--csvEscape=\\'],
  ['-p', '--tableDelimiter=$', '--cellPadding=_', '--firstLineMarker=+*'],
  ['--tableDelimiter=$', '--cellPadding=_', '--firstLineMarker=-==-'],
  ['-p', '--firstLineMarker=-==-'],
  ['--delimiterOnBegin=|', '--delimiterOnEnd=|'],
  ['-p', '--delimiterOnBegin=/', '--delimiterOnEnd=\\'],
  ['--parallel=1'],
  ['-p', '--csvDelimiter=;', '--csvComment=#', '--cellPadding=', '--tableDelimiter=;'],
  ['--csvDelimiter='],
  ['--tableDelimiter', ';'],
  ['-p', '--csvComment=#', '--firstLineMarker=:-']
]

export interface CliCase {
  name: string
  args: string[]
  /** fixture file (relative to fixturesDir) piped to stdin */
  stdin?: string
}

export interface CliResult {
  stdout: string
  exitCode: number | null
  stderr: string
}

export function cliCases(): CliCase[] {
  const fixtures = readdirSync(fixturesDir)
    .filter(f => f.endsWith('.csv'))
    .sort()
  const cases: CliCase[] = []
  for (const fixture of fixtures) {
    for (const args of optionSets) {
      const label = `${basename(fixture, '.csv')} ${JSON.stringify(args)}`
      cases.push({
        name: `${label} file`,
        args: [...args, join('fixtures', fixture)]
      })
      cases.push({ name: `${label} stdin`, args, stdin: fixture })
    }
  }
  cases.push({ name: 'help --help', args: ['--help'] })
  cases.push({ name: 'help -h', args: ['-h'] })
  cases.push({
    name: 'two files (last one wins)',
    args: ['-p', 'fixtures/example1.csv', 'fixtures/semi.csv']
  })
  return cases
}

export function runCli(bin: string, c: CliCase): Promise<CliResult> {
  return new Promise((resolve, reject) => {
    // run inside test/ so that relative fixture paths are stable in snapshots
    // start via node instead of the shebang, which Windows doesn't support
    const child = spawn(process.execPath, [bin, ...c.args], {
      cwd: import.meta.dirname
    })
    let stdout = ''
    let stderr = ''
    child.stdout.setEncoding('utf8').on('data', d => (stdout += d))
    child.stderr.setEncoding('utf8').on('data', d => (stderr += d))
    child.on('error', reject)
    child.on('close', exitCode => resolve({ stdout, stderr, exitCode }))
    if (c.stdin) {
      createReadStream(join(fixturesDir, c.stdin)).pipe(child.stdin)
    } else {
      // behave like an interactive call without piped data
      child.stdin.end()
    }
  })
}

export async function runAll(
  bin: string,
  cases: CliCase[]
): Promise<Map<string, CliResult>> {
  const results = new Map<string, CliResult>()
  const queue = [...cases]
  const worker = async () => {
    for (let c = queue.shift(); c; c = queue.shift()) {
      results.set(c.name, await runCli(bin, c))
    }
  }
  await Promise.all(Array.from({ length: availableParallelism() }, worker))
  return results
}
