import hasha from 'hasha'

const REF_PREFIX = `__sr_${Date.now()}`

export const raceIdFrom = (name) => hasha(name, { algorithm: 'md5' })

export const raceRefFrom = (id) => `${REF_PREFIX}_${id}`
