'use strict';

const ALLOWED_FONT_FAMILIES = [
  'system',
  'inter',
  'lexend',
  'georgia',
  'dm-sans',
  'nunito',
  'atkinson',
  'mono',
];

const ALLOWED_FONT_FAMILY_SET = new Set(ALLOWED_FONT_FAMILIES);

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function validateHexColour(value) {
  if (typeof value !== 'string') {
    return { valid: false, reason: 'must be a string in #RRGGBB format' };
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return { valid: false, reason: 'must be a 6-digit hex like #FF0000 (value is empty)' };
  }

  if (!trimmed.startsWith('#')) {
    return { valid: false, reason: 'must include # symbol (example: #FF0000)' };
  }

  if (!/^#[0-9A-Fa-f]{6}$/.test(trimmed)) {
    return { valid: false, reason: 'must be #RRGGBB format' };
  }

  return { valid: true };
}

function validateSpacingValue(value) {
  if (typeof value !== 'string') {
    return { valid: false, reason: 'must be a string CSS length like 1rem or 10px' };
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return { valid: false, reason: 'must be a CSS length like 1rem or 10px (value is empty)' };
  }

  if (/\s/.test(trimmed)) {
    return { valid: false, reason: 'must not contain spaces (use 10px, not 10 px)' };
  }

  if (trimmed.startsWith('-')) {
    return { valid: false, reason: 'must not be negative (e.g. -1rem is not allowed)' };
  }

  const match = /^(\d+(?:\.\d+)?)(rem|px)$/i.exec(trimmed);
  if (!match) {
    return { valid: false, reason: 'must be numeric and use rem or px units (e.g. 1rem, 10px)' };
  }

  const numericPart = Number.parseFloat(match[1]);
  const unit = match[2].toLowerCase();

  if (!Number.isFinite(numericPart)) {
    return { valid: false, reason: 'must be a finite numeric value' };
  }

  if (unit === 'rem' && numericPart > 9999) {
    return { valid: false, reason: 'rem value is too large (max 9999rem)' };
  }

  if (unit === 'px' && numericPart > 99999) {
    return { valid: false, reason: 'px value is too large (max 99999px)' };
  }

  return { valid: true };
}

function validateFontFamily(value) {
  if (typeof value !== 'string') {
    return { valid: false, reason: 'must be a string font key' };
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return { valid: false, reason: 'must not be empty' };
  }

  if (!ALLOWED_FONT_FAMILY_SET.has(trimmed)) {
    return {
      valid: false,
      reason: `must be one of: ${ALLOWED_FONT_FAMILIES.join(', ')}`,
    };
  }

  return { valid: true };
}

function validateConfigShape(config) {
  const errors = [];

  if (!isPlainObject(config)) {
    return {
      valid: false,
      errors: ['config must be an object (not null, array, or string)'],
    };
  }

  const requiredFields = ['colours', 'spacing', 'fontFamily', 'output'];
  requiredFields.forEach((field) => {
    if (!(field in config)) {
      errors.push(`missing required field: ${field}`);
    }
  });

  if ('colours' in config) {
    if (!isPlainObject(config.colours)) {
      errors.push('colours must be an object of #RRGGBB values');
    } else {
      Object.entries(config.colours).forEach(([name, value]) => {
        const result = validateHexColour(value);
        if (!result.valid) {
          errors.push(`colours.${name} ${result.reason}`);
        }
      });
    }
  }

  if ('spacing' in config) {
    if (!isPlainObject(config.spacing)) {
      errors.push('spacing must be an object');
    } else if (!('scale' in config.spacing)) {
      errors.push('spacing must include a scale key');
    } else if (!isPlainObject(config.spacing.scale)) {
      errors.push('spacing.scale must be an object of spacing values');
    } else {
      const spacingKeys = Object.keys(config.spacing.scale);
      if (spacingKeys.length === 0) {
        errors.push('spacing.scale must not be empty');
      }

      spacingKeys.forEach((key) => {
        if (!/^(\d+(\.\d+)?|px)$/.test(key)) {
          errors.push(`spacing.scale key "${key}" must be numeric (or "px" for legacy support)`);
        }

        const result = validateSpacingValue(config.spacing.scale[key]);
        if (!result.valid) {
          errors.push(`spacing.scale.${key} ${result.reason}`);
        }
      });
    }
  }

  if ('fontFamily' in config) {
    if (!isPlainObject(config.fontFamily)) {
      errors.push('fontFamily must be an object with heading and body');
    } else {
      if (!('heading' in config.fontFamily)) {
        errors.push('fontFamily.heading is required');
      } else {
        const headingValidation = validateFontFamily(config.fontFamily.heading);
        if (!headingValidation.valid) {
          errors.push(`fontFamily.heading ${headingValidation.reason}`);
        }
      }

      if (!('body' in config.fontFamily)) {
        errors.push('fontFamily.body is required');
      } else {
        const bodyValidation = validateFontFamily(config.fontFamily.body);
        if (!bodyValidation.valid) {
          errors.push(`fontFamily.body ${bodyValidation.reason}`);
        }
      }
    }
  }

  if ('output' in config) {
    if (!isPlainObject(config.output)) {
      errors.push('output must be an object');
    } else {
      if (typeof config.output.css !== 'string' || !config.output.css.trim()) {
        errors.push('output.css must be a non-empty string');
      }

      if (typeof config.output.fullCss !== 'string' || !config.output.fullCss.trim()) {
        errors.push('output.fullCss must be a non-empty string');
      }
    }
  }

  if ('manifest' in config) {
    if (typeof config.manifest !== 'boolean' && !isPlainObject(config.manifest)) {
      errors.push('manifest must be a boolean or an object');
    }

    if (isPlainObject(config.manifest)) {
      if ('enabled' in config.manifest && typeof config.manifest.enabled !== 'boolean') {
        errors.push('manifest.enabled must be a boolean');
      }

      if ('output' in config.manifest) {
        if (typeof config.manifest.output !== 'string' || !config.manifest.output.trim()) {
          errors.push('manifest.output must be a non-empty string when provided');
        }
      }
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, errors: [] };
}

module.exports = {
  ALLOWED_FONT_FAMILIES,
  validateHexColour,
  validateSpacingValue,
  validateFontFamily,
  validateConfigShape,
};
