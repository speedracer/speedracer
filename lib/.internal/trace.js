// https://github.com/GoogleChrome/lighthouse/blob/master/lighthouse-core/config/config.js#L35-L112
const cleanTrace = events => {
  // Keep track of most occuring threads
  const threads = []
  const countsByThread = {}
  const traceStartEvents = []
  const makeMockEvent = (evt, ts) => {
    return {
      pid: evt.pid,
      tid: evt.tid,
      // default to 0 for now
      ts: ts || 0,
      ph: 'I',
      cat: 'disabled-by-default-devtools.timeline',
      name: 'TracingStartedInPage',
      args: {
        data: {
          page: evt.frame
        }
      },
      s: 't'
    }
  }

  let frame
  let data
  let name
  let counter

  events.forEach((evt, idx) => {
    if (evt.name.startsWith('TracingStartedIn')) {
      traceStartEvents.push(idx)
    }

    // find the event's frame
    data = evt.args && (evt.args.data || evt.args.beginData || evt.args.counters)
    frame = (evt.args && evt.args.frame) || data && (data.frame || data.page)

    if (!frame) {
      return
    }

    // Increase occurences count of the frame
    name = `pid${evt.pid}-tid${evt.tid}-frame${frame}`
    counter = countsByThread[name]
    if (!counter) {
      counter = {
        pid: evt.pid,
        tid: evt.tid,
        frame: frame,
        count: 0
      }
      countsByThread[name] = counter
      threads.push(counter)
    }
    counter.count++
  })

  // find most active thread (and frame)
  threads.sort((a, b) => b.count - a.count)
  const mostActiveFrame = threads[0]

  // Remove all current TracingStartedIn* events, storing
  // the first events ts.
  const ts = events[traceStartEvents[0]] && events[traceStartEvents[0]].ts

  // account for offset after removing items
  let i = 0
  for (const dup of traceStartEvents) {
    events.splice(dup - i, 1)
    i++
  }

  // Add a new TracingStartedInPage event based on most active thread
  // and using TS of first found TracingStartedIn* event
  events.unshift(makeMockEvent(mostActiveFrame, ts))

  return events
}

const extractFrames = events =>
  events
    .filter(e => e.name.includes('DrawFrame'))
    .sort((a, b) => a.ts - b.ts)
    // remove first frame because it's often off the charts
    .slice(1)

const dumpTree = (tree, time) => {
  const result = {}
  tree.children.forEach((value, key) => { result[key] = value[time] })
  return result
}

const sortEvents = events => {
  return events.sort((a, b) => a.ts - b.ts)
}

const toMS = time => time / 10e2

const toSec = time => time / 10e5

module.exports = {
  cleanTrace,
  extractFrames,
  dumpTree,
  sortEvents,
  toMS,
  toSec
}
