import delay from 'delay'
import race from 'speedracer'

race('baz', () => Promise.resolve().then(delay(100)))
