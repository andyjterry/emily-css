'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const TOTAL_RUNS = 60;
const FONT_KEYS = ['system', 'inter', 'lexend', 'georgia', 'dm-sans', 'nunito', 'atkinson', 'mono'];
const BUILD_MODULE_PATH = path.resolve(__dirname, '../index.js');

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

function createDeepObject(depth) {
  let root = {};
  let cursor = root;
  for (let i = 0; i < depth; i += 1) {
    cursor['layer' + i] = {};
    cursor = cursor['layer' + i];
  }
  cursor.value = 'deep-value';
  return root;
}

function createCircularObject(baseConfig) {
  const config = clone(baseConfig);
  const circular = { label: 'circular' };
  circular.self = circular;
  config.attackVector = circular;
  return config;
}

function ensureBaselineShape(config) {
  if (!config || typeof config !== 'object') {
    return config;
  }

  config.output = {
    css: 'dist/emily.min.css',
    fullCss: 'dist/emily.css',
  };
  return config;
}

function withConfigMutation(name, mutate) {
  return {
    name,
    create(baseConfig) {
      const config = ensureBaselineShape(clone(baseConfig));
      mutate(config);
      return { type: 'config', payload: config };
    },
  };
}

function withRawJson(name, payload) {
  return {
    name,
    create() {
      return { type: 'raw', payload };
    },
  };
}

