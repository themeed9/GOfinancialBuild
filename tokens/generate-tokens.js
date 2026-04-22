/**
 * generate-tokens.js
 * 
 * Reads color-token.json and design-tokens.tokens.json,
 * resolves all token references, and outputs a single CSS file
 * with design-system variables.
 * 
 * Features:
 *  - Resolves nested token references (e.g. {color.palette.primary.100})
 *  - Interpolates missing tonal stops in palettes (e.g. neutral.6, neutral.12)
 *  - Provides a default error palette if none exists in the source
 *  - Outputs light theme as :root, dark theme as [data-theme="dark"]
 *    and @media (prefers-color-scheme: dark)
 * 
 * Usage: node generate-tokens.js
 */

const fs = require('fs');
const path = require('path');

// ─── File paths ───────────────────────────────────────────────
const COLOR_TOKEN_PATH = path.join(__dirname, 'color-token.json');
const DESIGN_TOKEN_PATH = path.join(__dirname, 'design-tokens.tokens.json');
const OUTPUT_CSS_PATH = path.join(__dirname, 'design-tokens.css');

// ─── Helpers ──────────────────────────────────────────────────

/**
 * Converts a camelCase string to kebab-case.
 * e.g. "onPrimaryContainer" → "on-primary-container"
 */
function camelToKebab(str) {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Parses an HSL string like "hsl(219, 23%, 12%)" into {h, s, l}.
 */
function parseHSL(hslStr) {
  const match = hslStr.match(/hsl\(\s*([\d.]+)\s*,\s*([\d.]+)%?\s*,\s*([\d.]+)%?\s*\)/);
  if (!match) return null;
  return { h: parseFloat(match[1]), s: parseFloat(match[2]), l: parseFloat(match[3]) };
}

/**
 * Formats {h, s, l} back to an HSL string.
 */
function formatHSL({ h, s, l }) {
  return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
}

/**
 * Interpolates a missing tonal stop between two known HSL stops.
 * t is a 0–1 factor between the low and high stops.
 */
function interpolateHSL(hslLow, hslHigh, t) {
  const low = parseHSL(hslLow);
  const high = parseHSL(hslHigh);
  if (!low || !high) return null;
  return formatHSL({
    h: low.h + (high.h - low.h) * t,
    s: low.s + (high.s - low.s) * t,
    l: low.l + (high.l - low.l) * t,
  });
}

/**
 * For a given palette object (keyed by tonal stop numbers),
 * fills in any missing stops that are referenced by the roles.
 * Interpolates between the two nearest known stops.
 */
function fillMissingTonalStops(palette, neededStops) {
  const knownStops = Object.keys(palette).map(Number).sort((a, b) => a - b);

  for (const stop of neededStops) {
    if (stop.toString() in palette) continue; // already exists

    // Find the two nearest known stops
    let lo = null, hi = null;
    for (const k of knownStops) {
      if (k <= stop) lo = k;
      if (k >= stop && hi === null) hi = k;
    }

    if (lo !== null && hi !== null && lo !== hi) {
      const t = (stop - lo) / (hi - lo);
      const interpolated = interpolateHSL(palette[lo.toString()], palette[hi.toString()], t);
      if (interpolated) {
        palette[stop.toString()] = interpolated;
        console.log(`   📐 Interpolated ${stop} between ${lo} and ${hi} → ${interpolated}`);
      }
    } else if (lo !== null) {
      // Extrapolate below the lowest known stop using tone=0 as black
      const t = stop / lo;
      const interpolated = interpolateHSL('hsl(0, 0%, 0%)', palette[lo.toString()], t);
      if (interpolated) {
        palette[stop.toString()] = interpolated;
        console.log(`   📐 Extrapolated ${stop} from 0↔${lo} → ${interpolated}`);
      }
    }
  }
}

/**
 * Returns a default error palette (red, Material Design 3 style).
 */
function getDefaultErrorPalette() {
  return {
    "0":   "hsl(0, 0%, 0%)",
    "10":  "hsl(0, 100%, 15%)",
    "20":  "hsl(0, 85%, 25%)",
    "30":  "hsl(2, 75%, 35%)",
    "40":  "hsl(4, 70%, 45%)",
    "50":  "hsl(5, 68%, 55%)",
    "60":  "hsl(6, 75%, 65%)",
    "70":  "hsl(7, 82%, 73%)",
    "80":  "hsl(8, 90%, 82%)",
    "87":  "hsl(9, 95%, 88%)",
    "90":  "hsl(10, 100%, 91%)",
    "92":  "hsl(10, 100%, 93%)",
    "94":  "hsl(10, 100%, 95%)",
    "95":  "hsl(10, 100%, 96%)",
    "96":  "hsl(10, 100%, 97%)",
    "98":  "hsl(10, 100%, 99%)",
    "99":  "hsl(10, 100%, 99%)",
    "100": "hsl(0, 0%, 100%)"
  };
}

/**
 * Resolves a token reference like "{color.palette.primary.100}"
 * by walking the colorData object tree.
 * Returns the resolved HSL value or null if not found.
 */
function resolveReference(ref, colorData) {
  // Strip the curly braces: "{color.palette.primary.100}" → "color.palette.primary.100"
  const tokenPath = ref.replace(/^\{|\}$/g, '');
  const parts = tokenPath.split('.');

  let current = colorData;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return null; // path not found
    }
  }

  // If the resolved value is itself a reference, resolve recursively
  if (typeof current === 'string' && current.startsWith('{')) {
    return resolveReference(current, colorData);
  }

  return typeof current === 'string' ? current : null;
}

