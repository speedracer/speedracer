class TraceLoader {
  load({ file, data }) {
    if (file.endsWith('.report')) {
      this.trace = data
      return false
    }
  }

  transformTrace({ file, race, trace }) {
    if (this.trace) {
      return this.trace
    }
  }

  onTrace() {
    this.trace = null
  }
}

module.exports = () => (
  new TraceLoader()
)
