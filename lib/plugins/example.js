class ExamplePlugin {
  /**
   * Hooks (side-effects)
   */

  /**
   * A custom file loader.
   *
   * @example ignoring, transpilation
   *
   * @param {String} file
   * @return {String|false} Source code of the file
   */
  loadFile({ file }) {
    return ''
  }

  /**
   * Transform a file.
   *
   * @example codemod, transpilation
   * @return {String} Mutated source code
   */
  transformFile({ file, code }) {
    return code
  }

  /**
   * A custom race starter.
   *
   * @example ignoring, change name, mutate categories
   *
   * @param {String} file
   * @param {String} race
   * @param {Array} categories
   * @return {Object|false} Race and categories
   */
  startRace({ file, race, categories }) {
    return { race, categories }
  }

  /**
   * Transform a trace.
   *
   * @example mutate/discard events
   *
   * @example cleanup
   * @return {String} Mutated trace
   */
  transformTrace({ file, race, trace }) {
    return trace
  }

  /**
   * A custom reporter.
   *
   * @example ignoring, custom report, mutate events
   *
   * @param {String} file
   * @param {String} race
   * @param {Array} events
   * @return {Object|false} Generated report
   */
  report({ file, race, trace }) {
    return {}
  }

  /**
   * Transform a report.
   *
   * @example custom sections, cleanup
   *
   * @param {String} file
   * @param {String} race
   * @param {Object} report
   * @return {Object|false} Mutated report
   */
  transformReport({ file, race, report }) {
    return report
  }

  /**
   * Events (no side-effects)
   */

  onFileLoad({ file }) {}

  onFileStart({ file }) {}

  onFileFinish({ file }) {}

  onRaceStart({ file, race }) {}

  onRaceFinish({ file, race }) {}

  onTrace({ file, race, trace }) {}

  onReport({ file, race, report }) {}

  onStatus({ text }) {}

  onWarn({ text }) {}
}

export default () => new ExamplePlugin()
