"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var csv2md_1 = require("./csv2md");
var yargs = require("yargs");
var argv = yargs
    .usage("Converts CSV data to Markdown tables\n(c) 2014-2019 by Philipp Staender, MIT License\n\nUsage: $0 [options] <csvfile>")
    .example('$0 -p input.csv > output.md', 'Converts a csv file to pretty formatted markdown table')
    .example('cat input.csv | $0 > output.md', 'Converts (larger) csv data to markdown table')
    .describe('p', 'pretty output, i.e. optimized column width')
    .default('p', csv2md_1.defaultOptions.pretty)
    .alias('p', 'pretty')
    .describe('csvComment', 'ignore everything until next line after this character')
    .default('csvComment', csv2md_1.defaultOptions.csvComment)
    .describe('csvDelimiter', 'column delimiter')
    .default('csvDelimiter', csv2md_1.defaultOptions.csvDelimiter)
    .describe('csvQuote', 'cell quote')
    .default('csvQuote', csv2md_1.defaultOptions.csvQuote)
    .describe('csvEscape', 'char to escape, see quoter')
    .default('csvEscape', csv2md_1.defaultOptions.csvEscape)
    .help('h')
    .alias('h', 'help').argv;
var lastArgument = process.argv.slice(-1)[0];
var inputFile = lastArgument.match(/\.csv$/i) ? lastArgument : null;
var processAsStream = !argv.inputFilePath && process.stdin;
var options = {
    pretty: csv2md_1.defaultOptions.pretty,
    stream: processAsStream,
    csvComment: argv.csvComment,
    csvDelimiter: argv.csvDelimiter,
    csvQuote: argv.csvQuote,
    csvEscape: argv.csvEscape
};
var parse = require("csv-parse");
var transform = require("stream-transform");
var parser = parse({
    comment: options.csvComment,
    delimiter: options.csvDelimiter,
    quote: options.csvQuote,
    escape: options.csvEscape
});
var isFirstLine = true;
var csv2md = new csv2md_1.CSV2MD(options);
var transformer = transform({ parallel: 10 }, function (record, callback) {
    ;
    (function () {
        if (!options.stream) {
            csv2md.addRow(record);
        }
        else {
            var s = csv2md.rowToString(record, isFirstLine);
            if (isFirstLine) {
                isFirstLine = false;
            }
        }
        callback(null, s);
    })();
});
if (csv2md.options.stream) {
    readStream
        .pipe(parser)
        .pipe(transformer)
        .pipe(process.stdout);
}
else {
    readStream.pipe(parser).pipe(transformer);
    transformer.on('finish', function () {
        console.log(csv2md.rowsToString());
    });
}
//# sourceMappingURL=index.js.map