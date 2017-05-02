// Packages
import mock from 'mock-require'
import sinon from 'sinon'

export const HeapProfiler = {
  collectGarbage: sinon.spy()
}

export const Page = {
  enable: sinon.spy(),
  navigate: sinon.spy()
}

export const Tracing = {
  callbacks: {},

  start: sinon.spy(() => {
    setImmediate(() => {
      if (Tracing.callbacks.dataCollected) Tracing.callbacks.dataCollected({ value: [] })
      if (Tracing.callbacks.bufferUsage) Tracing.callbacks.bufferUsage({ percentFull: 0.01 })
    })

    return Promise.resolve()
  }),

  end: sinon.spy(() => {
    setImmediate(() => {
      if (Tracing.callbacks.tracingComplete) Tracing.callbacks.tracingComplete()
    })
    return Promise.resolve()
  }),

  bufferUsage: sinon.spy(callback => {
    Tracing.callbacks.bufferUsage = sinon.spy(callback)
  }),

  dataCollected: sinon.spy(callback => {
    Tracing.callbacks.dataCollected = sinon.spy(callback)
  }),

  tracingComplete: sinon.spy(callback => {
    Tracing.callbacks.tracingComplete = sinon.spy(callback)
  })
}

export const close = sinon.spy()

mock('chrome-remote-interface', callback => {
  callback({ HeapProfiler, Page, Tracing, close })
})
