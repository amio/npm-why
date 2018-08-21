const path = require('path')
const kleur = require('kleur')
const why = require('./index.js')

/**
 * Run npm-why in a directory
 *
 * @param {String} dir Workding directory
 * @param {String} packageName The package to lookup
 */
module.exports = function main (dir, packageName) {
  const reasons = why(
    loadJSON(dir, 'package.json'),
    loadJSON(dir, 'package-lock.json'),
    packageName
  )

  if (!reasons.length) {
    console.log(`\n  No one requires ${kleur.blue(packageName)}.`)
  } else {
    console.log(`\n  Who required ${kleur.blue(packageName)}:\n`)
    print(reasons, path.parse(dir).name)
    console.log('')
  }
}

function loadJSON (dir, jsonFile) {
  try {
    return require(path.resolve(dir, jsonFile))
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      console.error(`\n  ${kleur.red('ERROR')} Cannot find ${kleur.yellow(jsonFile)}.\n`)
    } else {
      console.error(`\n  ${kleur.red('ERROR')} ${e.message}\n`)
    }
    process.exit(1)
  }
}

function print (reasons, dirName) {
  reasons.map(reason => {
    const versionTag = kleur.dim('@' + reason[0].version)
    return reason.reverse().map(rs => {
      return kleur.blue(rs.name || dirName)
    }).join(' > ') + versionTag
  }).sort().forEach(x => console.log('  ' + x))
}
