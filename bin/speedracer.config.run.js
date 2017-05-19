// TODO: merge with additional reporters

const defaultLoader = require('../lib/plugins/loaders/default')
const defaultReporter = require('../lib/plugins/reporters/default')
const save = require('../lib/plugins/processors/save')
const defaultUI = require('../lib/plugins/ui/default')

export default {
  files: 'test/fixtures/multiple.js',
  serverPort: 3000,
  runnerPort: 3001,
  plugins: [
    defaultLoader(),
    defaultReporter(),
    save({
      dest: '.speedracer',
      traces: true,
      reports: true
    }),
    defaultUI()
  ]
}
