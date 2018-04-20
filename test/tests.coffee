defaultOptions = {
  pretty:           false
  stream:           false
  tableDelimiter:   '|'
  firstLineMarker:  '-*'
  cellPadding:      ' '
  delimiterOnBegin: '|'
  delimiterOnEnd:   '|'
  csvComment:       '#'
  csvDelimiter:     ','
  csvQuote:         '"'
  csvEscape:        '"'
  prettyCellSpace:  ' '
}

csvOptions = {
  comment:          defaultOptions.csvComment
  delimiter:        defaultOptions.csvDelimiter
  quote:            defaultOptions.csvQuote
  escape:           defaultOptions.csvEscape
}

chai    = require('chai')
parse   = require('csv-parse')
csv2md  = require('../src/csv2md')
expect  = chai.expect

csvString = require('fs').readFileSync(__dirname+'/example1.csv').toString()
csvData   = []


describe 'markdown table output', ->

  before (done) ->
    parse csvString, csvOptions, (err, data) ->
      csvData = data
      expect(err).to.be.equal null
      done()

  it 'expect to have a parsable, multiline csv file', ->
    # properly we should not test the parser here
    # but we must ensure that we have a valid csv file
    expect(csvString.match(/\n/).length).to.be.above 0
    expect(csvData).to.have.length.above 0
    expect(csvData[0]).to.have.length.above 0


  it 'expect to transform to a simple markdown table with default values', ->
    csv2md.setOptions(defaultOptions)
    md = csv2md.rowsToString(csvData)
    expect(md.trim()).to.be.equal """
    | a | b | c_1 | c_2 |
    |---|---|---|---|
    | -122.1430195 | 124.3 | true | false |
    | null | a | a very long string | ~ |
    | a | b | c_1 | c_2 |
    """

  it 'expect to transform to a simple markdown table in pretty', ->
    csv2md.setOptions(defaultOptions)
    csv2md.setOptions({ pretty: true })
    md = csv2md.rowsToString(csvData)
    expect(md.trim()).to.be.equal """
    | a            | b     | c_1                | c_2   |
    |--------------|-------|--------------------|-------|
    | -122.1430195 | 124.3 | true               | false |
    | null         | a     | a very long string | ~     |
    | a            | b     | c_1                | c_2   |
    """

  it 'expect to transform to a simple markdown table with various options', ->
    csv2md.setOptions(defaultOptions)
    csv2md.setOptions
      tableDelimiter:   '$'
      firstLineMarker:  '+*'
      cellPadding:      '_'
      delimiterOnBegin: '/'
      delimiterOnEnd:   '\\'
    md = csv2md.rowsToString(csvData)
    expect(md.trim()).to.be.equal """
      /_a_$_b_$_c_1_$_c_2_\\
      /+++$+++$+++$+++\\
      /_-122.1430195_$_124.3_$_true_$_false_\\
      /_null_$_a_$_a very long string_$_~_\\
      /_a_$_b_$_c_1_$_c_2_\\
    """
    csv2md.setOptions({ pretty: true, prettyCellSpace: '…' })
    md = csv2md.rowsToString(csvData)
    expect(md.trim()).to.be.equal """
      /_a……………………………_$_b…………_$_c_1………………………………………_$_c_2……_\\
      /++++++++++++++$+++++++$++++++++++++++++++++$+++++++\\
      /_-122.1430195_$_124.3_$_true……………………………………_$_false_\\
      /_null……………………_$_a…………_$_a very long string_$_~…………_\\
      /_a……………………………_$_b…………_$_c_1………………………………………_$_c_2……_\\
    """

  it 'expect to transform also empty cells', (done) ->
    csvData = """
      foo,bar,baz
      a#,"b",c
      d,e,
      ,f,
      ,,
      g,h,i
    """
    parse csvData.trim(), {}, (err, rows) ->
      expect(err).to.be.equal null
      csv2md.setOptions(defaultOptions)
      csv2md.setOptions(pretty: true)
      expect(csv2md.rowsToString(rows).trim()).to.be.equal """
        | foo | bar | baz |
        |-----|-----|-----|
        | a#  | b   | c   |
        | d   | e   |     |
        |     | f   |     |
        |     |     |     |
        | g   | h   | i   |
      """.trim()
      done()

  it 'expect to transforms a csv string synchronously to markdown via require', ->
    csv = """
    foo,bar,baz
    a#,"b",c
    d,e,
    ,f,
    ,,
    g,h,i
    """
    expectedOutcome = """
    | foo | bar | baz |
    |---|---|---|
    | a# | b | c |
    | d | e |  |
    |  | f |  |
    |  |  |  |
    | g | h | i |
    """.trim()
    expect(
      require('../src/csv2md').csv2md(csv).trim()
    ).to.be.equal expectedOutcome
    expect(
      require('../src/csv2md').csv2md(csv, {}).trim()
    ).to.be.equal expectedOutcome
    expect(
      require('../src/csv2md').csv2md(csv, {
        tableDelimiter: 'ǁ'
        pretty: true
      }).trim()
    ).to.be.equal """
    ǁ foo ǁ bar ǁ baz ǁ
    ǁ-----ǁ-----ǁ-----ǁ
    ǁ a#  ǁ b   ǁ c   ǁ
    ǁ d   ǁ e   ǁ     ǁ
    ǁ     ǁ f   ǁ     ǁ
    ǁ     ǁ     ǁ     ǁ
    ǁ g   ǁ h   ǁ i   ǁ
    """.trim()
    
