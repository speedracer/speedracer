<p align="center">
  <img alt="Speed Racer" src="https://raw.githubusercontent.com/ngryman/artworks/master/speedracer/heading/speedracer@2x.png">
</p>

<p align="center">
  Collect performance metrics of your library/application.
</p>

<p align="center">
  <a href="//travis-ci.org/ngryman/speedracer">
    <img alt="Build Status" src="https://img.shields.io/travis/ngryman/speedracer.svg">
  </a>
  <a href="//codecov.io/github/ngryman/speedracer">
    <img alt="Coverage" src="https://img.shields.io/codecov/c/github/ngryman/speedracer.svg">
  </a>
</p>

---

## Installation

```sh
npm install -g speedracer
```

**Speed Racer** needs Chrome Canary to profile your files:

**Mac OS**

```sh
brew cask install google-chrome-canary
```

**Others**

Download [Chrome Canary](https://www.google.com/intl/en/chrome/browser/canary.html)

## Usage

```sh
$ speedracer -h

  🚗  Speed Racer v0.1.0

  speedracer files [options]

  Options:

    -h, --help            Usage information  false
    -t, --traces          Save traces        false
    -r, --reports         Save reports       false
    -o dir, --output=dir  Output directory   ./.speedracer

  Examples:

  – Race files in perf directory:

    $ speedracer

  – Race files matching perf/**/*.js glob:

    $ speedracer perf/**/*.js

  – Save traces and reports:

    $ speedracer --reports --traces --output=./speedracer
```
