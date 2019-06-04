"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var parseSync = require("csv-parse/lib/sync");
var Csv2md = (function () {
    function Csv2md(options) {
        if (options === void 0) { options = {}; }
        this.pretty = false;
        this.stream = false;
        this.tableDelimiter = '|';
        this.cellPadding = ' ';
        this.firstLineMarker = '-*';
        this.delimiterOnBegin = '';
        this.delimiterOnEnd = '';
        this.lineBreak = '\n';
        this.prettyCellSpace = ' ';
        this.rows = [];
        if (options.pretty !== undefined)
            this.pretty = options.pretty;
        if (options.stream !== undefined)
            this.stream = options.stream;
        if (this.pretty) {
            this.delimiterOnBegin = this.delimiterOnEnd = this.tableDelimiter;
        }
        if (typeof options.tableDelimiter === 'string')
            this.tableDelimiter = options.tableDelimiter;
        if (typeof options.cellPadding === 'string')
            this.cellPadding = options.cellPadding;
        if (typeof options.firstLineMarker === 'string')
            this.firstLineMarker = options.firstLineMarker;
        if (typeof options.csvComment === 'string')
            this.csvComment = options.csvComment;
        if (typeof options.delimiterOnBegin === 'string')
            this.delimiterOnBegin = options.delimiterOnBegin;
        if (typeof options.delimiterOnEnd === 'string')
            this.delimiterOnEnd = options.delimiterOnEnd;
        if (typeof options.lineBreak === 'string')
            this.lineBreak = options.lineBreak;
        if (typeof options.prettyCellSpace === 'string')
            this.prettyCellSpace = options.prettyCellSpace;
        this.csvComment = options.csvComment;
        this.csvDelimiter = options.csvDelimiter;
        this.csvQuote = options.csvQuote;
        this.csvEscape = options.csvEscape;
    }
    Csv2md.prototype.rowToString = function (record, isFirstLine, cellsForPrettyPadding) {
        if (isFirstLine === void 0) { isFirstLine = false; }
        var firstLineMarker = this.firstLineMarker;
        var firstLineMarkerRepeat = Boolean(firstLineMarker.length === 2 && firstLineMarker[1] === '*');
        var cellPaddingForFirstLine = firstLineMarkerRepeat
            ? firstLineMarker[0]
            : this.cellPadding;
        var s = '';
        for (var column = 0; column < record.length; column++) {
            if (cellsForPrettyPadding) {
                record[column] =
                    record[column].trim() +
                        Array(cellsForPrettyPadding[column] - (record[column].trim().length - 1)).join(this.prettyCellSpace);
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
                if (cellsForPrettyPadding) {
                    if (firstLineMarkerRepeat) {
                        a[i] = Array(cellsForPrettyPadding[i] + 1).join(firstLineMarker[0]);
                    }
                    else {
                        a[i] = firstLineMarker.substr(0, cellsForPrettyPadding[0]);
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
        var _this = this;
        if (rows === void 0) { rows = this.rows; }
        var maxLength = Array.apply(null, new Array(rows[0].length)).map(Number.prototype.valueOf, this.firstLineMarker.length);
        var isFirstLine = true;
        var s = '';
        if (this.pretty) {
            rows.map(function (row) {
                row.map(function (cell, columnIndex) {
                    if (String(cell).trim().length > maxLength[columnIndex]) {
                        maxLength[columnIndex] = String(cell).trim().length;
                    }
                });
            });
        }
        rows.map(function (row) {
            s += _this.rowToString(row, isFirstLine, _this.pretty ? maxLength : null);
            if (isFirstLine) {
                isFirstLine = false;
            }
        });
        return s;
    };
    Csv2md.prototype.addRow = function (row) {
        this.rows.push(row);
        return this.rows;
    };
    Csv2md.prototype.convert = function (csv) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                data = parseSync(csv, {
                    comment: this.csvComment,
                    delimiter: this.csvDelimiter,
                    quote: this.csvQuote,
                    escape: this.csvEscape
                });
                return [2, this.rowsToString(data)];
            });
        });
    };
    return Csv2md;
}());
exports.Csv2md = Csv2md;
//# sourceMappingURL=csv2md.js.map