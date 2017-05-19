const { dumpTree } = require('../.internal/util')

module.exports = () => trace =>
dumpTree(trace.model.bottomUpGroupBy('Category'), 'totalTime')
