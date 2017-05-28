class DefaultReporter {
  report({ file, race, events }) {
    return createReport(race)
  }
}

module.exports = () => new DefaultReporter()
