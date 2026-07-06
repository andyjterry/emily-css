const fs = require("fs");
const path = require("path");
const crossSpawn = require("cross-spawn");
const { Select, Input, Confirm } = require("enquirer");
const chalk = require("chalk");
const ora = require("ora");
const boxen = require("boxen");
const { DEFAULT_PURGE_IGNORE, PURGE_EXTENSIONS } = require("./constants.js");
const {
  ALLOWED_FONT_FAMILIES,
  validateHexColour,
  validateSpacingValue,
  validateFontFamily,
  validateConfigShape,
} = require("./validate.js");

// ============================================================================
// CONSTANTS
// ============================================================================

const COLOUR_PRESETS = {
  primary: [
    { value: "custom", label: "Enter your own hex" },
    { value: "#DB2777", label: "Emily Pink" },
    { value: "#2563EB", label: "Blue" },
    { value: "#028090", label: "Teal" },
    { value: "#114B5F", label: "Deep Teal" },
    { value: "#15803D", label: "Green" },
    { value: "#7C3AED", label: "Purple" },
    { value: "#E05C00", label: "Burnt Orange" },
  ],
  secondary: [
    { value: "custom", label: "Enter your own hex" },
    { value: "#2563EB", label: "Blue" },
    { value: "#028090", label: "Teal" },
    { value: "#7C3AED", label: "Purple" },
    { value: "#DB2777", label: "Emily Pink" },
    { value: "#F59E0B", label: "Amber" },
    { value: "#57534E", label: "Warm Grey" },
  ],
  success: [
    { value: "#017F65", label: "Accessible Green (recommended)" },
    { value: "#15803D", label: "Forest Green" },
    { value: "custom", label: "Enter your own hex" },
  ],
  warning: [
    { value: "#FFC107", label: "Amber (recommended)" },
    { value: "#F59E0B", label: "Orange Amber" },
    { value: "custom", label: "Enter your own hex" },
  ],
  error: [
    { value: "#B20000", label: "Accessible Red (recommended)" },
    { value: "#DC2626", label: "Red" },
    { value: "custom", label: "Enter your own hex" },
  ],
};

const CORE_COLOUR_KEYS = new Set([
  "brand",
  "accent",
  "btn-primary",
  "btn-secondary",
  "success",
  "warning",
  "error",
  "neutral",
]);

const FONT_PACKAGE_BY_KEY = {
  inter: "@fontsource/inter",
  lexend: "@fontsource/lexend",
  figtree: "@fontsource/figtree",
  "dm-sans": "@fontsource/dm-sans",
  nunito: "@fontsource/nunito",
  atkinson: "@fontsource/atkinson-hyperlegible",
};

const FONT_KEYS_WITHOUT_PACKAGE = new Set(["system", "georgia", "mono"]);
const DEFAULT_PROSE_CONFIG = {
  enabled: true,
  defaultWidth: "md",
  widths: {
    sm: "55ch",
    md: "65ch",
    lg: "75ch",
    xl: "85ch",
  },
  flowSpace: "1rem",
  legacyAlias: false,
  elements: {
    p: {
      color: "neutral-80",
      lineHeight: 1.75,
    },
    li: {
      color: "neutral-80",
      lineHeight: 1.75,
    },
    h2: {
      fontSize: "3xl",
      lineHeight: "3xl",
      color: "neutral-90",
      marginTop: "12",
    },
    h3: {
      fontSize: "2xl",
      lineHeight: "2xl",
      color: "neutral-90",
      marginTop: "8",
    },
    h4: {
      fontSize: "xl",
      lineHeight: "xl",
      color: "neutral-90",
      marginTop: "6",
    },
    ul: {
      paddingLeft: "6",
      listStyle: "disc",
    },
    ol: {
      paddingLeft: "6",
      listStyle: "decimal",
    },
    a: {
      color: "brand-80",
      underline: true,
      underlineOffset: "2px",
    },
    blockquote: {
      borderLeftColor: "brand-80",
      borderLeftWidth: "4px",
      paddingLeft: "4",
      fontStyle: "italic",
    },
    code: {
      fontSize: "sm",
      background: "neutral-10",
      borderColor: "neutral-20",
    },
  },
};
const FONT_IMPORTS_BY_KEY = {
  inter: [
    "@fontsource/inter/400.css",
    "@fontsource/inter/500.css",
    "@fontsource/inter/600.css",
    "@fontsource/inter/700.css",
  ],
  lexend: [
    "@fontsource/lexend/400.css",
    "@fontsource/lexend/500.css",
    "@fontsource/lexend/600.css",
    "@fontsource/lexend/700.css",
  ],
  figtree: [
    "@fontsource/figtree/400.css",
    "@fontsource/figtree/500.css",
    "@fontsource/figtree/600.css",
    "@fontsource/figtree/700.css",
  ],
  "dm-sans": [
    "@fontsource/dm-sans/400.css",
    "@fontsource/dm-sans/500.css",
    "@fontsource/dm-sans/700.css",
  ],
  nunito: [
    "@fontsource/nunito/400.css",
    "@fontsource/nunito/500.css",
    "@fontsource/nunito/700.css",
  ],
  atkinson: [
    "@fontsource/atkinson-hyperlegible/400.css",
    "@fontsource/atkinson-hyperlegible/700.css",
  ],
};

// ============================================================================
// HELPERS
// ============================================================================

function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function mergeWithDefaults(defaults, existing) {
  if (!isPlainObject(defaults)) {
    return existing === undefined ? defaults : existing;
  }

  const output = { ...defaults };

  if (!isPlainObject(existing)) {
    return output;
  }

  Object.keys(existing).forEach((key) => {
    if (isPlainObject(defaults[key]) && isPlainObject(existing[key])) {
      output[key] = mergeWithDefaults(defaults[key], existing[key]);
      return;
    }

    output[key] = existing[key];
  });

  return output;
}

function colourSwatch(hex) {
  return chalk.hex(hex)("■");
}

function normaliseHex(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  const result = validateHexColour(trimmed);
  return result.valid ? trimmed.toUpperCase() : null;
}

function formatValueForMessage(value) {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  return "'" + String(value) + "'";
}

async function askValidatedInput({
  promptName,
  message,
  initial,
  validator,
  normalise,
}) {
  let nextInitial = initial;

  while (true) {
    const raw = await new Input({
      name: promptName,
      message,
      initial: nextInitial,
    }).run();

    const value = typeof raw === "string" ? raw.trim() : raw;
    const result = validator(value);

    if (result.valid) {
      console.log(chalk.green("✓ Valid"));
      return typeof normalise === "function" ? normalise(value) : value;
    }

    console.log(
      chalk.red(
        "✗ Invalid: " + result.reason + " (got " + formatValueForMessage(raw) + ")",
      ),
    );
    nextInitial = value || initial;
  }
}

async function askHex(promptName, message, initial) {
  return askValidatedInput({
    promptName,
    message,
    initial: initial || "#000000",
    validator: validateHexColour,
    normalise: function (value) {
      return String(value).toUpperCase();
    },
  });
}

async function askColourFromPresets(label, presets, defaultHex, currentHex) {
  const defaultHexValue = normaliseHex(defaultHex);
  const currentHexValue = normaliseHex(currentHex);

  const choices = presets.map(function (opt) {
    if (opt.value === "custom") {
      return { name: "custom", message: "Enter your own hex" };
    }

    const upperHex = String(opt.value).toUpperCase();
    return {
      name: upperHex,
      message:
        colourSwatch(upperHex) + " " + opt.label + " " + chalk.gray(upperHex),
    };
  });

  let initial = Math.max(
    0,
    choices.findIndex((choice) => choice.name === "custom"),
  );

  if (currentHexValue) {
    const currentIndex = choices.findIndex(
      (choice) => choice.name === currentHexValue,
    );

    if (currentIndex !== -1) {
      initial = currentIndex;
    } else {
      choices.unshift({
        name: "__current__",
        message:
          "Keep current " +
          label +
          " " +
          colourSwatch(currentHexValue) +
          " " +
          chalk.gray(currentHexValue),
      });
      initial = 0;
    }
  } else if (defaultHexValue) {
    const defaultIndex = choices.findIndex(
      (choice) => choice.name === defaultHexValue,
    );
    if (defaultIndex !== -1) {
      initial = defaultIndex;
    }
  }

  const selected = await new Select({
    name: label,
    message: label + " colour",
    choices,
    initial,
  }).run();

  if (selected === "__current__" && currentHexValue) return currentHexValue;
  if (selected !== "custom") return selected.toUpperCase();

  const fallbackHex = currentHexValue || defaultHexValue || "#000000";
  return askHex(label + "Custom", "Enter " + label + " hex", fallbackHex);
}

