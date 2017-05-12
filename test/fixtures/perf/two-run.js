import delay from 'delay'
import race from 'speedracer'

race('foo', () => Promise.resolve().then(delay(100)))

race('bar', () => Promise.resolve().then(delay(100)))
