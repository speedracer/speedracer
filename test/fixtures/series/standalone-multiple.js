race('wait for 10ms', function() {
  return new Promise(resolve => {
    setTimeout(resolve, 10)
  })
})

race('wait for 20ms', function() {
  return new Promise(resolve => {
    setTimeout(resolve, 20)
  })
})
