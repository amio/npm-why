const path = require('path')
const chalk = require('chalk')
const why = require('./index.js')

const PREFIX_ERROR = chalk.red('ERROR')

/**
 * Run npm-why in a directory
 *
 * @param {String} dir Workding directory
 * @param {String} packageName The package to lookup
 */
module.exports = function main (dir, packageName) {
  if (typeof packageName !== 'string') {
    console.error(`\n  ${PREFIX_ERROR} A <package-name> is required.`)
    process.exit(1)
  }

  const reasons = why(
    loadJSON(dir, 'package.json'),
    loadJSON(dir, 'package-lock.json'),
    packageName
  )

  if (!reasons.length) {
    console.log(`\n  No one requires ${chalk.blue(packageName)}.`)
  } else {
    console.log(`\n  Who required ${chalk.blue(packageName)}:\n`)
    print(reasons, path.parse(dir).name)
    console.log('')
  }
}

function loadJSON (dir, jsonFile) {
  try {
    return require(path.resolve(dir, jsonFile))
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      console.error(`\n  ${PREFIX_ERROR} Cannot find ${chalk.yellow(jsonFile)}.\n`)
    } else {
      console.error(`\n  ${PREFIX_ERROR} ${e.message}\n`)
    }
    process.exit(1)
  }
}

function print (reasons, dirName) {
  reasons.map(reason => {
    const versionTag = chalk.dim('@' + reason[0].version)
    return reason.reverse().map(rs => {
      // Use `dirName` if the package.json has no `name` field. #1
      return chalk.blue(rs.name || dirName)
    }).join(' > ') + versionTag
  }).sort().forEach(x => console.log('  ' + x))
}
