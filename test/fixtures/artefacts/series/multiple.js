import { raceIdFrom } from '../../../../lib/utils/race'

module.exports = {
  code: `
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
  `,
  races: [
    { name: 'wait for 10ms', id: raceIdFrom('wait for 10ms'), ref: 'race1' },
    { name: 'wait for 20ms', id: raceIdFrom('wait for 20ms'), ref: 'race2' }
  ]
}
