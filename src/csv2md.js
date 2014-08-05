

exports.options = {
  tableDelimiter: null,   // will be set by (default) args
  cellPadding: null,      // will be set by (default) args
  firstLineMarker: null,  // will be set by (default) args
  pretty: null,           // will be set by (default) args
  stream: null,           // will be set by (default) args and in setOptions
  prettyCellSpace: ' ',
  lineBreak: '\n',
  delimiterOnBegin: null, // will be set in setOptions
  delimiterOnEnd: null,   // will be set in setOptions
}

exports.setOptions = function(o) {
  var options = exports.options;
  for (var attr in o) {
    if (/^["'].*["']$/.test(o[attr])) {
      options[attr] = o[attr].match(/^["'](.*)["']$/)[1];
    } else if (o[attr]==='null') {
      options[attr] = null;
    } else {
      options[attr] = o[attr];
    }
  }
  if (options.delimiterOnBegin === null) {
    options.delimiterOnBegin = options.tableDelimiter;
  }
  if (options.delimiterOnEnd === null) {
    options.delimiterOnEnd = options.tableDelimiter;
  }
  if (options.pretty) {
    // we can't work with streams in prettify mode
    options.stream = false;
  }
  // ensure that false/null/0 is an empty string, i.e. ''
  'tableDelimiter,cellPadding,firstLineMarker,delimiterOnBegin,delimiterOnEnd'.split(',').map(function(attr){
    if (!options[attr]) {
      options[attr] = '';
    }
  });
  return options;
}

exports.rows = [];

exports.rowToString = function(record, isFirstLine, cellLength) {
  if (typeof isFirstLine !== 'boolean') {
    isFirstLine = false;
  }
  var pretty = ((cellLength) && (cellLength.constructor === Array));
  var firstLineMarker = exports.options.firstLineMarker;
  var firstLineMarkerRepeat = Boolean((firstLineMarker.length === 2) && (firstLineMarker[1] === '*'));
  var cellPaddingForFirstLine = (firstLineMarkerRepeat) ? firstLineMarker[0] : exports.options.cellPadding;

  var s = "";
  for (var column=0; column < record.length; column++) {
    if (pretty) {
      record[column] = record[column].trim() + Array(cellLength[column] - (record[column].trim().length-1)).join(exports.options.prettyCellSpace);
    } else {
      record[column] = record[column].trim();
    }
  }
  s += ((exports.options.delimiterOnBegin) ? exports.options.delimiterOnBegin + exports.options.cellPadding : '' ) + record.join(exports.options.cellPadding + exports.options.tableDelimiter + exports.options.cellPadding) + ((exports.options.delimiterOnEnd) ? exports.options.cellPadding + exports.options.delimiterOnEnd : '' ) + exports.options.lineBreak;
  // attach first Line seperator
  if (isFirstLine) {
    var a = [];
    for(var i=0; i < record.length; i++) {
      if (pretty) {
        if (firstLineMarkerRepeat) {
          a[i] = Array(cellLength[i]+1).join(firstLineMarker[0]);
        } else {
          a[i] = firstLineMarker.substr(0,cellLength[0]);
        }
      } else {
        if (firstLineMarkerRepeat) {
          a[i] = Array(2).join(firstLineMarker[0]);
        } else {
          a[i] = firstLineMarker;
        }
      }
    }
    s += ((exports.options.delimiterOnBegin) ? exports.options.delimiterOnBegin + cellPaddingForFirstLine : '' ) + a.join(cellPaddingForFirstLine + exports.options.tableDelimiter + cellPaddingForFirstLine) + ((exports.options.delimiterOnEnd) ? cellPaddingForFirstLine + exports.options.delimiterOnEnd : '' ) + exports.options.lineBreak;
  }
  return s;
}

exports.rowsToString = function(rows) {
  if (typeof rows === 'undefined') {
    rows = exports.rows;
  }
  var maxLength = Array.apply(null, new Array(rows[0].length)).map(Number.prototype.valueOf,exports.options.firstLineMarker.length);
  if (exports.options.pretty) {
    rows.map(function(row){
      row.map(function(cell, columnIndex){
        if (String(cell).trim().length > maxLength[columnIndex]) {
          maxLength[columnIndex] = String(cell).trim().length;
        }
      })
    });
  }
  var isFirstLine = true;
  var s = '';
  rows.map(function(row){
    s += exports.rowToString(row, isFirstLine, (exports.options.pretty) ? maxLength : null);
    if (isFirstLine) {
      isFirstLine = false;
    }
  });
  return s;
}

exports.addRow = function(row) {
  if ((typeof row === 'undefined') || (row.constructor !== Array)) {
    throw new Error('row object must be an array');
  }
  exports.rows.push(row);
  return exports.rows;
}
