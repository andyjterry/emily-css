'use strict';

const fs = require('fs');
const path = require('path');
const { Confirm } = require('enquirer');
const chalk = require('chalk');

const FONT_PACKAGE_BY_KEY = {
  inter: '@fontsource/inter',
  lexend: '@fontsource/lexend',
  figtree: '@fontsource/figtree',
  'dm-sans': '@fontsource/dm-sans',
  nunito: '@fontsource/nunito',
  atkinson: '@fontsource/atkinson-hyperlegible',
};

const FONT_IMPORTS_BY_KEY = {
  inter: [
    '@fontsource/inter/400.css',
    '@fontsource/inter/500.css',
    '@fontsource/inter/600.css',
    '@fontsource/inter/700.css',
  ],
  lexend: [
    '@fontsource/lexend/400.css',
    '@fontsource/lexend/500.css',
    '@fontsource/lexend/600.css',
    '@fontsource/lexend/700.css',
  ],
  figtree: [
    '@fontsource/figtree/400.css',
    '@fontsource/figtree/500.css',
    '@fontsource/figtree/600.css',
    '@fontsource/figtree/700.css',
  ],
  'dm-sans': [
    '@fontsource/dm-sans/400.css',
    '@fontsource/dm-sans/500.css',
    '@fontsource/dm-sans/700.css',
  ],
  nunito: [
    '@fontsource/nunito/400.css',
    '@fontsource/nunito/500.css',
    '@fontsource/nunito/700.css',
  ],
  atkinson: [
    '@fontsource/atkinson-hyperlegible/400.css',
    '@fontsource/atkinson-hyperlegible/700.css',
  ],
};

const EMILY_SCRIPT_NAMES = [
  'emily:build',
  'emily:watch',
  'emily:watch:prod',
  'emily:doctor',
  'emily:migrate',
  'emily:info',
  'emily:manifest',
  'emily:version',
  'emily:showcase',
  'emily:help',
  'emily:uninstall',
];

function hasFlag(args, ...flags) {
  return flags.some((flag) => args.includes(flag));
}

function parseUninstallOptions(args = []) {
  return {
    yes: hasFlag(args, '--yes', '-y'),
    keepConfig: hasFlag(args, '--keep-config'),
    keepCss: hasFlag(args, '--keep-css'),
    keepScripts: hasFlag(args, '--keep-scripts'),
    keepFontPackages: hasFlag(args, '--keep-font-packages'),
    dryRun: hasFlag(args, '--dry-run'),
  };
}

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function getSelectedFontPackages(config) {
  const fontFamily = config && config.fontFamily;
  if (!fontFamily || typeof fontFamily !== 'object') return [];

  const keys = [fontFamily.heading, fontFamily.body]
    .filter((value) => typeof value === 'string')
    .map((value) => value.trim())
    .filter(Boolean);
  const unique = Array.from(new Set(keys));
  const packages = [];

  unique.forEach((key) => {
    const pkg = FONT_PACKAGE_BY_KEY[key];
    if (pkg && !packages.includes(pkg)) packages.push(pkg);
  });

  return packages;
}

