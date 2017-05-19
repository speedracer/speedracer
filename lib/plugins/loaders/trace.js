class TraceLoader {
  load({ file, data }) {
    // TODO: load associated file

    // skip the file, it will also skip the trace
    return false
  }

  // TODO: search a way to inject traces
}

module.exports = () => (
  new TraceLoader()
)
