import race from 'speedracer'

race('speed racer...', () =>
new Promise(resolve => {
  setTimeout(() => {
    console.log("I'm Racer X!")
    resolve()
  }, 1000)
}))
