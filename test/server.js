// Native
const http = require('http')
const net = require('net')

// Packages
import test from 'ava'

// Ours
import startServer from '../lib/server'

test.cb('start server', t => {
  const cleanup = client => {
    client.removeAllListeners()
    client.end()
    client.destroy()
    client.unref()
  }

  startServer({ baseDir: '.', port: 3000 }).then(server => {
    const client = net.createConnection(3000)
    client.once('error', () => {
      server.close()
      cleanup(client)
      t.fail()
    })
    client.once('connect', () => {
      server.close()
      cleanup(client)
      t.end()
    })
  })
})

test.cb('serve html for a script name', t => {
  startServer({ baseDir: '.', port: 3000 }).then(server => {
    http.request({
      host: 'localhost',
      port: 3000,
      path: '/test/fixtures/high-cpu'
    }, res => {
      res.setEncoding('utf8')
      res.on('data', chunk => {
        t.true(~chunk.indexOf('<script src="high-cpu.js">'))
        server.close()
      })
      t.end()
    }).end()
  })
})

test.cb('serve the script itself', t => {
  startServer({ baseDir: '.', port: 3000 }).then(server => {
    http.request({
      host: 'localhost',
      port: 3000,
      path: '/test/fixtures/high-cpu.js'
    }, res => {
      res.setEncoding('utf8')
      res.on('data', chunk => {
        t.true(chunk.startsWith('const isPrime'))
        server.close()
      })
      t.end()
    }).end()
  })
})

test.cb('accept a base directory', t => {
  startServer({ baseDir: 'test/fixtures', port: 3000 }).then(server => {
    http.request({
      host: 'localhost',
      port: 3000,
      path: '/high-cpu.js'
    }, res => {
      res.setEncoding('utf8')
      res.on('data', chunk => {
        t.true(chunk.startsWith('const isPrime'))
        server.close()
      })
      t.end()
    }).end()
  })
})
