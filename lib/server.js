// Native
const path = require('path')
const http = require('http')

// Ours
const createBundleStream = require('./bundler')
const debug = require('debug')('server')

const serveScript = (res, file, { baseDir, clientPort }) => {
  res.writeHead(200, { 'content-type': 'application/javascript' })
  createBundleStream(path.join(baseDir, file), { port: clientPort })
    .on('error', err => {
      res.write(`throw new Error("${err.message}")`)
      res.end()
    })
    .pipe(res)
}

const servePage = (res, file) => {
  res.write(`
    <!doctype html>
    <meta charset="utf-8">
    <link rel="icon" href="data:;base64,iVBORw0KGgo=">
    <script defer src="/${file}.js"></script>
  `)
  res.end()
}

const startServer = (options) =>
new Promise((resolve, reject) => {
  debug('start server')

  const server = http.createServer((req, res) => {
    let url = req.url.slice(1)

    if (url.endsWith('.js')) {
      serveScript(res, url, options)
    }
    else {
      servePage(res, url)
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

module.exports = startServer