// ─── Read JSON files ──────────────────────────────────────────

let colorData, designData;

try {
  colorData = JSON.parse(fs.readFileSync(COLOR_TOKEN_PATH, 'utf-8'));
} catch (err) {
  console.error(`❌ Failed to read ${COLOR_TOKEN_PATH}:`, err.message);
  process.exit(1);
}

try {
  designData = JSON.parse(fs.readFileSync(DESIGN_TOKEN_PATH, 'utf-8'));
} catch (err) {
  console.error(`❌ Failed to read ${DESIGN_TOKEN_PATH}:`, err.message);
  process.exit(1);
}

// ─── Patch missing palettes & tonal stops ─────────────────────

// 1. Add error palette if it doesn't exist
if (!colorData.color.palette.error) {
  console.log('⚙️  No error palette found — injecting default (red) error palette');
  colorData.color.palette.error = getDefaultErrorPalette();
}

// 2. Scan role references to discover which tonal stops are needed per palette
function collectNeededStops(roleObj) {
  const needed = {}; // { paletteName: Set<number> }
  for (const ref of Object.values(roleObj)) {
    if (typeof ref !== 'string') continue;
    const match = ref.match(/^\{color\.palette\.(\w+)\.([\d]+)\}$/);
    if (match) {
      const [, paletteName, stop] = match;
      if (!needed[paletteName]) needed[paletteName] = new Set();
      needed[paletteName].add(Number(stop));
    }
  }
  return needed;
}

const lightNeeded = collectNeededStops(colorData.color.role.light);
const darkNeeded = collectNeededStops(colorData.color.role.dark);

// Merge light + dark needs
const allNeeded = {};
for (const src of [lightNeeded, darkNeeded]) {
  for (const [palette, stops] of Object.entries(src)) {
    if (!allNeeded[palette]) allNeeded[palette] = new Set();
    stops.forEach(s => allNeeded[palette].add(s));
  }
}

// 3. Fill missing tonal stops via interpolation
for (const [paletteName, stops] of Object.entries(allNeeded)) {
  if (colorData.color.palette[paletteName]) {
    console.log(`\n🎨 Checking palette "${paletteName}" for missing stops...`);
    fillMissingTonalStops(colorData.color.palette[paletteName], [...stops]);
  }
}

// ─── Build color role CSS variables ───────────────────────────

/**
 * Takes the role object (e.g. color.role.light) and returns
 * an array of { varName, value } with resolved values.
 */
