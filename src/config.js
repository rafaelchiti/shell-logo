/**
 * Config loading with XDG-first resolution and legacy migration.
 *
 * Load order:
 *   1. XDG path  (~/.config/shell-logo/folders/<hash>/config.json)
 *   2. Legacy path (.shell-logo.json in the working directory)
 *
 * If a legacy config is found but no XDG config exists, the legacy config
 * is automatically copied to XDG (the legacy file is left untouched).
 */

import { readFileSync } from 'node:fs';
import chalk from 'chalk';
import { configPath, legacyConfigPath } from './paths.js';
import { writeConfig } from './generate.js';

export const DEFAULTS = {
  colors: ['#ff6b6b', '#feca57', '#48dbfb'],
  font: 'Standard',
};

/**
 * Parse a JSON string and validate it as a shell-logo config.
 * Requires a non-empty `text` field. Colors must be an array of 2+ if present.
 * Returns a normalized config object, or null if invalid.
 */
function parseAndValidate(raw) {
  let config;
  try {
    config = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!config.text || typeof config.text !== 'string' || config.text.trim() === '') {
    return null;
  }

  if (config.colors !== undefined) {
    if (!Array.isArray(config.colors) || config.colors.length < 2) {
      return null;
    }
  }

  return {
    text: config.text.trim(),
    colors: config.colors ?? DEFAULTS.colors,
    font: config.font ?? DEFAULTS.font,
  };
}

/**
 * Try to load config for `cwd`. Returns the parsed config or null.
 * Checks XDG first, then falls back to legacy .shell-logo.json.
 * Auto-migrates legacy configs to XDG on first load.
 */
export function tryLoadConfig(cwd) {
  // 1. Try XDG path
  try {
    const raw = readFileSync(configPath(cwd), 'utf-8');
    const config = parseAndValidate(raw);
    if (config) return config;
  } catch {
    // Not found or unreadable — fall through to legacy
  }

  // 2. Try legacy .shell-logo.json in the working directory
  let raw;
  try {
    raw = readFileSync(legacyConfigPath(cwd), 'utf-8');
  } catch {
    return null;
  }

  const config = parseAndValidate(raw);
  if (!config) return null;

  // 3. Auto-migrate legacy config to XDG (legacy file is left untouched)
  try {
    writeConfig(config, cwd);
    const xdgPath = configPath(cwd);
    console.log(
      chalk.dim(`Migrated config from .shell-logo.json → ${xdgPath}`)
    );
  } catch {
    // Migration failed — still usable from the legacy path
  }

  return config;
}

/**
 * Load config for `cwd`, or exit with an error if none is found.
 * Same resolution as tryLoadConfig but treats missing config as fatal.
 */
export function loadConfig(cwd) {
  const config = tryLoadConfig(cwd);
  if (config) return config;

  const xdg = configPath(cwd);
  console.error(
    chalk.red('Error: ') +
      `No config found for this folder.\n\n` +
      `Expected at: ${xdg}\n\n` +
      'Run shell-logo and choose "Generate" to create one.'
  );
  process.exit(1);
}
