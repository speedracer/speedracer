const colors = ['blue', 'white', 'red']

let frame = 0

const render = () => {
  if (frame < 600) {
    requestAnimationFrame(render)
  }
  else {
    speedracer.end()
  }

  document.body.style.backgroundColor = colors[frame++ % colors.length]
}
render()
