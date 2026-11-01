import { expect } from 'chai'
import { parse } from 'csv-parse/sync'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { Csv2md, csv2md } from '../src/csv2md.ts'

const __dirname = import.meta.dirname
const bin = join(__dirname, '..', 'bin', 'csv2md.js')
const example1 = join(__dirname, 'fixtures', 'example1.csv')

// runs the cli via node (works on every OS, no shebang needed)
function runBin(args: string[], input?: string): string {
  return execFileSync(process.execPath, [bin, ...args], {
    input,
    encoding: 'utf8'
  })
}

const csvOptions = {
  comment: '#',
  delimiter: undefined,
  quote: undefined,
  escape: undefined
}

const options = {
  pretty: false,
  stream: false,
  tableDelimiter: '|',
  firstLineMarker: '-*',
  cellPadding: ' ',
  delimiterOnBegin: '|',
  delimiterOnEnd: '|',
  csvComment: '#'
}

const csvString = readFileSync(`${__dirname}/fixtures/example1.csv`, 'utf8')

const expectedMarkdownTable = `| a | b | c_1 | c_2 |
|---|---|---|---|
| -122.1430195 | 124.3 | true | false |
| null | a | a very long string | ~ |
| a | b | c_1 | c_2 |`
const expectedMarkdownTableInline = `a | b | c_1 | c_2
---|---|---|---
-122.1430195 | 124.3 | true | false
null | a | a very long string | ~
a | b | c_1 | c_2`

const expectedMarkdownTablePretty =
  '| a            | b     | c_1                | c_2   |\n|--------------|-------|--------------------|-------|\n| -122.1430195 | 124.3 | true               | false |\n| null         | a     | a very long string | ~     |\n| a            | b     | c_1                | c_2   |'

describe('markdown table output', () => {
  let csvData: string[][] = []
  let csv2mdConverter: Csv2md = new Csv2md(options)

  before(() => {
    csvData = parse(csvString, csvOptions)
    expect(csvData).to.be.an('array')
  })

  beforeEach(() => {
    csv2mdConverter = new Csv2md(options)
  })

  it('expect to have a parsable, multiline csv file', () => {
    expect(csvString.match(/\n/)?.length).to.be.above(0)
    expect(csvData).to.have.length.above(0)
    expect(csvData[0]).to.have.length.above(0)
  })
  it('expect to convert to a markdown table with specific (test) options', () => {
    let md = csv2mdConverter.rowsToString(csvData)
    expect(md.trim()).to.be.equal(expectedMarkdownTable.trim())
  })
  it('expect to convert to a markdown table in pretty', () => {
    csv2mdConverter.pretty = true
    let md = csv2mdConverter.rowsToString(csvData)
    expect(md.trim()).to.be.equal(
      '| a            | b     | c_1                | c_2   |\n|--------------|-------|--------------------|-------|\n| -122.1430195 | 124.3 | true               | false |\n| null         | a     | a very long string | ~     |\n| a            | b     | c_1                | c_2   |'
    )
  })
  it('expect to convert to a markdown table with various options', () => {
    csv2mdConverter.tableDelimiter = '$'
    csv2mdConverter.firstLineMarker = '+*'
    csv2mdConverter.delimiterOnBegin = '/'
    csv2mdConverter.cellPadding = '_'
    csv2mdConverter.delimiterOnEnd = '\\'
    let md = csv2mdConverter.rowsToString(csvData)
    expect(md.trim()).to.be.equal(
      '/_a_$_b_$_c_1_$_c_2_\\\n/+++$+++$+++$+++\\\n/_-122.1430195_$_124.3_$_true_$_false_\\\n/_null_$_a_$_a very long string_$_~_\\\n/_a_$_b_$_c_1_$_c_2_\\'
    )
    csv2mdConverter.pretty = true
    csv2mdConverter.prettyCellSpace = '…'
    md = csv2mdConverter.rowsToString(csvData)
    expect(md.trim()).to.be.equal(
      '/_a……………………………_$_b…………_$_c_1………………………………………_$_c_2……_\\\n/++++++++++++++$+++++++$++++++++++++++++++++$+++++++\\\n/_-122.1430195_$_124.3_$_true……………………………………_$_false_\\\n/_null……………………_$_a…………_$_a very long string_$_~…………_\\\n/_a……………………………_$_b…………_$_c_1………………………………………_$_c_2……_\\'
    )
  })
  it('expect to convert also empty cells', () => {
    const csvData = 'foo,bar,baz\na#,"b",c\nd,e,\n,f,\n,,\ng,h,i'
    const rows: string[][] = parse(csvData.trim(), {})
    csv2mdConverter.pretty = true
    expect(csv2mdConverter.rowsToString(rows).trim()).to.be.equal(
      '| foo | bar | baz |\n|-----|-----|-----|\n| a#  | b   | c   |\n| d   | e   |     |\n|     | f   |     |\n|     |     |     |\n| g   | h   | i   |'.trim()
    )
  })
  it('expect to convert a csv string with promises', async () => {
    const data = await csv2mdConverter.convert(csvString)
    expect(data.trim()).to.eq(expectedMarkdownTable.trim())
  })
  it('expect to transform a csv string synchronously', () => {
    expect(csv2md(csvString, options).trim()).to.eq(
      expectedMarkdownTable.trim()
    )
    expect(csv2mdConverter.csv2md(csvString).trim()).to.eq(
      expectedMarkdownTable.trim()
    )
  })
  it('expect to transform records one by one (stream-transform handler)', () => {
    const results: (string | null)[] = []
    const converter = new Csv2md(options)
    for (const record of csvData) {
      converter.transform(record, (err, s) => {
        expect(err).to.equal(null)
        results.push(s)
      })
    }
    expect(results.join('').trim()).to.equal(expectedMarkdownTable)
  })
  it('expect to collect records for pretty output via transform', () => {
    const converter = new Csv2md({ ...options, pretty: true })
    for (const record of csvData) {
      converter.transform(record, (err, s) => expect(s).to.equal(null))
    }
    expect(converter.rowsToString().trim()).to.equal(expectedMarkdownTablePretty)
  })
  it('expect to format a single row', () => {
    expect(csv2mdConverter.rowToString(['a', ' b '], true)).to.equal(
      '| a | b |\n|---|---|\n'
    )
  })
  it('expect to convert with default options', async () => {
    const csv2mdDefault = new Csv2md()
    const data = await csv2mdDefault.convert(csvString)
    expect(data.trim()).to.eq(expectedMarkdownTableInline.trim())
  })
  it('expect to execute bin/csv2md', () => {
    const md = runBin(['--pretty', example1])
    expect(md.trim()).to.be.equal(expectedMarkdownTablePretty.trim())
  })
  it('expect to stream with bin/csv2md', () => {
    let md = runBin(['--pretty'], csvString)
    expect(md.trim()).to.be.equal(expectedMarkdownTablePretty.trim())
    md = runBin([], csvString)
    expect(md.trim()).to.be.equal(expectedMarkdownTableInline.trim())
  })
})
