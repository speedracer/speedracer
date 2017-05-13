// Packages
const DevtoolsTimelineModel = require('devtools-timeline-model')

// Ours
const analyzeProfiling = require('./analyzers/profiling')
const analyzeRendering = require('./analyzers/rendering')
const { readFile } = require('./.internal/util')

class Report {
  constructor(metadata, trace = null) {
    this.metadata = metadata

    if (trace) {
      const model = new DevtoolsTimelineModel(trace.events)
      this.profiling = analyzeProfiling(model, trace.events)
      this.rendering = analyzeRendering(model, trace.events)
    }
  }

  get title() {
    return this.metadata.title
  }

  serialize() {
    return JSON.stringify(this, null, 2)
  }
}

const loadReport = file =>
readFile(file)
  .then(JSON.parse)
  .then(data => {
    const report = new Report(data.metadata)
    report.profiling = data.profiling
    report.rendering = data.rendering
    return report
  })

module.exports = Report
module.exports.loadReport = loadReport
