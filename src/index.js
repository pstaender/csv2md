var parse = require('csv-parse');
var transform = require('stream-transform');
var csv2md = require('./csv2md');

var parser = parse();

var isFirstLine = true;

csv2md.options.pretty = true;

if (csv2md.options.pretty) {
  // we need to process steps if we prettyfy
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
  }, 1);
}, {parallel: 10});

if (csv2md.options.stream) {
  process.stdin.pipe(parser).pipe(transformer).pipe(process.stdout);
} else {
  process.stdin.pipe(parser).pipe(transformer);
  transformer.on('finish', function() {
    console.log(csv2md.rowsToString());
    // process.exit(0);
  });
}
