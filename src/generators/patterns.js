'use strict'

// Composite classes that combine multiple utilities into named patterns.
// These live in @layer components so utilities always take precedence in the cascade.
// Gap values reference spacing variables generated from emily.config.json,
// with pixel fallbacks so they work even without the variables in scope.

const DEFAULT_PROSE = {
  enabled: true,
  defaultWidth: 'md',
  widths: {
    sm: '55ch',
    md: '65ch',
    lg: '75ch',
    xl: '85ch',
  },
  flowSpace: '1rem',
  legacyAlias: false,
  elements: {
    p: {
      color: 'neutral-80',
      lineHeight: 1.75,
    },
    li: {
      color: 'neutral-80',
      lineHeight: 1.75,
    },
    h2: {
      fontSize: '3xl',
      lineHeight: '3xl',
      color: 'neutral-90',
      marginTop: '12',
    },
    h3: {
      fontSize: '2xl',
      lineHeight: '2xl',
      color: 'neutral-90',
      marginTop: '8',
    },
    h4: {
      fontSize: 'xl',
      lineHeight: 'xl',
      color: 'neutral-90',
      marginTop: '6',
    },
    ul: {
      paddingLeft: '6',
      listStyle: 'disc',
    },
    ol: {
      paddingLeft: '6',
      listStyle: 'decimal',
    },
    a: {
      color: 'brand-80',
      underline: true,
      underlineOffset: '2px',
    },
    blockquote: {
      borderLeftColor: 'brand-80',
      borderLeftWidth: '4px',
      paddingLeft: '4',
      fontStyle: 'italic',
    },
    code: {
      fontSize: 'sm',
      background: 'neutral-10',
      borderColor: 'neutral-20',
    },
  },
};

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function mergePlain(defaults, value) {
  if (!isPlainObject(defaults)) return value === undefined ? defaults : value;

  const output = { ...defaults };
  if (!isPlainObject(value)) return output;

  Object.keys(value).forEach((key) => {
    output[key] = mergePlain(defaults[key], value[key]);
  });

  return output;
}

function spacingVar(value) {
  if (typeof value !== 'string') return value;
  if (/^-?\d+(?:\.\d+)?$/.test(value)) return `var(--space-${value})`;
  return value;
}

function colorVar(value, property = 'color') {
  if (typeof value !== 'string') return value;
  if (/^[a-z][a-z0-9-]*-\d{2,3}$/.test(value)) return `var(--color-${value})`;
  if (/^[a-z][a-z0-9-]*$/.test(value) && property !== 'font-size') return `var(--color-${value})`;
  return value;
}

function fontSizeVar(value) {
  if (typeof value !== 'string') return value;
  if (/^[a-z0-9]+(?:\.[0-9]+)?xl$|^(?:xs|sm|base|lg|xl|\dxl)$/.test(value)) {
    return `var(--text-${value})`;
  }
  return value;
}

function lineHeightValue(value) {
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string' && /^(?:xs|sm|base|lg|xl|[2-9]xl)$/.test(value)) {
    return `var(--leading-${value})`;
  }
  return value;
}

function declaration(property, value) {
  if (value === undefined || value === null || value === false || value === '') return '';
  return `    ${property}: ${value};\n`;
}

function proseSelector(selector, prose) {
  if (!prose.legacyAlias) return `.prose ${selector}`;
  return `.prose ${selector},\n  .prose-emily ${selector}`;
}

function generateProseRule(selector, declarations, prose) {
  const body = declarations.filter(Boolean).join('');
  if (!body) return '';
  return `\n  ${proseSelector(selector, prose)} {\n${body}  }\n`;
}

