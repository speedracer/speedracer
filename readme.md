<h1 align="center">speedracer</h1>

<p align="center">
  :racing_car::boom: ............ :red_car::taxi::blue_car::police_car::fire_engine::minibus::truck::bus::articulated_lorry::tractor:
</p>

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
  <a href="//codecov.io/github/ngryman/speedracer">
    <img alt="Build Status" src="https://img.shields.io/codecov/c/github/ngryman/speedracer.svg">
  </a>
  <a href="//discord.gg/qzmXsUY">
    <img alt="Discord" src="https://img.shields.io/badge/chat-discord-brightgreen.svg">
  </a>
</p>

---

Speed Racer is a performance runner, like a test runner, but for performance :racing_car:. It runs scripts (*races*) in Chrome (headlessly if possible) and produces detailed **traces** and **reports** on scripting, rendering and painting.

<p align="center">
  <br><br>
  <b>
    See what's new in :package:
    <a href="//github.com/ngryman/speedracer/releases/tag/v0.2.0">0.2.0</a>
    or what's being cooked for :package:
    <a href="//github.com/ngryman/speedracer/projects/2">0.3.0</a>
  </b>
  <br><br>
</p>

## Installation

```sh
npm install -g speedracer
```

Speed Racer needs **Google Chrome** to run your files. It will run it headlessly if it finds a proper intallation of Canary (Mac OS X only for now).


## Usage

Speed Racer comes with two commands right now:
 - `run`: collect performance metrics and save them.
 - `display`: display a summary of generated reports.

### Create races

A race can be seen as a unit test. It contains a piece of code that will be profiled by Speed Racer. Under the hood, it uses [Chrome DevTools protocol] to drive Chrome and collect traces.
Races can import `es6` / `commonjs` modules and use most of `es6` features, depending on your version of Google Chrome: [es6 support](https://www.chromestatus.com/features)

Here is an example of a file containing a race:
```js
import race from 'speedracer'

race('my first race', () => {
  // ... stuff to profile
})
```

You can define as many races as you want per file, Speed Racer will collect and run them sequentially.

You can also define asynchronous races like so:
```js
import race from 'speedracer'

race('my first async race', () =>
new Promise(resolve => {
  // ... stuff to profile
  resolve()
}))
```

[Chrome DevTools protocol]: https://chromedevtools.github.io/devtools-protocol/

### Run races

Then you need to collect metrics!

For each race, Speed Racer will produce two artifacts:
 - a **trace**: a raw dump of Google Chrome tracing events, it contains a lot of detailed metrics about your race.
 - a **report**: a report created by Speed Racer from those events, it summarizes important metrics.

Those artifacts will be saved in the `.speedracer` directory by default.

To run races, type `speedracer run perf/*.js` or simply `speedracer perf/*.js`. Note that it will run all `.js` files in the `perf` directory by default, so you can omit `perf/*.js` if you are using this directory.

For more details, type `speedracer run --help`.
You can browse examples [here](https://github.com/ngryman/speedracer/tree/master/test/fixtures).

### Display reports

Once the artifacts have been created, you can quickly display a summary report for each run. Type `speedracer display` to see all the reports or `speedracer display .speedracer/a-file-name/*` to see the reports of a specific file.

For more details, type `speedracer display --help`.

## Go further

Speed Racer is still a baby so it does not provide advanced analysis yet, just a basic summary. But it has several goals:
 - **regression testing**: compare runs over time and report how it's faster/slower.
 - **benchmarking**: compare several races to see which is the best.
 - **analysis**: give precise insights of what is slow and why.
 - **auditing**: give advices on how to improve performance.

If you want to use Speed Racer for one of this use cases, you can leverage it and analyze the traces and reports it produces. I would be glad to receive your feedback and ideas on the subject!

### Traces

Traces are `json` files with the `.trace.gz` extension. They are basically **huge** arrays of events produced by Google Chrome. Those events give tons of informations about the overall performance of race. Here is the detail [format](https://docs.google.com/document/d/1CvAClvFfyA5R-PhYUmn5OOQtYMH4h6I0nSsKchNAySU/preview#heading=h.uxpopqvbjezh).

Traces can be pretty big, so they are saved `gziped`.

You can analyze them the way you want or load them in the Timeline/Performance tab of Chrome like so:

1. Locate and decompress your trace:

```sh
# first you need to locate and decompress the trace

$ cd .speedracer
$ ls
text-fixtures-multiple
$ cd text-fixtures-multiple
$ ls
render-60-frames.speedracer
render-60-frames.trace.gz
search-10e4-first-primes-very-long.speedracer
search-10e4-first-primes-very-long.trace.gz
$ gunzip render-60-frames.trace.gz
```

2. Load it in Chrome Devtools and enjoy :tada:

### Reports

Reports are `json` files with the `.speedracer` extension. They provide a performance summary for a given race.

Here is the format:
```json
{
  "meta": {
    "title": "render 60 frames",
    "group": "test-fixtures-multiple",
    "id": "render-60-frames"
  },
  "profiling": {
    "categories": {
      "scripting": 13.217000007629395,
      "rendering": 11.370999991893768,
      "painting": 9.248999938368797
    },
    "events": {
      "Animation Frame Fired": 7.994999974966049,
      "Composite Layers": 7.0119999796152115,
      "Update Layer Tree": 6.503000020980835,
      "JS Frame": 5.1060000360012054,
      "Recalculate Style": 4.867999970912933,
      "Paint": 2.236999958753586,
      "Run Microtasks": 0.11599999666213989
    },
    "functions": {
      "FireAnimationFrame": 7.994999974966049,
      "CompositeLayers": 7.0119999796152115,
      "UpdateLayerTree": 6.503000020980835,
      "UpdateLayoutTree": 4.867999970912933,
      "f:render@24": 2.32600000500679,
      "Paint": 2.236999958753586,
      "f:requestAnimationFrame@": 2.1010000109672546,
      "f:ws.onmessage@24": 0.1940000057220459,
      "f:finishRace@24": 0.15600000321865082,
      "f:@": 0.1300000101327896,
      "RunMicrotasks": 0.11599999666213989,
      "f:Promise@": 0.10099999606609344,
      "f:startRace@24": 0.09800000488758087
    }
  },
  "rendering": {
    "firstPaint": 0.00805,
    "fps": {
      "mean": 60.98,
      "variance": 3.9,
      "sd": 1.97,
      "lo": 56.92,
      "hi": 63.47
    }
  }
}
```

You can display, analyze or compare them depending on your needs.

---

<p align="center">
  :racing_car::boom: ............ :red_car::taxi::blue_car::police_car::fire_engine::minibus::truck::bus::articulated_lorry::tractor:
</p>
