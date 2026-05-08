const assert = require("node:assert/strict");
const { execFile } = require("node:child_process");
const path = require("node:path");
const test = require("node:test");

const cwd = path.resolve(__dirname, "..");
const bin = path.join(cwd, "bin/npm-why");

function stripFinalNewline(value) {
  return value.replace(/\r?\n$/, "");
}

function cli(args, options = {}) {
  const { reject: rejectOnError = true, ...execOptions } = options;

  return new Promise((resolve, reject) => {
    execFile(
      process.execPath,
      [bin, ...args],
      { encoding: "utf8", ...execOptions },
      (error, stdout, stderr) => {
        stdout = stripFinalNewline(stdout);
        stderr = stripFinalNewline(stderr);

        const exitCode = error && typeof error.code === "number" ? error.code : 0;
        const result = { exitCode, stderr, stdout };

        if (error && rejectOnError) {
          error.exitCode = exitCode;
          error.stderr = stderr;
          error.stdout = stdout;
          reject(error);
          return;
        }

        resolve(result);
      },
    );
  });
}

test("runs `--version`", async () => {
  const packageJson = require(path.join(cwd, "package.json"));
  const { stdout } = await cli(["--version"]);
  assert.equal(stdout, packageJson.version);
});

test("runs `chalk` on v1 lockfile", async () => {
  const cwd = path.join(__dirname, "fixtures", "lockfile-v1");
  const { stdout } = await cli(["chalk", "--noir"], { cwd });
  assert.equal(
    stdout.trim(),
    `Who required chalk:

  lockfile-v1 > npm-why > chalk@2.4.1`,
  );
});

test("runs `chalk` on v2 lockfile", async () => {
  const cwd = path.join(__dirname, "fixtures", "lockfile-v2");
  const { stdout } = await cli(["chalk", "--noir"], { cwd });
  assert.equal(
    stdout.trim(),
    `Who required chalk:

  lockfile-v2 > npm-why > chalk@2.4.1`,
  );
});

test("runs `eiyo` on v2 lockfile", async () => {
  const cwd = path.join(__dirname, "fixtures", "lockfile-v2");
  const { stdout } = await cli(["eiyo", "--noir"], { cwd });
  assert.equal(stdout.trim(), "No one requires eiyo.");
});

// Issue #1
test("Exit 1 if no <package-name> provided", async () => {
  const { exitCode, stderr } = await cli(["--noir"], { reject: false });
  assert.equal(exitCode, 1);
  assert.equal(stderr.trim(), "ERROR A <package-name> is required.");
});

// Issue #176
test("Exit 1 if no package.json presented", async () => {
  const cwd = path.join(__dirname, "fixtures");
  const { exitCode, stderr } = await cli(["eiyo", "--noir"], { cwd, reject: false });
  assert.equal(exitCode, 1);
  assert.equal(stderr.trim(), "ERROR package.json or lockfile not found.");
});

// Issue #176
test("Exit 1 if no lockfile presented", async () => {
  const cwd = path.join(__dirname, "fixtures/no-lockfile");
  const { exitCode, stderr } = await cli(["eiyo", "--noir"], { cwd, reject: false });
  assert.equal(exitCode, 1);
  assert.equal(stderr.trim(), "ERROR package.json or lockfile not found.");
});

// Issue #269
test("Support recursive dependencies", async () => {
  const cwd = path.join(__dirname, "fixtures/recursive-dependency");

  {
    const { stdout } = await cli(["a", "--noir"], { cwd });
    assert.equal(
      stdout.trim(),
      `Who required a:

  recursive-dependency > a@1.0.0`,
    );
  }

  {
    const { stdout } = await cli(["b", "--noir"], { cwd });
    assert.equal(
      stdout.trim(),
      `Who required b:

  recursive-dependency > a > b@1.0.0`,
    );
  }
});