function generateProseComponents(config = {}) {
  const prose = mergePlain(DEFAULT_PROSE, config.prose);
  if (prose.enabled === false) return '';

  const widths = isPlainObject(prose.widths) ? prose.widths : DEFAULT_PROSE.widths;
  const defaultWidthKey = widths[prose.defaultWidth] ? prose.defaultWidth : DEFAULT_PROSE.defaultWidth;
  const defaultWidth = widths[defaultWidthKey] || DEFAULT_PROSE.widths.md;
  const baseSelector = prose.legacyAlias ? '.prose,\n  .prose-emily' : '.prose';
  const elements = prose.elements || {};

  let css = `
  /* Comfortable reading column with scoped rich-text styles */
  ${baseSelector} {
    max-width: var(--prose-width-${defaultWidthKey}, ${defaultWidth});
    margin-inline: auto;
  }

  ${baseSelector} > * + * {
    margin-top: ${prose.flowSpace};
  }
`;

  Object.entries(widths).forEach(([name, width]) => {
    css += `
  .prose-${name} {
    max-width: ${width};
  }
`;
  });

  css += generateProseRule('p', [
    declaration('color', colorVar(elements.p?.color)),
    declaration('line-height', lineHeightValue(elements.p?.lineHeight)),
  ], prose);

  css += generateProseRule('li', [
    declaration('color', colorVar(elements.li?.color)),
    declaration('line-height', lineHeightValue(elements.li?.lineHeight)),
  ], prose);

  ['h2', 'h3', 'h4'].forEach((tag) => {
    const element = elements[tag] || {};
    css += generateProseRule(tag, [
      declaration('font-family', 'inherit'),
      declaration('font-size', fontSizeVar(element.fontSize)),
      declaration('line-height', lineHeightValue(element.lineHeight)),
      declaration('color', colorVar(element.color)),
      declaration('margin-top', spacingVar(element.marginTop)),
    ], prose);
  });

  ['ul', 'ol'].forEach((tag) => {
    const element = elements[tag] || {};
    css += generateProseRule(tag, [
      declaration('padding-left', spacingVar(element.paddingLeft)),
      declaration('list-style-type', element.listStyle),
    ], prose);
  });

  css += generateProseRule('a', [
    declaration('color', colorVar(elements.a?.color)),
    elements.a?.underline === true ? declaration('text-decoration', 'underline') : '',
    declaration('text-underline-offset', elements.a?.underlineOffset),
  ], prose);

  css += generateProseRule('blockquote', [
    declaration('border-left-color', colorVar(elements.blockquote?.borderLeftColor)),
    declaration('border-left-width', elements.blockquote?.borderLeftWidth),
    declaration('padding-left', spacingVar(elements.blockquote?.paddingLeft)),
    declaration('font-style', elements.blockquote?.fontStyle),
  ], prose);

  css += generateProseRule('code', [
    declaration('font-size', fontSizeVar(elements.code?.fontSize)),
    declaration('background-color', colorVar(elements.code?.background)),
    declaration('border-color', colorVar(elements.code?.borderColor)),
    declaration('border-width', '1px'),
    declaration('border-style', 'solid'),
    declaration('border-radius', 'var(--space-1, 0.25rem)'),
    declaration('padding', '0.125rem 0.375rem'),
  ], prose);

  return css;
}

