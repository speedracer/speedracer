class ReportLoader {
  load({ file, data }) {
    if (file.endsWith('.speedracer')) {
      this.report = JSON.parse(data)
      return false
    }
  }

  transformReport({ file, race, report }) {
    if (this.report) {
      return this.report
    }
  }

  onReport() {
    this.report = null
  }
}

module.exports = () => (
  new ReportLoader()
)
