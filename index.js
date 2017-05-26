const Chrome = require('./lib/modules/chrome')
const ChromeRemote = require('./lib/modules/chrome-remote')
const Driver = require('./lib/modules/driver')
const FileServer = require('./lib/modules/file-server')
const Runner = require('./lib/modules/runner')
const RunnerServer = require('./lib/modules/runner-server')
const speedracer = require('./lib/speedracer')
const Tracer = require('./lib/modules/tracer')

module.exports = options => (
  speedracer(options, {
    tracer: [Tracer,
      [Driver, [ChromeRemote, Chrome]],
      [Runner, RunnerServer]
    ],
    server: FileServer
  })
)
