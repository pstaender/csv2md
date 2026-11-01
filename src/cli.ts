import { createReadStream } from 'node:fs'
import { once } from 'node:events'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { Csv2md, type Options } from './promises.ts'

const defaultCsv2md = new Csv2md()

const argv = yargs(hideBin(process.argv))
  // fixed name, so help output doesn't depend on how the script was started
  .scriptName('csv2md')
  .usage(
    `Converts CSV data to Markdown tables
(c) 2014-2026 by Philipp Staender, MIT License

Usage: $0 [options] <csvfile>`
  )
  .example(
    `$0 -p data.csv > output.md`,
    `Converts csv to pretty markdown table`
  )
  .example(`cat data.csv | $0 > output.md`, `Converts larger data`)
  .example(
    `$0 --csvDelimiter=";" < ~/data.csv`,
    `Converts with a distinct csv delimiter`
  )
  .describe(
    'pretty',
    'pretty output, i.e. optimized column width and not inline-style'
  )
  .alias('pretty', 'p')
  .describe(
    'csvComment',
    'ignore everything until next line after this character'
  )
  .describe('tableDelimiter', 'delimiter for cells in output')
  .default('tableDelimiter', defaultCsv2md.tableDelimiter)
  .describe('cellPadding', 'chars / spaces to wrap cell content')
  .default('cellPadding', defaultCsv2md.cellPadding)
  .describe(
    'firstLineMarker',
    'to seperate first row\n you can specifiy own characters, for instance:\n`-*` -> `------…` (gets cell width)\n   `-====-` -> `-====-`\n'
  )
  .default('firstLineMarker', defaultCsv2md.firstLineMarker)
  .describe('delimiterOnBegin', 'first row delimiter')
  .default('delimiterOnBegin', defaultCsv2md.delimiterOnBegin)
  .describe('delimiterOnEnd', 'last row delimiter')
  .default('delimiterOnEnd', defaultCsv2md.delimiterOnEnd)
  // no-op since the async rewrite, kept for backwards compatibility
  // --parallel is a no-op since the async rewrite; kept for backwards compatibility
  .describe('parallel', 'number of transformation callbacks to run in parallel')
  .default('parallel', 100)
  .default('csvComment', defaultCsv2md.csvComment)
  .describe('csvDelimiter', 'column delimiter')
  .default('csvDelimiter', defaultCsv2md.csvDelimiter)
  .describe('csvQuote', 'cell quote')
  .default('csvQuote', defaultCsv2md.csvQuote)
  .describe('csvEscape', 'char to escape, see quoter')
  .default('csvEscape', defaultCsv2md.csvEscape)
  .number(['parallel'])
  .boolean(['pretty'])
  .help('h')
  .alias('h', 'help')
  .parseSync()

const lastArgument = process.argv.at(-1) ?? ''
const inputFile = /\.csv$/i.test(lastArgument) ? lastArgument : null

const options: Options = {
  pretty: argv.pretty,
  firstLineMarker: argv.firstLineMarker,
  delimiterOnBegin: argv.delimiterOnBegin || undefined,
  delimiterOnEnd: argv.delimiterOnEnd || undefined,
  cellPadding: argv.cellPadding,
  tableDelimiter: argv.tableDelimiter,
  csvComment: argv.csvComment as string | undefined,
  csvDelimiter: argv.csvDelimiter as string | undefined,
  csvQuote: argv.csvQuote as string | undefined,
  csvEscape: argv.csvEscape as string | undefined
}

const csv2md = new Csv2md(options)

async function write(chunk: string) {
  if (!process.stdout.write(chunk)) await once(process.stdout, 'drain')
}

async function main() {
  if (inputFile || csv2md.pretty) {
    // the whole table is needed (file or pretty output): convert, then print
    const markdown = await csv2md.convert(
      inputFile ? createReadStream(inputFile) : process.stdin
    )
    if (markdown === '') throw new Error('no CSV data found')
    await write(markdown + '\n')
  } else {
    // stream the table row by row
    for await (const chunk of csv2md.chunks(process.stdin)) await write(chunk)
  }
}

try {
  await main()
} catch (err) {
  console.error(String(err))
  process.exitCode = 1
}
