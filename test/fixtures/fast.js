import run from 'speedracer'

run('speed racer...', () =>
new Promise(resolve => {
  setTimeout(() => {
    console.log("I'm Racer X!")
    resolve()
  }, 1000)
}))
