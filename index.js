const kleur = require('kleur')
const Arborist = require('@npmcli/arborist')

/**
 * Run npm-why in a directory
 *
 * @param {String} dir Workding directory
 * @param {String} packageName The package to lookup
 */
async function collectReasons (dir, packageName) {
  const arb = new Arborist({ path: dir })
  const tree = await arb.loadVirtual()
  const pkgs = tree.children.keys()

  let reasons = []

  // find all versions of <packageName>
  for (const name of pkgs) {
    if (name === packageName) {
      const reasonChain = buildDependentsTree(tree.children.get(name))
      reasons = reasons.concat(reasonChain.leafs)
    }
  }

  // prepand root package info to every reason chain
  const root = { name: tree.name, version: tree.version }
  reasons = reasons.map(chain => chain.concat(root))

  return reasons
}

function buildDependentsTree (node, paths = [], leafs = []) {
  const { name, version, edgesIn } = node

  // when leaf node
  if (edgesIn.size === 0) {
    leafs.push(paths)
    return { name, version, leafs }
  }

  // prevent dead loops
  if (paths.includes(name)) {
    return { name, version, leafs }
  }

  const dependents = Array.from(edgesIn).map(edge => {
    const pkg = { name, version }
    return buildDependentsTree(edge.from, paths.concat(pkg), leafs)
  })

  return { name, version, leafs, dependents }
}

function printReasons (reasons, rootPackage) {
  reasons.map(reason => {
    const versionTag = kleur.dim('@' + reason[0].version)

    const line = reason.reverse().map(pkg => {
      return kleur.blue(pkg.name || rootPackage)
    }).join(' > ')

    return line + versionTag
  }).sort().forEach(line => console.log(' ', line))
}

module.exports = {
  collectReasons,
  printReasons
}
