<p align="center">
  <img alt="Speed Racer" src="https://raw.githubusercontent.com/ngryman/artworks/master/speedracer/heading/speedracer@2x.png">
</p>

<p align="center">
  Collect performance metrics for your library/application.
</p>

<p align="center">
  <a href="//travis-ci.org/ngryman/speedracer">
    <img alt="Build Status" src="https://img.shields.io/travis/ngryman/speedracer.svg">
  </a>
</p>

---

[![Greenkeeper badge](https://badges.greenkeeper.io/ngryman/speedracer.svg)](https://greenkeeper.io/)

## Installation

```sh
npm install -g speedracer
```

**Speed Racer** needs Chrome to profile your files.
Preferably, if you have Chrome Canary installed it will run it headless.


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
