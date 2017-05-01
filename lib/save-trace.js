// Ours
const { gzip, writeFile } = require('./.internal/util')

const saveTrace = (filename, events) =>
  gzip(JSON.stringify(events, null, 2))
    .then(buf => writeFile(`${filename}.gz`, buf))

module.exports = saveTrace
