'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { buildFullFramework } = require('../index.js');

const TOTAL_RUNS = 50;
const FONT_CHOICES = [
  'system',
  'inter',
  'lexend',
  'georgia',
  'dm-sans',
  'nunito',
  'atkinson',
  'mono',
];

function readBaseConfig() {
  const configPath = path.join(__dirname, '../../emily.config.json');
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(values) {
  return values[randomInt(0, values.length - 1)];
}

function randomHexColour() {
  const channel = () => randomInt(0, 255).toString(16).padStart(2, '0');
  return `#${channel()}${channel()}${channel()}`.toUpperCase();
}

function randomSpacingScale() {
  const keys = ['0', '0.5', '1', '1.5', '2', '2.5', '3', '3.5', '4', '5', '6', '8', '10', '12'];
  const scale = { 0: '0px' };

  keys.forEach((key) => {
    if (key === '0') {
      return;
    }

    const remSteps = randomInt(1, 48);
    const remValue = (remSteps / 16).toFixed(4).replace(/\.?0+$/, '');
    scale[key] = `${remValue}rem`;
  });

  return scale;
}

function randomTransitions() {
  const fast = randomInt(75, 175);
  const base = randomInt(Math.max(150, fast + 10), 300);
  const slow = randomInt(Math.max(250, base + 10), 450);

  return {
    fast: `${fast}ms`,
    base: `${base}ms`,
    slow: `${slow}ms`,
    timing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  };
}

function randomColours() {
  return {
    brand: randomHexColour(),
    accent: randomHexColour(),
    'btn-primary': randomHexColour(),
    'btn-secondary': randomHexColour(),
    success: randomHexColour(),
    warning: randomHexColour(),
    error: randomHexColour(),
    neutral: randomHexColour(),
  };
}

function buildRandomConfig(baseConfig) {
  const config = clone(baseConfig);
  const heading = randomChoice(FONT_CHOICES);
  const body = randomChoice(FONT_CHOICES);

  config.colours = randomColours();
  config.spacing = {
    ...config.spacing,
    scale: randomSpacingScale(),
  };
  config.fontFamily = {
    heading,
    body,
  };
  config.transitions = {
    ...config.transitions,
    ...randomTransitions(),
  };
  config.output = {
    css: 'dist/emily.min.css',
    fullCss: 'dist/emily.css',
  };
  config.manifest = {
    enabled: true,
    output: 'dist/emily.manifest.json',
  };

  return config;
}

function validateBuildOutput(tempDir) {
  const cssPath = path.join(tempDir, 'dist', 'emily.css');
  const manifestPath = path.join(tempDir, 'dist', 'emily.manifest.json');

  assert.ok(fs.existsSync(cssPath), `Missing CSS output: ${cssPath}`);
  const css = fs.readFileSync(cssPath, 'utf8');
  assert.ok(css.trim().length > 0, `Generated CSS is empty: ${cssPath}`);

  assert.ok(fs.existsSync(manifestPath), `Missing manifest output: ${manifestPath}`);
  const manifestRaw = fs.readFileSync(manifestPath, 'utf8');
  assert.ok(manifestRaw.trim().length > 0, `Generated manifest is empty: ${manifestPath}`);
  assert.doesNotThrow(() => JSON.parse(manifestRaw), `Manifest is not valid JSON: ${manifestPath}`);
}

function run() {
  const baseConfig = readBaseConfig();
  const initialCwd = process.cwd();

  for (let i = 0; i < TOTAL_RUNS; i += 1) {
    const runNumber = i + 1;
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'emily-e2e-'));

    try {
      const randomConfig = buildRandomConfig(baseConfig);
      fs.writeFileSync(
        path.join(tempDir, 'emily.config.json'),
        JSON.stringify(randomConfig, null, 2),
      );

      process.chdir(tempDir);
      assert.doesNotThrow(
        () => buildFullFramework(),
        `buildFullFramework threw for run ${runNumber}`,
      );
      validateBuildOutput(tempDir);
    } catch (error) {
      throw new Error(`Randomized E2E run ${runNumber}/${TOTAL_RUNS} failed: ${error.message}`);
    } finally {
      process.chdir(initialCwd);
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }

  console.log(`✓ Randomized E2E passed (${TOTAL_RUNS} configs)`);
}

try {
  run();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