function hasFile(fileName) {
  return fs.existsSync(path.join(process.cwd(), fileName));
}

function readPackageJson() {
  const packagePath = path.join(process.cwd(), "package.json");

  if (!fs.existsSync(packagePath)) return null;

  try {
    return JSON.parse(fs.readFileSync(packagePath, "utf8"));
  } catch {
    return null;
  }
}

function readExistingConfig() {
  const configPath = path.join(process.cwd(), "emily.config.json");

  if (!fs.existsSync(configPath)) return null;

  try {
    return JSON.parse(fs.readFileSync(configPath, "utf8"));
  } catch {
    return null;
  }
}

function getExistingAdditionalColours(existingColours) {
  if (!isPlainObject(existingColours)) return {};

  const additional = {};
  Object.entries(existingColours).forEach(([name, value]) => {
    if (CORE_COLOUR_KEYS.has(name)) return;
    if (!/^[a-z][a-z0-9-]*$/.test(name)) return;

    const upperHex = normaliseHex(value);
    if (!upperHex) return;
    additional[name] = upperHex;
  });

  return additional;
}

function getBaseUnitInitial(config) {
  const rawBaseUnit = config && typeof config.baseUnit === "string"
    ? config.baseUnit.trim()
    : "";
  if (validateSpacingValue(rawBaseUnit).valid) return rawBaseUnit;
  return "18px";
}

function hasDependency(packageJson, dependencyName) {
  if (!packageJson) return false;

  return Boolean(
    packageJson.dependencies?.[dependencyName] ||
    packageJson.devDependencies?.[dependencyName],
  );
}

function titleCasePackageName(name) {
  return name.replace(/-/g, " ").replace(/\b\w/g, function (c) {
    return c.toUpperCase();
  });
}

function getSelectedFontKeys(headingFont, bodyFont) {
  return [...new Set([headingFont, bodyFont])];
}

function getSelectedFontPackages(fontKeys) {
  return fontKeys
    .filter((key) => !FONT_KEYS_WITHOUT_PACKAGE.has(key))
    .map((key) => FONT_PACKAGE_BY_KEY[key])
    .filter(Boolean);
}

function detectPackageManager() {
  const userAgent = String(process.env.npm_config_user_agent || "").toLowerCase();
  if (userAgent.startsWith("pnpm/")) return "pnpm";
  if (userAgent.startsWith("yarn/")) return "yarn";
  if (userAgent.startsWith("bun/")) return "bun";

  if (hasFile("pnpm-lock.yaml")) return "pnpm";
  if (hasFile("yarn.lock")) return "yarn";
  if (hasFile("bun.lockb") || hasFile("bun.lock")) return "bun";

  return "npm";
}

function getInstallCommand(packageManager, packages) {
  if (packageManager === "pnpm") {
    return { command: "pnpm", args: ["add", ...packages] };
  }

  if (packageManager === "yarn") {
    return { command: "yarn", args: ["add", ...packages] };
  }

  if (packageManager === "bun") {
    return { command: "bun", args: ["add", ...packages] };
  }

  return { command: "npm", args: ["install", ...packages] };
}

function formatInstallCommand(packageManager, packages) {
  const cmd = getInstallCommand(packageManager, packages);
  return [cmd.command, ...cmd.args].join(" ");
}

function installPackages(packageManager, packages) {
  return new Promise((resolve) => {
    const cmd = getInstallCommand(packageManager, packages);
    const child = crossSpawn(cmd.command, cmd.args, {
      cwd: process.cwd(),
      stdio: "pipe",
      shell: process.platform === "win32",
    });

    let stderr = "";

    if (child.stderr) {
      child.stderr.on("data", function (data) {
        stderr += data.toString();
      });
    }

    child.on("close", function (code) {
      resolve({
        success: code === 0,
        stderr: stderr.trim(),
      });
    });

    child.on("error", function (error) {
      resolve({
        success: false,
        stderr: error && error.message ? error.message : "Unknown install error",
      });
    });
  });
}

function parseInitOptions(argv) {
  const args = Array.isArray(argv) ? argv : [];
  const has = function (flag) {
    return args.includes(flag);
  };
  const valueOf = function (flag) {
    const index = args.indexOf(flag);
    if (index === -1) return undefined;
    const value = args[index + 1];
    if (typeof value !== "string" || value.startsWith("--")) return undefined;
    return value;
  };

  return {
    yes: has("--yes") || has("-y"),
    skipFontInstall: has("--skip-font-install"),
    fresh: has("--fresh"),
    useExisting: has("--use-existing"),
    configOnly: has("--config-only"),
    help: has("--help") || has("-h"),
    brand: valueOf("--brand"),
    accent: valueOf("--accent"),
    headingFont: valueOf("--heading-font"),
    bodyFont: valueOf("--body-font"),
  };
}

const INIT_HELP_TEXT = `
emily-css init — set up EmilyCSS in the current project

Usage:
  npx emily-css init [options]

Options:
  --yes, -y             Non-interactive: accept detected/existing values
  --config-only         Write emily.config.json without building CSS
  --fresh               Ignore existing emily.config.json values
  --use-existing        Use existing emily.config.json values as defaults
  --skip-font-install   Do not install @fontsource packages
  --brand <hex>         Brand colour, e.g. --brand "#D92787"
  --accent <hex>        Accent colour, e.g. --accent "#F59E0B"
  --heading-font <key>  Heading font (${ALLOWED_FONT_FAMILIES.join(", ")})
  --body-font <key>     Body font (same keys as --heading-font)
  --help, -h            Show this help

Docs: https://emilyui.com/docs
`;

function validateInitFlagValues(initOptions) {
  const errors = [];

  ["brand", "accent"].forEach(function (key) {
    const value = initOptions[key];
    if (value === undefined) return;
    const result = validateHexColour(value.trim());
    if (!result.valid) {
      errors.push("--" + key + " " + formatValueForMessage(value) + ": " + result.reason);
    }
  });

  [["headingFont", "--heading-font"], ["bodyFont", "--body-font"]].forEach(function ([key, flag]) {
    const value = initOptions[key];
    if (value === undefined) return;
    const result = validateFontFamily(String(value).trim().toLowerCase());
    if (!result.valid) {
      errors.push(flag + " " + formatValueForMessage(value) + ": " + result.reason);
    }
  });

  return errors;
}

function getFontImportPaths(fontKeys) {
  const imports = [];
  fontKeys.forEach((key) => {
    const values = FONT_IMPORTS_BY_KEY[key];
    if (Array.isArray(values)) {
      values.forEach((value) => {
        if (!imports.includes(value)) imports.push(value);
      });
    }
  });
  return imports;
}

