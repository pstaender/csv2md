import { parse } from 'csv-parse'
import { Readable, pipeline } from 'node:stream'

export type Row = string[]

/** Anything csv2md can read CSV data from. */
export type CsvInput =
  | string
  | Buffer
  | Iterable<string | Buffer>
  | AsyncIterable<string | Buffer>

export interface Options {
  pretty?: boolean
  csvComment?: string
  csvDelimiter?: string
  csvQuote?: string
  csvEscape?: string
  tableDelimiter?: string
  cellPadding?: string
  firstLineMarker?: string
  delimiterOnBegin?: string
  delimiterOnEnd?: string
  lineBreak?: string
  prettyCellSpace?: string
}

export class Csv2md {
  pretty = false
  tableDelimiter = '|'
  cellPadding = ' '
  firstLineMarker = '-*'
  delimiterOnBegin = ''
  delimiterOnEnd = ''
  lineBreak = '\n'
  prettyCellSpace = ' '

  csvComment?: string
  csvDelimiter?: string
  csvQuote?: string
  csvEscape?: string

  constructor(options: Options = {}) {
    if (options.pretty !== undefined) this.pretty = options.pretty
    if (this.pretty) {
      // pretty tables get a table delimiter at the beginning and end of each row by default
      this.delimiterOnBegin = this.delimiterOnEnd = this.tableDelimiter
    }
    if (typeof options.tableDelimiter === 'string')
      this.tableDelimiter = options.tableDelimiter
    if (typeof options.cellPadding === 'string')
      this.cellPadding = options.cellPadding
    if (typeof options.firstLineMarker === 'string')
      this.firstLineMarker = options.firstLineMarker
    if (options.delimiterOnBegin !== undefined)
      this.delimiterOnBegin = options.delimiterOnBegin
    if (options.delimiterOnEnd !== undefined)
      this.delimiterOnEnd = options.delimiterOnEnd
    if (typeof options.lineBreak === 'string')
      this.lineBreak = options.lineBreak
    if (typeof options.prettyCellSpace === 'string')
      this.prettyCellSpace = options.prettyCellSpace

    this.csvComment = options.csvComment
    this.csvDelimiter = options.csvDelimiter
    this.csvQuote = options.csvQuote
    this.csvEscape = options.csvEscape
  }

  /** Parses CSV input and yields its records one by one. */
  async *records(input: CsvInput): AsyncGenerator<Row> {
    const parser = parse({
      comment: this.csvComment,
      delimiter: this.csvDelimiter,
      quote: this.csvQuote,
      escape: this.csvEscape
    })
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
      yield this.#rowToString(row, isFirstLine, null)
      isFirstLine = false
    }
  }

  /** Converts CSV input to a markdown table. */
  async convert(input: CsvInput): Promise<string> {
    return (await collect(this.chunks(input))).join('')
  }

  /** Formats already parsed rows as a markdown table. */
  rowsToString(rows: Row[]): string {
    if (rows.length === 0) return ''
    const columnWidths = this.pretty ? this.#columnWidths(rows) : null
    return rows
      .map((row, index) => this.#rowToString(row, index === 0, columnWidths))
      .join('')
  }

  #columnWidths(rows: Row[]): number[] {
    const widths: number[] = rows[0].map(() => this.firstLineMarker.length)
    for (const row of rows) {
      row.forEach((cell, column) => {
        widths[column] = Math.max(widths[column], String(cell).trim().length)
      })
    }
    return widths
  }

  #rowToString(
    row: Row,
    isFirstLine: boolean,
    columnWidths: number[] | null
  ): string {
    const { firstLineMarker, cellPadding, tableDelimiter, lineBreak } = this
    const { delimiterOnBegin, delimiterOnEnd } = this
    const markerRepeats =
      firstLineMarker.length === 2 && firstLineMarker[1] === '*'
    const cellPaddingForFirstLine = markerRepeats
      ? firstLineMarker[0]
      : cellPadding

    const cells = row.map((cell, column) => {
      const text = String(cell).trim()
      return columnWidths
        ? text + this.prettyCellSpace.repeat(columnWidths[column] - text.length)
        : text
    })

    let s =
      (delimiterOnBegin ? delimiterOnBegin + cellPadding : '') +
      cells.join(cellPadding + tableDelimiter + cellPadding) +
      (delimiterOnEnd ? cellPadding + delimiterOnEnd : '') +
      lineBreak

    if (isFirstLine) {
      const separators = cells.map((_, column) => {
        if (columnWidths) {
          return markerRepeats
            ? firstLineMarker[0].repeat(columnWidths[column] + 1)
            : firstLineMarker.slice(0, columnWidths[0])
        }
        return markerRepeats ? firstLineMarker[0].repeat(2) : firstLineMarker
      })
      s +=
        delimiterOnBegin +
        separators.join(cellPaddingForFirstLine + tableDelimiter) +
        cellPaddingForFirstLine +
        delimiterOnEnd +
        lineBreak
    }
    return s
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
  stream.once('end', () => {
    finished = true
    notify()
  })
  stream.once('close', () => {
    finished = true
    notify()
  })
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