function getSelectedFontImports(config) {
  const fontFamily = config && config.fontFamily;
  if (!fontFamily || typeof fontFamily !== 'object') return [];

  const keys = [fontFamily.heading, fontFamily.body]
    .filter((value) => typeof value === 'string')
    .map((value) => value.trim())
    .filter(Boolean);
  const unique = Array.from(new Set(keys));
  const imports = [];

  unique.forEach((key) => {
    const values = FONT_IMPORTS_BY_KEY[key];
    if (!Array.isArray(values)) return;
    values.forEach((value) => {
      if (!imports.includes(value)) imports.push(value);
    });
  });

  return imports;
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function cleanupNuxtRuntimeWiring(config, dryRun = false) {
  const candidates = ['nuxt.config.ts', 'nuxt.config.js'];
  const target = candidates.find((candidate) => fs.existsSync(path.join(process.cwd(), candidate)));
  if (!target) return { changed: false, target: null };

  const absolutePath = path.join(process.cwd(), target);
  const original = fs.readFileSync(absolutePath, 'utf8');
  let next = original;

  const selectedImports = getSelectedFontImports(config);
  selectedImports.forEach((fontImport) => {
    const importRegex = new RegExp(`^.*['"]${escapeRegex(fontImport)}['"].*\\r?\\n?`, 'gm');
    next = next.replace(importRegex, '');
  });

  // Remove Emily stylesheet entries previously injected in Nuxt config wiring.
  next = next
    .replace(/^.*href\s*:\s*['"][^'"]*emily(?:\.min)?\.css['"].*\r?\n?/gim, '')
    .replace(/^.*['"][^'"]*emily(?:\.min)?\.css['"].*\r?\n?/gim, (line) => {
      if (/href\s*:/.test(line)) return '';
      if (/css\s*:/.test(line)) return line;
      return '';
    });

  // Cleanup simple accidental duplicate commas introduced by line removals.
  next = next.replace(/,\s*,/g, ',');

  const changed = next !== original;
  if (changed && !dryRun) {
    fs.writeFileSync(absolutePath, next);
  }

  return { changed, target };
}

function collectGeneratedFileCandidates(configPath, config) {
  const files = new Set();
  const cwd = process.cwd();

  files.add(path.join(cwd, 'dist', 'emily.css'));
  files.add(path.join(cwd, 'dist', 'emily.min.css'));
  files.add(path.join(cwd, 'dist', 'emily.manifest.json'));
  files.add(path.join(cwd, 'dist', 'emily.intellisense.json'));
  files.add(path.join(cwd, 'public', 'emily.css'));
  files.add(path.join(cwd, 'public', 'emily.min.css'));
  files.add(path.join(cwd, 'showcase.html'));

  if (configPath) files.add(configPath);

  if (config && typeof config === 'object') {
    const output = config.output || {};
    if (typeof output.css === 'string' && output.css.trim()) {
      files.add(path.resolve(cwd, output.css.trim()));
    }
    if (typeof output.fullCss === 'string' && output.fullCss.trim()) {
      files.add(path.resolve(cwd, output.fullCss.trim()));
    }

    if (config.manifest === true) {
      files.add(path.join(cwd, 'dist', 'emily.manifest.json'));
    } else if (config.manifest && typeof config.manifest === 'object' && config.manifest.output) {
      files.add(path.resolve(cwd, config.manifest.output));
    }

    if (config.intellisense === true) {
      files.add(path.join(cwd, 'dist', 'emily.intellisense.json'));
    } else if (config.intellisense && typeof config.intellisense === 'object' && config.intellisense.output) {
      files.add(path.resolve(cwd, config.intellisense.output));
    }
  }

  return Array.from(files);
}

function shouldRemoveShowcase(filePath) {
  if (path.basename(filePath) !== 'showcase.html') return true;
  if (!fs.existsSync(filePath)) return false;

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.includes('<title>EmilyUI Showcase</title>');
  } catch {
    return false;
  }
}

function isDirectoryEmpty(dirPath) {
  try {
    const entries = fs.readdirSync(dirPath);
    return entries.length === 0;
  } catch {
    return false;
  }
}

function removeFile(filePath, report) {
  if (!fs.existsSync(filePath)) return;
  if (!shouldRemoveShowcase(filePath)) return;
  fs.unlinkSync(filePath);
  report.removedFiles.push(path.relative(process.cwd(), filePath));
}

function removeEmilyScripts(packageJson) {
  if (!packageJson || typeof packageJson !== 'object') return [];
  const scripts = packageJson.scripts;
  if (!scripts || typeof scripts !== 'object') return [];

  const removed = [];
  Object.keys(scripts).forEach((name) => {
    const value = scripts[name];
    const isEmilyNamedScript = EMILY_SCRIPT_NAMES.includes(name) || name.startsWith('emily:');
    const isEmilyCommandScript = typeof value === 'string' && value.includes('emily-css');

    if (isEmilyNamedScript || isEmilyCommandScript) {
      delete scripts[name];
      removed.push(name);
    }
  });

  return removed;
}

function removeFontPackagesFromPackageJson(packageJson, packagesToRemove) {
  if (!packageJson || typeof packageJson !== 'object') return [];
  const removed = [];
  const fields = ['dependencies', 'devDependencies'];

  fields.forEach((field) => {
    if (!packageJson[field] || typeof packageJson[field] !== 'object') return;
    packagesToRemove.forEach((pkg) => {
      if (packageJson[field][pkg]) {
        delete packageJson[field][pkg];
        removed.push(pkg);
      }
    });
  });

  return Array.from(new Set(removed));
}

function cleanupEmptyFoldersFromFiles(removedRelativeFiles) {
  const touchedDirs = new Set(
    removedRelativeFiles.map((relativeFile) =>
      path.resolve(process.cwd(), path.dirname(relativeFile)),
    ),
  );

  const sorted = Array.from(touchedDirs).sort((a, b) => b.length - a.length);
  sorted.forEach((dirPath) => {
    if (dirPath === process.cwd()) return;
    if (isDirectoryEmpty(dirPath)) {
      fs.rmdirSync(dirPath);
    }
  });
}

