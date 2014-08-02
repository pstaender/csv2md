# Transform csv data to markdown table data

Install with:

```sh
  $ (sudo) npm install -g csv2md
```

Very basic tool (just wrote it to get csv in pandoc markdown). It just processes `stdin`, no file reading included.

# Usage

```sh
  $ cat data.csv | csv2md

  max_i | min_i | max_f | min_f
  --- | --- | --- | ---
  -122.1430195 | -122.1430195 | -122.415278 | 37.778643
  -122.1430195 | -122.1430195 | -122.40815 | 37.785034
  -122.4194155 | -122.4194155 | -122.4330827 | 37.7851673
  -122.4194155 | -122.4194155 | -122.4330827 | 37.7851673
  -118.4911912 | -118.4911912 | -118.3672828 | 33.9164666
  -121.8374777 | -121.8374777 | -121.8498415 | 39.7241178
  -115.172816 | -115.172816 | -115.078011 | 36.1586877
  -82.5618186 | -82.5618186 | -79.2274115 | 37.9308282
  -79.9958864 | -79.9958864 | -80.260396 | 40.1787544
  -74.1243063 | -74.1243063 | -74.040948 | 40.729688
```

# TODO

Create basic interface, i.e. make parameters available (e.g. delimiter, encoding etc …)
