import "source-map-support/register";

import { expect } from "chai";
import { parse } from "csv-parse";
import { Csv2md, csv2md } from "../src/csv2md";

const csvOptions = {
  comment: "#",
  delimiter: undefined,
  quote: undefined,
  escape: undefined,
};

const options = {
  pretty: false,
  stream: false,
  tableDelimiter: "|",
  firstLineMarker: "-*",
  cellPadding: " ",
  delimiterOnBegin: "|",
  delimiterOnEnd: "|",
  csvComment: "#",
};

const csvString = require("fs")
  .readFileSync(__dirname + "/example1.csv")
  .toString();

const expectedMarkdownTable = `| a | b | c_1 | c_2 |
|---|---|---|---|
| -122.1430195 | 124.3 | true | false |
| null | a | a very long string | ~ |
| a | b | c_1 | c_2 |`;
const expectedMarkdownTableInline = `a | b | c_1 | c_2
---|---|---|---
-122.1430195 | 124.3 | true | false
null | a | a very long string | ~
a | b | c_1 | c_2`;

const expectedMarkdownTablePretty =
  "| a            | b     | c_1                | c_2   |\n|--------------|-------|--------------------|-------|\n| -122.1430195 | 124.3 | true               | false |\n| null         | a     | a very long string | ~     |\n| a            | b     | c_1                | c_2   |";

describe("markdown table output", () => {
  let csvData: any[] | never[] = [];
  let csv2mdConverter: Csv2md = new Csv2md(options);

  before((done) => {
    parse(csvString, csvOptions, (err, data) => {
      csvData = data;
      expect(err).to.be.equal(undefined);
      expect(data).to.be.an("array");
      return done();
    });
  });

  beforeEach(() => {
    csv2mdConverter = new Csv2md(options);
  });

  it("expect to have a parsable, multiline csv file", () => {
    expect(csvString.match(/\n/).length).to.be.above(0);
    expect(csvData).to.have.length.above(0);
    expect(csvData[0]).to.have.length.above(0);
  });
  it("expect to convert to a markdown table with specific (test) options", () => {
    let md = csv2mdConverter.rowsToString(csvData);
    expect(md.trim()).to.be.equal(expectedMarkdownTable.trim());
  });
  it("expect to convert to a markdown table in pretty", () => {
    csv2mdConverter.pretty = true;
    let md = csv2mdConverter.rowsToString(csvData);
    expect(md.trim()).to.be.equal(
      "| a            | b     | c_1                | c_2   |\n|--------------|-------|--------------------|-------|\n| -122.1430195 | 124.3 | true               | false |\n| null         | a     | a very long string | ~     |\n| a            | b     | c_1                | c_2   |"
    );
  });
  it("expect to convert to a markdown table with various options", () => {
    csv2mdConverter.tableDelimiter = "$";
    csv2mdConverter.firstLineMarker = "+*";
    csv2mdConverter.delimiterOnBegin = "/";
    csv2mdConverter.cellPadding = "_";
    csv2mdConverter.delimiterOnEnd = "\\";
    let md = csv2mdConverter.rowsToString(csvData);
    expect(md.trim()).to.be.equal(
      "/_a_$_b_$_c_1_$_c_2_\\\n/+++$+++$+++$+++\\\n/_-122.1430195_$_124.3_$_true_$_false_\\\n/_null_$_a_$_a very long string_$_~_\\\n/_a_$_b_$_c_1_$_c_2_\\"
    );
    csv2mdConverter.pretty = true;
    csv2mdConverter.prettyCellSpace = "…";
    md = csv2mdConverter.rowsToString(csvData);
    expect(md.trim()).to.be.equal(
      "/_a……………………………_$_b…………_$_c_1………………………………………_$_c_2……_\\\n/++++++++++++++$+++++++$++++++++++++++++++++$+++++++\\\n/_-122.1430195_$_124.3_$_true……………………………………_$_false_\\\n/_null……………………_$_a…………_$_a very long string_$_~…………_\\\n/_a……………………………_$_b…………_$_c_1………………………………………_$_c_2……_\\"
    );
  });
  it("expect to convert also empty cells", (done) => {
    const csvData = 'foo,bar,baz\na#,"b",c\nd,e,\n,f,\n,,\ng,h,i';
    parse(csvData.trim(), {}, function (err, rows) {
      expect(err).to.be.equal(undefined);
      csv2mdConverter.pretty = true;
      expect(csv2mdConverter.rowsToString(rows).trim()).to.be.equal(
        "| foo | bar | baz |\n|-----|-----|-----|\n| a#  | b   | c   |\n| d   | e   |     |\n|     | f   |     |\n|     |     |     |\n| g   | h   | i   |".trim()
      );
      done();
    });
  });
  it("expect to convert a csv string with promises", async () => {
    const data = await csv2mdConverter.convert(csvString);
    expect(data.trim()).to.eq(expectedMarkdownTable.trim());
  });
  it("expect to transform a csv string synchronously", async () => {
    expect(csv2md(csvString, options).trim()).to.eq(
      expectedMarkdownTable.trim()
    );
  });
  it("expect to convert with default options", async () => {
    const csv2mdDefault = new Csv2md();
    const data = await csv2mdDefault.convert(csvString);
    expect(data.trim()).to.eq(expectedMarkdownTableInline.trim());
  });
  it("expect to execute bin/csv2md", () => {
    const md = require("child_process").execSync(
      `node ${__dirname}/../bin/csv2md --pretty ${__dirname}/example1.csv`
    );
    expect(md.toString().trim()).to.be.equal(
      expectedMarkdownTablePretty.trim()
    );
  });
  it("expect to stream with bin/csv2md", () => {
    let md = require("child_process").execSync(
      `node ${__dirname}/../bin/csv2md --pretty < ${__dirname}/example1.csv`
    );
    expect(md.toString().trim()).to.be.equal(
      expectedMarkdownTablePretty.trim()
    );
    md = require("child_process").execSync(
      `node ${__dirname}/../bin/csv2md < ${__dirname}/example1.csv`
    );
    expect(md.toString().trim()).to.be.equal(
      expectedMarkdownTableInline.trim()
    );
  });
});
