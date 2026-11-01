# Transforms csv to markdown table

[![Build Status](https://travis-ci.org/pstaender/csv2md.svg?branch=master)](https://travis-ci.org/pstaender/csv2md)

Install with:

```sh
  $ npm install -g csv2md
```

Small tool to convert (larger) csv to markdown tables. Processes `stdin` or csv file.

## Usage

```sh
  $ csv2md data.csv > data.md
```

Piping data is possible (and recommend for larger files):

```sh
  $ csv2md < data.csv

  max_i | min_i | max_f | min_f
  ---|---|---|---
  -122.1430195 | -122.1430195 | -122.415278 | 37.778643
  -122.1430195 | -122.1430195 | -122.40815 | 37.785034
  -122.4194155 | -122.4194155 | -122.4330827 | 37.7851673
```

To write the resulting markdown to a file, use the familiar stream syntax:

```sh
  $ csv2md < data.csv > data.md
```

### Pretty Markdown

The `pretty` / `p` option will pad cells to uniform width and uses beginning and ending `|`-delimiters by default:

```sh
  $ csv2md -p < data.csv

  | max_i        | min_i        | max_f        | min_f      |
  |--------------|--------------|--------------|------------|
  | -122.1430195 | -122.1430195 | -122.415278  | 37.778643  |
  | -122.1430195 | -122.1430195 | -122.40815   | 37.785034  |
  | -122.4194155 | -122.4194155 | -122.4330827 | 37.7851673 |
```

It's much more human readable than the default inline-style but will disable stream processing.

## Options

Use `-h` for more command options:

```sh
  $ csv2md -h
```

## Using csv2md programatically

All conversions are promise based. Input can be a string, a `Buffer`, a readable stream or any (async) iterable of strings/buffers.

```js
import { createReadStream } from 'node:fs'
import { Csv2md, csv2md } from 'csv2md'

// one-off conversion
const markdown = await csv2md('a,b\n1,2', { pretty: true })

// reusable converter, reading from a stream
const converter = new Csv2md({ pretty: true, csvDelimiter: ';' })
const table = await converter.convert(createReadStream('data.csv'))
```

### Streaming

`chunks()` yields the markdown table piece by piece. Regular tables are streamed row by row, pretty tables (which need all rows to compute the column widths) are yielded as one chunk.

```js
import { Csv2md } from 'csv2md'

for await (const chunk of new Csv2md().chunks(process.stdin)) {
  process.stdout.write(chunk)
}
```

### Other methods

- `records(input)` – async generator of the parsed CSV records (`string[]`)
- `rowsToString(rows)` – formats already parsed rows synchronously

> Requires Node.js 24 or newer. The package is ESM, but it can still be loaded via `require('csv2md')` thanks to Node's `require(esm)` support.

## Contributors

- [dbohdan](https://github.com/dbohdan)
