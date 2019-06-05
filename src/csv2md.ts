import * as parseSync from 'csv-parse/lib/sync'

export interface Options {
  pretty?: boolean
  csvComment?: string | undefined
  csvDelimiter?: string | undefined
  csvQuote?: string | undefined
  csvEscape?: string | undefined
  tableDelimiter?: string
  cellPadding?: string
  firstLineMarker?: string
  delimiterOnBegin?: string
  delimiterOnEnd?: string
  lineBreak?: string
  prettyCellSpace?: string
}

export class Csv2md implements Options {
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

  private rows: any[] = []

  constructor(options: Options = {}) {
    if (options.pretty !== undefined) this.pretty = options.pretty
    if (this.pretty) {
      // for pretty we assume a table delimiter as well at the beginning and at the end by default
      this.delimiterOnBegin = this.delimiterOnEnd = this.tableDelimiter
    }
    if (typeof options.tableDelimiter === 'string')
      this.tableDelimiter = options.tableDelimiter
    if (typeof options.cellPadding === 'string')
      this.cellPadding = options.cellPadding
    if (typeof options.firstLineMarker === 'string')
      this.firstLineMarker = options.firstLineMarker
    if (typeof options.csvComment === 'string')
      this.csvComment = options.csvComment
    if (typeof options.delimiterOnBegin === 'string')
      this.delimiterOnBegin = options.delimiterOnBegin
    if (typeof options.delimiterOnEnd === 'string')
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

  rowToString(
    record: any[],
    isFirstLine = false,
    cellsForPrettyPadding: any[] | null
  ): string {
    let firstLineMarker = this.firstLineMarker
    var firstLineMarkerRepeat = Boolean(
      firstLineMarker.length === 2 && firstLineMarker[1] === '*'
    )
    var cellPaddingForFirstLine = firstLineMarkerRepeat
      ? firstLineMarker[0]
      : this.cellPadding

    var s = ''
    for (var column = 0; column < record.length; column++) {
      if (cellsForPrettyPadding) {
        record[column] =
          record[column].trim() +
          Array(
            cellsForPrettyPadding[column] - (record[column].trim().length - 1)
          ).join(this.prettyCellSpace)
      } else {
        record[column] = record[column].trim()
      }
    }
    s +=
      (this.delimiterOnBegin ? this.delimiterOnBegin + this.cellPadding : '') +
      record.join(this.cellPadding + this.tableDelimiter + this.cellPadding) +
      (this.delimiterOnEnd ? this.cellPadding + this.delimiterOnEnd : '') +
      this.lineBreak
    // attach first Line seperator
    if (isFirstLine) {
      var a = []
      for (var i = 0; i < record.length; i++) {
        if (cellsForPrettyPadding) {
          if (firstLineMarkerRepeat) {
            a[i] = Array(cellsForPrettyPadding[i] + 2).join(firstLineMarker[0])
          } else {
            a[i] = firstLineMarker.substr(0, cellsForPrettyPadding[0])
          }
        } else {
          if (firstLineMarkerRepeat) {
            a[i] = Array(3).join(firstLineMarker[0])
          } else {
            a[i] = firstLineMarker
          }
        }
      }
      s +=
        (this.delimiterOnBegin || '') +
        a.join(cellPaddingForFirstLine + this.tableDelimiter) +
        cellPaddingForFirstLine +
        (this.delimiterOnEnd || '') +
        this.lineBreak
    }
    return s
  }

  rowsToString(rows: any[] = this.rows): string {
    var maxLength = Array.apply(null, new Array(rows[0].length)).map(
      Number.prototype.valueOf,
      this.firstLineMarker.length
    )
    var isFirstLine = true
    var s = ''
    if (this.pretty) {
      rows.map(function(row) {
        row.map(function(cell: any, columnIndex: any) {
          if (String(cell).trim().length > maxLength[columnIndex]) {
            maxLength[columnIndex] = String(cell).trim().length
          }
        })
      })
    }
    rows.map(row => {
      s += this.rowToString(row, isFirstLine, this.pretty ? maxLength : null)
      if (isFirstLine) {
        isFirstLine = false
      }
    })
    return s
  }

  addRow(row: any[]): any[] {
    this.rows.push(row)
    return this.rows
  }

  csv2md(csv: string): string {
    const data = parseSync(csv, {
      comment: this.csvComment,
      delimiter: this.csvDelimiter,
      quote: this.csvQuote,
      escape: this.csvEscape
    })
    return this.rowsToString(data)
  }

  async convert(csv: string) {
    // TODO: make this "real" async via transformer -> e.g. https://stackoverflow.com/a/51711076
    return this.csv2md(csv)
  }
}

export function csv2md(csv: string, options: Options = {}) {
  return new Csv2md(options).csv2md(csv)
}
