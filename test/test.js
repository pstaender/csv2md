"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var parse = require("csv-parse");
var csv2md_1 = require("../src/csv2md");
var csvOptions = {
    comment: '#',
    delimiter: undefined,
    quote: undefined,
    escape: undefined
};
var csvString = require('fs')
    .readFileSync(__dirname + '/example1.csv')
    .toString();
describe('markdown table output', function () {
    var csvData = [];
    var csv2md = new csv2md_1.Csv2md(pretty, false, stream, false, tableDelimiter, '|', firstLineMarker, '-*', cellPadding, ' ', delimiterOnBegin, '|', delimiterOnEnd, '|', csvComment, '#');
    before(function (done) {
        parse(csvString, csvOptions, function (err, data) {
            csvData = data;
            chai_1.expect(err).to.be.equal(undefined);
            chai_1.expect(data).to.be.an('array');
            return done();
        });
    });
    beforeEach(function () {
        csv2md = new csv2md_1.Csv2md(defaultOptions);
    });
    it('expect to have a parsable, multiline csv file', function () {
        chai_1.expect(csvString.match(/\n/).length).to.be.above(0);
        chai_1.expect(csvData).to.have.length.above(0);
        return chai_1.expect(csvData[0]).to.have.length.above(0);
    });
    it('expect to transform to a simple markdown table with default values', function () {
        var md = csv2md.rowsToString(csvData);
        return chai_1.expect(md.trim()).to.be.equal('| a | b | c_1 | c_2 |\n|---|---|---|---|\n| -122.1430195 | 124.3 | true | false |\n| null | a | a very long string | ~ |\n| a | b | c_1 | c_2 |');
    });
});
//# sourceMappingURL=test.js.map