"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultOptions = {
    pretty: true,
    stream: false,
    csvComment: null,
    csvDelimiter: ',',
    csvQuote: '"',
    csvEscape: '"',
    tableDelimiter: '|',
    cellPadding: ' ',
    firstLineMarker: '-*',
    delimiterOnBegin: '',
    delimiterOnEnd: '',
    lineBreak: '\n',
    prettyCellSpace: ' '
};
var Csv2md = (function () {
    function Csv2md(options) {
        this.options = options;
        this.rows = [];
    }
    Csv2md.prototype.rowToString = function (record, isFirstLine, cell) {
        if (isFirstLine === void 0) { isFirstLine = false; }
        var pretty = this.options.pretty;
        var firstLineMarker = this.options.firstLineMarker;
        var firstLineMarkerRepeat = firstLineMarker.length === 2 && firstLineMarker[1] === '*';
        var cellPaddingForFirstLine = firstLineMarkerRepeat
            ? firstLineMarker[0]
            : this.options.cellPadding;
        var s = '';
        for (var column = 0; column < record.length; column++) {
            if (pretty) {
                record[column] =
                    record[column].trim() +
                        Array(cell[column] - (record[column].trim().length - 1)).join(this.options.prettyCellSpace);
            }
            else {
                record[column] = record[column].trim();
            }
        }
        s +=
            (this.options.delimiterOnBegin
                ? this.options.delimiterOnBegin + this.options.cellPadding
                : '') +
                record.join(this.options.cellPadding +
                    this.options.tableDelimiter +
                    this.options.cellPadding) +
                (this.options.delimiterOnEnd
                    ? this.options.cellPadding + this.options.delimiterOnEnd
                    : '') +
                this.options.lineBreak;
        if (isFirstLine) {
            var a = [];
            for (var i = 0; i < record.length; i++) {
                if (pretty) {
                    if (firstLineMarkerRepeat) {
                        a[i] = Array(cell[i] + 1).join(firstLineMarker[0]);
                    }
                    else {
                        a[i] = firstLineMarker.substr(0, cell[0]);
                    }
                }
                else {
                    if (firstLineMarkerRepeat) {
                        a[i] = Array(2).join(firstLineMarker[0]);
                    }
                    else {
                        a[i] = firstLineMarker;
                    }
                }
            }
            s +=
                (this.options.delimiterOnBegin
                    ? this.options.delimiterOnBegin + cellPaddingForFirstLine
                    : '') +
                    a.join(cellPaddingForFirstLine +
                        this.options.tableDelimiter +
                        cellPaddingForFirstLine) +
                    (this.options.delimiterOnEnd
                        ? cellPaddingForFirstLine + this.options.delimiterOnEnd
                        : '') +
                    this.options.lineBreak;
        }
        return s;
    };
    Csv2md.prototype.rowsToString = function (rows) {
        if (rows === void 0) { rows = this.rows; }
        var maxLength = Array.apply(null, new Array(rows[0].length)).map(Number.prototype.valueOf, exports.options.firstLineMarker.length);
        var isFirstLine = true;
        var s = '';
        if (exports.options.pretty) {
            rows.map(function (row) {
                row.map(function (cell, columnIndex) {
                    if (String(cell).trim().length > maxLength[columnIndex]) {
                        maxLength[columnIndex] = String(cell).trim().length;
                    }
                });
            });
        }
        rows.map(function (row) {
            s += exports.rowToString(row, isFirstLine, exports.options.pretty ? maxLength : null);
            if (isFirstLine) {
                isFirstLine = false;
            }
        });
        return s;
    };
    Csv2md.prototype.addRow = function (row) {
        this.rows.push(row);
        return exports.rows;
    };
    return Csv2md;
}());
exports.Csv2md = Csv2md;
//# sourceMappingURL=csv2md.js.map