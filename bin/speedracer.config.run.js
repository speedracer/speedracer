// TODO: merge with additional reporters

const summary = require('../lib/reporters/summary')
const simpleUI = require('../lib/plugins/simple-ui')

export default {
  files: 'test/fixtures/multiple.js',
  dest: '.speedracer',
  saveTraces: true,
  saveReports: true,
  serverPort: 3000,
  runnerPort: 3001,
  reporters: [
    summary()
  ],
  plugins: [
    simpleUI()
  ]
}
