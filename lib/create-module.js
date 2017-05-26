module.exports = (module, options) => {
  const createModule = (module, ...deps) => {
    return Promise.all(deps.map(dep => (
      Promise.resolve().then(() => (
        Array.isArray(dep) ? createModule(...dep) : createModule(dep)
      ))
    )))
    .then(deps => {
      console.log(module)
      return Promise.resolve().then(() => (
        Array.isArray(deps) ? module(...deps, options) : module(options)
      ))
    })
  }

  return createModule(
    Array.isArray(module) ? createModule(...module) : createModule(module)
  )
}
