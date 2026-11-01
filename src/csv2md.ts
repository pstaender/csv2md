// Synchronous API (compatible with csv2md v1): `import { csv2md, Csv2md } from 'csv2md'`
// For the promise based API see `csv2md/promises`.
import { parse as parseSync } from 'csv-parse/sync'
import { Formatter, type Options, type Row } from './formatter.ts'

export type { Options, Row }

export class Csv2md extends Formatter {
  private isFirstLine = true

  private rows: Row[] = []

  /** Converts a CSV string to a markdown table. */
  csv2md(csv: string): string {
    return this.rowsToString(parseSync(csv, this.csvParseOptions()))
  }

  /** Converts a CSV string to a markdown table (resolves with `csv2md()`). */
  async convert(csv: string): Promise<string> {
    return this.csv2md(csv)
  }

  /** Formats parsed rows; defaults to the rows collected by `transform()`. */
  override rowsToString(rows: Row[] = this.rows): string {
    // to reuse transform
    this.isFirstLine = true
    return super.rowsToString(rows)
  }

  override rowToString(
    record: Row,
    isFirstLine = false,
    cellsForPrettyPadding: number[] | null = null
  ): string {
    return super.rowToString(record, isFirstLine, cellsForPrettyPadding)
  }

  /** Collects a row for a later `rowsToString()` call. */
  addRow(row: Row): Row[] {
    this.rows.push(row)
    return this.rows
  }

  /**
   * Record handler for stream-transform. Regular tables pass on each formatted
   * row; pretty tables collect the rows for a final `rowsToString()` call.
   * @deprecated use `chunks()` from `csv2md/promises` instead
   */
  transform(
    record: Row,
    cb: (err: Error | null, result: string | null) => void
  ): void {
    let s: string | null = null
    if (this.pretty) {
      this.addRow(record)
    } else {
      s = this.rowToString(record, this.isFirstLine)
      this.isFirstLine = false
    }
    cb(null, s)
  }
}

/** Converts a CSV string to a markdown table. */
export function csv2md(csv: string, options: Options = {}): string {
  return new Csv2md(options).csv2md(csv)
}
