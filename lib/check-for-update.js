// Packages
const chalk = require('chalk')
const updateNotifier = require('update-notifier')

// Ours
const pkg = require('../package.json')

const checkForUpdate = () => {
  const notifier = updateNotifier({ pkg, updateCheckInterval: 0 })
  const { update } = notifier

  if (update) {
    /* eslint-disable */
    let message = `Update available! ${chalk.red(update.current)} → ${chalk.green(update.latest)}\n`
    message += `Run ${chalk.magenta('npm i -g speedracer')} to update!\n`
    message += `${chalk.magenta('Changelog:')} https://github.com/ngryman/speedracer/releases/tag/${update.latest}`
    /* eslint-enable */

    notifier.notify({ message })
  }
}

module.exports = checkForUpdate
