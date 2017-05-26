const debug = require('debug')('file-server')
const http = require('http')
const path = require('path')

const resolveFile = (file, baseDir) => (
  file[0] !== '/' ? path.join(baseDir, file) : file
)

const serveScript = (res, file, { baseDir, clientPort, plugins }) => {
  const filename = resolveFile(file, baseDir)
  debug('serve script', filename)

  res.writeHead(200, { 'content-type': 'application/javascript' })

  plugins.loadFile({
    file: filename,
    options: {
      port: clientPort,
      runtimePath: path.resolve(__dirname, '../runtime-runner.js')
    }
  })
  .then(code => res.end(code))
}

const servePage = (res, file, options) => {
  debug('serve page', file)

  res.write(`
    <!doctype html>
    <meta charset="utf-8">
    <link rel="icon" href="data:;base64,iVBORw0KGgo=">
    <script defer src="http://localhost:${options.port}/${file}.js"></script>
  `)
  res.end()
}

const startServer = (options, hooks) =>
new Promise((resolve, reject) => {
  debug('start server')

  const server = http.createServer((req, res) => {
    let url = req.url.slice(1)

    if (url.endsWith('.js')) {
      serveScript(res, url, options)
    }
    else {
      servePage(res, url, options)
    }
  }).listen(options.port, () => {
    debug('listening on port: %d', options.port)
    debug('serving directory: %s', options.baseDir)
    resolve(server)
  })

  server.once('error', err => {
    debug('server error: %s', err)
    resolve(false)
  })
})

module.exports = (options) => {
  startServer({
    baseDir: process.cwd(),
    port: options.port,
    clientPort: options.runnerPort
  })
}
