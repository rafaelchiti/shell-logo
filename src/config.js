import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import chalk from 'chalk';

export const DEFAULTS = {
  colors: ['#ff6b6b', '#feca57', '#48dbfb'],
  font: 'Standard',
};

export function tryLoadConfig() {
  const configPath = join(process.cwd(), '.shell-logo.json');

  let raw;
  try {
    raw = readFileSync(configPath, 'utf-8');
  } catch {
    return null;
  }

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

export function loadConfig() {
  const configPath = join(process.cwd(), '.shell-logo.json');

  let raw;
  try {
    raw = readFileSync(configPath, 'utf-8');
  } catch {
    console.error(
      chalk.red('Error: ') +
        'No .shell-logo.json found in the current directory.\n\n' +
        'Create one with at least:\n\n' +
        '  { "text": "HELLO" }\n\n' +
        'Or copy an example:\n\n' +
        '  cp node_modules/shell-logo/examples/.shell-logo.json .'
    );
    process.exit(1);
  }

  let config;
  try {
    config = JSON.parse(raw);
  } catch {
    console.error(chalk.red('Error: ') + '.shell-logo.json contains invalid JSON.');
    process.exit(1);
  }

  if (!config.text || typeof config.text !== 'string' || config.text.trim() === '') {
    console.error(
      chalk.red('Error: ') + '"text" is required and must be a non-empty string in .shell-logo.json.'
    );
    process.exit(1);
  }

  if (config.colors !== undefined) {
    if (!Array.isArray(config.colors) || config.colors.length < 2) {
      console.error(
        chalk.red('Error: ') + '"colors" must be an array of at least 2 color strings.'
      );
      process.exit(1);
    }
  }

  return {
    text: config.text.trim(),
    colors: config.colors ?? DEFAULTS.colors,
    font: config.font ?? DEFAULTS.font,
  };
}
