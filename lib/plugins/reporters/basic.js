class BasicReporter {
  report({ file, race, events }) {
    race.createReport()
  }
}

module.exports = () => new BasicReporter()
