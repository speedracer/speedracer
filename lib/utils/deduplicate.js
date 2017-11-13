export default function createDeduplicator(occurrences = new Map()) {
  return function deduplicate(x) {
    const occ = occurrences.get(x) || 0
    if (occ > 0) {
      x = `${x} [${occ + 1}]`
    }
    occurrences.set(x, occ + 1)
    return x
  }
}
