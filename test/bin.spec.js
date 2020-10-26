const path = require('path')
const execa = require('execa')
const tap = require('tap')

const cwd = path.resolve(__dirname, '..')
const bin = path.join(cwd, 'bin/npm-why')
const cli = (args, opts) => execa(bin, args, opts)

tap.test('runs `--version`', async t => {
  const packageJson = require(path.join(cwd, 'package.json'))
  const { stdout } = await cli(['--version'])
  t.is(stdout, packageJson.version, 'output version.')
})

tap.test('runs `chalk`', async t => {
  const { stdout } = await cli(['chalk', '--noir'], { cwd: __dirname })
  t.is(stdout.trim(), `Who required chalk:

  npm-why > chalk@2.4.1`, 'output correct result.')
})

// Issue #1
tap.test('Exit 1 if no <package-name> provided', async t => {
  const { exitCode, stderr } = await cli(['--noir'], { reject: false })
  t.is(exitCode, 1, 'exit code 1')
  t.is(stderr.trim(), 'ERROR A <package-name> is required.', 'output hint.')
})
