import { defaultOptions, Options, CSV2MD } from './csv2md'

import * as fs from 'fs'
//import * as path from 'path'

// var path = require('path')
// var isFirstLine = true
// var defaultOptions = csv2md.defaultOptions

import * as yargs from 'yargs'

const { argv } = yargs
  .usage(
    `Converts CSV data to Markdown tables
(c) 2014-2019 by Philipp Staender, MIT License

Usage: $0 [options] <csvfile>`
  )
  .example(
    '$0 -p input.csv > output.md',
    'Converts a csv file to pretty formatted markdown table'
  )
  .example(
    'cat input.csv | $0 > output.md',
    'Converts (larger) csv data to markdown table'
  )
  // .command('$0 [options] [csvfile]', '', {}, argv => {
  //   console.log('this command will be run by default')
  // })
  //.example('')
  .describe('p', 'pretty output, i.e. optimized column width')
  .default('p', defaultOptions.pretty)
  .alias('p', 'pretty')
  .describe(
    'csvComment',
    'ignore everything until next line after this character'
  )
  .default('csvComment', defaultOptions.csvComment)
  .describe('csvDelimiter', 'column delimiter')
  .default('csvDelimiter', defaultOptions.csvDelimiter)
  .describe('csvQuote', 'cell quote')
  .default('csvQuote', defaultOptions.csvQuote)
  .describe('csvEscape', 'char to escape, see quoter')
  .default('csvEscape', defaultOptions.csvEscape)
  .help('h')
  .alias('h', 'help')

const lastArgument = process.argv.slice(-1)[0]

const inputFile = lastArgument.match(/\.csv$/i) ? lastArgument : null

const processAsStream = !argv.inputFilePath && process.stdin

// input file or stdin?
// var readStream = argv.inputFilePath
//   ? fs.createReadStream(argv.inputFilePath)
//   : process.stdin

const options: Options = {
  pretty: defaultOptions.pretty,
  stream: processAsStream as boolean,
  csvComment: argv.csvComment as string,
  csvDelimiter: argv.csvDelimiter as string,
  csvQuote: argv.csvQuote as string,
  csvEscape: argv.csvEscape as string
}

import * as parse from 'csv-parse'
import * as transform from 'stream-transform'

const parser = parse({
  comment: options.csvComment as string,
  delimiter: options.csvDelimiter,
  quote: options.csvQuote,
  escape: options.csvEscape
})

let isFirstLine = true

const csv2md = new CSV2MD(options)

const transformer = transform({ parallel: 10 }, function(
  record: any,
  callback: any
) {
  ;(function() {
    if (!options.stream) {
      csv2md.addRow(record)
    } else {
      // prepare for stdout
      var s = csv2md.rowToString(record, isFirstLine)
      if (isFirstLine) {
        isFirstLine = false
      }
    }
    callback(null, s)
  })()
})

// generator
//   .pipe(parser)
//   .pipe(transformer)
//   .pipe(process.stdout)

if (csv2md.options.stream) {
  readStream
    .pipe(parser)
    .pipe(transformer)
    .pipe(process.stdout)
} else {
  readStream.pipe(parser).pipe(transformer)
  transformer.on('finish', function() {
    console.log(csv2md.rowsToString())
  })
}

// if (argv.p && argv.stream) {
//   argv.stream = argv.s = false
// }

// argv.inputFilePath = null

// if (residualArguments.length > 0) {
//   // we might have input file argument
//   residualArguments.forEach(function(fileName) {
//     var file = path.parse(fileName)
//     if (file && file.ext && /csv/i.test(file.ext)) {
//       argv.inputFilePath = fileName
//       try {
//         // check read access
//         fs.accessSync(argv.inputFilePath, fs.R_OK)
//       } catch (e) {
//         console.error(
//           "Couldn't access/read input file '" + argv.inputFilePath + "'"
//         )
//         process.exit(1)
//       }
//     }
//   })
// }

// csv2md.setOptions({
//   pretty: argv.pretty,
//   stream: argv.stream,
//   tableDelimiter: argv.tableDelimiter,
//   firstLineMarker: argv.firstLineMarker,
//   cellPadding: argv.cellPadding,
//   delimiterOnBegin: argv.delimiterOnBegin,
//   delimiterOnEnd: argv.delimiterOnEnd,
//   csvComment: argv.csvComment,
//   csvDelimiter: argv.csvDelimiter,
//   csvQuote: argv.csvQuote,
//   csvEscape: argv.csvEscape
// })

// var parser = parse({
//   comment: argv.csvComment,
//   delimiter: argv.csvDelimiter,
//   quote: argv.csvQuote,
//   escape: argv.csvEscape
// })

// var transformer = transform(
//   function(record, callback) {
//     ;(function() {
//       if (!csv2md.options.stream) {
//         csv2md.addRow(record)
//       } else {
//         // prepare for stdout
//         var s = csv2md.rowToString(record, isFirstLine)
//         if (isFirstLine) {
//           isFirstLine = false
//         }
//       }
//       callback(null, s)
//     })()
//   },
//   { parallel: 10 }
// )

// input file or stdin?
// const readStream = inputFile ? fs.createReadStream(inputFile) : process.stdin

// if (csv2md.options.stream) {
//   readStream
//     .pipe(parser)
//     .pipe(transformer)
//     .pipe(process.stdout)
// } else {
//   readStream.pipe(parser).pipe(transformer)
//   transformer.on('finish', function() {
//     console.log(csv2md.rowsToString())
//   })
// }
