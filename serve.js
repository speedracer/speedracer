const startServer = require('./lib/start-server')
const createRunner = require('./lib/runner')

startServer(process.cwd())
createRunner({ port: 3001 })
  .then(runner => {
    runner.on('run:start', () => console.log('START'))
  })
