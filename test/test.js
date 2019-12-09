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
var expectedMarkdownTable = "| a | b | c_1 | c_2 |\n|---|---|---|---|\n| -122.1430195 | 124.3 | true | false |\n| null | a | a very long string | ~ |\n| a | b | c_1 | c_2 |";
var expectedMarkdownTableInline = "a | b | c_1 | c_2\n---|---|---|---\n-122.1430195 | 124.3 | true | false\nnull | a | a very long string | ~\na | b | c_1 | c_2";
var expectedMarkdownTablePretty = '| a            | b     | c_1                | c_2   |\n|--------------|-------|--------------------|-------|\n| -122.1430195 | 124.3 | true               | false |\n| null         | a     | a very long string | ~     |\n| a            | b     | c_1                | c_2   |';
describe('markdown table output', function () {
    var csvData = [];
    var csv2mdConverter = new csv2md_1.Csv2md(options);
    before(function (done) {
        parse(csvString, csvOptions, function (err, data) {
            csvData = data;
            chai_1.expect(err).to.be.equal(undefined);
            chai_1.expect(data).to.be.an('array');
            return done();
        });
    });
    beforeEach(function () {
        csv2mdConverter = new csv2md_1.Csv2md(options);
    });
    it('expect to have a parsable, multiline csv file', function () {
        chai_1.expect(csvString.match(/\n/).length).to.be.above(0);
        chai_1.expect(csvData).to.have.length.above(0);
        chai_1.expect(csvData[0]).to.have.length.above(0);
    });
    it('expect to convert to a markdown table with specific (test) options', function () {
        var md = csv2mdConverter.rowsToString(csvData);
        chai_1.expect(md.trim()).to.be.equal(expectedMarkdownTable.trim());
    });
    it('expect to convert to a markdown table in pretty', function () {
        csv2mdConverter.pretty = true;
        var md = csv2mdConverter.rowsToString(csvData);
        chai_1.expect(md.trim()).to.be.equal('| a            | b     | c_1                | c_2   |\n|--------------|-------|--------------------|-------|\n| -122.1430195 | 124.3 | true               | false |\n| null         | a     | a very long string | ~     |\n| a            | b     | c_1                | c_2   |');
    });
    it('expect to convert to a markdown table with various options', function () {
        csv2mdConverter.tableDelimiter = '$';
        csv2mdConverter.firstLineMarker = '+*';
        csv2mdConverter.delimiterOnBegin = '/';
        csv2mdConverter.cellPadding = '_';
        csv2mdConverter.delimiterOnEnd = '\\';
        var md = csv2mdConverter.rowsToString(csvData);
        chai_1.expect(md.trim()).to.be.equal('/_a_$_b_$_c_1_$_c_2_\\\n/+++$+++$+++$+++\\\n/_-122.1430195_$_124.3_$_true_$_false_\\\n/_null_$_a_$_a very long string_$_~_\\\n/_a_$_b_$_c_1_$_c_2_\\');
        csv2mdConverter.pretty = true;
        csv2mdConverter.prettyCellSpace = '…';
        md = csv2mdConverter.rowsToString(csvData);
        chai_1.expect(md.trim()).to.be.equal('/_a……………………………_$_b…………_$_c_1………………………………………_$_c_2……_\\\n/++++++++++++++$+++++++$++++++++++++++++++++$+++++++\\\n/_-122.1430195_$_124.3_$_true……………………………………_$_false_\\\n/_null……………………_$_a…………_$_a very long string_$_~…………_\\\n/_a……………………………_$_b…………_$_c_1………………………………………_$_c_2……_\\');
    });
    it('expect to convert also empty cells', function (done) {
        var csvData = 'foo,bar,baz\na#,"b",c\nd,e,\n,f,\n,,\ng,h,i';
        parse(csvData.trim(), {}, function (err, rows) {
            chai_1.expect(err).to.be.equal(undefined);
            csv2mdConverter.pretty = true;
            chai_1.expect(csv2mdConverter.rowsToString(rows).trim()).to.be.equal('| foo | bar | baz |\n|-----|-----|-----|\n| a#  | b   | c   |\n| d   | e   |     |\n|     | f   |     |\n|     |     |     |\n| g   | h   | i   |'.trim());
            done();
        });
    });
    it('expect to convert a csv string with promises', function () { return __awaiter(void 0, void 0, void 0, function () {
        var data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, csv2mdConverter.convert(csvString)];
                case 1:
                    data = _a.sent();
                    chai_1.expect(data.trim()).to.eq(expectedMarkdownTable.trim());
                    return [2];
            }
        });
    }); });
    it('expect to transform a csv string synchronously', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            chai_1.expect(csv2md_1.csv2md(csvString, options).trim()).to.eq(expectedMarkdownTable.trim());
            return [2];
        });
    }); });
    it('expect to convert with default options', function () { return __awaiter(void 0, void 0, void 0, function () {
        var csv2mdDefault, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    csv2mdDefault = new csv2md_1.Csv2md();
                    return [4, csv2mdDefault.convert(csvString)];
                case 1:
                    data = _a.sent();
                    chai_1.expect(data.trim()).to.eq(expectedMarkdownTableInline.trim());
                    return [2];
            }
        });
    }); });
    it('expect to execute bin/csv2md', function () {
        var md = require('child_process').execSync(__dirname + "/../bin/csv2md --pretty " + __dirname + "/example1.csv");
        chai_1.expect(md.toString().trim()).to.be.equal(expectedMarkdownTablePretty.trim());
    });
    it('expect to stream with bin/csv2md', function () {
        var md = require('child_process').execSync(__dirname + "/../bin/csv2md --pretty < " + __dirname + "/example1.csv");
        chai_1.expect(md.toString().trim()).to.be.equal(expectedMarkdownTablePretty.trim());
        md = require('child_process').execSync(__dirname + "/../bin/csv2md < " + __dirname + "/example1.csv");
        chai_1.expect(md.toString().trim()).to.be.equal(expectedMarkdownTableInline.trim());
    });
});
//# sourceMappingURL=test.js.map