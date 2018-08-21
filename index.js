const logicalTree = require('npm-logical-tree')

/**
 * Find who depend upon a target package.
 *
 * @param {Object} pkg package.json
 * @param {Object} pkgLock package-lock.json
 * @param {String} target target package name to lookup
 */
module.exports = function (pkg, pkgLock, name) {
  const tree = logicalTree(pkg, pkgLock)

  // Find target deps
  const targets = new Set()
  tree.forEach((dep, callback) => {
    dep.name === name && targets.add(dep)
    callback()
  })

  // Find requiredBy for those targets
  const results = []
  targets.forEach(t => {
    lookupDependents(t, tree, [], results)
  })
  return results
}

function lookupDependents (target, root, breadcrumb = [], results) {
  breadcrumb = breadcrumb.concat(target)

  if (target.requiredBy.size === 0) {
    return results.push(formatBreadcrumb(breadcrumb))
  }

  if (breadcrumb.includes(root)) {
    return results.push(formatBreadcrumb(breadcrumb))
  }

  if (breadcrumb.slice(0, -1).includes(target)) {
    return // Recursive dependency
  }

  target.requiredBy.forEach(dependent => {
    lookupDependents(dependent, root, breadcrumb, results)
  })
}

function formatBreadcrumb (bc) {
  return bc.map(piece => ({
    name: piece.name,
    version: piece.version
  }))
}
