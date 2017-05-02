// Ours
const { writeFile } = require('./.internal/util')

const saveReport = (filename, report) =>
writeFile(filename, JSON.stringify(report, null, 2))

module.exports = saveReport
