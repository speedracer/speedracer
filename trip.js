/**
 * The tracer takes a JavaScript file as input and output multiple traces corresponding to each
 * race defined in the file.
 */
class Tracer {

}

/**
 * The reporter takes a trace as input and extract useful informations from it to create a report.
 * A report can be used for later analyzis. The reporter uses a collection of extractors that
 * extract specific data from a trace.
 */
class Reporter {

}

// /**
//  * The analyzer takes one or several reports as input and analyze/compare/audit them depending on
//  * the needs.
//  */
// class Analyzer {
//
// }

/**
 * Speed Racer is in charge of executing those 3 steps. They are executed in a pipeline that offers
 * 2 flows: per file, per batch.
 *
 * Per file mode applies the 3 steps for each file sequentially. Once a file is done, another
 * is processed and so on.
 *
 * Per batch mode first traces all files (or until batch size is reached), then report and
 * finally analyze them.
 *
 * Depending on the needs one or the other model can be chosen.
 */
class SpeedRacer {
  run() {
    pipe({ files },
      trace,
      report,
      analyze
    )
  }
}

/* ────────────────────────────────────────────────────────────────────────── */

// stateless analyzer
const Analyzer = (report, speedracer) => {
  // do stuff...
}

// stateful analyzer
class Analyzer {
  constructor() {}

  analyze(report) {

  }

  onFileStarted() {

  }
}

/* ────────────────────────────────────────────────────────────────────────── */

export default {
  mode: 'race',
  reporters: ['summary', 'rendering'],
  analyzers: ['generate']
}

/* ────────────────────────────────────────────────────────────────────────── */

const Run = () => ({
  reporters: ['summary'],
  events: {
    startFile: (file) => {},
    startRace: (race) => {},
    finishRace: (race) => {},
    finishFile: (file) => {}
  }
})