function getFontImportGuidance(projectName, fontImportPaths) {
  if (!Array.isArray(fontImportPaths) || fontImportPaths.length === 0) {
    return [];
  }

  if (projectName === "Nuxt") {
    const lines = [];
    lines.push("Nuxt: add these entries to nuxt.config css:");
    lines.push("css: [");
    fontImportPaths.forEach((fontPath) => {
      lines.push('  "' + fontPath + '",');
    });
    lines.push("]");
    return lines;
  }

  if (projectName === "Next.js") {
    const lines = [];
    lines.push("Next.js: import in app/layout.tsx or pages/_app.tsx:");
    fontImportPaths.forEach((fontPath) => {
      lines.push('import "' + fontPath + '";');
    });
    return lines;
  }

  if (projectName === "React" || projectName === "Vue/Vite") {
    const lines = [];
    lines.push("Import in your app entry (e.g. src/main.tsx or src/main.ts):");
    fontImportPaths.forEach((fontPath) => {
      lines.push('import "' + fontPath + '";');
    });
    return lines;
  }

  if (projectName === "Astro") {
    const lines = [];
    lines.push("Astro: import in src/layouts or a global style entry:");
    fontImportPaths.forEach((fontPath) => {
      lines.push('import "' + fontPath + '";');
    });
    return lines;
  }

  const lines = [];
  lines.push("Import these font files in your global entry stylesheet/layout:");
  fontImportPaths.forEach((fontPath) => {
    lines.push('import "' + fontPath + '";');
  });
  return lines;
}

