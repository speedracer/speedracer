import { Race, Serie } from '../../../../lib/artefacts'

const code = `
  const race1 = function() {
    return new Promise(resolve => {
      setTimeout(resolve, 10)
    })
  }

  const race2 = function() {
    return new Promise(resolve => {
      setTimeout(resolve, 20)
    })
  }
`
const race1 = new Race('wait for 10ms')
race1.ref = 'race1'

const race2 = new Race('wait for 20ms')
race2.ref = 'race2'

module.exports = new Serie(code, [race1, race2])
