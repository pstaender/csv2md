"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Csv2md = (function () {
    function Csv2md(pretty, stream, tableDelimiter, cellPadding, firstLineMarker, delimiterOnBegin, delimiterOnEnd, lineBreak, prettyCellSpace, csvComment, csvDelimiter, csvQuote, csvEscape) {
        if (pretty === void 0) { pretty = true; }
        if (stream === void 0) { stream = false; }
        if (tableDelimiter === void 0) { tableDelimiter = '|'; }
        if (cellPadding === void 0) { cellPadding = ' '; }
        if (firstLineMarker === void 0) { firstLineMarker = '-*'; }
        if (delimiterOnBegin === void 0) { delimiterOnBegin = ''; }
        if (delimiterOnEnd === void 0) { delimiterOnEnd = ''; }
        if (lineBreak === void 0) { lineBreak = '\n'; }
        if (prettyCellSpace === void 0) { prettyCellSpace = ' '; }
        this.tableDelimiter = '|';
        this.cellPadding = ' ';
        this.firstLineMarker = '-*';
        this.delimiterOnBegin = '';
        this.delimiterOnEnd = '';
        this.lineBreak = '\n';
        this.prettyCellSpace = ' ';
        this.pretty = pretty;
        this.stream = stream;
        this.tableDelimiter = tableDelimiter;
        this.cellPadding = cellPadding;
        this.firstLineMarker = firstLineMarker;
        this.csvComment = csvComment;
        this.delimiterOnBegin = delimiterOnBegin;
        this.delimiterOnEnd = delimiterOnEnd;
        this.lineBreak = lineBreak;
        this.prettyCellSpace = prettyCellSpace;
        this.csvComment = csvComment;
        this.csvDelimiter = csvDelimiter;
        this.csvQuote = csvQuote;
        this.csvEscape = csvEscape;
        this.rows = [];
    }
    Csv2md.prototype.rowToString = function (record, isFirstLine, cell) {
        if (isFirstLine === void 0) { isFirstLine = false; }
        var pretty = this.pretty;
        var firstLineMarker = this.firstLineMarker;
        var firstLineMarkerRepeat = firstLineMarker.length === 2 && firstLineMarker[1] === '*';
        var cellPaddingForFirstLine = firstLineMarkerRepeat
            ? firstLineMarker[0]
            : this.cellPadding;
        var s = '';
        for (var column = 0; column < record.length; column++) {
            if (pretty) {
                record[column] =
                    record[column].trim() +
                        Array(cell[column] - (record[column].trim().length - 1)).join(this.prettyCellSpace);
            }
            else {
                record[column] = record[column].trim();
            }
        }
        s +=
            (this.delimiterOnBegin ? this.delimiterOnBegin + this.cellPadding : '') +
                record.join(this.cellPadding + this.tableDelimiter + this.cellPadding) +
                (this.delimiterOnEnd ? this.cellPadding + this.delimiterOnEnd : '') +
                this.lineBreak;
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
                (this.delimiterOnBegin
                    ? this.delimiterOnBegin + cellPaddingForFirstLine
                    : '') +
                    a.join(cellPaddingForFirstLine +
                        this.tableDelimiter +
                        cellPaddingForFirstLine) +
                    (this.delimiterOnEnd
                        ? cellPaddingForFirstLine + this.delimiterOnEnd
                        : '') +
                    this.lineBreak;
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