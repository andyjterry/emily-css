'use strict'

// Composite classes that combine multiple utilities into named patterns.
// These live in @layer components so utilities always take precedence in the cascade.
// Gap values reference spacing variables generated from emily.config.json,
// with pixel fallbacks so they work even without the variables in scope.

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

  /* Comfortable reading column — limits line length, centers the block */
  .prose,
  .prose-emily {
    max-width: 65ch;
    margin-inline: auto;
  }

  .prose > * + *,
  .prose-emily > * + * {
    margin-top: var(--space-4, 1rem);
  }

  .prose h2,
  .prose h3,
  .prose-emily h2,
  .prose-emily h3 {
    font-family: inherit;
    color: var(--color-neutral-90);
    line-height: 1.25;
  }

  .prose h2,
  .prose-emily h2 {
    font-size: var(--text-2xl, 24px);
    margin-top: var(--space-10, 2.5rem);
  }

  .prose h3,
  .prose-emily h3 {
    font-size: var(--text-xl, 20px);
    margin-top: var(--space-8, 2rem);
  }

  .prose p,
  .prose li,
  .prose-emily p,
  .prose-emily li {
    color: var(--color-neutral-70);
    line-height: 1.75;
  }

  .prose ul,
  .prose ol,
  .prose-emily ul,
  .prose-emily ol {
    padding-left: var(--space-6, 1.5rem);
  }

  .prose ul,
  .prose-emily ul {
    list-style-type: disc;
  }

  .prose ol,
  .prose-emily ol {
    list-style-type: decimal;
  }

  .prose a,
  .prose-emily a {
    color: var(--color-brand-80);
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .prose code,
  .prose-emily code {
    font-size: var(--text-sm, 14px);
    background-color: var(--color-neutral-10);
    border: 1px solid var(--color-neutral-20);
    border-radius: var(--space-1, 0.25rem);
    padding: 0.125rem 0.375rem;
  }

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
`;
}

module.exports = {
  patternComponents,
};
