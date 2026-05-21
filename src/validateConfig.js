'use strict';

const fs = require('fs');
const path = require('path');
const { validateConfigShape } = require('./validate');

function validateConfigOrExit() {
  const configPath = path.join(process.cwd(), 'emily.config.json');

  if (!fs.existsSync(configPath)) {
    console.error('Invalid EmilyCSS config: emily.config.json not found.');
    process.exit(1);
  }

  let config;
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (error) {
    console.error('Invalid EmilyCSS config: emily.config.json is not valid JSON.');
    console.error(error.message);
    process.exit(1);
  }

  const result = validateConfigShape(config);
  if (!result.valid) {
    console.error('Invalid EmilyCSS config:');
    result.errors.forEach((error) => {
      console.error('- ' + error);
    });
    process.exit(1);
  }
}

module.exports = {
  validateConfigOrExit,
};
