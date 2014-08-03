

exports.options = {
  tableLimiter: '|',
  cellMargin: ' ',
  firstLineMarker: '-*',
  pretty: false,
  stream: true,
  lineBreak: '\n',
  delimiterOnBegin: '|',
  delimiterOnEnd: '|',
}

exports.rows = [];

exports.rowToString = function(record, isFirstLine, cellLength) {
  if (typeof isFirstLine !== 'boolean') {
    isFirstLine = false;
  }
  var firstLineMarker = exports.options.firstLineMarker;
  var firstLineMarkerRepeat = Boolean((firstLineMarker.length === 2) && (firstLineMarker[1] === '*'));
  var cellMarginForFirstLine = (firstLineMarkerRepeat) ? firstLineMarker[0] : exports.options.cellMargin;
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
    cellMarginForFirstLine = '';
  }
  var s = "";
  s += ((exports.options.delimiterOnBegin) ? exports.options.delimiterOnBegin + exports.options.cellMargin : '' ) + record.join(exports.options.cellMargin + exports.options.tableLimiter + exports.options.cellMargin) + ((exports.options.delimiterOnEnd) ? exports.options.cellMargin + exports.options.delimiterOnEnd : '' ) + exports.options.lineBreak;
  if (isFirstLine) {
    var a = Array(record.length+1).join(firstLineMarker+'¨').split('¨');
    a.pop();

    s += ((exports.options.delimiterOnBegin) ? exports.options.delimiterOnBegin + cellMarginForFirstLine : '' ) + a.join(cellMarginForFirstLine + exports.options.tableLimiter + cellMarginForFirstLine) + ((exports.options.delimiterOnEnd) ? cellMarginForFirstLine + exports.options.delimiterOnEnd : '' ) + exports.options.lineBreak;
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
