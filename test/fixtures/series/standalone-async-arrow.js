race('wait for 10ms', () => (
  new Promise(resolve => {
    setTimeout(resolve, 10)
  })
))
