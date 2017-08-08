# Transforms csv to markdown table

Install with:

```sh
  $ (sudo) npm install -g csv2md
```

Small tool to convert (larger) csv to markdown tables. Processes `stdin` or csv file.

## Usage

```sh
  $ csv2md data.csv > data.md
```

Piping data is possible (and recommend for larger files):

```sh
  $ cat data.csv | csv2md

  | max_i | min_i | max_f | min_f |
  |---|---|---|---|
  | -122.1430195 | -122.1430195 | -122.415278 | 37.778643 |
  | -122.1430195 | -122.1430195 | -122.40815 | 37.785034 |
  | -122.4194155 | -122.4194155 | -122.4330827 | 37.7851673 |
  …
```

```sh
  $ cat data.csv | csv2md > data.md
```

The `pretty` option will pad cells to uniform width, but will disable stream processing.

```sh
  $ csv2md --pretty data.csv > data.md

  | max_i        | min_i        | max_f        | min_f      |
  |--------------|--------------|--------------|------------|
  | -122.1430195 | -122.1430195 | -122.415278  | 37.778643  |
  | -122.1430195 | -122.1430195 | -122.40815   | 37.785034  |
  | -122.4194155 | -122.4194155 | -122.4330827 | 37.7851673 |
  …
```

## Options

Use `-h` for more command options:

```sh
  $ csv2md -h
```

## Tests

Ensure that you have mocha installed `npm install -g mocha`, then run:

```sh
  $ npm run test
```

## TODO

  * file writing
