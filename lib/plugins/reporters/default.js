class DefaultReporter {
  report({ file, race, events }) {
    race.createReport()
  }
}

module.exports = () => new DefaultReporter()
