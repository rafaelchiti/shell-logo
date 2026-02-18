/**
 * Interactive CLI prompts for shell-logo.
 *
 * When a config already exists for the current folder, presents three options:
 *   - Run          — display the logo, arrow key changes persist to disk
 *   - New session  — display the logo, changes are in-memory only (temporary)
 *   - Generate     — walk through the setup wizard to create a new config
 *
 * When no config exists, only the Generate option is shown.
 *
 * Returns { action, config, persistent } where `persistent` controls
 * whether arrow key theme/font changes are saved back to disk.
 */

import * as p from '@clack/prompts';
import chalk from 'chalk';
import { tryLoadConfig } from './config.js';
import { SHAPES } from './shapes.js';
import { FONTS } from './themes.js';

const COLOR_PALETTE = [
  { value: '#ff6b6b', label: `${chalk.bgHex('#ff6b6b')('   ')} Coral` },
  { value: '#ff4757', label: `${chalk.bgHex('#ff4757')('   ')} Vibrant Red` },
  { value: '#ff6348', label: `${chalk.bgHex('#ff6348')('   ')} Tomato` },
  { value: '#feca57', label: `${chalk.bgHex('#feca57')('   ')} Golden` },
  { value: '#ff9f43', label: `${chalk.bgHex('#ff9f43')('   ')} Orange` },
  { value: '#ffdd59', label: `${chalk.bgHex('#ffdd59')('   ')} Lemon` },
  { value: '#1dd1a1', label: `${chalk.bgHex('#1dd1a1')('   ')} Mint` },
  { value: '#2ed573', label: `${chalk.bgHex('#2ed573')('   ')} Neon Green` },
  { value: '#26de81', label: `${chalk.bgHex('#26de81')('   ')} Emerald` },
  { value: '#48dbfb', label: `${chalk.bgHex('#48dbfb')('   ')} Sky` },
  { value: '#0abde3', label: `${chalk.bgHex('#0abde3')('   ')} Cerulean` },
  { value: '#54a0ff', label: `${chalk.bgHex('#54a0ff')('   ')} Cornflower` },
  { value: '#5f27cd', label: `${chalk.bgHex('#5f27cd')('   ')} Deep Purple` },
  { value: '#c56cf0', label: `${chalk.bgHex('#c56cf0')('   ')} Lavender` },
  { value: '#fd79a8', label: `${chalk.bgHex('#fd79a8')('   ')} Pink` },
  { value: '#ffffff', label: `${chalk.bgHex('#ffffff')('   ')} White` },
];

const FONT_OPTIONS = FONTS.map(f => ({ value: f, label: f }));

/** Exit gracefully if the user presses Ctrl+C / Escape during a prompt. */
function handleCancel(value) {
  if (p.isCancel(value)) {
    p.cancel('Cancelled.');
    process.exit(0);
  }
  return value;
}

/** Prompt for gradient colors (shared by text and shape modes). */
async function promptColors() {
  const shuffled = [...COLOR_PALETTE].sort(() => Math.random() - 0.5);
  const initialColors = shuffled.slice(0, 3).map(c => c.value);

  let colors;
  while (true) {
    colors = handleCancel(
      await p.multiselect({
        message: 'Pick 2 or more colors for the gradient:',
        options: COLOR_PALETTE,
        initialValues: initialColors,
        required: true,
      })
    );

    if (colors.length >= 2) break;
    p.log.warning('Please select at least 2 colors.');
  }
  return colors;
}

/** Walk the user through the Shape wizard: shape picker, colors. */
async function promptShapeGenerate() {
  const shape = handleCancel(
    await p.select({
      message: 'Pick a mascot:',
      options: SHAPES.map((s) => ({ value: s.name, label: s.name })),
    })
  );

  const colors = await promptColors();

  return {
    action: 'generate',
    config: { mode: 'shape', shape, colors },
    persistent: true,
  };
}

/** Walk the user through the Text wizard: text, colors, font. */
async function promptTextGenerate() {
  const text = handleCancel(
    await p.text({
      message: 'What text should the logo display?',
      placeholder: 'HELLO',
      validate: (val) => {
        if (!val || val.trim() === '') return 'Text is required.';
      },
    })
  );

  const colors = await promptColors();

  const font = handleCancel(
    await p.select({
      message: 'Pick a font:',
      options: FONT_OPTIONS,
    })
  );

  return {
    action: 'generate',
    config: { mode: 'text', text: text.trim(), colors, font },
    persistent: true,
  };
}

/** Walk the user through the Generate wizard: mode selection, then mode-specific prompts. */
async function promptGenerate() {
  const mode = handleCancel(
    await p.select({
      message: 'What kind of logo?',
      options: [
        { value: 'text', label: 'Text', hint: 'type your own text' },
        { value: 'shape', label: 'Shape', hint: 'pick a mascot/pet' },
      ],
    })
  );

  if (mode === 'shape') return promptShapeGenerate();
  return promptTextGenerate();
}

/**
 * Main entry point for the interactive CLI.
 * Returns { action: 'generate'|'run', config, persistent }.
 */
export async function runInteractiveUI() {
  p.intro(chalk.bold('terminal-logo'));

  const existingConfig = tryLoadConfig();

  if (existingConfig) {
    const action = handleCancel(
      await p.select({
        message: 'What would you like to do?',
        initialValue: 'run',
        options: [
          { value: 'run', label: 'Run', hint: 'use saved config' },
          { value: 'temp', label: 'New session', hint: "temporary, changes won't be saved" },
          { value: 'generate', label: 'Generate', hint: 'create a new logo config' },
        ],
      })
    );

    if (action === 'generate') {
      return promptGenerate();
    }

    if (action === 'temp') {
      p.outro('Launching logo (temporary session)...');
      return { action: 'run', config: existingConfig, persistent: false };
    }

    // action === 'run'
    p.outro('Launching logo...');
    return { action: 'run', config: existingConfig, persistent: true };
  }

  // No existing config — only offer Generate
  const action = handleCancel(
    await p.select({
      message: 'What would you like to do?',
      initialValue: 'generate',
      options: [
        { value: 'generate', label: 'Generate', hint: 'create a new logo config' },
      ],
    })
  );

  if (action === 'generate') {
    return promptGenerate();
  }
}
