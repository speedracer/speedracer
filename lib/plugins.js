const series = require('p-series')
const waterfall = require('p-waterfall')

const hookPipeline = (plugins, hook) => args => (
  waterfall(plugins.map(plugin => args => {
    const fn = plugin[hook]
    if (fn) {
      const ret = fn.call(plugin, args)
      if (ret === false) throw Object({ skip: true })
      return (ret || args)
    }
    return args
  }), args)
)

const eventPipeline = (plugins, event) => args => (
  series(plugins.map(plugin => {
    const fn = plugin[event]
    if (fn) {
      const ret = fn.call(plugin, args)
      if (ret === false) throw Object({ stop: true })
    }
  }), args)
)

module.exports = plugins => ({
  loadFile: hookPipeline(plugins, 'loadFile'),
  transformFile: hookPipeline(plugins, 'transformFile'),
  startRace: hookPipeline(plugins, 'startRace'),
  transformTrace: hookPipeline(plugins, 'transformTrace'),
  report: hookPipeline(plugins, 'report'),
  transformReport: hookPipeline(plugins, 'transformReport'),
  onFileLoad: eventPipeline(plugins, 'onFileLoad'),
  onFileStart: eventPipeline(plugins, 'onFileStart'),
  onFileFinish: eventPipeline(plugins, 'onFileFinish'),
  onRaceStart: eventPipeline(plugins, 'onRaceStart'),
  onRaceFinish: eventPipeline(plugins, 'onRaceFinish'),
  onTrace: eventPipeline(plugins, 'onTrace'),
  onReport: eventPipeline(plugins, 'onReport'),
  onStatus: eventPipeline(plugins, 'onStatus'),
  onWarn: eventPipeline(plugins, 'onWarn')
})
