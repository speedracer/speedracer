const startServer = require('./lib/server')
const createRunner = require('./lib/runner-server')

startServer({ baseDir: process.cwd(), port: 3000 })
createRunner({ port: 3001 })
  .then(runner => {
    runner.on('run:start', () => console.log('START'))
  })