const ABUSE_CASES = [
  withConfigMutation('colour-8-digit-hex', (config) => { config.colours.brand = '#FF0000FF'; }),
  withConfigMutation('colour-3-digit-hex', (config) => { config.colours.brand = '#F00'; }),
  withConfigMutation('colour-invalid-hex', (config) => { config.colours.brand = '#GGGGGG'; }),
  withConfigMutation('colour-named', (config) => { config.colours.brand = 'red'; }),
  withConfigMutation('colour-null', (config) => { config.colours.brand = null; }),
  withConfigMutation('colour-empty', (config) => { config.colours.brand = ''; }),
  withConfigMutation('colour-number', (config) => { config.colours.brand = 123456; }),
  withConfigMutation('colour-xss-payload', (config) => { config.colours.brand = '<script>alert("hi")</script>'; }),

  withConfigMutation('spacing-negative-px', (config) => { config.spacing.scale['4'] = '-10px'; }),
  withConfigMutation('spacing-negative-rem', (config) => { config.spacing.scale['4'] = '-1rem'; }),
  withConfigMutation('spacing-huge-rem', (config) => { config.spacing.scale['4'] = '99999rem'; }),
  withConfigMutation('spacing-huge-px', (config) => { config.spacing.scale['4'] = '1000000px'; }),
  withConfigMutation('spacing-invalid-no-unit', (config) => { config.spacing.scale['4'] = '10'; }),
  withConfigMutation('spacing-invalid-unit', (config) => { config.spacing.scale['4'] = '10xx'; }),
  withConfigMutation('spacing-invalid-whitespace-unit', (config) => { config.spacing.scale['4'] = '10 rem'; }),
  withConfigMutation('spacing-null-value', (config) => { config.spacing.scale['4'] = null; }),
  withConfigMutation('spacing-nonnumeric', (config) => { config.spacing.scale['4'] = 'abc'; }),
  withConfigMutation('spacing-infinity', (config) => { config.spacing.scale['4'] = 'infinity'; }),
  withConfigMutation('spacing-descending-scale', (config) => {
    config.spacing.scale = {
      '10': '2.5rem',
      '8': '2rem',
      '6': '1.5rem',
      '4': '1rem',
      '2': '0.5rem',
      '0': '0px',
    };
  }),

  withConfigMutation('font-nonexistent', (config) => { config.fontFamily = { heading: 'banana-sans', body: 'foo' }; }),
  withConfigMutation('font-null', (config) => { config.fontFamily = null; }),
  withConfigMutation('font-empty-string', (config) => { config.fontFamily = ''; }),
  withConfigMutation('font-number', (config) => { config.fontFamily = 42; }),
  withConfigMutation('font-array', (config) => { config.fontFamily = ['inter', 'lexend']; }),
  withConfigMutation('font-object-weird-types', (config) => { config.fontFamily = { heading: {}, body: [] }; }),
  withConfigMutation('font-unicode-edge', (config) => { config.fontFamily = { heading: '\uD83D\uDCA5\u200D\uFE0F', body: '\u2066\u2067\u2069' }; }),
  withConfigMutation('font-very-long-string', (config) => {
    const long = 'x'.repeat(10000);
    config.fontFamily = { heading: long, body: long };
  }),

  withConfigMutation('missing-colours', (config) => { delete config.colours; }),
  withConfigMutation('missing-spacing', (config) => { delete config.spacing; }),
  withConfigMutation('wrong-type-colours-string', (config) => { config.colours = 'not-an-object'; }),
  withConfigMutation('wrong-type-spacing-string', (config) => { config.spacing = 'not-an-object'; }),
  withConfigMutation('wrong-type-transitions-string', (config) => { config.transitions = 'not-an-object'; }),
  withConfigMutation('unknown-extra-fields', (config) => {
    config.__unknown = true;
    config.notExpected = { nested: [1, 2, 3] };
  }),
  withConfigMutation('deeply-nested-object', (config) => {
    config.veryDeep = createDeepObject(300);
  }),
  {
    name: 'circular-reference',
    create(baseConfig) {
      return { type: 'config', payload: createCircularObject(baseConfig) };
    },
  },

  withConfigMutation('transition-negative-fast', (config) => { config.transitions.fast = '-100ms'; }),
  withConfigMutation('transition-negative-base', (config) => { config.transitions.base = '-200ms'; }),
  withConfigMutation('transition-negative-slow', (config) => { config.transitions.slow = '-300ms'; }),
  withConfigMutation('transition-nonnumeric-fast', (config) => { config.transitions.fast = 'abc'; }),
  withConfigMutation('transition-null-base', (config) => { config.transitions.base = null; }),
  withConfigMutation('transition-order-invalid', (config) => {
    config.transitions.fast = '300ms';
    config.transitions.base = '200ms';
    config.transitions.slow = '100ms';
  }),
  withConfigMutation('transition-number-types', (config) => {
    config.transitions.fast = 100;
    config.transitions.base = 200;
    config.transitions.slow = 300;
  }),
  withConfigMutation('transition-timing-malicious', (config) => {
    config.transitions.timing = 'cubic-bezier(0.4, 0, 0.2, 1));background:url(javascript:alert(1))/*';
  }),

  withRawJson('top-level-null', 'null'),
  withRawJson('top-level-string', '"oops"'),
  withRawJson('top-level-array', '["bad", "config"]'),
  withRawJson('invalid-json-syntax', '{"colours": {"brand": "#FF0000",}}'),

  withConfigMutation('spacing-scale-missing', (config) => { delete config.spacing.scale; }),
  withConfigMutation('spacing-scale-null', (config) => { config.spacing.scale = null; }),
  withConfigMutation('spacing-scale-array', (config) => { config.spacing.scale = ['1rem', '2rem']; }),
  withConfigMutation('manifest-wrong-type', (config) => { config.manifest = 'yes'; }),
  withConfigMutation('output-wrong-type', (config) => { config.output = 'dist/emily.css'; }),
  withConfigMutation('breakpoints-wrong-type', (config) => { config.breakpoints = 'sm,md,lg'; }),
  withConfigMutation('typography-null', (config) => { config.typography = null; }),
  withConfigMutation('typography-fontsizes-string', (config) => { config.typography.fontSizes = '16px'; }),
  withConfigMutation('typography-fontweights-number', (config) => { config.typography.fontWeights = 700; }),
  withConfigMutation('colours-empty-object', (config) => { config.colours = {}; }),
  withConfigMutation('colours-undefined-via-delete', (config) => { delete config.colours.brand; }),
  withConfigMutation('spacing-proto-pollution-shape', (config) => {
    config.spacing.scale = {
      '__proto__': { polluted: true },
      '4': '1rem',
      '8': '2rem',
      '0': '0px',
    };
  }),
];

function writeConfigFile(tempDir, caseDef, baseConfig) {
  const generated = caseDef.create(baseConfig);
  const configPath = path.join(tempDir, 'emily.config.json');

  if (generated.type === 'raw') {
    fs.writeFileSync(configPath, generated.payload);
    return;
  }

  assert.strictEqual(generated.type, 'config', `Unknown generated config type: ${generated.type}`);
  fs.writeFileSync(configPath, JSON.stringify(generated.payload, null, 2));
}

function runBuildInSubprocess(tempDir) {
  const runner = [
    'const { buildFullFramework } = require(' + JSON.stringify(BUILD_MODULE_PATH) + ');',
    'try {',
    '  buildFullFramework();',
    '  process.exit(0);',
    '} catch (error) {',
    '  const message = error && error.message ? error.message : String(error);',
    '  console.error(message);',
    '  process.exit(2);',
    '}',
  ].join('\n');

  return spawnSync(process.execPath, ['-e', runner], {
    cwd: tempDir,
    encoding: 'utf8',
  });
}

