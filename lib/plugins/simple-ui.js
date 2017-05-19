class SimpleUI {
  onFileStart(file) {
    console.log('file started', file)
  }

  onFileFinish(file) {
    console.log('file finished', file)
  }

  onRaceStart(race) {
    console.log('race started', race)
  }

  onRaceFinish(race) {
    console.log('race finished', race)
  }

  onStatus(status) {
    console.log('status', status)
  }

  onWarn(warning) {
    console.log('warning', warning)
  }
}

module.exports = () => new SimpleUI()
