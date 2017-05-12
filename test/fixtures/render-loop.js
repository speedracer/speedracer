import race from 'speedracer'

race('alternate body background', r => {
  return new Promise(resolve => {
    const colors = ['blue', 'white', 'red']
    let frame = 0
    const render = () => {
      if (frame < 60) {
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
