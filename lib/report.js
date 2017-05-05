// Packages
const DevtoolsTimelineModel = require('devtools-timeline-model')

// Ours
const analyzeProfiling = require('./analyzers/profiling')
const analyzeRendering = require('./analyzers/rendering')

class Report {
  constructor(meta, trace) {
    const model = new DevtoolsTimelineModel(trace.events)

    this.meta = meta
    this.profiling = analyzeProfiling(model, trace.events)
    this.rendering = analyzeRendering(model, trace.events)
  }

  serialize() {
    return JSON.stringify(this, null, 2)
  }
}

module.exports = Report
