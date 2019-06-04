"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support/register");
var chai_1 = require("chai");
var parse = require("csv-parse");
var csv2md_1 = require("../src/csv2md");
var csvOptions = {
    comment: '#',
    delimiter: undefined,
    quote: undefined,
    escape: undefined
};
var options = {
    pretty: false,
    stream: false,
    tableDelimiter: '|',
    firstLineMarker: '-*',
    cellPadding: ' ',
    delimiterOnBegin: '|',
    delimiterOnEnd: '|',
    csvComment: '#'
};
var csvString = require('fs')
    .readFileSync(__dirname + '/example1.csv')
    .toString();
describe('markdown table output', function () {
    var csvData = [];
    var csv2md = new csv2md_1.Csv2md(options);
    before(function (done) {
        parse(csvString, csvOptions, function (err, data) {
            csvData = data;
            chai_1.expect(err).to.be.equal(undefined);
            chai_1.expect(data).to.be.an('array');
            return done();
        });
    });
    beforeEach(function () {
        csv2md = new csv2md_1.Csv2md(options);
    });
    it('expect to have a parsable, multiline csv file', function () {
        chai_1.expect(csvString.match(/\n/).length).to.be.above(0);
        chai_1.expect(csvData).to.have.length.above(0);
        chai_1.expect(csvData[0]).to.have.length.above(0);
    });
    it('expect to transform to a simple markdown table with default values', function () {
        var md = csv2md.rowsToString(csvData);
        chai_1.expect(md.trim()).to.be.equal('| a | b | c_1 | c_2 |\n|---|---|---|---|\n| -122.1430195 | 124.3 | true | false |\n| null | a | a very long string | ~ |\n| a | b | c_1 | c_2 |');
    });
    it('expect to transform to a simple markdown table in pretty', function () {
        csv2md.pretty = true;
        var md = csv2md.rowsToString(csvData);
        chai_1.expect(md.trim()).to.be.equal('| a            | b     | c_1                | c_2   |\n|--------------|-------|--------------------|-------|\n| -122.1430195 | 124.3 | true               | false |\n| null         | a     | a very long string | ~     |\n| a            | b     | c_1                | c_2   |');
    });
    it('expect to transform to a simple markdown table with various options', function () {
        csv2md.tableDelimiter = '$';
        csv2md.firstLineMarker = '+*';
        csv2md.cellPadding = '_';
        csv2md.delimiterOnBegin = '/';
        csv2md.delimiterOnEnd = '\\';
        var md = csv2md.rowsToString(csvData);
        chai_1.expect(md.trim()).to.be.equal('/_a_$_b_$_c_1_$_c_2_\\\n/+++$+++$+++$+++\\\n/_-122.1430195_$_124.3_$_true_$_false_\\\n/_null_$_a_$_a very long string_$_~_\\\n/_a_$_b_$_c_1_$_c_2_\\');
        csv2md.pretty = true;
        csv2md.prettyCellSpace = '…';
        md = csv2md.rowsToString(csvData);
        chai_1.expect(md.trim()).to.be.equal('/_a……………………………_$_b…………_$_c_1………………………………………_$_c_2……_\\\n/++++++++++++++$+++++++$++++++++++++++++++++$+++++++\\\n/_-122.1430195_$_124.3_$_true……………………………………_$_false_\\\n/_null……………………_$_a…………_$_a very long string_$_~…………_\\\n/_a……………………………_$_b…………_$_c_1………………………………………_$_c_2……_\\');
    });
    it('expect to transform also empty cells', function (done) {
        var csvData = 'foo,bar,baz\na#,"b",c\nd,e,\n,f,\n,,\ng,h,i';
        parse(csvData.trim(), {}, function (err, rows) {
            chai_1.expect(err).to.be.equal(undefined);
            csv2md.pretty = true;
            chai_1.expect(csv2md.rowsToString(rows).trim()).to.be.equal('| foo | bar | baz |\n|-----|-----|-----|\n| a#  | b   | c   |\n| d   | e   |     |\n|     | f   |     |\n|     |     |     |\n| g   | h   | i   |'.trim());
            done();
        });
    });
    it('expect to transform a csv string with promises', function () {
        var csv = 'foo,bar,baz\na#,"b",c\nd,e,\n,f,\n,,\ng,h,i';
        var expectedOutcome = '| foo | bar | baz |\n|---|---|---|\n| a# | b | c |\n| d | e |  |\n|  | f |  |\n|  |  |  |\n| g | h | i |'.trim();
    });
    it('expect to execute bin/csv2md', function () {
        var md;
        md = require('child_process').execSync(__dirname + '/../bin/csv2md --pretty ' + __dirname + '/example1.csv');
        chai_1.expect(md.toString().trim()).to.be.equal('| a            | b     | c_1                | c_2   |\n|--------------|-------|--------------------|-------|\n| -122.1430195 | 124.3 | true               | false |\n| null         | a     | a very long string | ~     |\n| a            | b     | c_1                | c_2   |'.trim());
    });
});
//# sourceMappingURL=test.js.map