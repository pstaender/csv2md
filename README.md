# Transform csv data to markdown table data

Install with:

```sh
  $ (sudo) npm install -g csv2md
```

Very basic tool (just wrote it to get csv in pandoc markdown). It just processes `stdin`, no file reading included.

## Usage

```sh
  $ cat data.csv | csv2md

  | max_i | min_i | max_f | min_f |
  |===|===|===|===|
  | -122.1430195 | -122.1430195 | -122.415278 | 37.778643 |
  | -122.1430195 | -122.1430195 | -122.40815 | 37.785034 |
  …
```

```sh
  $ cat data.csv | csv2md --pretty

  | max_i        | min_i        | max_f        | min_f        |
  |==============|==============|==============|==============|
  | -122.1430195 | -122.1430195 | -122.415278  | 37.778643    |
  | -122.1430195 | -122.1430195 | -122.40815   | 37.785034    |
  …
```

## Options

Despite from `pretty` you can also set these options as well:

```sh
  $ csv2md -h

  Usage:
    csv2md                      [-hps] [--help] [--pretty] [--stream] [--tableDelimiter=STRING] [--cellPadding=STRING] [--firstLineMarker=STRING] [--csvComment=STRING] [--csvDelimiter=STRING] [--csvQuote=STRING] [--csvEscape=STRING] [--delimiterOnBegin=STRING] [--delimiterOnEnd=STRING]

  Example:
    cat data.csv | csv2md > data.md
    **important** it expects input on `stdin`

  Options:
    -h --help                   show this help message and exit
    -p --pretty                 pretty output, i.e. optimized column width (takes longer to process) [default: false]
    -s --stream                 stream processing [default: true]
    --tableDelimiter=STRING     delimiter for cells in output [default: |]
    --cellPadding=STRING        chars / spaces to wrap cell content [default: ' ']
    --firstLineMarker=STRING    to seperate first row [default: =*]
                                you can specifiy own characters, for instance:
                                `-*`      -> `----------…` (will be set to same width as cell)
                                `-====-`  -> `-====-`
    --delimiterOnBegin=STRING   first row delimiter [default: null]
    --delimiterOnEnd=STRING     last  row delimiter [default: null]
    --csvComment=STRING         ignore lines in csv starts with [default: #]
    --csvDelimiter=STRING       column delimiter [default: ,]
    --csvQuote=STRING           cell quote [default: "]
    --csvEscape=STRING          char to escape, see quoter [default: "]

  To define an empty string, simply set null

```

## TODO

  * tests
  * file reading + writing
