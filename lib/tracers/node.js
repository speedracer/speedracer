import pify from 'pify'
import pSeries from 'p-map-series'
import { execFile } from 'child_process'
import { unlink } from 'fs'
import { concat, join } from 'lodash'

import { readFile, throwError } from '../utils'

const disabledByDefault = (category) => `disabled-by-default-${category}`

const categories = [
  'v8',
  'node',
  disabledByDefault('v8.runtime_stats_sampling'),
  disabledByDefault('v8.cpu_profiler'),
  disabledByDefault('v8.cpu_profiler.hires')
]

const nodeArgs = [
  '--trace-events-enabled',
  '--trace-event-categories',
  join(categories),
  '--eval'
]

const assertNode8 = async () => {
  const version = await pify(execFile)('node', ['--version'])
  if (Number(version[1]) < 8) {
    throwError('NODE_OLD_VERSION', 'NodeJS >= 8 is required')
  }
}

class NodeTracer {
  async launch() {
    const version = await pify(execFile)('node', ['--version'])
    if (Number(version[1]) < 8) {
      throwError('NODE_OLD_VERSION', 'NodeJS >= 8 is required')
    }
  }

  async trace({ code, races }) {
    return pSeries(races, async race => {
      const raceCode = `${code};${race.ref}()`
      await pify(execFile)('node', concat(nodeArgs, [raceCode]))

      const trace = JSON.parse(await readFile('node_trace.1.log'))
      await pify(unlink)('node_trace.1.log')
      return trace
    })
  }

  async dispose() {}
}

export default async function NodeTracerFactory(options) {
  await assertNode8()

  const tracer = new NodeTracer(options)
  return tracer
}
