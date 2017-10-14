race('wait for 10ms', async function() {
  await new Promise(resolve => {
    setTimeout(resolve, 10)
  })
})
