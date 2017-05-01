// Native
const fs = require('fs')
const path = require('path')
const http = require('http')

// Packages
const pify = require('pify')

const startServer = (basePath = '') =>
  pify(fs.readFile)(path.join(__dirname, 'runtime.js'), 'utf8').then(runtime =>
    new Promise((resolve, reject) => {
      const server = http.createServer((req, res) => {
        let url = req.url.slice(1)

        if (url.endsWith('.js')) {
          res.writeHead(200, { 'content-type': 'application/javascript' })

          fs.createReadStream(path.join(basePath, url))
            .on('error', err => {
              res.write(`throw new Error("${err.message}")`)
              res.end()
            })
            .pipe(res)
        }
        else {
          res.write(`
            <!doctype html>
            <meta charset="utf-8">
            <link rel="icon" href="data:;base64,iVBORw0KGgo=">
            <script defer>${runtime}</script>
            <script defer src="/${url}.js"></script>
          `)
          res.end()
        }
      }).listen(3000, () => resolve(server))

      server.once('error', () => {
        resolve(false)
      })
    })
  )

module.exports = startServer
