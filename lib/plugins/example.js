class ExamplePlugin {
  /**
   * Hooks
   */

  /**
   * A custom file loader.
   * Returning a string will alter the file name.
   * Returning `false` will skip the file.
   * Returning `null` or `undefined` defers to other functions.
   *
   * @example Ignore files, transpilation
   *
   * @param {String} file
   */
  loadFile({ file }) {}

  /**
   * Transform a file.
   *
   * @example Codemod, additional transpilation
   */
  transformFile({ file, code }) {}

  /**
   * A custom race loader.
   * Returning a string will alter the race name.
   * Returning `false` will skip the race.
   * Returning `null` or `undefined` defers to other functions.
   *
   * @example Ignore race, change name, alter options
   *
   * @param {String} file
   * @param {String} race
   * @param {Array} categories
   */
  trace({ file, race, categories }) {}

  /**
   * A custom reporter.
   * Returning an object will be used as report.
   * Returning `null` or `undefined` defers to other functions.
   *
   * @param {String} file
   * @param {String} race
   * @param {Array} events
   */
  report({ file, race, events }) {}

  /**
   * Process a report.
   * Returning an object will replace the current report.
   * Returning `null` or `undefined` defers to other functions.
   *
   * @param {String} file
   * @param {String} race
   * @param {Report} report
   */
  process({ file, race, report }) {}

  /**
   * Events
   */

  onFileLoad(file) {}

  onFileStart(file) {}

  onFileFinish(file) {}

  onRaceStart(race) {}

  onRaceFinish(race) {}

  onStatus(text) {}

  onWarn(text) {}
}

export default () => new ExamplePlugin()
