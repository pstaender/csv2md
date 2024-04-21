import { parse } from "csv-parse/sync";

export interface Options {
  pretty?: boolean;
  csvComment?: string | undefined;
  csvDelimiter?: string | undefined;
  csvQuote?: string | undefined;
  csvEscape?: string | undefined;
  tableDelimiter?: string;
  cellPadding?: string;
  firstLineMarker?: string;
  delimiterOnBegin?: string | undefined;
  delimiterOnEnd?: string | undefined;
  lineBreak?: string;
  prettyCellSpace?: string;
}

export class Csv2md implements Options {
  pretty = false;
  tableDelimiter = "|";
  cellPadding = " ";
  firstLineMarker = "-*";
  delimiterOnBegin = "";
  delimiterOnEnd = "";
  lineBreak = "\n";
  prettyCellSpace = " ";

  csvComment?: string;
  csvDelimiter: string;
  csvQuote?: string;
  csvEscape?: string;

  private isFirstLine = true;

  private rows: any[] = [];

  constructor(options: Options = {}) {
    if (options.pretty !== undefined) this.pretty = options.pretty;
    if (this.pretty) {
      // for pretty we assume a table delimiter as well at the beginning and at the end by default
      this.delimiterOnBegin = this.delimiterOnEnd = this.tableDelimiter;
    }
    if (typeof options.tableDelimiter === "string")
      this.tableDelimiter = options.tableDelimiter;
    if (typeof options.cellPadding === "string")
      this.cellPadding = options.cellPadding;
    if (typeof options.firstLineMarker === "string")
      this.firstLineMarker = options.firstLineMarker;
    if (typeof options.csvComment === "string")
      this.csvComment = options.csvComment;
    if (options.delimiterOnBegin !== undefined)
      this.delimiterOnBegin = options.delimiterOnBegin;
    if (options.delimiterOnEnd !== undefined)
      this.delimiterOnEnd = options.delimiterOnEnd;
    if (typeof options.lineBreak === "string")
      this.lineBreak = options.lineBreak;
    if (typeof options.prettyCellSpace === "string")
      this.prettyCellSpace = options.prettyCellSpace;

    this.csvComment = options.csvComment;
    this.csvDelimiter = options.csvDelimiter;
    this.csvQuote = options.csvQuote;
    this.csvEscape = options.csvEscape;
  }

  rowToString(
    record: any[],
    isFirstLine = false,
    cellsForPrettyPadding: any[] | null
  ): string {
    let firstLineMarker = this.firstLineMarker;
    var firstLineMarkerRepeat = Boolean(
      firstLineMarker.length === 2 && firstLineMarker[1] === "*"
    );
    var cellPaddingForFirstLine = firstLineMarkerRepeat
      ? firstLineMarker[0]
      : this.cellPadding;

    var s = "";
    for (var column = 0; column < record.length; column++) {
      if (cellsForPrettyPadding) {
        record[column] = this.paddedCells(
          record[column],
          column,
          cellsForPrettyPadding
        );
      } else {
        record[column] = record[column].trim();
      }
    }
    s +=
      (this.delimiterOnBegin ? this.delimiterOnBegin + this.cellPadding : "") +
      record.join(this.cellPadding + this.tableDelimiter + this.cellPadding) +
      (this.delimiterOnEnd ? this.cellPadding + this.delimiterOnEnd : "") +
      this.lineBreak;
    // attach first Line seperator
    if (isFirstLine) {
      let headingSeperatorLine = this.headingSeperatorLine(
        record,
        cellsForPrettyPadding,
        firstLineMarkerRepeat,
        firstLineMarker,
        cellPaddingForFirstLine
      );
      s +=
        this.delimiterOnBegin +
        headingSeperatorLine +
        cellPaddingForFirstLine +
        this.delimiterOnEnd +
        this.lineBreak;
    }
    return s;
  }

  private paddedCells(
    record: string,
    column: any,
    cellsForPrettyPadding: any[]
  ) {
    return (
      record.trim() +
      Array(cellsForPrettyPadding[column] - (record.trim().length - 1)).join(
        this.prettyCellSpace
      )
    );
  }

  private headingSeperatorLine(
    record: any[],
    cellsForPrettyPadding: any[] | null,
    firstLineMarkerRepeat: boolean,
    firstLineMarker: string,
    cellPaddingForFirstLine: string
  ): string {
    var a = [];
    for (var i = 0; i < record.length; i++) {
      if (cellsForPrettyPadding) {
        if (firstLineMarkerRepeat) {
          a[i] = Array(cellsForPrettyPadding[i] + 2).join(firstLineMarker[0]);
        } else {
          a[i] = firstLineMarker.substr(0, cellsForPrettyPadding[0]);
        }
      } else {
        if (firstLineMarkerRepeat) {
          a[i] = Array(3).join(firstLineMarker[0]);
        } else {
          a[i] = firstLineMarker;
        }
      }
    }
    return a.join(cellPaddingForFirstLine + this.tableDelimiter);
  }

  rowsToString(rows: any[] = this.rows): string {
    var maxLength = Array.apply(null, new Array(rows[0].length)).map(
      Number.prototype.valueOf,
      this.firstLineMarker.length
    );
    var isFirstLine = true;
    var s = "";
    if (this.pretty) {
      rows.map(function (row) {
        row.map(function (cell: any, columnIndex: any) {
          if (String(cell).trim().length > maxLength[columnIndex]) {
            maxLength[columnIndex] = String(cell).trim().length;
          }
        });
      });
    }
    rows.map((row) => {
      s += this.rowToString(row, isFirstLine, this.pretty ? maxLength : null);
      if (isFirstLine) {
        isFirstLine = false;
      }
    });
    // to reuse transform
    this.isFirstLine = true;
    return s;
  }

  addRow(row: any[]): any[] {
    this.rows.push(row);
    return this.rows;
  }

  transform(record: any[], cb: Function): Function {
    let s = null;
    if (this.pretty) {
      this.addRow(record);
    } else {
      s = this.rowToString(record, this.isFirstLine, null);
      if (this.isFirstLine) {
        this.isFirstLine = false;
      }
    }
    return cb(null, s);
  }

  csv2md(csv: string): string {
    const data = parse(csv, {
      comment: this.csvComment,
      delimiter: this.csvDelimiter,
      quote: this.csvQuote,
      escape: this.csvEscape,
    });
    return this.rowsToString(data);
  }

  async convert(csv: string) {
    // TODO: make this "real" async via transformer -> e.g. https://stackoverflow.com/a/51711076
    return this.csv2md(csv);
  }
}

export function csv2md(csv: string, options: Options = {}): string {
  return new Csv2md(options).csv2md(csv);
}
