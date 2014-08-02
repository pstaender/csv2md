var parse = require('csv-parse');
var transform = require('stream-transform');

var output = [];
var parser = parse();

var tableLimiter = '|';
var cellMargin = ' ';
var firstLineMarker = '---';

var isFirstLine = true;
var transformer = transform(function(record, callback){
  setTimeout(function() {
    var s = "";
    s += record.join(cellMargin+tableLimiter+cellMargin)+'\n';
    if (isFirstLine) {
      var a = Array(record.length+1).join(firstLineMarker+';').split(';');
      a.pop();
      s += a.join(cellMargin+tableLimiter+cellMargin)+'\n';
      isFirstLine = false;
    }
    callback(null, s);
  }, 500);
}, {parallel: 10});

process.stdin.pipe(parser).pipe(transformer).pipe(process.stdout);
