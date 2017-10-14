race('wait for 10ms', function() {
  return new Promise(resolve => {
    setTimeout(resolve, 10)
  })
})
