const dumpTree = (tree, time) => {
  const result = {}
  tree.children.forEach((value, key) => { result[key] = value[time] })
  return result
}

const analyzeByCategories = model =>
dumpTree(model.bottomUpGroupBy('Category'), 'totalTime')

const analyzeByEvents = model =>
dumpTree(model.bottomUpGroupBy('EventName'), 'totalTime')

const analyzeFunctions = model =>
dumpTree(model.bottomUp(), 'selfTime')

const analyzeProfiling = model => ({
  categories: analyzeByCategories(model),
  events: analyzeByEvents(model),
  functions: analyzeFunctions(model)
})

module.exports = analyzeProfiling
