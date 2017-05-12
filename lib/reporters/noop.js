class NoopReporter {
  start() {}
  finish() {}
  startFile() {}
  startRace() {}
  finishRace() {}
  finishFile() {}
  updateStatus() {}
  warn() {}
}

module.exports = NoopReporter
