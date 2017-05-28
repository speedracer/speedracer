const waterfall = require('p-waterfall')

const pipe = (plugins, hook, prop = null) => baton => (
  waterfall(plugins.map(plugin => val => {
    const fn = plugin[hook]
    if (!fn) return val

    if (prop) {
      const ret = fn.call(plugin, Object.assign({ [prop]: val }, baton))
      if (ret === false) throw Object({ skip: true })
      if (ret) return Promise.resolve(ret)
      return val
    }

    const ret = fn.call(plugin, Object.assign({}, baton))
    if (ret === false) throw Object({ skip: true })
  }), baton && baton[prop])
)

module.exports = plugins => ({
  loadFile: pipe(plugins, 'loadFile', 'code'),
  transformFile: pipe(plugins, 'transformFile', 'code'),
  startRace: pipe(plugins, 'startRace', 'categories'),
  transformTrace: pipe(plugins, 'transformTrace', 'trace'),
  report: pipe(plugins, 'report', 'report'),
  transformReport: pipe(plugins, 'transformReport', 'report'),
  onStart: pipe(plugins, 'onStart'),
  onFinish: pipe(plugins, 'onFinish'),
  onFileLoad: pipe(plugins, 'onFileLoad'),
  onFileStart: pipe(plugins, 'onFileStart'),
  onFileFinish: pipe(plugins, 'onFileFinish'),
  onRaceStart: pipe(plugins, 'onRaceStart'),
  onRaceFinish: pipe(plugins, 'onRaceFinish'),
  onTrace: pipe(plugins, 'onTrace'),
  onReport: pipe(plugins, 'onReport'),
  onStatus: pipe(plugins, 'onStatus'),
  onWarn: pipe(plugins, 'onWarn')
})
