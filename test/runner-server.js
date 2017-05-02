// Packages
import test from 'ava'
import WebSocket from 'ws'

// Ours
import startRunnerServer from '../lib/runner-server'

test.cb('start a server', t => {
  startRunnerServer({ port: 3001 }).then(server => {
    const client = new WebSocket('ws://localhost:3001')
    client.on('open', () => {
      client.close()
      server.close().then(t.end)
    })
  })
})

test.cb('emit an event on a message', t => {
  startRunnerServer({ port: 3001 }).then(server => {
    const client = new WebSocket('ws://localhost:3001')
    server.on('file:start', () => {
      client.close()
      server.close().then(t.end)
    })
    client.on('open', () =>
      client.send(JSON.stringify({ type: 'file:start' }))
    )
  })
})

test.cb('acknowledge a message', t => {
  startRunnerServer({ port: 3001 }).then(server => {
    const client = new WebSocket('ws://localhost:3001')
    client.on('open', () =>
      server.acknowledge('file:start')
    )
    client.on('message', payload => {
      t.deepEqual(JSON.parse(payload), { type: 'file:start:ack' })
      client.close()
      server.close().then(t.end)
    })
  })
})
