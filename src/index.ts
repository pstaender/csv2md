import { Csv2md, Options } from './csv2md'
import * as fs from 'fs'
import * as yargs from 'yargs'

const defaultCsv2md = new Csv2md()

const { argv } = yargs
  .usage(
    `Converts CSV data to Markdown tables
(c) 2014-2019 by Philipp Staender, MIT License

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
  .describe('delimiterOnEnd', 'last  row delimiter')
  .default('delimiterOnEnd', defaultCsv2md.delimiterOnEnd)
  .default('csvComment', defaultCsv2md.csvComment)
  .describe('csvDelimiter', 'column delimiter')
  .default('csvDelimiter', defaultCsv2md.csvDelimiter)
  .describe('csvQuote', 'cell quote')
  .default('csvQuote', defaultCsv2md.csvQuote)
  .describe('csvEscape', 'char to escape, see quoter')
  .default('csvEscape', defaultCsv2md.csvEscape)
  .boolean(['pretty'])
  .help('h')
  .alias('h', 'help')

const lastArgument = process.argv.slice(-1)[0]

const inputFile = lastArgument.match(/\.csv$/i) ? lastArgument : null

const processAsStream = Boolean(!inputFile && process.stdin)

const options: Options = {
  pretty: argv.pretty,
  firstLineMarker: argv.firstLineMarker,
  delimiterOnBegin: argv.delimiterOnBegin,
  delimiterOnEnd: argv.delimiterOnEnd,
  cellPadding: argv.cellPadding,
  tableDelimiter: argv.tableDelimiter,
  csvComment: argv.csvComment as string,
  csvDelimiter: argv.csvDelimiter as string,
  csvQuote: argv.csvQuote as string,
  csvEscape: argv.csvEscape as string
}

const csv2md = new Csv2md(options)

import * as parse from 'csv-parse'
import * as transform from 'stream-transform'

const parser = parse({
  comment: options.csvComment as string,
  delimiter: options.csvDelimiter,
  quote: options.csvQuote,
  escape: options.csvEscape
})

let isFirstLine = true

const transformer = transform({ parallel: 10 }, function(
  record: any,
  callback: any
) {
  ;(function(csv2md) {
    let s = null
    if (csv2md.pretty) {
      csv2md.addRow(record)
    } else {
      s = csv2md.rowToString(record, isFirstLine, null)
      if (isFirstLine) {
        isFirstLine = false
      }
    }
    callback(null, s)
  })(csv2md)
})

if (processAsStream) {
  if (csv2md.pretty) {
    process.stdin.pipe(parser).pipe(transformer)
    transformer.on('finish', function() {
      console.log(csv2md.rowsToString())
    })
  } else {
    process.stdin
      .pipe(parser)
      .pipe(transformer)
      .pipe(process.stdout)
  }
} else if (inputFile) {
  ;(async () => {
    console.log(await csv2md.convert(fs.readFileSync(inputFile).toString()))
  })()
}
