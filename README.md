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
  $ data.csv < csv2md

  max_i | min_i | max_f | min_f
  --|---|---|--
  -122.1430195 | -122.1430195 | -122.415278 | 37.778643
  -122.1430195 | -122.1430195 | -122.40815 | 37.785034
  -122.4194155 | -122.4194155 | -122.4330827 | 37.7851673
```

To write the resulting markdown to a file, use the familiar stream syntax:

```sh
  $ csv2md < data.csv > data.md
```

### Pretty Markdown

The `pretty` option will pad cells to uniform width and using additional `|`-delimiters by default:

```sh
  $ csv2md -p < data.csv

  | max_i        | min_i        | max_f        | min_f      |
  |--------------|--------------|--------------|------------|
  | -122.1430195 | -122.1430195 | -122.415278  | 37.778643  |
  | -122.1430195 | -122.1430195 | -122.40815   | 37.785034  |
  | -122.4194155 | -122.4194155 | -122.4330827 | 37.7851673 |
```

It looks much nicer than the default inline-style but will disable stream processing.

## Options

Use `-h` for more command options:

```sh
  $ csv2md -h
```

## Using csv2md programatically

```js
import { Csv2md } from 'csv2md'

let csvString = fs.readFileSync(__dirname + '/data.csv').toString()

let csv2md = new Csv2md.new({
  pretty: true
})

let markdown = await csv2md.convert(csvString)

console.log(markdown)
```

### Synchronous usage

```js
import { Csv2md, csv2md } from 'csv2md'

let csvString = `
a,b,c_1,c_2
-122.1430195,124.3,true,false
null, a ,a very long string,~
a,b,c_1,c_2`.trim()

let markdown = csv2md(csvString, {
  pretty: true
})

console.log(markdown)
```

## Contributors

- [dbohdan](https://github.com/dbohdan)
