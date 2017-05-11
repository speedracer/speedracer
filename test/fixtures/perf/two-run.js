import delay from 'delay'
import run from 'speedracer'

run('foo', () => Promise.resolve().then(delay(100)))

run('bar', () => Promise.resolve().then(delay(100)))
