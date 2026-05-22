'use strict';

const ALLOWED_FONT_FAMILIES = [
  'system',
  'inter',
  'lexend',
  'figtree',
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

function hasCssInjectionRisk(value) {
  if (typeof value !== 'string') return false;
  const lower = value.toLowerCase();
  if (value.includes(';') || lower.includes('url(')) return true;

  let depth = 0;
  for (const char of value) {
    if (char === '(') depth++;
    if (char === ')') depth--;
    if (depth < 0) return true;
  }

  return depth !== 0;
}

function validateDurationValue(value) {
  if (typeof value !== 'string') {
    return { valid: false, reason: 'must be a CSS duration string like 150ms or 0.2s' };
  }

  const trimmed = value.trim();
  if (hasCssInjectionRisk(trimmed)) {
    return { valid: false, reason: 'must not contain unsafe CSS syntax' };
  }

  if (!/^\d+(\.\d+)?(ms|s)$/.test(trimmed)) {
    return { valid: false, reason: 'must be a CSS duration string like 150ms or 0.2s' };
  }

  return { valid: true };
}

function validateCssLengthValue(value) {
  if (typeof value !== 'string') {
    return { valid: false, reason: 'must be a CSS length string' };
  }

  const trimmed = value.trim();
  if (hasCssInjectionRisk(trimmed)) {
    return { valid: false, reason: 'must not contain unsafe CSS syntax' };
  }

  if (!/^\d+(\.\d+)?(px|rem|em|ch|vw|vh|vmin|vmax|%)$/i.test(trimmed)) {
    return { valid: false, reason: 'must be a CSS length string' };
  }

  return { valid: true };
}

function validateHexOrCustomProperty(value) {
  if (typeof value !== 'string') {
    return { valid: false, reason: 'must be a hex colour or CSS custom property reference' };
  }

  const trimmed = value.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) return { valid: true };
  if (/^var\(--[a-zA-Z0-9-_]+\)$/.test(trimmed)) return { valid: true };

  return { valid: false, reason: 'must be a valid #RRGGBB hex colour or var(--token) reference' };
}

function isStringOrNumber(value) {
  return typeof value === 'string' || typeof value === 'number';
}

