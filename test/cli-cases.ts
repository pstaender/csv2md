// CLI snapshot cases covering the basic functionality. Used by both
// `test/record-cli-snapshots.ts` (records expected output) and `test/cli.test.ts`.
import { spawn } from 'node:child_process'
import { createReadStream } from 'node:fs'
import { availableParallelism } from 'node:os'
import { join } from 'node:path'

export const fixturesDir = join(import.meta.dirname, 'fixtures')
export const snapshotFile = join(import.meta.dirname, 'cli-snapshots.json')
export const defaultBin = join(import.meta.dirname, '..', 'bin', 'csv2md.js')

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

/** [fixture, cli options, input mode] */
const matrix: [string, string[], 'file' | 'stdin'][] = [
  // regular and pretty output, from a file and streamed from stdin
  ['example1', [], 'file'],
  ['example1', [], 'stdin'],
  ['example1', ['-p'], 'file'],
  ['example1', ['-p'], 'stdin'],
  // output formatting options
  ['example1', ['-p', '--tableDelimiter=$', '--cellPadding=_', '--firstLineMarker=+*'], 'file'],
  ['example1', ['--delimiterOnBegin=|', '--delimiterOnEnd=|'], 'file'],
  // csv parsing options
  ['semi', ['--csvDelimiter=;'], 'file'],
  ['semi', ['-p', '--csvDelimiter=;'], 'stdin'],
  ['comment', ['--csvComment=#'], 'file'],
  ['crlf', [], 'file'],
  // empty input: no output (stdin streaming exits 0, everything else 1)
  ['empty', [], 'stdin'],
  ['empty', ['-p'], 'file'],
  // invalid csv: streaming prints the rows before the error, then exits 1
  ['bad', [], 'stdin'],
  ['bad', [], 'file']
]

export function cliCases(): CliCase[] {
  const cases: CliCase[] = matrix.map(([fixture, args, mode]) => {
    const name = `${fixture} ${JSON.stringify(args)} ${mode}`
    return mode === 'file'
      ? { name, args: [...args, join('fixtures', `${fixture}.csv`)] }
      : { name, args, stdin: `${fixture}.csv` }
  })
  cases.push({ name: 'help --help', args: ['--help'] })
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
