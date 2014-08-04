var parse = require('csv-parse');
var transform = require('stream-transform');
var csv2md = require('./csv2md');
var fs = require('fs');
var helpText = fs.readFileSync(__dirname+'/help.txt').toString();
var docopt = require('docopt').docopt;
var argOptions = docopt(helpText);

var parser = parse();

var isFirstLine = true;

csv2md.setOptions({
  pretty: argOptions['--pretty'],
  stream: argOptions['--stream'],
  tableDelimiter: argOptions['--tableDelimiter'],
  firstLineMarker: argOptions['--firstLineMarker'],
  cellPadding: (argOptions['--cellPadding'] === "' '") ? ' ' : argOptions['--cellPadding']
});

if (csv2md.options.pretty) {
  // we can't work with streams in prettify mode
  csv2md.options.stream = false;
}


var transformer = transform(function(record, callback){
  setTimeout(function() {
    if (!csv2md.options.stream) {
      // we
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
