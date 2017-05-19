// TODO: merge with additional reporters

const basicReporter = require('../lib/plugins/reporters/basic')
const save = require('../lib/plugins/processors/save')
const basicUI = require('../lib/plugins/ui/basic')

export default {
  files: 'test/fixtures/multiple.js',
  serverPort: 3000,
  runnerPort: 3001,
  plugins: [
    basicReporter(),
    save({
      dest: '.speedracer',
      traces: true,
      reports: true
    }),
    basicUI()
  ]
}
