# QA Codebase Audit

Audit date: 2026-05-22

Scope: repo structure, package metadata, CLI, generators, validation, build/release scripts, docs, `dist`.

## Verification Performed

- Ran `git status --short`: existing dirty file before audit was `package-lock.json`.
- Ran `npm test`: passed.
- Ran `npm pack --json --dry-run`.
- Compared committed `dist` with a fresh temp build.
- Reviewed source, scripts, docs, generated manifest, and package file list.

## High-Priority Findings

### 1. `dist` is stale and ambiguous

- Evidence: committed `dist/emily.css` is a purged/minified CSS file at `128,141` bytes.
- Evidence: a fresh full build from the same config writes about `7,322,044` bytes.
- Evidence: committed manifest version is `1.2.10`; package version is `1.2.20`.
- Problem: the repo contains generated output that does not represent the current generator or package version.
- Suggested fix: decide whether `dist` is a demo artifact or source-controlled release artifact. If source-controlled, add a freshness check. If not, remove it from repo or document that it is local/demo output.
- Files likely affected: `dist/*`, `.gitignore`, `package.json`, tests.
- Risk: high.

### 2. Package file list excludes docs and dist but includes `src/test/e2e.test.js`

- Evidence: `package.json` `files` includes `bin/`, `src/`, `templates/`, README/LICENSE/CHANGELOG.
- Evidence: dry-run package includes `src/test/e2e.test.js`, but excludes `docs/`.
- Problem: published package ships internal test code while documentation pages are not shipped.
- Suggested fix: either exclude `src/test/` with `.npmignore`/files granularity, or move e2e tests out of `src`. Consider including `docs/` if npm package users should receive docs.
- Files likely affected: `package.json`, `.npmignore`, repo layout.
- Risk: medium.

### 3. Package scripts are not consistent with init-created scripts

- Evidence: root `package.json` has `emily:build`, `watch`, `doctor`, `migrate`, `info`, `manifest`, `version`, `help`, but not `emily:showcase` or `emily:uninstall`.
- Evidence: `src/init.js` adds `emily:showcase` and `emily:uninstall`.
- Problem: local package scripts do not match what the CLI scaffolds.
- Suggested fix: add parity or document why the package repo differs.
- Files likely affected: `package.json`, tests.
- Risk: low.

### 4. Validation only covers part of the config

- Evidence: `src/validate.js` validates `colours`, `spacing.scale`, `fontFamily`, `output`, and `manifest`.
- Evidence: invalid `transitions`, `breakpoints`, `typography`, and empty `colours` can pass randomized abuse tests as graceful successes.
- Problem: malformed CSS or misleading success can be emitted.
- Suggested fix: validate `semanticColours`, `typography`, `breakpoints`, `shadows`, `zIndex`, `transitions`, `opacity`, `intellisense`, and purge config.
- Files likely affected: `src/validate.js`, `src/validateConfig.js`, tests.
- Risk: high.

### 5. Some generators ignore config tokens

- Evidence: `shadowUtilities()` hard-codes shadows while `config.shadows` exists.
- Evidence: `transitionUtilities()` hard-codes durations/timing while `config.transitions` exists.
- Evidence: `positioningUtilities()` hard-codes z-index values while `config.zIndex` exists.
- Problem: “token-first” behavior is inconsistent.
- Suggested fix: pass config into these generators and generate from token maps.
- Files likely affected: `src/index.js`, `src/generators/effects.js`, `src/generators/positioning.js`, tests.
- Risk: medium.

### 6. Manifest extraction drops intentional pseudo-class utilities

- Evidence: `focus-ring`, `focus-ring-inset`, `focus-ring-none`, and `sr-only-focusable` are in CSS source but not manifest.
- Problem: manifest, doctor, migrate, and IntelliSense are not accurate for these utilities.
- Suggested fix: update `extractManifestClassSelectors()` to record leading class selectors for known intentional pseudo-class utilities, while still skipping expanded generated variants.
- Files likely affected: `src/manifest.js`, tests.
- Risk: medium.

