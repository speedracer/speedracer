import run from 'speedracer'

const colors = ['blue', 'white', 'red']

let frame = 0

run.cb('alternate body background', r => {
  const render = () => {
    if (frame < 600) {
      requestAnimationFrame(render)
    }
    else {
      r.end()
    }

    document.body.style.backgroundColor = colors[frame++ % colors.length]
  }
  render()
})
