const defaultOptions = {
  name: 'Philipp'
}

interface Options {
  name?: string | null
  year?: number | null
}

class Test implements Options {
  name = defaultOptions.name
  year = 0
  constructor(options: Options) {
    if (options.name) {
      this.name = options.name
    }
  }
}

let myTest = new Test({ name: 'ok' })
