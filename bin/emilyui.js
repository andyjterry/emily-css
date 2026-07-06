#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const command = process.argv[2];
const packageJson = require(path.join(__dirname, "..", "package.json"));
const usageText = `
  emily-css — Config-driven CSS framework generator

  Usage:
    emily-css init        Set up a new project
      --fresh             Ignore existing emily.config.json values
      --use-existing      Use existing emily.config.json values as defaults
      --yes, -y           Non-interactive: accept detected/existing values
      --config-only       Write emily.config.json without building CSS
      --brand <hex>       Brand colour, e.g. --brand "#D92787"
      --accent <hex>      Accent colour, e.g. --accent "#F59E0B"
      --heading-font <f>  Heading font key, e.g. lexend
      --body-font <f>     Body font key, e.g. inter
      --skip-font-install Skip optional @fontsource package install prompt
    emily-css build       Generate production CSS to the configured output path
      --profile           Print coarse build timing information
    emily-css watch       Dev mode: rebuild full CSS on config changes
      --prod              Watch source files and rebuild minified CSS on changes
    emily-css info        Show project config and CSS stats
    emily-css doctor      Scan project files for unknown EmilyCSS classes
      --strict-contrast   Fail when configured colour tokens miss WCAG AA contrast
    emily-css migrate     Generate a Tailwind-to-EmilyCSS migration report
      --import-colours    Detect Tailwind colour palettes and suggest importedPalettes config
    emily-css manifest    Generate the utility/token manifest JSON
    emily-css showcase    Browse components in your browser
    emily-css uninstall   Remove EmilyCSS files/scripts/config traces from this project
      --yes, -y           Remove without confirmation prompts
      --dry-run           Show what would be removed without changing files
    emily-css help        Full command reference

  Run emily-css help for more detail.
`;

if (command === "init") {
  const { init, parseInitOptions } = require("../src/init.js");
  init(parseInitOptions(process.argv.slice(3)));
} else if (command === "build") {
  const { build } = require("../src/index.js");
  build({
    keepFull: process.argv.includes("--keep-full"),
    profile: process.argv.includes("--profile"),
  });
} else if (command === "watch") {
  const { runWatch } = require("../src/watch.js");
  runWatch(process.argv.includes("--prod") ? "prod" : "dev");
} else if (command === "showcase") {
  require("../src/showcase.js");
} else if (command === "info") {
  const { info } = require("../src/info.js");
  info();
} else if (command === "doctor") {
  const { doctor } = require("../src/doctor.js");
  const result = doctor({
    strictContrast: process.argv.includes("--strict-contrast"),
  });
  process.exitCode = result.exitCode;
} else if (command === "migrate") {
  const { generateMigrationReport } = require("../src/migrate.js");
  const { formatMigrationReport } = require("../src/reporters/migrationReporter.js");
  const importColours = process.argv.includes("--import-colours");
  const report = generateMigrationReport({ importColours });
  console.log(formatMigrationReport(report, { importColours }));
} else if (command === "manifest") {
  const { getConfig, getFullCssPath, getManifestOutputPath, ensureDirectoryForFile } = require("../src/config.js");
  const { ensureFullFramework } = require("../src/index.js");
  const { generateManifest } = require("../src/manifest.js");
  const config = getConfig();
  ensureFullFramework();
  const fullCssPath = getFullCssPath(config);
  const css = fs.readFileSync(fullCssPath, "utf8");
  const manifestData = generateManifest(css, config);
  const manifestPath = getManifestOutputPath(config);
  ensureDirectoryForFile(manifestPath);
  fs.writeFileSync(manifestPath, JSON.stringify(manifestData, null, 2));
  console.log(`✓ Generated manifest: ${manifestPath}`);
} else if (command === "uninstall") {
  const { uninstall, parseUninstallOptions } = require("../src/uninstall.js");
  uninstall(parseUninstallOptions(process.argv.slice(3))).catch((error) => {
    const message = error && error.message ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
  });
} else if (command === "version" || command === "--version" || command === "-v") {
  console.log(packageJson.version);
} else if (command === "help") {
  console.log(`
  emily-css — Config-driven CSS framework generator
  
  Commands:
    emily-css init        Set up a new project (interactive wizard)
      --fresh             Ignore existing emily.config.json values
      --use-existing      Use existing emily.config.json values as defaults
      --yes, -y           Non-interactive: accept detected/existing values
      --config-only       Write emily.config.json without building CSS
      --brand <hex>       Brand colour, e.g. --brand "#D92787"
      --accent <hex>      Accent colour, e.g. --accent "#F59E0B"
      --heading-font <f>  Heading font key, e.g. lexend
      --body-font <f>     Body font key, e.g. inter
      --skip-font-install Skip optional @fontsource package install prompt
    emily-css build       Generate production CSS to the configured output path
      --profile           Print coarse build timing information
    emily-css watch       Dev mode: watch config and rebuild full CSS
      --prod              Production watch: purge + minify on source changes
    emily-css info        Show project config, output paths, and CSS stats
    emily-css doctor      Scan project files for unknown EmilyCSS classes
      --strict-contrast   Fail when configured colour tokens miss WCAG AA contrast
    emily-css migrate     Generate a Tailwind-to-EmilyCSS migration report
      --import-colours    Detect Tailwind colour palettes and suggest importedPalettes config
    emily-css manifest    Generate the utility/token manifest JSON
    emily-css showcase    Launch the component showcase in your browser
    emily-css uninstall   Remove EmilyCSS-generated files and scripts from this project
      --yes, -y           Remove without confirmation prompts
      --dry-run           Show what would be removed without changing files
    emily-css version     Show installed version
    emily-css help        Show this help text
  
  npm scripts (added by init):
    npm run emily:build      Same as emily-css build
    npm run emily:watch      Same as emily-css watch
    npm run emily:watch:prod Same as emily-css watch --prod
    npm run emily:doctor     Same as emily-css doctor
    npm run emily:migrate    Same as emily-css migrate
    npm run emily:info       Same as emily-css info
    npm run emily:manifest   Same as emily-css manifest
    npm run emily:showcase   Same as emily-css showcase
    npm run emily:uninstall  Same as emily-css uninstall
    npm run emily:version    Same as emily-css version
    npm run emily:help       Same as emily-css help
  
  Docs: https://emilyui.com/docs
`);
} else {
  if (!command) {
    console.log(usageText);
  } else {
    console.error(`Unknown command: ${command}`);
    console.log(usageText);
    process.exitCode = 1;
  }
}
