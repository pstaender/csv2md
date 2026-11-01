// Promise based API: `import { csv2md, Csv2md } from 'csv2md/promises'`
import { parse } from 'csv-parse'
import { Readable, pipeline } from 'node:stream'
import { Formatter, type Options, type Row } from './formatter.ts'

export type { Options, Row }

/** Anything csv2md can read CSV data from. */
export type CsvInput =
  | string
  | Buffer
  | Iterable<string | Buffer>
  | AsyncIterable<string | Buffer>

export class Csv2md extends Formatter {
  /** Parses CSV input and yields its records one by one. */
  async *records(input: CsvInput): AsyncGenerator<Row> {
    const parser = parse(this.csvParseOptions())
    pipeline(Readable.from(input), parser, () => {
      // errors surface through the parser, see iterate()
    })
    yield* iterate<Row>(parser)
  }

  /**
   * Converts CSV input to markdown and yields it in chunks. Regular tables are
   * streamed row by row; pretty tables need all rows to compute the column
   * widths and are yielded as a single chunk at the end.
   */
  async *chunks(input: CsvInput): AsyncGenerator<string> {
    if (this.pretty) {
      const rows = await collect(this.records(input))
      if (rows.length > 0) yield this.rowsToString(rows)
      return
    }
    let isFirstLine = true
    for await (const row of this.records(input)) {
      yield this.rowToString(row, isFirstLine)
      isFirstLine = false
    }
  }

  /** Converts CSV input to a markdown table. */
  async convert(input: CsvInput): Promise<string> {
    return (await collect(this.chunks(input))).join('')
  }
}

/** Converts CSV input to a markdown table. */
export function csv2md(input: CsvInput, options: Options = {}): Promise<string> {
  return new Csv2md(options).convert(input)
}

async function collect<T>(iterable: AsyncIterable<T>): Promise<T[]> {
  const items: T[] = []
  for await (const item of iterable) items.push(item)
  return items
}

/**
 * Iterates a readable stream via 'data' events. Unlike the stream's own async
 * iterator, records emitted right before an error are still yielded (csv-parse
 * emits valid records and the error of the same chunk synchronously).
 */
async function* iterate<T>(stream: Readable): AsyncGenerator<T> {
  const highWaterMark = 1024
  const queue: T[] = []
  let error: unknown
  let finished = false
  let wake: (() => void) | undefined
  const notify = () => {
    wake?.()
    wake = undefined
  }
  stream.on('data', (item: T) => {
    queue.push(item)
    if (queue.length >= highWaterMark) stream.pause()
    notify()
  })
  stream.once('error', err => {
    error = err
    finished = true
    notify()
  })
  for (const event of ['end', 'close']) {
    stream.once(event, () => {
      finished = true
      notify()
    })
  }
  try {
    while (true) {
      if (queue.length > 0) {
        yield queue.shift()!
        if (queue.length === 0 && stream.isPaused()) stream.resume()
      } else if (error !== undefined) {
        throw error
      } else if (finished) {
        return
      } else {
        await new Promise<void>(resolve => (wake = resolve))
      }
    }
  } finally {
    stream.destroy()
  }
}
