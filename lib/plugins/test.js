const path = require('path')

const { createDir } = require('../.internal/util')

export default (options) => (reports, file) => {
  reports.forEach(report => {
    const dirname = path.join(path.dirname(file), options.snapshotsDirname)
    const filename = path.join(dirname, `${report.metadata.id}.speedracer`)

    return loadReport(filename).then(
      oldReport => {
        process.exit(0)
      },
      () => createDir(dirname).then(
        () => writeFile(filename, race.report.serialize())
      )
    )
  })
}
