"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
var csv2md_1 = require("./csv2md");
var fs = require("fs");
var yargs = require("yargs");
var defaultCsv2md = new csv2md_1.Csv2md();
var argv = yargs
    .usage("Converts CSV data to Markdown tables\n(c) 2014-2020 by Philipp Staender, MIT License\n\nUsage: $0 [options] <csvfile>")
    .example("$0 -p data.csv > output.md", "Converts csv to pretty markdown table")
    .example("cat data.csv | $0 > output.md", "Converts larger data")
    .example("$0 --csvDelimiter=\";\" < ~/data.csv", "Converts with a distinct csv delimiter")
    .describe('pretty', 'pretty output, i.e. optimized column width and not inline-style')
    .alias('pretty', 'p')
    .describe('csvComment', 'ignore everything until next line after this character')
    .describe('tableDelimiter', 'delimiter for cells in output')
    .default('tableDelimiter', defaultCsv2md.tableDelimiter)
    .describe('cellPadding', 'chars / spaces to wrap cell content')
    .default('cellPadding', defaultCsv2md.cellPadding)
    .describe('firstLineMarker', 'to seperate first row\n you can specifiy own characters, for instance:\n`-*` -> `------…` (gets cell width)\n   `-====-` -> `-====-`\n')
    .default('firstLineMarker', defaultCsv2md.firstLineMarker)
    .describe('delimiterOnBegin', 'first row delimiter')
    .default('delimiterOnBegin', defaultCsv2md.delimiterOnBegin)
    .describe('delimiterOnEnd', 'last row delimiter')
    .default('delimiterOnEnd', defaultCsv2md.delimiterOnEnd)
    .describe('parallel', 'number of transformation callbacks to run in parallel')
    .default('parallel', 100)
    .default('csvComment', defaultCsv2md.csvComment)
    .describe('csvDelimiter', 'column delimiter')
    .default('csvDelimiter', defaultCsv2md.csvDelimiter)
    .describe('csvQuote', 'cell quote')
    .default('csvQuote', defaultCsv2md.csvQuote)
    .describe('csvEscape', 'char to escape, see quoter')
    .default('csvEscape', defaultCsv2md.csvEscape)
    .number(['parallel'])
    .boolean(['pretty'])
    .help('h')
    .alias('h', 'help').argv;
var lastArgument = process.argv.slice(-1)[0];
var inputFile = lastArgument.match(/\.csv$/i) ? lastArgument : null;
var processAsStream = Boolean(!inputFile && process.stdin);
var options = {
    pretty: argv.pretty,
    firstLineMarker: argv.firstLineMarker,
    delimiterOnBegin: argv.delimiterOnBegin || undefined,
    delimiterOnEnd: argv.delimiterOnEnd || undefined,
    cellPadding: argv.cellPadding,
    tableDelimiter: argv.tableDelimiter,
    csvComment: argv.csvComment,
    csvDelimiter: argv.csvDelimiter,
    csvQuote: argv.csvQuote,
    csvEscape: argv.csvEscape
};
var csv2md = new csv2md_1.Csv2md(options);
var parse = require("csv-parse");
var transform = require("stream-transform");
var parser = parse({
    comment: options.csvComment,
    delimiter: options.csvDelimiter,
    quote: options.csvQuote,
    escape: options.csvEscape
});
if (processAsStream) {
    ;
    (function (csv2md) {
        var transformer = transform({ parallel: argv.parallel }, function (record, cb) {
            return csv2md.transform(record, cb);
        });
        if (csv2md.pretty) {
            process.stdin.pipe(parser).pipe(transformer);
            transformer.on('finish', function () {
                console.log(csv2md.rowsToString());
            });
        }
        else {
            process.stdin
                .pipe(parser)
                .pipe(transformer)
                .pipe(process.stdout);
        }
    })(csv2md);
}
else if (inputFile) {
    ;
    (function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _b = (_a = console).log;
                    return [4 /*yield*/, csv2md.convert(fs.readFileSync(inputFile).toString())];
                case 1:
                    _b.apply(_a, [_c.sent()]);
                    return [2 /*return*/];
            }
        });
    }); })();
}
//# sourceMappingURL=cli.js.map