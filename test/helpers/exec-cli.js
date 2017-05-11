// Native
import { exec } from 'child_process'

export default (command, args = '') =>
new Promise((resolve, reject) => {
  exec(`../../bin/speedracer.js ${command} ${args}`, {
    cwd: 'test/fixtures'
  }, (err, stdout, stderr) => {
    if (err) return reject(err)
    resolve(stderr ? stderr : stdout)
  })
})
