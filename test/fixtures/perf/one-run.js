import delay from 'delay'
import run from 'speedracer'

run('foo', () => Promise.resolve().then(delay(100)))
