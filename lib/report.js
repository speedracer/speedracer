const DevtoolsTimelineModel = require('devtools-timeline-model')
const analyzeProfiling = require('./reporters/profiling')
const analyzeRendering = require('./reporters/rendering')
const { readFile } = require('./.internal/util')

class Report {
  constructor(metada, trace = null) {
    this.metada = metada

    if (trace) {
      const model = new DevtoolsTimelineModel(trace.events)
      this.profiling = analyzeProfiling(model, trace.events)
      this.rendering = analyzeRendering(model, trace.events)
    }
  }

  get title() {
    return this.metada.title
  }

  serialize() {
    return JSON.stringify(this, null, 2)
  }
}

const loadReport = file =>
readFile(file)
  .then(JSON.parse)
  .then(data => {
    const report = new Report(data.metada)
    report.profiling = data.profiling
    report.rendering = data.rendering
    return report
  })

module.exports = Report
module.exports.loadReport = loadReport