function assertFailureLooksClear(output, caseName) {
  const trimmed = output.trim();
  assert.ok(trimmed.length >= 8, `Case "${caseName}" failed but gave no clear error message`);
  assert.ok(trimmed !== '[object Object]', `Case "${caseName}" returned an unhelpful object error`);
}

function formatErrorSnippet(message) {
  return String(message || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100);
}

function assertSuccessLooksSensible(tempDir, caseName) {
  const cssPath = path.join(tempDir, 'dist', 'emily.css');
  assert.ok(fs.existsSync(cssPath), `Case "${caseName}" succeeded but did not output dist/emily.css`);

  const cssContent = fs.readFileSync(cssPath, 'utf8');
  assert.ok(cssContent.trim().length > 0, `Case "${caseName}" succeeded but CSS output was empty`);

  const manifestPath = path.join(tempDir, 'dist', 'emily.manifest.json');
  if (fs.existsSync(manifestPath)) {
    const raw = fs.readFileSync(manifestPath, 'utf8');
    assert.doesNotThrow(() => JSON.parse(raw), `Case "${caseName}" wrote invalid manifest JSON`);
  }
}

function run() {
  const baseConfig = readBaseConfig();
  const initialCwd = process.cwd();
  const createdTempDirs = [];
  let handledFailures = 0;
  let gracefulSuccesses = 0;
  let crashes = 0;
  const gracefulSuccessCases = [];
  const handledFailureCases = [];

  for (let i = 0; i < TOTAL_RUNS; i += 1) {
    const runLabel = `[${i + 1}/${TOTAL_RUNS}]`;
    const caseDef = randomChoice(ABUSE_CASES);
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'emily-chaos-'));
    createdTempDirs.push(tempDir);

    try {
      try {
        writeConfigFile(tempDir, caseDef, baseConfig);
      } catch (error) {
        const message = error && error.message ? error.message : String(error);
        assertFailureLooksClear(message, caseDef.name);
        const snippet = formatErrorSnippet(message);
        console.log(`${runLabel} ${caseDef.name} ... FAIL (${snippet})`);
        handledFailures += 1;
        handledFailureCases.push({ name: caseDef.name, error: snippet });
        continue;
      }

      const result = runBuildInSubprocess(tempDir);
      const output = (result.stdout || '') + '\n' + (result.stderr || '');

      if (result.status === 0) {
        assertSuccessLooksSensible(tempDir, caseDef.name);
        console.log(`${runLabel} ${caseDef.name} ... OK (graceful success)`);
        gracefulSuccesses += 1;
        gracefulSuccessCases.push(caseDef.name);
      } else if (result.status === 1 || result.status === 2) {
        assertFailureLooksClear(output, caseDef.name);
        const snippet = formatErrorSnippet(output);
        console.log(`${runLabel} ${caseDef.name} ... FAIL (${snippet})`);
        handledFailures += 1;
        handledFailureCases.push({ name: caseDef.name, error: snippet });
      } else {
        crashes += 1;
        const snippet = formatErrorSnippet(output || `exit ${result.status}`);
        console.log(`${runLabel} ${caseDef.name} ... CRASH (${snippet})`);
        throw new Error(
          `Case "${caseDef.name}" crashed (exit ${result.status}). Output:\n${output.trim() || '(no output)'}`,
        );
      }
    } catch (error) {
      throw new Error(`Chaos run ${i + 1}/${TOTAL_RUNS} failed for case "${caseDef.name}": ${error.message}`);
    } finally {
      process.chdir(initialCwd);
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }

  const leftoverTempDirs = createdTempDirs.filter((tempDir) => fs.existsSync(tempDir));
  assert.strictEqual(leftoverTempDirs.length, 0, `Temp directory cleanup failed for ${leftoverTempDirs.length} case(s)`);
  assert.ok(handledFailures + gracefulSuccesses >= 50, 'Expected at least 50 chaos runs');
  assert.strictEqual(crashes, 0, `Detected ${crashes} unhandled crash(es) during chaos testing`);

  console.log('\nResults:');
  console.log(`  Graceful successes (${gracefulSuccesses}): ${gracefulSuccessCases.join(', ') || '(none)'}`);
  console.log(`  Handled failures (${handledFailures}):`);
  if (handledFailureCases.length === 0) {
    console.log('  - (none)');
  } else {
    handledFailureCases.forEach((entry) => {
      console.log(`  - ${entry.name}: ${entry.error}`);
    });
  }

  console.log(
    `✓ Chaos testing passed (50+ abuse cases, 0 crashes) [runs=${TOTAL_RUNS}, handled-failures=${handledFailures}, graceful-successes=${gracefulSuccesses}]`,
  );
}

try {
  run();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