async function uninstall(options = {}) {
  const uninstallOptions = {
    yes: Boolean(options.yes),
    keepConfig: Boolean(options.keepConfig),
    keepCss: Boolean(options.keepCss),
    keepScripts: Boolean(options.keepScripts),
    keepFontPackages: Boolean(options.keepFontPackages),
    dryRun: Boolean(options.dryRun),
  };

  const cwd = process.cwd();
  const report = {
    removedFiles: [],
    removedScripts: [],
    removedFontPackages: [],
    removedRuntimeWiringTargets: [],
    warnings: [],
  };

  const packageJsonPath = path.join(cwd, 'package.json');
  const packageJson = readJsonIfExists(packageJsonPath);
  const configPath = path.join(cwd, 'emily.config.json');
  const config = readJsonIfExists(configPath);

  const candidateFiles = collectGeneratedFileCandidates(fs.existsSync(configPath) ? configPath : null, config);
  const filesToRemove = candidateFiles.filter((filePath) => {
    if (!fs.existsSync(filePath)) return false;
    if (uninstallOptions.keepConfig && path.basename(filePath) === 'emily.config.json') return false;
    if (
      uninstallOptions.keepCss &&
      (filePath.endsWith('emily.css') || filePath.endsWith('emily.min.css'))
    ) {
      return false;
    }
    return true;
  });

  if (!uninstallOptions.keepScripts && packageJson) {
    report.removedScripts = removeEmilyScripts(packageJson);
  }

  if (!uninstallOptions.keepFontPackages && packageJson && config) {
    const selectedPackages = getSelectedFontPackages(config);
    report.removedFontPackages = removeFontPackagesFromPackageJson(packageJson, selectedPackages);
  }

  const nuxtCleanupResult = cleanupNuxtRuntimeWiring(config, uninstallOptions.dryRun);
  if (nuxtCleanupResult.changed && nuxtCleanupResult.target) {
    report.removedRuntimeWiringTargets.push(nuxtCleanupResult.target);
  }

  const hasChanges =
    filesToRemove.length > 0 ||
    report.removedScripts.length > 0 ||
    report.removedFontPackages.length > 0 ||
    report.removedRuntimeWiringTargets.length > 0;

  if (!hasChanges) {
    console.log(chalk.gray('No EmilyCSS traces found to remove.'));
    return report;
  }

  if (!uninstallOptions.yes) {
    const summary = [];
    if (filesToRemove.length > 0) summary.push(`${filesToRemove.length} file(s)`);
    if (report.removedScripts.length > 0) summary.push(`${report.removedScripts.length} script(s)`);
    if (report.removedFontPackages.length > 0) summary.push(`${report.removedFontPackages.length} font package reference(s)`);
    if (report.removedRuntimeWiringTargets.length > 0) summary.push('runtime config cleanup');

    const confirmed = await new Confirm({
      name: 'confirmUninstall',
      message: `Remove EmilyCSS traces from this project (${summary.join(', ')})?`,
      initial: true,
    }).run();

    if (!confirmed) {
      console.log(chalk.yellow('Cancelled.'));
      return report;
    }
  }

  if (uninstallOptions.dryRun) {
    console.log(chalk.cyan('Dry run: no files were changed.'));
  } else {
    filesToRemove.forEach((filePath) => removeFile(filePath, report));

    if (packageJson && packageJsonPath) {
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    }

    cleanupEmptyFoldersFromFiles(report.removedFiles);
  }

  console.log(chalk.green('EmilyCSS cleanup complete.'));
  if (report.removedFiles.length > 0) {
    console.log(chalk.gray(`  Removed files: ${report.removedFiles.length}`));
  }
  if (report.removedScripts.length > 0) {
    console.log(chalk.gray(`  Removed scripts: ${report.removedScripts.join(', ')}`));
  }
  if (report.removedFontPackages.length > 0) {
    console.log(chalk.gray(`  Removed font package refs: ${report.removedFontPackages.join(', ')}`));
    console.log(chalk.gray('  Run your package manager install to refresh lockfiles.'));
  }
  if (report.removedRuntimeWiringTargets.length > 0) {
    console.log(
      chalk.gray(
        `  Cleaned runtime wiring in: ${report.removedRuntimeWiringTargets.join(', ')}`,
      ),
    );
  }

  return report;
}

module.exports = {
  uninstall,
  parseUninstallOptions,
  collectGeneratedFileCandidates,
  getSelectedFontPackages,
  getSelectedFontImports,
  cleanupNuxtRuntimeWiring,
  removeEmilyScripts,
};