function patternComponents(config = {}) {
  const containerMaxWidth = config.layout?.containerMaxWidth ?? '1100px';
  const includeFormBase = config.formBase === true;
  const formBaseCss = includeFormBase ? `
  fieldset {
    border: none;
    padding: 0;
    margin: 0 0 var(--space-6, 1.5rem);
  }

  fieldset legend {
    display: block;
    font-size: var(--text-lg, 18px);
    font-weight: var(--font-weight-semibold, 600);
    margin-bottom: var(--space-3, 0.75rem);
    color: var(--color-neutral-90);
    padding: 0;
  }

  input[type="text"],
  input[type="email"],
  input[type="password"],
  input[type="number"],
  input[type="tel"],
  input[type="url"],
  input[type="search"],
  input[type="date"],
  select,
  textarea {
    width: 100%;
    max-width: 100%;
    padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
    border: 2px solid var(--color-neutral-30);
    border-radius: var(--radius-base, 8px);
    background-color: #ffffff;
    color: var(--color-neutral-90);
    font-family: inherit;
    font-size: var(--text-base, 16px);
    line-height: var(--leading-base, 1.6);
    appearance: none;
    transition: border-color 200ms ease, box-shadow 200ms ease;
  }

  select {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
    background-position: right var(--space-2, 0.5rem) center;
    background-repeat: no-repeat;
    background-size: 1.5em 1.5em;
    padding-right: var(--space-10, 2.5rem);
    cursor: pointer;
  }

  textarea {
    min-height: 120px;
    resize: vertical;
  }

  input[type="text"]:focus,
  input[type="email"]:focus,
  input[type="password"]:focus,
  input[type="number"]:focus,
  input[type="tel"]:focus,
  input[type="url"]:focus,
  input[type="search"]:focus,
  input[type="date"]:focus,
  select:focus,
  textarea:focus {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
    border-color: var(--focus-ring-color);
    box-shadow: 0 0 0 4px var(--focus-ring-glow, rgba(219, 39, 119, 0.1));
  }

  input[type="checkbox"] {
    width: 1.5rem;
    height: 1.5rem;
    margin: 0;
    cursor: pointer;
    accent-color: var(--color-brand-80);
    flex-shrink: 0;
  }

  input[type="checkbox"]:focus {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
    box-shadow: 0 0 0 4px var(--focus-ring-glow, rgba(219, 39, 119, 0.1));
  }

  input[type="radio"] {
    width: 1.5rem;
    height: 1.5rem;
    margin: 0;
    border-radius: 50%;
    appearance: none;
    background-color: #ffffff;
    border: 2px solid var(--color-neutral-30);
    display: grid;
    place-content: center;
    cursor: pointer;
    flex-shrink: 0;
    transition: background-color 200ms ease, border-color 200ms ease;
  }

  input[type="radio"]::before {
    content: "";
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 50%;
    transform: scale(0);
    transition: 120ms transform ease-in-out;
    background-color: var(--color-brand-80);
  }

  input[type="radio"]:checked {
    border-color: var(--color-brand-80);
  }

  input[type="radio"]:checked::before {
    transform: scale(1);
  }

  input[type="radio"]:hover {
    background-color: var(--color-brand-10);
    border-color: var(--color-brand-80);
  }

  input[type="radio"]:focus {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
    border-radius: 50%;
    box-shadow: 0 0 0 4px var(--focus-ring-glow, rgba(219, 39, 119, 0.1));
  }

  input[aria-invalid="true"],
  select[aria-invalid="true"],
  textarea[aria-invalid="true"] {
    border-color: var(--color-error-80) !important;
    border-width: 3px;
  }
` : '';

  return `
  /* ---- Centering ---- */

  /* Full-viewport overlay centering — use for modals, lightboxes, toasts */
  .center-screen {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Transform-based centering within a relative/absolute parent */
  .center-absolute {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  /* ---- Reading / Prose ---- */
${generateProseComponents(config)}

  /* ---- Composition ---- */

  /* Vertical stack with consistent gap — replaces manual margin chains */
  .stack {
    display: flex;
    flex-direction: column;
    gap: var(--space-4, 1rem);
  }

  .stack-sm {
    display: flex;
    flex-direction: column;
    gap: var(--space-2, 0.5rem);
  }

  .stack-lg {
    display: flex;
    flex-direction: column;
    gap: var(--space-6, 1.5rem);
  }

  .stack-xl {
    display: flex;
    flex-direction: column;
    gap: var(--space-8, 2rem);
  }

  /* Horizontal grouping with wrapping — for tags, button rows, icon lists */
  .cluster {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4, 1rem);
    align-items: center;
  }

  .cluster-start {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4, 1rem);
    align-items: center;
    justify-content: flex-start;
  }

  .cluster-between {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4, 1rem);
    align-items: center;
    justify-content: space-between;
  }

  .cluster-end {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4, 1rem);
    align-items: center;
    justify-content: flex-end;
  }

  /* ---- Layout ---- */

  /* Constrained width container — 1100px max, full-width on small screens */
  .width-container {
    width: 100%;
    max-width: ${containerMaxWidth};
    margin-inline: auto;
    padding-inline: var(--space-4, 1rem);
  }

  @media (min-width: 640px) {
    .width-container {
      padding-inline: var(--space-6, 1.5rem);
    }
  }

  @media (min-width: 1024px) {
    .width-container {
      padding-inline: var(--space-8, 2rem);
    }
  }

  @media (min-width: 1140px) {
    .width-container {
      padding-inline: 0;
    }
  }

  .center {
    box-sizing: content-box;
    margin-inline: auto;
    max-inline-size: 65ch;
  }

  .sidebar {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-6, 1.5rem);
  }

  .sidebar > :first-child {
    flex-basis: 20rem;
    flex-grow: 1;
  }

  .sidebar > :last-child {
    flex-basis: 0;
    flex-grow: 999;
    min-inline-size: 50%;
  }

  .switcher {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4, 1rem);
  }

  .switcher > * {
    flex-grow: 1;
    flex-basis: calc((40rem - 100%) * 999);
  }

  .cover {
    display: flex;
    flex-direction: column;
    min-block-size: 100vh;
    padding: var(--space-6, 1.5rem);
  }

  .cover > :first-child {
    margin-block-start: 0;
  }

  .cover > :last-child {
    margin-block-end: 0;
  }

  .cover > .cover-center {
    margin-block: auto;
  }

  .grid-auto {
    display: grid;
    gap: var(--space-6, 1.5rem);
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
  }

  .grid-auto-sm {
    display: grid;
    gap: var(--space-4, 1rem);
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr));
  }

  .grid-auto-lg {
    display: grid;
    gap: var(--space-6, 1.5rem);
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
  }

  .equal-columns {
    display: grid;
    gap: var(--space-6, 1.5rem);
    grid-auto-columns: minmax(0, 1fr);
    grid-auto-flow: column;
  }

  @media (max-width: 767.98px) {
    .equal-columns {
      grid-auto-flow: row;
      grid-template-columns: 1fr;
    }
  }

  .media-object {
    display: flex;
    align-items: flex-start;
    gap: var(--space-4, 1rem);
  }

  .media-object > :first-child {
    flex: 0 0 auto;
  }

  .media-object > :last-child {
    min-inline-size: 0;
  }

  .inline-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2, 0.5rem) var(--space-4, 1rem);
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .content {
    max-inline-size: 65ch;
    margin-inline: auto;
  }

  .content-wide {
    max-inline-size: 80ch;
    margin-inline: auto;
  }

  .section {
    padding-block: var(--space-12, 3rem);
  }

  .section-sm {
    padding-block: var(--space-8, 2rem);
  }

  .section-lg {
    padding-block: var(--space-16, 4rem);
  }

  /* ---- Forms ---- */

  .field-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-2, 0.5rem);
    margin-bottom: var(--space-6, 1.5rem);
  }

  .form-row {
    display: grid;
    gap: var(--space-2, 0.5rem);
  }

  @media (min-width: 640px) {
    .form-row {
      grid-template-columns: minmax(10rem, 16rem) minmax(0, 1fr);
      align-items: start;
    }
  }

  .form-actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3, 0.75rem);
    align-items: center;
  }

  .field-container label {
    display: block;
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-neutral-90);
    font-size: var(--text-base, 16px);
    line-height: 1.4;
    margin-bottom: var(--space-1, 0.25rem);
  }

${formBaseCss}

  .form-hint {
    font-size: var(--text-sm, 14px);
    color: var(--color-neutral-60);
    margin-bottom: var(--space-1, 0.25rem);
  }

  .input,
  .select,
  .textarea {
    width: 100%;
    max-width: 100%;
    padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
    border: 2px solid var(--color-neutral-30);
    border-radius: var(--radius-base, 8px);
    background-color: #ffffff;
    color: var(--color-neutral-90);
    font-family: inherit;
    font-size: var(--text-base, 16px);
    line-height: var(--leading-base, 1.6);
    appearance: none;
    transition: border-color 200ms ease, box-shadow 200ms ease;
  }

  .select {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
    background-position: right var(--space-2, 0.5rem) center;
    background-repeat: no-repeat;
    background-size: 1.5em 1.5em;
    padding-right: var(--space-10, 2.5rem);
    cursor: pointer;
  }

  .textarea {
    min-height: 120px;
    resize: vertical;
  }

  .input:focus,
  .select:focus,
  .textarea:focus {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
    border-color: var(--focus-ring-color);
    box-shadow: 0 0 0 4px var(--focus-ring-glow, rgba(219, 39, 119, 0.1));
  }

  .checkbox-group,
  .radio-group {
    display: flex;
    align-items: center;
    gap: var(--space-3, 0.75rem);
    margin-bottom: var(--space-4, 1rem);
  }

  .checkbox-group label,
  .radio-group label {
    font-weight: var(--font-weight-normal, 400);
    margin-bottom: 0;
    cursor: pointer;
    font-size: var(--text-base, 16px);
  }

  .checkbox {
    width: 1.5rem;
    height: 1.5rem;
    margin: 0;
    cursor: pointer;
    accent-color: var(--color-brand-80);
    flex-shrink: 0;
  }

  .checkbox:focus {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
    box-shadow: 0 0 0 4px var(--focus-ring-glow, rgba(219, 39, 119, 0.1));
  }

  .radio {
    width: 1.5rem;
    height: 1.5rem;
    margin: 0;
    border-radius: 50%;
    appearance: none;
    background-color: #ffffff;
    border: 2px solid var(--color-neutral-30);
    display: grid;
    place-content: center;
    cursor: pointer;
    flex-shrink: 0;
    transition: background-color 200ms ease, border-color 200ms ease;
  }

  .radio::before {
    content: "";
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 50%;
    transform: scale(0);
    transition: 120ms transform ease-in-out;
    background-color: var(--color-brand-80);
  }

  .radio:checked {
    border-color: var(--color-brand-80);
  }

  .radio:checked::before {
    transform: scale(1);
  }

  .radio:hover {
    background-color: var(--color-brand-10);
    border-color: var(--color-brand-80);
  }

  .radio:focus {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
    border-radius: 50%;
    box-shadow: 0 0 0 4px var(--focus-ring-glow, rgba(219, 39, 119, 0.1));
  }

  .switch {
    appearance: none;
    width: 3rem;
    height: 1.625rem;
    margin: 0;
    padding: 0;
    border: 2px solid var(--color-neutral-30);
    border-radius: var(--radius-full, 9999px);
    background-color: var(--color-neutral-20);
    cursor: pointer;
    position: relative;
    flex-shrink: 0;
    transition: background-color 200ms ease, border-color 200ms ease;
  }

  .switch::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 0.1875rem;
    width: 1rem;
    height: 1rem;
    border-radius: var(--radius-full, 9999px);
    background-color: #ffffff;
    box-shadow: var(--shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.05));
    transform: translateY(-50%);
    transition: transform 200ms ease;
  }

  .switch:checked {
    border-color: var(--color-brand-80);
    background-color: var(--color-brand-80);
  }

  .switch:checked::before {
    transform: translate(1.375rem, -50%);
  }

  .switch:focus {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
    box-shadow: 0 0 0 4px var(--focus-ring-glow, rgba(219, 39, 119, 0.1));
  }

  .switch:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  .input-file {
    width: 100%;
    max-width: 100%;
    color: var(--color-neutral-80);
    font-family: inherit;
    font-size: var(--text-base, 16px);
    line-height: var(--leading-base, 1.6);
  }

  .input-file::file-selector-button {
    margin-right: var(--space-4, 1rem);
    padding: var(--space-2, 0.5rem) var(--space-4, 1rem);
    border: 2px solid var(--color-brand-80);
    border-radius: var(--radius-base, 8px);
    background-color: #ffffff;
    color: var(--color-brand-80);
    font: inherit;
    font-weight: var(--font-weight-semibold, 600);
    cursor: pointer;
    transition: background-color 200ms ease, border-color 200ms ease, color 200ms ease;
  }

  .input-file:hover::file-selector-button {
    background-color: var(--color-brand-10);
  }

  .input-file:focus {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }

  .input-file:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  .input-file:disabled::file-selector-button {
    cursor: not-allowed;
  }

  .range {
    width: 100%;
    accent-color: var(--color-brand-80);
    cursor: pointer;
  }

  .range:focus {
    outline: none;
  }

  .range:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }

  .range::-webkit-slider-runnable-track {
    height: 0.5rem;
    border-radius: var(--radius-full, 9999px);
    background-color: var(--color-neutral-20);
  }

  .range::-webkit-slider-thumb {
    appearance: none;
    width: 1.25rem;
    height: 1.25rem;
    margin-top: -0.375rem;
    border: 2px solid #ffffff;
    border-radius: var(--radius-full, 9999px);
    background-color: var(--color-brand-80);
    box-shadow: var(--shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.05));
  }

  .range::-moz-range-track {
    height: 0.5rem;
    border: 0;
    border-radius: var(--radius-full, 9999px);
    background-color: var(--color-neutral-20);
  }

  .range::-moz-range-thumb {
    width: 1.25rem;
    height: 1.25rem;
    border: 2px solid #ffffff;
    border-radius: var(--radius-full, 9999px);
    background-color: var(--color-brand-80);
    box-shadow: var(--shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.05));
  }

  .range:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  @media (prefers-reduced-motion: reduce) {
    .switch,
    .switch::before,
    .input-file::file-selector-button {
      transition-duration: 0ms;
    }
  }

  .input[aria-invalid="true"],
  .select[aria-invalid="true"],
  .textarea[aria-invalid="true"] {
    border-color: var(--color-error-80) !important;
    border-width: 3px;
  }

  .form-error-message {
    font-size: var(--text-sm, 14px);
    font-weight: var(--font-weight-bold, 700);
    color: var(--color-error-80);
    margin-top: var(--space-1, 0.25rem);
    display: block;
  }

  .error-summary {
    border: 4px solid var(--color-error-80);
    padding: var(--space-6, 1.5rem);
    margin-bottom: var(--space-8, 2rem);
    border-radius: var(--radius-base, 8px);
  }

  .error-summary ul {
    list-style: disc;
    padding-left: var(--space-5, 1.25rem);
  }

  .error-summary a {
    color: var(--color-error-80);
  }

  /* ---- Buttons ---- */

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-3, 0.75rem) var(--space-6, 1.5rem);
    font-weight: var(--font-weight-semibold, 600);
    border-radius: var(--radius-base, 8px);
    cursor: pointer;
    transition: background-color 200ms ease, border-color 200ms ease, color 200ms ease;
    border: 2px solid transparent;
    text-align: center;
    min-height: 3rem;
    font-size: var(--text-base, 16px);
    text-decoration: none;
    font-family: inherit;
    line-height: 1;
  }

  .btn-primary {
    background-color: var(--color-brand-80);
    color: #ffffff;
    border-color: transparent;
  }

  .btn-primary:hover {
    background-color: var(--color-brand-90);
  }

  .btn-primary:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
    box-shadow: 0 0 0 4px var(--focus-ring-glow, rgba(219, 39, 119, 0.1));
  }

  .btn-secondary {
    background-color: #ffffff;
    color: var(--color-accent-80);
    border-color: var(--color-accent-80);
  }

  .btn-secondary:hover {
    background-color: var(--color-accent-10);
    color: var(--color-accent-90);
    border-color: var(--color-accent-90);
  }

  .btn-secondary:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
    box-shadow: 0 0 0 4px var(--focus-ring-glow, rgba(219, 39, 119, 0.1));
  }

  .btn-ghost {
    background-color: transparent;
    color: var(--color-neutral-80);
    border-color: transparent;
  }

  .btn-ghost:hover {
    background-color: var(--color-neutral-10);
  }

  .btn-ghost:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
    box-shadow: 0 0 0 4px var(--focus-ring-glow, rgba(219, 39, 119, 0.1));
  }

  .btn-danger {
    background-color: var(--color-error-80);
    color: #ffffff;
    border-color: transparent;
  }

  .btn-danger:hover {
    background-color: var(--color-error-90);
  }

  .btn-danger:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
    box-shadow: 0 0 0 4px var(--focus-ring-glow, rgba(219, 39, 119, 0.1));
  }

  .btn-sm {
    padding: var(--space-2, 0.5rem) var(--space-4, 1rem);
    font-size: var(--text-sm, 14px);
    min-height: 2.25rem;
  }

  .btn-lg {
    padding: var(--space-4, 1rem) var(--space-8, 2rem);
    font-size: var(--text-lg, 18px);
    min-height: 3.5rem;
  }

  .button-group {
    display: inline-flex;
    flex-wrap: wrap;
    gap: var(--space-2, 0.5rem);
    align-items: center;
  }

  .button-group[role="group"] {
    isolation: isolate;
  }

  /* ---- Site assembly ---- */

  /* Small uppercase kicker above headings */
  .eyebrow {
    display: block;
    font-size: var(--text-sm, 14px);
    font-weight: var(--font-weight-semibold, 600);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-brand, var(--color-brand-80));
    margin-bottom: var(--space-2, 0.5rem);
  }

  /* Surface card — pair with .stack/.stack-sm for inner rhythm */
  .card {
    background-color: var(--color-surface, #ffffff);
    border: 1px solid var(--color-border, var(--color-neutral-30));
    border-radius: var(--radius-md, 12px);
    padding: var(--space-6, 1.5rem);
  }

  .card-hover {
    transition: border-color 200ms ease, box-shadow 200ms ease;
  }

  .card-hover:hover,
  .card-hover:focus-within {
    border-color: var(--color-neutral-50, #79716b);
    box-shadow: var(--shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1));
  }

  /* Hero heading/lead — place inside .section-lg + .width-container */
  .hero-title {
    font-size: clamp(2.25rem, 5vw, var(--text-6xl, 60px));
    line-height: 1.1;
    color: var(--color-text, var(--color-neutral-90));
    margin: 0 0 var(--space-4, 1rem);
  }

  .hero-lead {
    font-size: clamp(1.125rem, 2.5vw, var(--text-2xl, 24px));
    line-height: 1.5;
    color: var(--color-text-muted, var(--color-neutral-60));
    max-width: 42rem;
    margin: 0 0 var(--space-6, 1.5rem);
  }

  /* Centred conversion band */
  .cta-band {
    display: grid;
    gap: var(--space-3, 0.75rem);
    justify-items: center;
    text-align: center;
    background-color: var(--color-brand-10, #fdf2f8);
    border: 1px solid var(--color-brand-30, #f9a8d4);
    border-radius: var(--radius-lg, 16px);
    padding: clamp(2rem, 5vw, 3rem);
  }

  .cta-band h2 {
    margin: 0;
    color: var(--color-text, var(--color-neutral-90));
  }

  .cta-band p {
    margin: 0;
    max-width: 40rem;
    /* The band sits on a brand-10 tint; muted text can miss AA on stronger
       brand scales, so body copy stays near-heading dark here. */
    color: var(--color-text, var(--color-neutral-90));
  }

  /* Asymmetric two-column content split — collapses on small screens */
  .split {
    display: grid;
    align-items: start;
    gap: clamp(1.5rem, 4vw, 2.5rem);
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  }

  @media (max-width: 767.98px) {
    .split {
      grid-template-columns: 1fr;
    }
  }

  /* Row of accreditation logos / proof badges */
  .trust-strip {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: var(--space-6, 1.5rem) var(--space-8, 2rem);
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .trust-strip img {
    max-height: 3rem;
    width: auto;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1, 0.25rem);
    padding: var(--space-1, 0.25rem) var(--space-3, 0.75rem);
    border-radius: var(--radius-full, 9999px);
    border: 1px solid var(--color-border, var(--color-neutral-30));
    background-color: var(--color-surface-raised, var(--color-neutral-10));
    color: var(--color-text, var(--color-neutral-90));
    font-size: var(--text-sm, 14px);
    font-weight: var(--font-weight-semibold, 600);
    line-height: 1.4;
  }

  /* ---- Atoms: buttons ---- */

  /* Link-styled button — pair with .btn: <button class="btn btn-link"> */
  .btn-link {
    background-color: transparent;
    border-color: transparent;
    color: var(--color-brand, var(--color-brand-80));
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .btn-link:hover {
    color: var(--color-brand-90, var(--color-brand-80));
  }

  .btn-link:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }

  /* Icon-only button — pair with .btn and an .sr-only text label */
  .btn-icon {
    padding: var(--space-3, 0.75rem);
    aspect-ratio: 1;
  }

  /* ---- Atoms: feedback ---- */

  /* Square-cornered subtle label — categorisation, metadata */
  .tag {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1, 0.25rem);
    padding: var(--space-1, 0.25rem) var(--space-2, 0.5rem);
    border-radius: var(--radius-base, 8px);
    background-color: var(--color-surface-raised, var(--color-neutral-10));
    color: var(--color-text-muted, var(--color-neutral-60));
    font-size: var(--text-sm, 14px);
    font-weight: var(--font-weight-semibold, 600);
    line-height: 1.4;
  }

  /* Pill with room for a dismiss control — filters, selections */
  .chip {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2, 0.5rem);
    padding: var(--space-1, 0.25rem) var(--space-3, 0.75rem);
    border-radius: var(--radius-full, 9999px);
    border: 1px solid var(--color-border, var(--color-neutral-30));
    background-color: var(--color-surface, #ffffff);
    color: var(--color-text, var(--color-neutral-90));
    font-size: var(--text-sm, 14px);
    line-height: 1.4;
  }

  .status-dot {
    display: inline-block;
    width: 0.625rem;
    height: 0.625rem;
    border-radius: var(--radius-full, 9999px);
    background-color: var(--color-text-muted, var(--color-neutral-60));
    flex-shrink: 0;
  }

  .status-dot-success { background-color: var(--color-success, var(--color-success-80)); }
  .status-dot-warning { background-color: var(--color-warning, var(--color-warning-80)); }
  .status-dot-error { background-color: var(--color-error, var(--color-error-80)); }
  .status-dot-info { background-color: var(--color-brand, var(--color-brand-80)); }

  /* Pair with role="status" and visible or .sr-only loading text */
  .spinner {
    display: inline-block;
    width: 1.25em;
    height: 1.25em;
    border: 3px solid var(--color-border, var(--color-neutral-30));
    border-top-color: var(--color-brand, var(--color-brand-80));
    border-radius: var(--radius-full, 9999px);
    animation: spin 0.8s linear infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    .spinner {
      animation-duration: 1.6s;
    }
  }

  /* Native <progress> element styling */
  .progress {
    appearance: none;
    width: 100%;
    height: 0.75rem;
    border: none;
    border-radius: var(--radius-full, 9999px);
    overflow: hidden;
    background-color: var(--color-surface-raised, var(--color-neutral-10));
  }

  .progress::-webkit-progress-bar {
    background-color: var(--color-surface-raised, var(--color-neutral-10));
  }

  .progress::-webkit-progress-value {
    background-color: var(--color-brand, var(--color-brand-80));
  }

  .progress::-moz-progress-bar {
    background-color: var(--color-brand, var(--color-brand-80));
  }

  /* Loading placeholder — add aria-hidden="true", announce loading elsewhere */
  .skeleton {
    display: block;
    min-height: 1em;
    border-radius: var(--radius-base, 8px);
    background-color: var(--color-surface-raised, var(--color-neutral-10));
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    .skeleton {
      animation: none;
    }
  }

  .inline-error,
  .inline-success,
  .inline-warning,
  .inline-info {
    display: block;
    font-size: var(--text-sm, 14px);
    font-weight: var(--font-weight-semibold, 600);
    margin-top: var(--space-1, 0.25rem);
  }

  .inline-error { color: var(--color-error, var(--color-error-80)); }
  .inline-success { color: var(--color-success, var(--color-success-80)); }
  .inline-warning { color: var(--color-warning, var(--color-warning-80)); }
  .inline-info { color: var(--color-text-muted, var(--color-neutral-60)); }

  /* ---- Atoms: media ---- */

  .avatar {
    display: inline-block;
    width: 3rem;
    height: 3rem;
    border-radius: var(--radius-full, 9999px);
    object-fit: cover;
  }

  .avatar-sm {
    width: 2rem;
    height: 2rem;
  }

  .avatar-lg {
    width: 4rem;
    height: 4rem;
  }

  /* ---- Atoms: layout ---- */

  .divider {
    border: none;
    border-top: 1px solid var(--color-border, var(--color-neutral-30));
    margin-block: var(--space-6, 1.5rem);
  }

  /* Horizontal scroll region — add tabindex="0" and an aria-label for keyboard users */
  .scroll-area {
    overflow-x: auto;
    max-width: 100%;
  }

  .scroll-area:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }

  /* ---- Molecules ---- */

  /* Flush image at the top of a .card — cancels the card padding */
  .card-media {
    margin: calc(-1 * var(--space-6, 1.5rem)) calc(-1 * var(--space-6, 1.5rem)) 0;
    border-radius: calc(var(--radius-md, 12px) - 1px) calc(var(--radius-md, 12px) - 1px) 0 0;
    overflow: hidden;
  }

  .card-media img {
    display: block;
    width: 100%;
    object-fit: cover;
  }

  /* Status banner — status + text + optional action. Not colour-only:
     lead with a bold status word. role="alert" only for interruptions. */
  .alert {
    display: grid;
    gap: var(--space-1, 0.25rem);
    padding: var(--space-4, 1rem) var(--space-5, 1.25rem);
    border: 1px solid var(--color-border, var(--color-neutral-30));
    border-left: 4px solid var(--color-text-muted, var(--color-neutral-60));
    border-radius: var(--radius-base, 8px);
    background-color: var(--color-surface, #ffffff);
    color: var(--color-text, var(--color-neutral-90));
  }

  .alert-success {
    border-left-color: var(--color-success, var(--color-success-80));
    background-color: var(--color-success-10, var(--color-surface, #ffffff));
  }

  .alert-warning {
    border-left-color: var(--color-warning, var(--color-warning-80));
    background-color: var(--color-warning-10, var(--color-surface, #ffffff));
  }

  .alert-error {
    border-left-color: var(--color-error, var(--color-error-80));
    background-color: var(--color-error-10, var(--color-surface, #ffffff));
  }

  .alert-info {
    border-left-color: var(--color-brand, var(--color-brand-80));
    background-color: var(--color-brand-10, var(--color-surface, #ffffff));
  }

  /* ---- Organisms ---- */

  /* Column-flow gallery — no JS. Items must be display: inline-block or
     break-inside: avoid to prevent splitting across columns. */
  .masonry {
    columns: 3 16rem;
    column-gap: var(--space-6, 1.5rem);
  }

  .masonry > * {
    break-inside: avoid;
    margin-bottom: var(--space-6, 1.5rem);
  }
`;
}

module.exports = {
  DEFAULT_PROSE,
  generateProseComponents,
  patternComponents,
};
