var parse = require('csv-parse');
var transform = require('stream-transform');
var csv2md = require('./csv2md');
var fs = require('fs');
var helpText = fs.readFileSync(__dirname+'/help.txt').toString();
var docopt = require('docopt').docopt;
var argOptions = docopt(helpText);
var isFirstLine = true;

csv2md.setOptions({
  pretty:           argOptions['--pretty'],
  stream:           argOptions['--stream'],
  tableDelimiter:   argOptions['--tableDelimiter'],
  firstLineMarker:  argOptions['--firstLineMarker'],
  cellPadding:      argOptions['--cellPadding'],
  delimiterOnBegin: argOptions['--delimiterOnBegin'],
  delimiterOnEnd:   argOptions['--delimiterOnEnd'],
  csvComment:       argOptions['--csvComment'],
  csvDelimiter:     argOptions['--csvDelimiter'],
  csvQuote:         argOptions['--csvQuote'],
  csvEscape:        argOptions['--csvEscape']
});

var parser = parse({
  comment:          argOptions['--csvComment'],
  delimiter:        argOptions['--csvDelimiter'],
  quote:            argOptions['--csvQuote'],
  escape:           argOptions['--csvEscape'],
});

var transformer = transform(function(record, callback){
  setTimeout(function() {
    if (!csv2md.options.stream) {
      csv2md.addRow(record);
    } else {
      // prepare for stdout
      var s = csv2md.rowToString(record, isFirstLine);
      if (isFirstLine) {
        isFirstLine = false;
      }
    }
    callback(null, s);
  }, 0);
}, {parallel: 10});

if (csv2md.options.stream) {
  process.stdin.pipe(parser).pipe(transformer).pipe(process.stdout);
} else {
  process.stdin.pipe(parser).pipe(transformer);
  transformer.on('finish', function() {
    console.log(csv2md.rowsToString());
  });
}
