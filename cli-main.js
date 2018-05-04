const path = require('path')
const chalk = require('chalk')
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
    console.log(`\n  No one requires ${chalk.blue(packageName)}.`)
  } else {
    console.log(`\n  Who required ${chalk.blue(packageName)}:\n`)
    print(reasons)
    console.log('')
  }
}

function loadJSON (dir, jsonFile) {
  try {
    return require(path.resolve(dir, jsonFile))
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      console.error(`${chalk.red('ERROR')} Cannot find ${chalk.green(jsonFile)}.`)
    } else {
      console.error(`${chalk.red('ERROR')} ${e.message}`)
    }
    process.exit(1)
  }
}

function print (reasons) {
  reasons.map(reason => {
    return reason.reverse().map(rs => {
      return chalk.blue(rs.name)// + chalk.dim('#' + rs.version)
    }).join(' > ')
  }).sort().forEach(x => console.log('  ' + x))
}
