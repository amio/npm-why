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

tap.test('runs `chalk` on v1 lockfile', async t => {
  const cwd = path.join(__dirname, 'fixtures', 'lockfile-v1')
  const { stdout } = await cli(['chalk', '--noir'], { cwd })
  t.is(stdout.trim(), `Who required chalk:

  lockfile-v1 > npm-why > chalk@2.4.1`, 'output correct result.')
})

tap.test('runs `chalk` on v2 lockfile', async t => {
  const cwd = path.join(__dirname, 'fixtures', 'lockfile-v2')
  const { stdout } = await cli(['chalk', '--noir'], { cwd })
  t.is(stdout.trim(), `Who required chalk:

  lockfile-v2 > npm-why > chalk@2.4.1`, 'output correct result.')
})

// Issue #1
tap.test('Exit 1 if no <package-name> provided', async t => {
  const { exitCode, stderr } = await cli(['--noir'], { reject: false })
  t.is(exitCode, 1, 'exit code 1')
  t.is(stderr.trim(), 'ERROR A <package-name> is required.', 'output hint.')
})
