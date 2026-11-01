import { expect } from 'chai'
import { parse } from 'csv-parse/sync'
import { execSync } from 'node:child_process'
import { createReadStream, readFileSync } from 'node:fs'
import { Readable } from 'node:stream'
import { Csv2md, csv2md } from '../src/csv2md.ts'

const __dirname = import.meta.dirname

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
  it('expect to convert a csv string with the csv2md function', async () => {
    expect((await csv2md(csvString, options)).trim()).to.eq(
      expectedMarkdownTable.trim()
    )
  })
  it('expect to convert with default options', async () => {
    const csv2mdDefault = new Csv2md()
    const data = await csv2mdDefault.convert(csvString)
    expect(data.trim()).to.eq(expectedMarkdownTableInline.trim())
  })
  it('expect to execute bin/csv2md', () => {
    const md = execSync(
      `${__dirname}/../bin/csv2md --pretty ${__dirname}/fixtures/example1.csv`
    )
    expect(md.toString().trim()).to.be.equal(expectedMarkdownTablePretty.trim())
  })
  it('expect to stream with bin/csv2md', () => {
    let md = execSync(
      `${__dirname}/../bin/csv2md --pretty < ${__dirname}/fixtures/example1.csv`
    )
    expect(md.toString().trim()).to.be.equal(expectedMarkdownTablePretty.trim())
    md = execSync(
      `${__dirname}/../bin/csv2md < ${__dirname}/fixtures/example1.csv`
    )
    expect(md.toString().trim()).to.be.equal(expectedMarkdownTableInline.trim())
  })
})

describe('promise based api', () => {
  const fixture = `${__dirname}/fixtures/example1.csv`
  const prettyOptions = { pretty: true }

  it('accepts strings, buffers, readable streams and (async) iterables', async () => {
    const inputs = [
      csvString,
      Buffer.from(csvString),
      createReadStream(fixture, { highWaterMark: 7 }),
      Readable.from(csvString.match(/[^\n]*\n/g)!),
      csvString.split(',').map((part, i, all) => (i < all.length - 1 ? `${part},` : part))
    ]
    for (const input of inputs) {
      expect((await csv2md(input, prettyOptions)).trim()).to.equal(
        expectedMarkdownTablePretty
      )
    }
  })

  it('yields parsed records', async () => {
    const records = await Array.fromAsync(new Csv2md().records('a,b\n1, 2 \n'))
    expect(records).to.deep.equal([
      ['a', 'b'],
      ['1', ' 2 ']
    ])
  })

  it('streams regular tables row by row', async () => {
    const chunks = await Array.fromAsync(new Csv2md().chunks(csvString))
    expect(chunks).to.have.length(4)
    expect(chunks[0]).to.equal('a | b | c_1 | c_2\n---|---|---|---\n')
    expect(chunks.join('').trim()).to.equal(expectedMarkdownTableInline)
  })

  it('yields pretty tables as one chunk', async () => {
    const chunks = await Array.fromAsync(new Csv2md(prettyOptions).chunks(csvString))
    expect(chunks).to.have.length(1)
    expect(chunks[0].trim()).to.equal(expectedMarkdownTablePretty)
  })

  it('yields the rows parsed before an error, then rejects', async () => {
    const chunks: string[] = []
    let error: unknown
    try {
      for await (const chunk of new Csv2md().chunks('a,b\n1,2,3\n')) chunks.push(chunk)
    } catch (err) {
      error = err
    }
    expect(chunks).to.deep.equal(['a | b\n---|---\n'])
    expect(String(error)).to.match(/Invalid Record Length/)
  })

  it('rejects on invalid csv', async () => {
    let error: unknown
    await csv2md('a,b\n1,2,3', prettyOptions).catch(err => (error = err))
    expect(String(error)).to.match(/Invalid Record Length/)
  })

  it('converts empty input to an empty string', async () => {
    expect(await csv2md('')).to.equal('')
    expect(await csv2md('', prettyOptions)).to.equal('')
    expect(new Csv2md().rowsToString([])).to.equal('')
  })

  it('does not mutate the given rows', () => {
    const rows = [
      [' a ', 'b'],
      ['1', ' 2']
    ]
    new Csv2md(prettyOptions).rowsToString(rows)
    expect(rows).to.deep.equal([
      [' a ', 'b'],
      ['1', ' 2']
    ])
  })

  it('can stop iterating early', async () => {
    for await (const record of new Csv2md().records(createReadStream(fixture))) {
      expect(record).to.deep.equal(['a', 'b', 'c_1', 'c_2'])
      break
    }
  })
})