function validateTypographyTokenGroup(group, pathName, errors) {
  if (isStringOrNumber(group)) return;

  if (!isPlainObject(group)) {
    errors.push(`${pathName} must be a string, number, or object of string/number values`);
    return;
  }

  Object.entries(group).forEach(([key, value]) => {
    if (!isStringOrNumber(value)) {
      errors.push(`${pathName}.${key} must be a string or number`);
    }
  });
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
    } else if (Object.keys(config.colours).length === 0) {
      errors.push('colours must not be empty');
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

  if ('cornerStyle' in config && !['square', 'subtle', 'rounded'].includes(config.cornerStyle)) {
    errors.push('cornerStyle must be one of: square, subtle, rounded');
  }

  if ('formBase' in config && typeof config.formBase !== 'boolean') {
    errors.push('formBase must be a boolean');
  }

  if ('transitions' in config) {
    if (!isPlainObject(config.transitions)) {
      errors.push('transitions must be an object');
    } else {
      Object.entries(config.transitions).forEach(([name, value]) => {
        if (name === 'timing') {
          if (typeof value !== 'string' || !value.trim() || hasCssInjectionRisk(value)) {
            errors.push(`transitions.${name} has invalid value "${value}"`);
          }
          return;
        }

        const result = validateDurationValue(value);
        if (!result.valid) {
          errors.push(`transitions.${name} has invalid value "${value}": ${result.reason}`);
        }
      });
    }
  }

  if ('breakpoints' in config) {
    if (!isPlainObject(config.breakpoints)) {
      errors.push('breakpoints must be an object');
    } else {
      Object.entries(config.breakpoints).forEach(([name, value]) => {
        const result = validateCssLengthValue(value);
        if (!result.valid) {
          errors.push(`breakpoints.${name} has invalid value "${value}": ${result.reason}`);
        }
      });
    }
  }

  if ('layout' in config) {
    if (!isPlainObject(config.layout)) {
      errors.push('layout must be an object');
    } else if ('containerMaxWidth' in config.layout) {
      const result = validateCssLengthValue(config.layout.containerMaxWidth);
      if (!result.valid) {
        errors.push(`layout.containerMaxWidth has invalid value "${config.layout.containerMaxWidth}": ${result.reason}`);
      }
    }
  }

  if ('extend' in config) {
    if (!isPlainObject(config.extend)) {
      errors.push('extend must be an object');
    } else if ('utilities' in config.extend) {
      if (!isPlainObject(config.extend.utilities)) {
        errors.push('extend.utilities must be an object');
      } else {
        Object.entries(config.extend.utilities).forEach(([name, utility]) => {
          if (!isPlainObject(utility)) {
            errors.push(`extend.utilities.${name} must be an object with property and value`);
            return;
          }

          if (typeof utility.property !== 'string' || !utility.property.trim()) {
            errors.push(`extend.utilities.${name}.property must be a non-empty string`);
          } else if (!/^--[a-zA-Z0-9-_]+$|^-?[a-zA-Z][a-zA-Z0-9-]*$/.test(utility.property.trim())) {
            errors.push(`extend.utilities.${name}.property must be a valid CSS property name`);
          }

          if (typeof utility.value !== 'string' || !utility.value.trim()) {
            errors.push(`extend.utilities.${name}.value must be a non-empty string`);
          } else if (hasCssInjectionRisk(utility.value.trim())) {
            errors.push(`extend.utilities.${name}.value must not contain unsafe CSS syntax`);
          }
        });
      }
    }
  }

  if ('typography' in config) {
    if (!isPlainObject(config.typography)) {
      errors.push('typography must be an object');
    } else {
      ['fontSize', 'lineHeight', 'letterSpacing'].forEach((key) => {
        if (key in config.typography) {
          validateTypographyTokenGroup(config.typography[key], `typography.${key}`, errors);
        }
      });
    }
  }

  if ('shadows' in config) {
    if (!isPlainObject(config.shadows)) {
      errors.push('shadows must be an object');
    } else {
      Object.entries(config.shadows).forEach(([name, value]) => {
        if (typeof value !== 'string' || !value.trim()) {
          errors.push(`shadows.${name} must be a non-empty string`);
        }
      });
    }
  }

  if ('zIndex' in config) {
    if (!isPlainObject(config.zIndex)) {
      errors.push('zIndex must be an object');
    } else {
      Object.entries(config.zIndex).forEach(([name, value]) => {
        if (value === 'auto') return;

        const numericValue = typeof value === 'number' ? value : Number(value);
        if (!Number.isInteger(numericValue) || !Number.isFinite(numericValue)) {
          errors.push(`zIndex.${name} must be a finite integer or auto`);
        }
      });
    }
  }

  if ('semanticColours' in config) {
    if (!isPlainObject(config.semanticColours)) {
      errors.push('semanticColours must be an object');
    } else {
      Object.entries(config.semanticColours).forEach(([name, value]) => {
        const result = validateHexOrCustomProperty(value);
        if (!result.valid) {
          errors.push(`semanticColours.${name} ${result.reason}`);
        }
      });
    }
  }

  if ('opacity' in config) {
    const opacityEntries = Array.isArray(config.opacity)
      ? config.opacity.map((value, index) => [index, value])
      : isPlainObject(config.opacity)
        ? Object.entries(config.opacity)
        : null;

    if (!opacityEntries) {
      errors.push('opacity must be an array or object of numeric values');
    } else {
      opacityEntries.forEach(([name, value]) => {
        if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 100) {
          errors.push(`opacity.${name} must be a number between 0 and 100`);
        }
      });
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
  validateDurationValue,
  validateCssLengthValue,
  validateFontFamily,
  validateConfigShape,
};
