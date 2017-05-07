const createReporter = name => {
  const Reporter = require(`./reporters/${name}`)
  return new Reporter()
}

module.exports = createReporter