function buildColorRoleVars(roleObj, rootData) {
  const vars = [];
  const unresolved = [];

  for (const [key, ref] of Object.entries(roleObj)) {
    const cssVarName = `--color-${camelToKebab(key)}`;

    if (typeof ref === 'string' && ref.startsWith('{')) {
      const resolved = resolveReference(ref, rootData);
      if (resolved) {
        vars.push({ varName: cssVarName, value: resolved });
      } else {
        unresolved.push({ varName: cssVarName, ref });
        vars.push({ varName: cssVarName, value: `/* UNRESOLVED: ${ref} */` });
      }
    } else {
      // Direct value (not a reference)
      vars.push({ varName: cssVarName, value: ref });
    }
  }

  if (unresolved.length > 0) {
    console.warn(`⚠️  ${unresolved.length} unresolved color reference(s):`);
    unresolved.forEach(u => console.warn(`   ${u.varName} → ${u.ref}`));
  }

  return vars;
}

// ─── Build typography CSS variables ───────────────────────────

function buildTypographyVars(typo) {
  const vars = [];

  // Global typography tokens
  vars.push({ varName: '--font-family', value: `'${typo.fontFamily}', sans-serif` });
  vars.push({ varName: '--font-size-base', value: `${typo.baseFontSize}px` });
  vars.push({ varName: '--line-height-multiplier', value: `${typo.lineHeightMultiplier}` });
  vars.push({ varName: '--scale-ratio', value: `${typo.scaleRatio}` });

  // Font weights
  for (const [role, weight] of Object.entries(typo.fontWeights)) {
    vars.push({
      varName: `--font-weight-${camelToKebab(role)}`,
      value: `${weight}`,
    });
  }

  // Typography styles (display, headline, title, body, label × large, medium, small)
  for (const [category, sizes] of Object.entries(typo.styles)) {
    for (const [size, props] of Object.entries(sizes)) {
      const prefix = `--${camelToKebab(category)}-${camelToKebab(size)}`;
      vars.push({ varName: `${prefix}-font-size`, value: `${props.fontSizeRem}rem` });
      vars.push({ varName: `${prefix}-font-size-px`, value: `${props.fontSizePx}px` });
      vars.push({ varName: `${prefix}-line-height`, value: `${props.lineHeightPx}px` });
      vars.push({ varName: `${prefix}-font-weight`, value: `${props.fontWeight}` });
      vars.push({ varName: `${prefix}-letter-spacing`, value: `${props.letterSpacing}` });
    }
  }

  return vars;
}

// ─── Assemble CSS output ──────────────────────────────────────

function formatVarsBlock(vars, indent = '  ') {
  return vars.map(v => `${indent}${v.varName}: ${v.value};`).join('\n');
}

const lightRoleVars = buildColorRoleVars(colorData.color.role.light, colorData);
const darkRoleVars = buildColorRoleVars(colorData.color.role.dark, colorData);
const typographyVars = buildTypographyVars(designData.typography);

console.log('\n📊 Token summary:');
console.log(`   Light color roles : ${lightRoleVars.length} variables`);
console.log(`   Dark color roles  : ${darkRoleVars.length} variables`);
console.log(`   Typography        : ${typographyVars.length} variables`);

const css = `/*
 * ═══════════════════════════════════════════════════════════════
 *  Design Tokens — Auto-generated by generate-tokens.js
 *  Generated: ${new Date().toISOString()}
 * 
 *  DO NOT EDIT MANUALLY.
 *  Modify the source JSON files and re-run the script instead.
 * ═══════════════════════════════════════════════════════════════
 */


/* ─── Light Theme (default) ─────────────────────────────────── */

:root {

  /* ── Color Roles ── */
${formatVarsBlock(lightRoleVars)}

  /* ── Typography ── */
${formatVarsBlock(typographyVars)}
}


/* ─── Dark Theme ────────────────────────────────────────────── */

[data-theme="dark"] {
${formatVarsBlock(darkRoleVars)}
}

/* Also support system preference */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
${formatVarsBlock(darkRoleVars, '    ')}
  }
}
`;

// ─── Write output ─────────────────────────────────────────────

fs.writeFileSync(OUTPUT_CSS_PATH, css, 'utf-8');

console.log(`\n✅ CSS written to: ${OUTPUT_CSS_PATH}`);
console.log(`   Total variables: ${lightRoleVars.length + darkRoleVars.length + typographyVars.length}`);