function getNuxtStylesheetHrefFromOutputPath(outputPath) {
  if (!outputPath || typeof outputPath !== "string") {
    return "/emily.css";
  }

  const normalised = outputPath.replace(/\\/g, "/").replace(/^\.\//, "");

  if (normalised.startsWith("public/")) {
    return "/" + normalised.slice("public/".length);
  }

  if (normalised.startsWith("/")) {
    return normalised;
  }

  return "/" + normalised;
}

function patchNuxtConfigCssImports(content, fontImportPaths) {
  const runtimeCssEntries = [];
  if (Array.isArray(fontImportPaths)) {
    fontImportPaths.forEach((fontPath) => {
      if (fontPath && !runtimeCssEntries.includes(fontPath)) runtimeCssEntries.push(fontPath);
    });
  }

  const cssRegex = /(^\s*css\s*:\s*\[)([\s\S]*?)(^\s*\],?)/m;
  const match = content.match(cssRegex);

  if (match) {
    const open = match[1];
    const body = match[2];
    const close = match[3].endsWith(",") ? match[3] : `${match[3]},`;
    const propertyIndentMatch = open.match(/^(\s*)/);
    const propertyIndent = propertyIndentMatch ? propertyIndentMatch[1] : "  ";
    const itemIndent = propertyIndent + "  ";
    const keptLines = body
      .split("\n")
      .filter((line) => !line.includes("@fontsource/"))
      .filter((line) => !/emily(?:\.min)?\.css/i.test(line))
      .filter((line) => line.trim() !== "");
    const runtimeCssLines = runtimeCssEntries.map((runtimePath) => `${itemIndent}'${runtimePath}',`);
    const rebuiltBody = `\n${[...keptLines, ...runtimeCssLines].join("\n")}\n`;
    const replacement = `${open}${rebuiltBody}${close}`;
    const nextContent = content.replace(cssRegex, replacement);
    return { changed: nextContent !== content, content: nextContent };
  }

  const configOpenIndex = content.indexOf("defineNuxtConfig({");
  if (configOpenIndex === -1) {
    return { changed: false, content };
  }

  if (runtimeCssEntries.length === 0) {
    return { changed: false, content };
  }

  const insertIndex = configOpenIndex + "defineNuxtConfig({".length;
  const cssBlock =
    `\n  css: [\n${runtimeCssEntries.map((runtimePath) => `    '${runtimePath}',`).join("\n")}\n  ],\n`;
  const nextContent = content.slice(0, insertIndex) + cssBlock + content.slice(insertIndex);
  return { changed: true, content: nextContent };
}

function patchNuxtHeadStylesheetHref(content, stylesheetHref) {
  if (!stylesheetHref || typeof stylesheetHref !== "string") {
    return { changed: false, content };
  }

  const escapedHref = stylesheetHref.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const hasExactEmilyStylesheetLink = new RegExp(
    `rel\\s*:\\s*['"]stylesheet['"][\\s\\S]*?href\\s*:\\s*['"]${escapedHref}['"]`,
    "i",
  ).test(content);
  if (hasExactEmilyStylesheetLink) {
    return { changed: false, content };
  }

  const rewrittenContent = content
    .replace(
      /(href\s*:\s*["'])[^"']*emily(?:\.min)?\.css(["'])/gi,
      `$1${stylesheetHref}$2`,
    )
    .replace(
      /(<link[^>]*href=["'])[^"']*emily(?:\.min)?\.css(["'][^>]*>)/gi,
      `$1${stylesheetHref}$2`,
    );

  if (rewrittenContent !== content) {
    return { changed: true, content: rewrittenContent };
  }

  const linkRegex = /(^\s*link\s*:\s*\[)([\s\S]*?)(^\s*\],?)/m;
  const linkMatch = rewrittenContent.match(linkRegex);
  if (linkMatch) {
    const open = linkMatch[1];
    const body = linkMatch[2];
    const close = linkMatch[3].endsWith(",") ? linkMatch[3] : `${linkMatch[3]},`;
    const propertyIndentMatch = open.match(/^(\s*)/);
    const propertyIndent = propertyIndentMatch ? propertyIndentMatch[1] : "      ";
    const itemIndent = propertyIndent + "  ";
    const linkLine = `${itemIndent}{ rel: 'stylesheet', href: '${stylesheetHref}' },`;
    const bodyLines = body.split("\n");
    const normalisedBodyLines = bodyLines.map((line) => line.trimEnd());
    for (let i = normalisedBodyLines.length - 1; i >= 0; i -= 1) {
      const trimmed = normalisedBodyLines[i].trim();
      if (!trimmed) continue;
      if (!trimmed.endsWith(",")) {
        normalisedBodyLines[i] = normalisedBodyLines[i] + ",";
      }
      break;
    }
    const rebuiltBody =
      normalisedBodyLines.some((line) => line.trim() !== "")
        ? `\n${normalisedBodyLines.join("\n")}\n${linkLine}\n`
        : `\n${linkLine}\n`;
    const replacement = `${open}${rebuiltBody}${close}`;
    const nextContent = rewrittenContent.replace(linkRegex, replacement);
    return { changed: nextContent !== content, content: nextContent };
  }

  const headRegex = /(^\s*head\s*:\s*\{)/m;
  const headMatch = rewrittenContent.match(headRegex);
  if (headMatch) {
    const line = headMatch[1];
    const propertyIndentMatch = line.match(/^(\s*)/);
    const propertyIndent = propertyIndentMatch ? propertyIndentMatch[1] : "    ";
    const itemIndent = propertyIndent + "  ";
    const linkIndent = itemIndent + "  ";
    const linkBlock =
      `\n${itemIndent}link: [\n${linkIndent}{ rel: 'stylesheet', href: '${stylesheetHref}' },\n${itemIndent}],`;
    const nextContent = rewrittenContent.replace(headRegex, `${line}${linkBlock}`);
    return { changed: nextContent !== content, content: nextContent };
  }

  const appRegex = /(^\s*app\s*:\s*\{)/m;
  const appMatch = rewrittenContent.match(appRegex);
  if (appMatch) {
    const line = appMatch[1];
    const propertyIndentMatch = line.match(/^(\s*)/);
    const propertyIndent = propertyIndentMatch ? propertyIndentMatch[1] : "  ";
    const headIndent = propertyIndent + "  ";
    const linkIndent = headIndent + "  ";
    const linkItemIndent = linkIndent + "  ";
    const headBlock =
      `\n${headIndent}head: {\n${linkIndent}link: [\n${linkItemIndent}{ rel: 'stylesheet', href: '${stylesheetHref}' },\n${linkIndent}],\n${headIndent}},`;
    const nextContent = rewrittenContent.replace(appRegex, `${line}${headBlock}`);
    return { changed: nextContent !== content, content: nextContent };
  }

  const configOpenIndex = rewrittenContent.indexOf("defineNuxtConfig({");
  if (configOpenIndex !== -1) {
    const insertIndex = configOpenIndex + "defineNuxtConfig({".length;
    const appBlock =
      `\n  app: {\n    head: {\n      link: [\n        { rel: 'stylesheet', href: '${stylesheetHref}' },\n      ],\n    },\n  },\n`;
    const nextContent = rewrittenContent.slice(0, insertIndex) + appBlock + rewrittenContent.slice(insertIndex);
    return { changed: nextContent !== content, content: nextContent };
  }

  return { changed: false, content: rewrittenContent };
}

function patchJsEntryWithImports(content, fontImportPaths) {
  if (!Array.isArray(fontImportPaths) || fontImportPaths.length === 0) {
    return { changed: false, content };
  }

  const missing = fontImportPaths.filter(
    (fontPath) => !content.includes(`"${fontPath}"`) && !content.includes(`'${fontPath}'`),
  );

  if (missing.length === 0) {
    return { changed: false, content };
  }

  const importBlock = missing.map((fontPath) => `import "${fontPath}";`).join("\n") + "\n";
  return { changed: true, content: importBlock + content };
}

function patchAstroWithImports(content, fontImportPaths) {
  if (!Array.isArray(fontImportPaths) || fontImportPaths.length === 0) {
    return { changed: false, content };
  }

  const missing = fontImportPaths.filter(
    (fontPath) => !content.includes(`"${fontPath}"`) && !content.includes(`'${fontPath}'`),
  );

  if (missing.length === 0) {
    return { changed: false, content };
  }

  const importLines = missing.map((fontPath) => `import "${fontPath}";`).join("\n");
  const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
  const match = content.match(frontmatterRegex);

  if (match) {
    const updatedFrontmatter = `---\n${match[1]}\n${importLines}\n---`;
    const nextContent = content.replace(frontmatterRegex, updatedFrontmatter);
    return { changed: nextContent !== content, content: nextContent };
  }

  const nextContent = `---\n${importLines}\n---\n\n${content}`;
  return { changed: true, content: nextContent };
}

function applyFontRuntimeWiring(projectName, fontImportPaths, outputCssPath = null) {
  const result = {
    changed: false,
    applied: false,
    target: null,
    message: "",
  };

  const hasFontImports = Array.isArray(fontImportPaths) && fontImportPaths.length > 0;
  if (!hasFontImports && projectName !== "Nuxt") {
    result.message = "No font imports required.";
    return result;
  }

  if (projectName === "Nuxt") {
    const target = hasFile("nuxt.config.ts") ? "nuxt.config.ts" : hasFile("nuxt.config.js") ? "nuxt.config.js" : null;
    if (!target) {
      result.message = "Nuxt config file not found for automatic font wiring.";
      return result;
    }
    const original = fs.readFileSync(path.join(process.cwd(), target), "utf8");
    const nuxtStylesheetHref = getNuxtStylesheetHrefFromOutputPath(outputCssPath || "public/emily.css");
    const patchedCss = patchNuxtConfigCssImports(original, fontImportPaths || []);
    const patchedHead = patchNuxtHeadStylesheetHref(patchedCss.content, nuxtStylesheetHref);
    const changedContent = patchedHead.content;
    if (patchedCss.changed || patchedHead.changed) {
      fs.writeFileSync(path.join(process.cwd(), target), changedContent);
      result.changed = true;
    }
    result.applied = true;
    result.target = target;
    result.message = result.changed
      ? `Updated ${target} font imports and stylesheet link.`
      : `${target} already had matching font imports and stylesheet link.`;
    return result;
  }

  const jsTargetsByProject = {
    "Next.js": ["app/layout.tsx", "app/layout.jsx", "pages/_app.tsx", "pages/_app.jsx", "pages/_app.ts", "pages/_app.js"],
    "React": ["src/main.tsx", "src/main.jsx", "src/main.ts", "src/main.js"],
    "Vue/Vite": ["src/main.ts", "src/main.js"],
  };

  if (jsTargetsByProject[projectName]) {
    const target = jsTargetsByProject[projectName].find((candidate) => hasFile(candidate));
    if (!target) {
      result.message = `${projectName} entry file not found for automatic font wiring.`;
      return result;
    }
    const original = fs.readFileSync(path.join(process.cwd(), target), "utf8");
    const patched = patchJsEntryWithImports(original, fontImportPaths);
    if (patched.changed) {
      fs.writeFileSync(path.join(process.cwd(), target), patched.content);
      result.changed = true;
    }
    result.applied = true;
    result.target = target;
    result.message = patched.changed
      ? `Added font imports to ${target}.`
      : `${target} already had matching font imports.`;
    return result;
  }

  if (projectName === "Astro") {
    const target = ["src/layouts/Layout.astro", "src/pages/index.astro"].find((candidate) => hasFile(candidate));
    if (!target) {
      result.message = "Astro layout/page file not found for automatic font wiring.";
      return result;
    }
    const original = fs.readFileSync(path.join(process.cwd(), target), "utf8");
    const patched = patchAstroWithImports(original, fontImportPaths);
    if (patched.changed) {
      fs.writeFileSync(path.join(process.cwd(), target), patched.content);
      result.changed = true;
    }
    result.applied = true;
    result.target = target;
    result.message = patched.changed
      ? `Added font imports to ${target}.`
      : `${target} already had matching font imports.`;
    return result;
  }

  result.message = `${projectName} uses manual font wiring guidance.`;
  return result;
}

function canAutoWireFontRuntime(projectName) {
  return (
    projectName === "Nuxt" ||
    projectName === "Next.js" ||
    projectName === "React" ||
    projectName === "Vue/Vite" ||
    projectName === "Astro"
  );
}

function addEmilyScriptsToPackageJson() {
  const packagePath = path.join(process.cwd(), "package.json");

  if (!fs.existsSync(packagePath)) return false;

  try {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));

    packageJson.scripts = packageJson.scripts || {};

    let changed = false;

    const scripts = {
      "emily:build": "emily-css build",
      "emily:watch": "emily-css watch",
      "emily:watch:prod": "emily-css watch --prod",
      "emily:doctor": "emily-css doctor",
      "emily:migrate": "emily-css migrate",
      "emily:info": "emily-css info",
      "emily:manifest": "emily-css manifest",
      "emily:version": "emily-css version",
      "emily:help": "emily-css help",
      "emily:showcase": "emily-css showcase",
      "emily:uninstall": "emily-css uninstall",
    };

    for (const [key, value] of Object.entries(scripts)) {
      if (!packageJson.scripts[key]) {
        packageJson.scripts[key] = value;
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(
        packagePath,
        JSON.stringify(packageJson, null, 2) + "\n",
      );
    }

    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// PROJECT DETECTION
// ============================================================================

function detectProject() {
  const packageJson = readPackageJson();

  if (
    hasFile("nuxt.config.ts") ||
    hasFile("nuxt.config.js") ||
    hasDependency(packageJson, "nuxt")
  ) {
    return {
      name: "Nuxt",
      sourceDir: ".",
      outputPath: "public/emily.css",
      sourceGlobs: [
        "./components/**/*.{vue,js,ts}",
        "./pages/**/*.vue",
        "./layouts/**/*.vue",
        "./app.vue",
      ],
      linkHint: '<link rel="stylesheet" href="/emily.css">',
    };
  }

  if (hasDependency(packageJson, "next")) {
    return {
      name: "Next.js",
      sourceDir: ".",
      outputPath: "public/emily.css",
      sourceGlobs: [
        "./app/**/*.{js,jsx,ts,tsx}",
        "./pages/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}",
        "./src/**/*.{js,jsx,ts,tsx}",
      ],
      linkHint: '<link rel="stylesheet" href="/emily.css">',
    };
  }

  if (hasDependency(packageJson, "react")) {
    return {
      name: "React",
      sourceDir: "./src",
      outputPath: hasFile("public")
        ? "public/emily.css"
        : "dist/emily.css",
      sourceGlobs: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}",
      ],
      linkHint: hasFile("public")
        ? '<link rel="stylesheet" href="/emily.css">'
        : '<link rel="stylesheet" href="./dist/emily.css">',
    };
  }

  if (
    hasDependency(packageJson, "vue") ||
    hasFile("vite.config.ts") ||
    hasFile("vite.config.js")
  ) {
    return {
      name: "Vue/Vite",
      sourceDir: "./src",
      outputPath: "public/emily.css",
      sourceGlobs: ["./src/**/*.{vue,js,ts}"],
      linkHint: '<link rel="stylesheet" href="/emily.css">',
    };
  }

  if (hasDependency(packageJson, "astro") || hasFile("astro.config.mjs")) {
    return {
      name: "Astro",
      sourceDir: "./src",
      outputPath: "public/emily.css",
      sourceGlobs: ["./src/**/*.{astro,html,js,ts,vue,jsx,tsx,svelte}"],
      linkHint: '<link rel="stylesheet" href="/emily.css">',
    };
  }

  const rootFiles = fs.readdirSync(process.cwd());
  const hasDrupalInfoFile = rootFiles.some(function (file) {
    return file.endsWith(".info.yml");
  });

  if (
    hasDrupalInfoFile ||
    fs.existsSync(path.join(process.cwd(), "web/core"))
  ) {
    return {
      name: "Drupal",
      sourceDir: ".",
      outputPath: "dist/emily.css",
      sourceGlobs: [
        "./web/themes/custom/**/*.{twig,js,ts}",
        "./templates/**/*.html.twig",
        "./components/**/*.twig",
        "./**/*.theme",
      ],
      linkHint: "Attach dist/emily.css through your theme library YAML.",
    };
  }

  return {
    name: "Static/Generic",
    sourceDir: ".",
    outputPath: "dist/emily.css",
    sourceGlobs: [
      "./**/*.{html,htm,twig,njk,liquid,hbs,php,astro,svelte,vue,blade.php,jinja,jinja2,j2}",
    ],
    linkHint: '<link rel="stylesheet" href="./dist/emily.css">',
  };
}

// ============================================================================
// CONFIG BUILDER
// ============================================================================

function createDefaultConfig({
  name,
  colours,
  headingFont,
  bodyFont,
  baseUnit,
  baseFontSize,
  detectedProject,
  proseEnabled,
}) {
  return {
    name,
    description: name + " design system",

    baseUnit,
    baseFontSize: baseFontSize || "16px",

    fontFamily: {
      heading: headingFont,
      body: bodyFont,
    },

    customFonts: [],

    output: {
      css: detectedProject.outputPath,
      fullCss: detectedProject.outputPath,
    },

    manifest: true,

    colours,

    semanticColours: {
      dark: "#1A1A1A",
      light: "#FAFAFA",
    },

    prose: {
      ...DEFAULT_PROSE_CONFIG,
      enabled: proseEnabled !== false,
    },

    purge: {
      projectType: detectedProject.name,
      sourceDir: detectedProject.sourceDir,
      sourceGlobs: detectedProject.sourceGlobs,
      ignore: DEFAULT_PURGE_IGNORE,
      safelist: [
        "bg-dark",
        "text-dark",
        "border-dark",
        "fill-dark",
        "bg-light",
        "text-light",
        "border-light",
        "fill-light",
      ],
      extensions: PURGE_EXTENSIONS,
    },

    breakpoints: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },

    spacing: {
      scale: {
        0: "0px",
        px: "1px",
        0.5: "0.125rem",
        1: "0.25rem",
        1.5: "0.375rem",
        2: "0.5rem",
        2.5: "0.625rem",
        3: "0.75rem",
        3.5: "0.875rem",
        4: "1rem",
        5: "1.25rem",
        6: "1.5rem",
        7: "1.75rem",
        8: "2rem",
        9: "2.25rem",
        10: "2.5rem",
        11: "2.75rem",
        12: "3rem",
        14: "3.5rem",
        16: "4rem",
        20: "5rem",
        24: "6rem",
        28: "7rem",
        32: "8rem",
        36: "9rem",
        40: "10rem",
        44: "11rem",
        48: "12rem",
        52: "13rem",
        56: "14rem",
        60: "15rem",
        64: "16rem",
        72: "18rem",
        80: "20rem",
        96: "24rem",
      },

      borderWidths: [0, 2, 4, 8],

      borderRadius: {
        none: "0",
        sm: "4px",
        base: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "32px",
        full: "9999px",
      },
    },

    typography: {
      lineHeightRatio: 1.5,

      fontWeights: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },

      fontSizes: [
        { name: "xs", value: "12px", lineHeight: 1.5 },
        { name: "sm", value: "14px", lineHeight: 1.5 },
        { name: "base", value: "16px", lineHeight: 1.6 },
        { name: "lg", value: "18px", lineHeight: 1.6 },
        { name: "xl", value: "20px", lineHeight: 1.6 },
        { name: "2xl", value: "24px", lineHeight: 1.4 },
        { name: "3xl", value: "30px", lineHeight: 1.4 },
        { name: "4xl", value: "36px", lineHeight: 1.3 },
        { name: "5xl", value: "48px", lineHeight: 1.15 },
        { name: "6xl", value: "60px", lineHeight: 1.1 },
        { name: "7xl", value: "72px", lineHeight: 1.05 },
        { name: "8xl", value: "96px", lineHeight: 1 },
        { name: "9xl", value: "128px", lineHeight: 1 },
      ],
    },

    shadows: {
      sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
      base: "0 4px 6px rgba(0, 0, 0, 0.1)",
      md: "0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)",
      lg: "0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)",
      xl: "0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)",
      "2xl": "0 25px 50px rgba(0, 0, 0, 0.25)",
      inner: "inset 0 2px 4px rgba(0, 0, 0, 0.06)",
      none: "none",
    },

    transitions: {
      fast: "100ms",
      base: "200ms",
      slow: "300ms",
      timing: "cubic-bezier(0.4, 0, 0.2, 1)",
    },

    zIndex: {
      auto: "auto",
      0: "0",
      10: "10",
      20: "20",
      30: "30",
      40: "40",
      50: "50",
      dropdown: "1000",
      sticky: "1020",
      fixed: "1030",
      modal: "1040",
      popover: "1060",
      tooltip: "1070",
    },

    opacity: [0, 5, 10, 25, 50, 75, 90, 95, 100],
  };
}

