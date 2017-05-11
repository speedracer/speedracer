// Native
import { exec } from 'child_process'

const CI = !!process.env.CI

export default (subCommand, args = '') =>
new Promise((resolve, reject) => {
  const command = [
    '../../bin/speedracer.js',
    subCommand,
    args
  ]

  if (CI) {
    command.push('--chrome-flags="--no-sandbox"')
    command.push('--no-headless')
    command.push('--timeout=10000')
  }

  exec(command.join(' '), {
    cwd: 'test/fixtures'
  }, (err, stdout, stderr) => {
    if (err) return reject(err)
    resolve(stderr ? stderr : stdout)
  })
})
