// Shared, synchronous core of both APIs: options and markdown formatting.
// The entry points (csv2md.ts, promises.ts) only differ in how they parse CSV.

export type Row = string[]

export interface Options {
  pretty?: boolean
  csvComment?: string | undefined
  csvDelimiter?: string | undefined
  csvQuote?: string | undefined
  csvEscape?: string | undefined
  tableDelimiter?: string
  cellPadding?: string
  firstLineMarker?: string
  delimiterOnBegin?: string | undefined
  delimiterOnEnd?: string | undefined
  lineBreak?: string
  prettyCellSpace?: string
}

export class Formatter implements Options {
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

  /** Formats already parsed rows as a markdown table. */
  rowsToString(rows: Row[]): string {
    if (rows.length === 0) return ''
    const columnWidths = this.pretty ? this.columnWidths(rows) : null
    return rows
      .map((row, index) => this.rowToString(row, index === 0, columnWidths))
      .join('')
  }

  /** Options for csv-parse, shared by the sync and the streaming parser. */
  protected csvParseOptions() {
    return {
      comment: this.csvComment,
      delimiter: this.csvDelimiter,
      quote: this.csvQuote,
      escape: this.csvEscape
    }
  }

  protected columnWidths(rows: Row[]): number[] {
    const widths: number[] = rows[0].map(() => this.firstLineMarker.length)
    for (const row of rows) {
      row.forEach((cell, column) => {
        widths[column] = Math.max(widths[column], String(cell).trim().length)
      })
    }
    return widths
  }

  /**
   * Formats a single row (plus the heading separator line for the first row).
   * `columnWidths` pads the cells for pretty output; `null` disables padding.
   */
  protected rowToString(
    row: Row,
    isFirstLine = false,
    columnWidths: number[] | null = null
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