### 7. Docs contain starter stubs and old metadata

- Evidence: `docs/accessibility.md`, `docs/variants.md`, `docs/manifest.md`, and others are starter stubs.
- Evidence: `docs/manifest.md` example version is `1.2.1`.
- Evidence: source comment points to `https://emilyui.com/docs/getting-started`; README points to `https://emilyui.dev`.
- Problem: documentation does not match project claims or current version.
- Suggested fix: update docs after behavior is fixed; add docs lint/test for stale version/domain references.
- Files likely affected: `docs/*`, `README.md`, source comments.
- Risk: medium.

### 8. Naming is mixed between EmilyUI, emilyCSS, and EmilyCSS

- Evidence: CLI binary is `emily-css`, package is `emily-css`, setup logs say `EmilyUI Setup`, README title says `emilyCSS`, framework context says EmilyCSS.
- Problem: brand/product naming is inconsistent.
- Suggested fix: standardize public naming; keep binary/package as `emily-css`.
- Files likely affected: README, docs, `src/init.js`, `src/watch.js`, scripts, templates.
- Risk: low.

### 9. Release/ship scripts are risky for automation

- Evidence: `scripts/release.js` performs npm login, version bump, changelog write, git commit/tag, push, and publish interactively.
- Evidence: release script uses string-built shell commands such as `git log ${range}` and `npm version ${bumpType}`.
- Problem: release is difficult to dry-run, test, or run in CI. Auth/publish is coupled with changelog/version mutation.
- Suggested fix: split into `release:prepare`, `release:tag`, `release:publish`; add dry-run; use `spawnSync` argument arrays.
- Files likely affected: `scripts/release.js`, `scripts/ship.js`, tests.
- Risk: medium.

### 10. Build output path defaults can overwrite full CSS with production CSS

- Evidence: default config sets `output.css` and `output.fullCss` to `dist/emily.css`.
- Evidence: README says this is intentional for new projects.
- Problem: it is pragmatic, but creates ambiguity between dev full CSS, production CSS, and generated manifest state.
- Suggested fix: docs and CLI output should explicitly say whether `dist/emily.css` is full or purged after each command. Consider default `dist/emily.full.css` for dev in v2.
- Files likely affected: `src/index.js`, docs, init defaults.
- Risk: medium.

## Additional Findings

- `src/generators.js` is a compatibility shim; useful but should be documented as public API or internal.
- `project_context.txt` and `project_context - new.txt` are very large local context files in the repo root and are ignored by purge config, but they are not in package files. Consider moving them outside the repo or documenting them as local artifacts.
- `component-test.html` and `showcase.html` are root demo files. They influence production purge when config scans root unless ignored, which the current config does.
- `baseUnit` is documentation-only while `spacing.scale` is source of truth; tests cover this, but docs should be explicit.
- `opacity` exists in config but opacity utilities use a hard-coded array instead of config.

## Windows Compatibility

- Tests run successfully on the current Windows/PowerShell environment.
- Code generally uses `path.join` and normalized globs.
- `scripts/ship.js` prints `rm .git/index.lock`, which is not a Windows-native command. Suggested message should include PowerShell equivalent.
- Release script uses shell strings; prefer argument arrays for cross-platform robustness.

## Generated Output Consistency

- Fresh full build and committed dist are intentionally or accidentally different. This must be resolved before treating `dist` as test oracle.
- Manifest utility count matched between committed and fresh (`4070`), but version metadata differed.
- Committed `dist/emily.css` contains a small purged subset of utilities and should not be used to infer full utility coverage.

## Recommended QA Actions

1. Add a CI check for generated artifact policy.
2. Expand config validation to all emitted token/config surfaces.
3. Fix package file contents to exclude internal tests and include intended docs.
4. Standardize naming and docs domains.
5. Split release scripts into testable, non-publishing preparation steps.
