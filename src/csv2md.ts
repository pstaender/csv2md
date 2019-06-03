// export interface Options {
//   pretty?: boolean
//   stream?: boolean
//   csvComment?: string | undefined
//   csvDelimiter?: string | undefined
//   csvQuote?: string | undefined
//   csvEscape?: string | undefined
//   tableDelimiter?: string
//   cellPadding?: string
//   firstLineMarker?: string
//   delimiterOnBegin?: string
//   delimiterOnEnd?: string
//   lineBreak?: string
//   prettyCellSpace?: string
// }

// export const defaultOptions: Options = {
//   pretty: true,
//   stream: false,
//   csvComment: undefined,
//   csvDelimiter: ',',
//   csvQuote: '"',
//   csvEscape: '"',
//   tableDelimiter: '|',
//   cellPadding: ' ',
//   firstLineMarker: '-*',
//   delimiterOnBegin: '',
//   delimiterOnEnd: '',
//   lineBreak: '\n',
//   prettyCellSpace: ' '
// }

// export interface options {
//   tableDelimiter?: string
//   cellPadding?: string
//   firstLineMarker?: string
//   pretty?: boolean
//   stream?: boolean
//   prettyCellSpace?: string
//   lineBreak?: string
//   delimiterOnBegin?: string
//   delimiterOnEnd?: string
//   csvComment?: string
//   csvEscape?: string
//   csvQuote?: string
//   csvDelimiter?: string
// }

export class Csv2md {
  pretty: Boolean
  stream: Boolean
  tableDelimiter = '|'
  cellPadding = ' '
  firstLineMarker = '-*'
  delimiterOnBegin = ''
  delimiterOnEnd = ''
  lineBreak = '\n'
  prettyCellSpace = ' '

  csvComment: string | undefined
  csvDelimiter: string | undefined
  csvQuote: string | undefined
  csvEscape: string | undefined

  private rows: any[]

  constructor(
    pretty = true,
    stream = false,
    tableDelimiter = '|',
    cellPadding = ' ',
    firstLineMarker = '-*',
    delimiterOnBegin = '',
    delimiterOnEnd = '',
    lineBreak = '\n',
    prettyCellSpace = ' ',
    csvComment: string | undefined,
    csvDelimiter: string | undefined, // = ',',
    csvQuote: string | undefined, //'"',
    csvEscape: string | undefined //'"',
  ) {
    this.pretty = pretty
    this.stream = stream
    this.tableDelimiter = tableDelimiter
    this.cellPadding = cellPadding
    this.firstLineMarker = firstLineMarker
    this.csvComment = csvComment
    this.delimiterOnBegin = delimiterOnBegin
    this.delimiterOnEnd = delimiterOnEnd
    this.lineBreak = lineBreak
    this.prettyCellSpace = prettyCellSpace
    this.csvComment = csvComment
    this.csvDelimiter = csvDelimiter
    this.csvQuote = csvQuote
    this.csvEscape = csvEscape
    this.rows = []
  }

  rowToString(record: any, isFirstLine = false, cell: [any]) {
    let pretty = this.pretty
    let firstLineMarker = this.firstLineMarker
    let firstLineMarkerRepeat =
      firstLineMarker.length === 2 && firstLineMarker[1] === '*'
    var cellPaddingForFirstLine = firstLineMarkerRepeat
      ? firstLineMarker[0]
      : this.cellPadding

    let s = ''
    for (let column = 0; column < record.length; column++) {
      if (pretty) {
        record[column] =
          record[column].trim() +
          Array(cell[column] - (record[column].trim().length - 1)).join(
            this.prettyCellSpace
          )
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
        if (pretty) {
          if (firstLineMarkerRepeat) {
            a[i] = Array(cell[i] + 1).join(firstLineMarker[0])
          } else {
            a[i] = firstLineMarker.substr(0, cell[0])
          }
        } else {
          if (firstLineMarkerRepeat) {
            a[i] = Array(2).join(firstLineMarker[0])
          } else {
            a[i] = firstLineMarker
          }
        }
      }
      s +=
        (this.delimiterOnBegin
          ? this.delimiterOnBegin + cellPaddingForFirstLine
          : '') +
        a.join(
          cellPaddingForFirstLine +
            this.tableDelimiter +
            cellPaddingForFirstLine
        ) +
        (this.delimiterOnEnd
          ? cellPaddingForFirstLine + this.delimiterOnEnd
          : '') +
        this.lineBreak
    }
    return s
  }

  rowsToString(rows: any[] = this.rows) {
    var maxLength = Array.apply(null, new Array(rows[0].length)).map(
      Number.prototype.valueOf,
      exports.options.firstLineMarker.length
    )
    var isFirstLine = true
    var s = ''
    if (exports.options.pretty) {
      rows.map(function(row) {
        row.map(function(cell: any, columnIndex: any) {
          if (String(cell).trim().length > maxLength[columnIndex]) {
            maxLength[columnIndex] = String(cell).trim().length
          }
        })
      })
    }
    rows.map(function(row) {
      s += exports.rowToString(
        row,
        isFirstLine,
        exports.options.pretty ? maxLength : null
      )
      if (isFirstLine) {
        isFirstLine = false
      }
    })
    return s
  }

  addRow(row: any[]) {
    this.rows.push(row)
    return exports.rows
  }

  // convert(csv: string) {
  //   // options = mergeWithDefaultOptions(options)
  //   var data = require('csv-parse/lib/sync')(csv, {
  //     comment: options.csvComment,
  //     delimiter: options.csvDelimiter,
  //     quote: options.csvQuote,
  //     escape: options.csvEscape
  //   })
  //   exports.setOptions(options)
  //   return exports.rowsToString(data)
  // }
}
