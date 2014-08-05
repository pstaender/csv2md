

exports.options = {
  tableDelimiter: null,   // will be set by (default) args
  cellPadding: null,      // will be set by (default) args
  firstLineMarker: null,  // will be set by (default) args
  pretty: null,           // will be set by (default) args
  stream: null,           // will be set by (default) args and in setOptions
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
  var firstLineMarker = exports.options.firstLineMarker;
  var firstLineMarkerRepeat = Boolean((firstLineMarker.length === 2) && (firstLineMarker[1] === '*'));
  var cellPaddingForFirstLine = (firstLineMarkerRepeat) ? firstLineMarker[0] : exports.options.cellPadding;
  if ((typeof cellLength === 'number') && (cellLength > 0)) {
    // ensure correct cell length
    if (firstLineMarkerRepeat) {
      firstLineMarker = Array(cellLength+1).join(firstLineMarker[0]);
    } else {
      firstLineMarker = firstLineMarker.trim() + Array(cellLength - (firstLineMarker.trim().length-1)).join(' ');
    }
    for (var i = 0; i < record.length; i++) {
      record[i] = record[i].trim() + Array(cellLength - (record[i].trim().length-1)).join(' ');
    }
  } else {
    firstLineMarker = Array(4).join(firstLineMarker[0]);
    cellPaddingForFirstLine = '';
  }
  var s = "";
  s += ((exports.options.delimiterOnBegin) ? exports.options.delimiterOnBegin + exports.options.cellPadding : '' ) + record.join(exports.options.cellPadding + exports.options.tableDelimiter + exports.options.cellPadding) + ((exports.options.delimiterOnEnd) ? exports.options.cellPadding + exports.options.delimiterOnEnd : '' ) + exports.options.lineBreak;
  if (isFirstLine) {
    var a = Array(record.length+1).join(firstLineMarker+'¨').split('¨');
    a.pop();

    s += ((exports.options.delimiterOnBegin) ? exports.options.delimiterOnBegin + cellPaddingForFirstLine : '' ) + a.join(cellPaddingForFirstLine + exports.options.tableDelimiter + cellPaddingForFirstLine) + ((exports.options.delimiterOnEnd) ? cellPaddingForFirstLine + exports.options.delimiterOnEnd : '' ) + exports.options.lineBreak;
  }
  return s;
}

exports.rowsToString = function(rows) {
  if (typeof rows === 'undefined') {
    rows = exports.rows;
  }
  var maxLength = exports.options.firstLineMarker.length;
  if (exports.options.pretty) {
    rows.map(function(row){
      row.map(function(cell){
        if (String(cell).trim().length > maxLength) {
          maxLength = String(cell).trim().length;
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
  // rows.map(function(row){
  //   exports.rows.puhs(row);
  // });
  return exports.rows;
}
