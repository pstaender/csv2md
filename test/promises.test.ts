import { expect } from 'chai'
import { createReadStream, readFileSync, readdirSync } from 'node:fs'
import { Readable } from 'node:stream'
import * as sync from '../src/csv2md.ts'
import { Csv2md, csv2md, type Options } from '../src/promises.ts'

const __dirname = import.meta.dirname
const fixture = `${__dirname}/fixtures/example1.csv`
const csvString = readFileSync(fixture, 'utf8')

const expectedMarkdownTableInline = `a | b | c_1 | c_2
---|---|---|---
-122.1430195 | 124.3 | true | false
null | a | a very long string | ~
a | b | c_1 | c_2`

const expectedMarkdownTablePretty =
  '| a            | b     | c_1                | c_2   |\n|--------------|-------|--------------------|-------|\n| -122.1430195 | 124.3 | true               | false |\n| null         | a     | a very long string | ~     |\n| a            | b     | c_1                | c_2   |'

describe('promise based api', () => {
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

describe('sync and promise based api', () => {
  const optionSets: Options[] = [{}, { pretty: true }]
  const fixtures = readdirSync(`${__dirname}/fixtures`).filter(f => f.endsWith('.csv'))

  for (const file of fixtures) {
    for (const options of optionSets) {
      it(`produce the same result for ${file} ${JSON.stringify(options)}`, async () => {
        const csv = readFileSync(`${__dirname}/fixtures/${file}`, 'utf8')
        let expected: string | Error
        try {
          expected = sync.csv2md(csv, options)
        } catch (err) {
          expected = err as Error
        }
        const actual = await csv2md(csv, options).catch((err: Error) => err)
        if (expected instanceof Error) {
          expect(actual).to.be.instanceOf(Error)
          expect((actual as Error).message).to.equal(expected.message)
        } else {
          expect(actual).to.equal(expected)
        }
      })
    }
  }
})
