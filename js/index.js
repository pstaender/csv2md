var parse = require('csv-parse')
var transform = require('stream-transform')
var csv2md = require('./csv2md')
var fs = require('fs')
var path = require('path')
var isFirstLine = true
var defaultOptions = csv2md.defaultOptions

var argv = require('yargs')
  .usage(
    'Converts CSV data to MARKDOWN tables\n(c) 2014-2019 by Philipp Staender, MIT License\n\nUsage: csv2md [options] (inputfile.csv)'
  )
  .example('csv2md --pretty input.csv > output.md')
  .describe(
    'p',
    'pretty output, i.e. optimized column width (takes longer to process)'
  )
  .default('p', defaultOptions.pretty)
  .alias('p', 'pretty')
  .describe('s', 'stream processing')
  .default('s', true)
  .alias('s', 'stream')
  .describe('tableDelimiter', 'delimiter for cells in output')
  .default('tableDelimiter', defaultOptions.tableDelimiter)
  .describe('cellPadding', 'chars / spaces to wrap cell content')
  .default('cellPadding', defaultOptions.cellPadding)
  .describe(
    'firstLineMarker',
    'to seperate first row\n you can specifiy own characters, for instance:\n`-*` -> `------…` (gets cell width)\n   `-====-` -> `-====-`\n'
  )
  .default('firstLineMarker', defaultOptions.firstLineMarker)
  .describe('delimiterOnBegin', 'first row delimiter')
  .default('delimiterOnBegin', defaultOptions.delimiterOnBegin)
  .describe('delimiterOnEnd', 'last  row delimiter')
  .default('delimiterOnEnd', defaultOptions.delimiterOnEnd)
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
  .boolean(['p', 's'])
  .help('h')
  .alias('h', 'help')
  .count('verbose')
  .alias('v', 'verbose')
  .locale('en').argv

var residualArguments = argv._

if (argv.p && argv.stream) {
  argv.stream = argv.s = false
}

argv.inputFilePath = null

if (residualArguments.length > 0) {
  // we might have input file argument
  residualArguments.forEach(function(fileName) {
    var file = path.parse(fileName)
    if (file && file.ext && /csv/i.test(file.ext)) {
      argv.inputFilePath = fileName
      try {
        // check read access
        fs.accessSync(argv.inputFilePath, fs.R_OK)
      } catch (e) {
        console.error(
          "Couldn't access/read input file '" + argv.inputFilePath + "'"
        )
        process.exit(1)
      }
    }
  })
}

csv2md.setOptions({
  pretty: argv.pretty,
  stream: argv.stream,
  tableDelimiter: argv.tableDelimiter,
  firstLineMarker: argv.firstLineMarker,
  cellPadding: argv.cellPadding,
  delimiterOnBegin: argv.delimiterOnBegin,
  delimiterOnEnd: argv.delimiterOnEnd,
  csvComment: argv.csvComment,
  csvDelimiter: argv.csvDelimiter,
  csvQuote: argv.csvQuote,
  csvEscape: argv.csvEscape
})

var parser = parse({
  comment: argv.csvComment,
  delimiter: argv.csvDelimiter,
  quote: argv.csvQuote,
  escape: argv.csvEscape
})

var transformer = transform(
  function(record, callback) {
    ;(function() {
      if (!csv2md.options.stream) {
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
  },
  { parallel: 10 }
)

// input file or stdin?
var readStream = argv.inputFilePath
  ? fs.createReadStream(argv.inputFilePath)
  : process.stdin

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
