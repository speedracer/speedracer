// Packages
import test from 'ava'

// Ours
import launchChrome from '../lib/chrome-launcher'

const CI = !!process.env.CI

const options = CI
  ? { flags: '--chrome-flags="--no-sandbox"', headless: false }
  : {}

test('launch chrome', async t => {
  const chrome = await launchChrome(options)
  t.true(typeof chrome.pid === 'number')
  chrome.kill()
})