// ============================================================================
// INIT
// ============================================================================

async function init(options = {}) {
  const initOptions = {
    yes: options.yes === true,
    skipFontInstall: options.skipFontInstall === true,
    fresh: options.fresh === true,
    useExisting: options.useExisting === true,
    configOnly: options.configOnly === true,
    help: options.help === true,
    brand: typeof options.brand === "string" ? options.brand : undefined,
    accent: typeof options.accent === "string" ? options.accent : undefined,
    headingFont: typeof options.headingFont === "string" ? options.headingFont : undefined,
    bodyFont: typeof options.bodyFont === "string" ? options.bodyFont : undefined,
  };

  if (initOptions.help) {
    console.log(INIT_HELP_TEXT);
    process.exit(0);
  }

  const flagErrors = validateInitFlagValues(initOptions);
  if (flagErrors.length > 0) {
    console.log(chalk.red("\n✗ Invalid init flags:\n"));
    flagErrors.forEach(function (message) {
      console.log(chalk.red("  - " + message));
    });
    console.log("");
    process.exit(1);
  }

  console.log(
    chalk.bold.magenta("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"),
  );
  console.log(chalk.bold.magenta("  EmilyUI Setup"));
  console.log(
    chalk.bold.magenta("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"),
  );

  try {
    const spinner = ora("Analysing project structure...").start();
    const detectedProject = detectProject();
    spinner.succeed("Detected project: " + chalk.cyan(detectedProject.name));
    const rawExistingConfig = readExistingConfig();
    let existingConfig = rawExistingConfig;

    if (rawExistingConfig) {
      if (initOptions.fresh) {
        existingConfig = null;
        console.log(
          chalk.gray("  Existing config found. Starting from fresh defaults (--fresh)."),
        );
      } else if (initOptions.useExisting || initOptions.yes) {
        console.log(
          chalk.gray("  Found existing emily.config.json. Using existing values as prompt defaults."),
        );
      } else {
        const configMode = await new Select({
          name: "configMode",
          message: "Existing emily.config.json detected. How do you want to continue?",
          choices: [
            {
              name: "use-existing",
              message: "Use existing values as defaults (recommended)",
            },
            {
              name: "start-fresh",
              message: "Start from fresh defaults",
            },
          ],
          initial: 0,
        }).run();

        if (configMode === "start-fresh") {
          existingConfig = null;
          console.log(chalk.gray("  Starting from fresh defaults."));
        } else {
          console.log(chalk.gray("  Using existing values as prompt defaults."));
        }
      }
    }

    const existingColours = isPlainObject(existingConfig && existingConfig.colours)
      ? existingConfig.colours
      : {};

    if (existingConfig && rawExistingConfig) {
      console.log(
        chalk.gray(
          "  Found existing emily.config.json. Prompts are pre-filled from current settings.",
        ),
      );
    }

    const packageJsonData = readPackageJson();
    const pkgName =
      existingConfig && typeof existingConfig.name === "string" && existingConfig.name.trim()
        ? existingConfig.name.trim()
        : packageJsonData && packageJsonData.name
        ? titleCasePackageName(packageJsonData.name)
        : "My Design System";

    const projectName = initOptions.yes
      ? pkgName
      : await askValidatedInput({
          promptName: "projectName",
          message: "Project name",
          initial: pkgName,
          validator: function (value) {
            if (typeof value !== "string" || !value.trim()) {
              return { valid: false, reason: "project name is required" };
            }
            return { valid: true };
          },
        });

    if (!projectName || !projectName.trim()) {
      console.log(chalk.red("\nProject name is required.\n"));
      process.exit(1);
    }

    // =========================================================================
    // COLOURS
    // =========================================================================

    console.log(chalk.bold("\n" + chalk.magenta("→") + " Brand colours"));

    const flagBrand = normaliseHex(initOptions.brand);
    const flagAccent = normaliseHex(initOptions.accent);

    const brand = flagBrand
      ? flagBrand
      : initOptions.yes
        ? normaliseHex(existingColours.brand) || "#DB2777"
        : await askColourFromPresets(
            "brand",
            COLOUR_PRESETS.primary,
            "#DB2777",
            existingColours.brand,
          );
    const accent = flagAccent
      ? flagAccent
      : initOptions.yes
        ? normaliseHex(existingColours.accent) || "#2563EB"
        : await askColourFromPresets(
            "accent",
            COLOUR_PRESETS.secondary,
            "#2563EB",
            existingColours.accent,
          );

    console.log(
      chalk.gray(
        "\n  Button colour tokens will use your brand colours by default:",
      ),
    );
    console.log(chalk.gray("  - btn-primary = brand"));
    console.log(chalk.gray("  - btn-secondary = accent"));

    console.log(chalk.bold("\n" + chalk.magenta("→") + " Utility colours"));
    console.log(
      chalk.gray(
        "  Defaults shown. Press enter to accept or pick an alternative.\n",
      ),
    );

    const success = initOptions.yes
      ? normaliseHex(existingColours.success) || "#017F65"
      : await askColourFromPresets(
          "success",
          COLOUR_PRESETS.success,
          "#017F65",
          existingColours.success,
        );
    const warning = initOptions.yes
      ? normaliseHex(existingColours.warning) || "#FFC107"
      : await askColourFromPresets(
          "warning",
          COLOUR_PRESETS.warning,
          "#FFC107",
          existingColours.warning,
        );
    const error = initOptions.yes
      ? normaliseHex(existingColours.error) || "#B20000"
      : await askColourFromPresets(
          "error",
          COLOUR_PRESETS.error,
          "#B20000",
          existingColours.error,
        );

    const colours = {
      brand,
      accent,
      "btn-primary": brand,
      "btn-secondary": accent,
      success,
      warning,
      error,
      neutral: normaliseHex(existingColours.neutral) || "#57534E",
      ...getExistingAdditionalColours(existingColours),
    };

    let addingMore = !initOptions.yes;

    while (addingMore) {
      const wantsMore = await new Confirm({
        name: "addMore",
        message: "Add another utility colour?",
        initial: false,
      }).run();

      if (!wantsMore) {
        addingMore = false;
        break;
      }

      const customName = await new Input({
        name: "customName",
        message: "Colour name (e.g. accent, highlight, brand-dark)",
        validate: function (value) {
          const trimmed = value.trim();

          if (!trimmed) return "Name is required";
          if (!/^[a-z][a-z0-9-]*$/.test(trimmed)) {
            return "Use lowercase letters, numbers, and hyphens only";
          }
          if (colours[trimmed]) return '"' + trimmed + '" is already defined';

          return true;
        },
      }).run();

      colours[customName.trim()] = await askHex(
        "hex-" + customName,
        "Hex for " + customName,
        "#000000",
      );
    }

    // =========================================================================
    // TYPOGRAPHY
    // =========================================================================

    console.log(chalk.bold("\n" + chalk.magenta("→") + " Typography"));

    console.log(
      chalk.gray(
        "  Allowed font families: " + ALLOWED_FONT_FAMILIES.join(", "),
      ),
    );

    const headingFontDefault = (function () {
      const existingHeading = isPlainObject(existingConfig && existingConfig.fontFamily)
        ? existingConfig.fontFamily.heading
        : existingConfig && existingConfig.fontFamily;
      if (typeof existingHeading !== "string") return "lexend";
      const candidate = existingHeading.trim().toLowerCase();
      return validateFontFamily(candidate).valid ? candidate : "lexend";
    })();

    const headingFont = initOptions.headingFont
      ? String(initOptions.headingFont).trim().toLowerCase()
      : initOptions.yes
        ? headingFontDefault
        : await askValidatedInput({
            promptName: "headingFont",
            message: "Heading font family",
            initial: headingFontDefault,
            validator: validateFontFamily,
            normalise: function (value) {
              return String(value).trim().toLowerCase();
            },
          });

    const bodyFontDefault = (function () {
      const existingBody = isPlainObject(existingConfig && existingConfig.fontFamily)
        ? existingConfig.fontFamily.body
        : existingConfig && existingConfig.fontFamily;
      if (typeof existingBody !== "string") return "inter";
      const candidate = existingBody.trim().toLowerCase();
      return validateFontFamily(candidate).valid ? candidate : "inter";
    })();

    const bodyFont = initOptions.bodyFont
      ? String(initOptions.bodyFont).trim().toLowerCase()
      : initOptions.yes
        ? bodyFontDefault
        : await askValidatedInput({
            promptName: "bodyFont",
            message: "Body font family",
            initial: bodyFontDefault,
            validator: validateFontFamily,
            normalise: function (value) {
              return String(value).trim().toLowerCase();
            },
          });

    const selectedFontKeys = getSelectedFontKeys(headingFont, bodyFont);
    const selectedFontImportPaths = getFontImportPaths(selectedFontKeys);
    const selectedFontGuidanceLines = getFontImportGuidance(
      detectedProject.name,
      selectedFontImportPaths,
    );
    const selectedFontPackages = getSelectedFontPackages(selectedFontKeys);
    const packageManager = detectPackageManager();
    const packageJsonSnapshot = readPackageJson() || packageJsonData || {};
    const missingFontPackages = selectedFontPackages.filter(
      (pkg) => !hasDependency(packageJsonSnapshot, pkg),
    );
    let fontInstallAttempted = false;
    let fontInstallSucceeded = false;
    let fontInstallSkipped = false;
    let fontPackagesAlreadyInstalled = false;
    let fontInstallError = "";
    let fontRuntimeWiringAttempted = false;
    let fontRuntimeWiringResult = null;

    if (selectedFontPackages.length > 0 && missingFontPackages.length === 0) {
      fontPackagesAlreadyInstalled = true;
      console.log(
        chalk.gray("\n  Required @fontsource packages are already installed."),
      );
    } else if (missingFontPackages.length > 0) {
      console.log(
        chalk.gray(
          "\n  Selected fonts can be installed automatically via @fontsource:",
        ),
      );
      missingFontPackages.forEach(function (fontPkg) {
        console.log(chalk.gray("  - " + fontPkg));
      });

      let shouldInstallFonts = false;
      if (initOptions.skipFontInstall) {
        fontInstallSkipped = true;
      } else if (initOptions.yes) {
        shouldInstallFonts = true;
      } else {
        shouldInstallFonts = await new Confirm({
          name: "installFontPackages",
          message: "Install selected font packages now?",
          initial: true,
        }).run();
      }

      if (shouldInstallFonts) {
        fontInstallAttempted = true;
        const installSpinner = ora("Installing selected font packages...").start();
        const installResult = await installPackages(packageManager, missingFontPackages);

        if (installResult.success) {
          fontInstallSucceeded = true;
          installSpinner.succeed("Installed font packages.");
        } else {
          fontInstallError = installResult.stderr || "Install command failed.";
          installSpinner.fail("Font package install failed. You can install them manually.");
        }
      } else if (!initOptions.skipFontInstall) {
        fontInstallSkipped = true;
        console.log(
          chalk.gray(
            "  Skipped font package install. You can load these fonts manually later.",
          ),
        );
      }
    }

    const baseFontSizeChoices = ["14px", "16px", "18px", "20px"];
    const baseFontSizeDefault = baseFontSizeChoices.includes(
      existingConfig && existingConfig.baseFontSize,
    )
      ? existingConfig.baseFontSize
      : "16px";

    const baseFontSize = initOptions.yes
      ? baseFontSizeDefault
      : await new Select({
          name: "baseFontSize",
          message: "Base font size (sets html font-size, scales all rem values)",
          choices: baseFontSizeChoices,
          initial: baseFontSizeChoices.indexOf(baseFontSizeDefault),
        }).run();

    // =========================================================================
    // PROSE
    // =========================================================================

    let proseEnabled = true;
    const existingProse = isPlainObject(existingConfig && existingConfig.prose)
      ? existingConfig.prose
      : {};

    if (initOptions.yes) {
      proseEnabled = typeof existingProse.enabled === "boolean"
        ? existingProse.enabled
        : true;
    } else {
      console.log(chalk.bold("\n" + chalk.magenta("→") + " Prose"));
      proseEnabled = await new Confirm({
        name: "proseEnabled",
        message: "Generate scoped rich-text styles for .prose?",
        initial: typeof existingProse.enabled === "boolean"
          ? existingProse.enabled
          : true,
      }).run();
    }

    // =========================================================================
    // SPACING
    // =========================================================================

    const baseUnit = initOptions.yes
      ? getBaseUnitInitial(existingConfig)
      : await askValidatedInput({
          promptName: "baseUnit",
          message: "Base spacing unit in px (label/documentation only) e.g. 1rem or 10px",
          initial: getBaseUnitInitial(existingConfig),
          validator: validateSpacingValue,
          normalise: function (value) {
            return String(value).trim().toLowerCase();
          },
        });

    // =========================================================================
    // PURGE / OUTPUT
    // =========================================================================

    console.log(chalk.bold("\n" + chalk.magenta("→") + " Project files"));

    const existingPurge = isPlainObject(existingConfig && existingConfig.purge)
      ? existingConfig.purge
      : {};
    const initialSourceGlobs =
      Array.isArray(existingPurge.sourceGlobs) && existingPurge.sourceGlobs.length > 0
        ? existingPurge.sourceGlobs
        : detectedProject.sourceGlobs;
    const existingOutput = isPlainObject(existingConfig && existingConfig.output)
      ? existingConfig.output
      : {};
    const initialOutputPath =
      typeof existingOutput.css === "string" && existingOutput.css.trim()
        ? existingOutput.css.trim()
        : detectedProject.outputPath;

    console.log(
      chalk.gray(
        "  Detected " +
          detectedProject.name +
          ". EmilyCSS will scan these files for used classes:",
      ),
    );

    initialSourceGlobs.forEach(function (glob) {
      console.log(chalk.gray("  - " + glob));
    });

    if (initOptions.yes) {
      detectedProject.sourceGlobs = initialSourceGlobs;
      detectedProject.outputPath = initialOutputPath;
    } else {
      const globsInput = await askValidatedInput({
        promptName: "sourceGlobs",
        message: "Source globs to scan (comma-separated, enter to accept)",
        initial: initialSourceGlobs.join(", "),
        validator: function (value) {
          if (typeof value !== "string" || !value.trim()) {
            return { valid: false, reason: "at least one source glob is required" };
          }
          return { valid: true };
        },
      });
      detectedProject.sourceGlobs = globsInput
        .split(",")
        .map(function (glob) {
          return glob.trim();
        })
        .filter(Boolean);

      console.log(chalk.bold("\n" + chalk.magenta("→") + " CSS output"));
      detectedProject.outputPath = await askValidatedInput({
        promptName: "outputPath",
        message: "CSS output path (enter to accept)",
        initial: initialOutputPath,
        validator: function (value) {
          if (typeof value !== "string" || !value.trim()) {
            return { valid: false, reason: "output path is required" };
          }
          if (!value.trim().toLowerCase().endsWith(".css")) {
            return { valid: false, reason: "output path must end in .css" };
          }
          return { valid: true };
        },
        normalise: function (value) {
          return String(value).trim();
        },
      });
    }

    // =========================================================================
    // BUILD
    // =========================================================================

    const generatedDefaults = createDefaultConfig({
      name: projectName.trim(),
      colours,
      headingFont,
      bodyFont,
      baseUnit,
      baseFontSize,
      detectedProject,
      proseEnabled,
    });
    const config = mergeWithDefaults(generatedDefaults, existingConfig);
    config.name = projectName.trim();

    if (!existingConfig || !existingConfig.description) {
      config.description = config.name + " design system";
    }

    config.baseUnit = baseUnit;
    config.baseFontSize = baseFontSize || "16px";
    config.fontFamily = {
      heading: headingFont,
      body: bodyFont,
    };
    config.colours = colours;
    config.prose = mergeWithDefaults(DEFAULT_PROSE_CONFIG, config.prose);
    config.prose.enabled = proseEnabled;

    config.output = isPlainObject(config.output) ? config.output : {};
    config.output.css = detectedProject.outputPath;
    if (typeof config.output.fullCss !== "string" || !config.output.fullCss.trim()) {
      config.output.fullCss = detectedProject.outputPath;
    }
    if (isPlainObject(config.purge)) {
      config.purge.sourceGlobs = detectedProject.sourceGlobs;
    }

    const finalValidation = validateConfigShape(config);
    if (!finalValidation.valid) {
      console.log(chalk.red("\n✗ Config validation failed. emily.config.json was not written.\n"));
      finalValidation.errors.forEach(function (error) {
        console.log(chalk.red("  - " + error));
      });
      process.exit(1);
    }

    const configPath = path.join(process.cwd(), "emily.config.json");
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");

    if (
      canAutoWireFontRuntime(detectedProject.name) &&
      (selectedFontImportPaths.length > 0 || detectedProject.name === "Nuxt")
    ) {
      let shouldWireFontRuntime = false;
      if (initOptions.yes) {
        shouldWireFontRuntime = true;
      } else {
        shouldWireFontRuntime = await new Confirm({
          name: "wireFontImports",
          message:
            "Auto-wire runtime CSS setup into your " +
            detectedProject.name +
            " entry?",
          initial: true,
        }).run();
      }

      if (shouldWireFontRuntime) {
        fontRuntimeWiringAttempted = true;
        fontRuntimeWiringResult = applyFontRuntimeWiring(
          detectedProject.name,
          selectedFontImportPaths,
          config.output && config.output.css ? config.output.css : detectedProject.outputPath,
        );
      }
    }

    const manifestOutputPath =
      config.manifest === true
        ? "dist/emily.manifest.json"
        : isPlainObject(config.manifest) && config.manifest.enabled === true
          ? config.manifest.output || "dist/emily.manifest.json"
          : null;

    const nextCommandsBlock =
      "\n\nNext commands:\n" +
      chalk.cyan("  npx emily-css build") +
      chalk.gray("      generate CSS from your config\n") +
      chalk.cyan("  npx emily-css watch") +
      chalk.gray("      rebuild on file changes\n") +
      chalk.cyan("  npx emily-css doctor") +
      chalk.gray("     check config and contrast\n") +
      chalk.cyan("  npx emily-css migrate") +
      chalk.gray("    convert Tailwind-style classes if you have them") +
      "\n\nDocs: " +
      chalk.cyan("https://emilyui.com/docs");

    if (initOptions.configOnly) {
      console.log(
        "\n" +
          boxen(
            chalk.green.bold("Config written (no CSS built)") +
              "\n\nConfig:   " +
              chalk.cyan("emily.config.json") +
              "\nOutput:   " +
              chalk.cyan(config.output.css) +
              (manifestOutputPath
                ? "\nManifest: " + chalk.cyan(manifestOutputPath)
                : "") +
              "\nProject:  " +
              chalk.cyan(detectedProject.name) +
              "\nScan:\n  " +
              chalk.cyan(config.purge.sourceGlobs.join("\n  ")) +
              nextCommandsBlock,
            {
              padding: 1,
              margin: 1,
              borderStyle: "round",
              borderColor: "magenta",
            },
          ),
      );
      process.exit(0);
      return;
    }

    console.log("");

    const buildSpinner = ora("Building EmilyUI CSS...").start();

    const build = crossSpawn("npx", ["emily-css", "build"], {
      cwd: process.cwd(),
      stdio: "pipe",
      shell: process.platform === "win32",
    });

    let stderr = "";

    build.stderr.on("data", function (data) {
      stderr += data.toString();
    });

    build.on("close", async function (code) {
      if (code === 0) {
        buildSpinner.succeed("EmilyUI CSS built successfully.");

        const scriptsAdded = addEmilyScriptsToPackageJson();
        const fontInstallCommand = formatInstallCommand(packageManager, missingFontPackages);
        const fontGuidanceBlock = selectedFontGuidanceLines.length > 0
          ? "\n" + selectedFontGuidanceLines.map((line) => "  " + line).join("\n")
          : "";
        const fontInstallSummary = selectedFontPackages.length === 0
          ? ""
          : fontPackagesAlreadyInstalled
            ? "\n\nFonts:\n" +
              chalk.green("  Font packages already installed.") +
              fontGuidanceBlock
          : fontInstallAttempted && fontInstallSucceeded
            ? "\n\nFonts:\n" +
              chalk.green("  Installed font packages: ") +
              chalk.cyan(missingFontPackages.join(", ")) +
              fontGuidanceBlock
            : "\n\nFonts:\n" +
              chalk.yellow(
                fontInstallSkipped
                  ? "  Font package install was skipped."
                  : "  Selected fonts require manual loading.",
              ) +
              "\n" +
              chalk.gray("  Install later with: ") +
              chalk.cyan(fontInstallCommand) +
              fontGuidanceBlock +
              (fontInstallError
                ? "\n" + chalk.gray("  Install error: " + fontInstallError)
                : "");
        const fontRuntimeSummary = !fontRuntimeWiringAttempted
          ? selectedFontImportPaths.length === 0
            ? ""
            : "\n\nFont runtime wiring:\n" +
              chalk.gray("  Skipped auto-wiring. Use guidance below if needed.") +
              fontGuidanceBlock
          : fontRuntimeWiringResult && fontRuntimeWiringResult.applied
            ? "\n\nFont runtime wiring:\n" +
              (fontRuntimeWiringResult.changed
                ? chalk.green("  " + fontRuntimeWiringResult.message)
                : chalk.gray("  " + fontRuntimeWiringResult.message))
            : "\n\nFont runtime wiring:\n" +
              chalk.yellow(
                "  " +
                  (fontRuntimeWiringResult && fontRuntimeWiringResult.message
                    ? fontRuntimeWiringResult.message
                    : "Automatic wiring could not be applied."),
              ) +
              fontGuidanceBlock;

        console.log(
          "\n" +
            boxen(
              chalk.green.bold("Setup complete") +
                "\n\nConfig:   " +
                chalk.cyan("emily.config.json") +
                "\nOutput:   " +
                chalk.cyan(config.output.css) +
                (manifestOutputPath
                  ? "\nManifest: " + chalk.cyan(manifestOutputPath)
                  : "") +
                "\nProject:  " +
                chalk.cyan(detectedProject.name) +
                "\nScan:\n  " +
                chalk.cyan(config.purge.sourceGlobs.join("\n  ")) +
                "\n\nNext: add this stylesheet to your project:" +
                "\n" +
                chalk.yellow("  " + detectedProject.linkHint) +
                nextCommandsBlock +
                fontInstallSummary +
                fontRuntimeSummary +
                (scriptsAdded
                  ? "\n\nScripts added:\n" +
                    chalk.cyan("  npm run emily:build\n") +
                    chalk.cyan("  npm run emily:watch\n") +
                    chalk.cyan("  npm run emily:watch:prod\n") +
                    chalk.cyan("  npm run emily:doctor\n") +
                    chalk.cyan("  npm run emily:migrate\n") +
                    chalk.cyan("  npm run emily:info\n") +
                    chalk.cyan("  npm run emily:manifest\n") +
                    chalk.cyan("  npm run emily:version\n") +
                    chalk.cyan("  npm run emily:showcase\n") +
                    chalk.cyan("  npm run emily:uninstall\n") +
                    chalk.cyan("  npm run emily:help")
                  : ""),
              {
                padding: 1,
                margin: 1,
                borderStyle: "round",
                borderColor: "magenta",
              },
            ),
        );

        console.log(
          chalk.gray(
            "\nInit complete. Use your framework dev server for HMR; run Emily commands manually when needed.\n",
          ),
        );
        process.exit(0);
        return;
      }

      buildSpinner.fail("Automatic build failed.");
      console.log("\nYour config was created, but CSS was not built.");
      console.log("\nRun manually:\n");
      console.log(chalk.cyan("  npx emily-css build"));

      if (stderr.trim()) {
        console.log(chalk.gray("\nBuild error:\n"));
        console.log(stderr.trim());
      }

      process.exit(1);
    });

    build.on("error", function (error) {
      buildSpinner.fail("Automatic build failed.");
      console.log("\nYour config was created, but CSS was not built.");
      console.log("Reason: " + error.message);
      console.log("\nRun manually:\n");
      console.log(chalk.cyan("  npx emily-css build\n"));
      process.exit(1);
    });
  } catch (error) {
    console.log(chalk.red("\nSetup cancelled or failed."));

    if (error && error.message) {
      console.log(chalk.gray(error.message));
    }

    process.exit(1);
  }
}

if (require.main === module) {
  const options = parseInitOptions(process.argv.slice(2));
  init(options);
}

module.exports = {
  init,
  parseInitOptions,
  getSelectedFontKeys,
  getSelectedFontPackages,
  detectPackageManager,
  getInstallCommand,
  formatInstallCommand,
  getFontImportPaths,
  getFontImportGuidance,
  getNuxtStylesheetHrefFromOutputPath,
  patchNuxtConfigCssImports,
  patchNuxtHeadStylesheetHref,
  patchJsEntryWithImports,
  patchAstroWithImports,
  applyFontRuntimeWiring,
  canAutoWireFontRuntime,
  DEFAULT_PROSE_CONFIG,
};
