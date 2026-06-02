#!/usr/bin/env node
'use strict'

const { spawnSync, execSync } = require('child_process')
const chalk = require('chalk')
const path = require('path')
const fs = require('fs')

const ROOT = path.join(__dirname, '..')
const GIT_LOCK_PATH = path.join(ROOT, '.git', 'index.lock')

console.log(chalk.bold('\n  emilyCSS ship\n'))

if (fs.existsSync(GIT_LOCK_PATH)) {
  console.log(chalk.red.bold('  ⚠ Git index is locked.'))
  console.log(chalk.dim('  Another git process is running or a previous one crashed.'))
  console.log(chalk.yellow('  Run: rm .git/index.lock'))
  console.log()
  process.exit(1)
}

let npmUser = ''
try {
  npmUser = execSync('npm whoami', {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe']
  }).toString().trim()
} catch {
  console.log(chalk.red('\n  npm auth could not be verified. Ship cancelled.\n'))
  console.log(chalk.dim('  Add your npm token to ~/.npmrc first.\n'))
  process.exit(1)
}

console.log(chalk.green(`  ✓ npm auth OK${npmUser ? ` (${npmUser})` : ''}\n`))

let hasChanges = false
try {
  execSync('git diff --quiet && git diff --cached --quiet', {
    cwd: ROOT,
    stdio: 'ignore'
  })
} catch {
  hasChanges = true
}

if (hasChanges) {
  console.log(chalk.bold('  Step 1 — Commit\n'))
  const commitResult = spawnSync('node', [path.join(__dirname, 'commit.js')], {
    stdio: 'inherit',
    cwd: ROOT,
  })

  if (commitResult.status !== 0) {
    console.log(chalk.yellow('\n  Commit step exited early. Release skipped.\n'))
    process.exit(commitResult.status || 1)
  }
} else {
  console.log(chalk.bold('  Step 1 — Commit\n'))
  console.log(chalk.dim('  No uncommitted changes found. Skipping commit.\n'))
}

console.log(chalk.bold('  Step 2 — Release + Publish\n'))
const releaseResult = spawnSync('node', [path.join(__dirname, 'release.js')], {
  stdio: 'inherit',
  cwd: ROOT,
  env: { ...process.env, EMILY_NPM_AUTH_OK: '1' },
})

if (releaseResult.status !== 0) {
  console.log(chalk.yellow('\n  Release step exited with an error.\n'))
  process.exit(releaseResult.status || 1)
}

console.log(chalk.green('\n  ✓ Ship complete\n'))