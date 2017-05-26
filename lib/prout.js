const driver = (runner, chrome) => ({ name: 'driver', runner, chrome })
const runner = () => ({ name: 'runner' })
const chrome = (server) => ({ name: 'chrome', server })
const server = () => ({ name: 'server' })

const createModule = (module, ...deps) => (
  Promise.all(deps.map(dep => (
    Promise.resolve().then(() => (
      Array.isArray(dep) ? createModule(...dep) : createModule(dep)
    ))
  )))
  .then(deps => (
    Promise.resolve().then(() => module(...deps))
  ))
)

createModule(driver, runner, [chrome, server])
.then(module => console.log(module))

// const director = createDirector(
//   createDriver(createChrome()),
//   createServer(),
//   createRunner()
// )
//
// const director = createDirector([
//   ['driver', 'chrome'],
//   'server',
//   'runner'
// ], plugins, config)
//
// const createDirector = (modules, plugins, config) => {
//   Promise.all(modules.map(
//     module => require(`./modules/${module}`)()
//   ))
// }
//
// const startModule = (modules, plugins, config) => (
//   Promise.all(modules.slice(1).map(
//     dependency => startModule(dependency, plugins, config)
//   ))
//   .then((...modules) => (
//     require(`./modules/${modules[0]}`)(...modules)
//   ))
// )
