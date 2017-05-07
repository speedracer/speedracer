import run from 'speedracer'

run('search 10e4 first primes very long', r => {
  const isPrime = num => {
    if (num < 2) return false

    for (var i = 2; i < num; i++) {
      if (num % i === 0) {
        return false
      }
    }

    return true
  }

  const searchPrimes = limit => {
    const optGuard = [0, 0]
    for (let i = 0; i < limit; i++) {
      optGuard[i % 2] = isPrime(i)
    }
    return optGuard
  }

  searchPrimes(10e4)
})

run('render 600 frames', r => {
  return new Promise(resolve => {
    const colors = ['blue', 'white', 'red']
    let frame = 0
    const render = () => {
      if (frame < 600) {
        requestAnimationFrame(render)
      }
      else {
        resolve()
      }
      document.body.style.backgroundColor = colors[frame++ % colors.length]
    }
    render()
  })
})
