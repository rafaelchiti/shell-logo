#!/usr/bin/env node

/**
 * Entry point for shell-logo.
 *
 * 1. Run the interactive UI to get a config + session mode (persistent or temporary).
 * 2. If the user chose "Generate", persist the new config to disk.
 * 3. Start the fullscreen render loop with arrow-key theme/font cycling.
 */

import { runInteractiveUI } from './ui.js';
import { writeConfig } from './generate.js';
import { render } from './renderer.js';
import { getTerminalSize, clearScreen, hideCursor, showCursor, centerContent } from './terminal.js';
import { THEMES, FONTS } from './themes.js';
import { SHAPES } from './shapes.js';
import chalk from 'chalk';
import * as p from '@clack/prompts';

const { action, config, persistent } = await runInteractiveUI();

if (action === 'generate') {
  const s = p.spinner();
  s.start('Saving config...');
  writeConfig(config);
  s.stop('Config saved!');
}

startRenderLoop(config, persistent);

/**
 * Fullscreen render loop. Draws the logo centered in the terminal and
 * listens for arrow keys to cycle themes (up/down) and fonts (left/right).
 *
 * @param {object}  config     - Logo config: { text, colors, font }
 * @param {boolean} persistent - When true, arrow key changes are saved to disk.
 *                               When false (temporary session), changes are in-memory only.
 */
function startRenderLoop(config, persistent) {
  let resizeTimer;

  const isShapeMode = config.mode === 'shape';

  // Find the current theme index by matching colors
  let themeIndex = THEMES.findIndex(
    (t) => JSON.stringify(t.colors) === JSON.stringify(config.colors)
  );
  if (themeIndex === -1) themeIndex = 0;

  let fontIndex = FONTS.indexOf(config.font);
  if (fontIndex === -1) fontIndex = 0;

  let shapeIndex = isShapeMode
    ? SHAPES.findIndex((s) => s.name === config.shape)
    : 0;
  if (shapeIndex === -1) shapeIndex = 0;

  let showStatus = false;
  let statusTimer;

  function renderLoop() {
    const { columns, rows } = getTerminalSize();
    const art = render(config, columns, rows);
    clearScreen();
    process.stdout.write(centerContent(art, columns, rows));
    if (showStatus) {
      const lrLabel = isShapeMode
        ? `${SHAPES[shapeIndex].name}  ·  ←→ shape`
        : `${FONTS[fontIndex]}  ·  ←→ font`;
      const status = `  ${THEMES[themeIndex].name}  ·  ${lrLabel}  ·  ↑↓ theme  q quit`;
      process.stdout.write(`\x1B[${rows};1H` + chalk.dim(status));
    }
  }

  /** Briefly show the status bar (theme name, font, controls) for 2 seconds. */
  function flashStatus() {
    showStatus = true;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => {
      showStatus = false;
      renderLoop();
    }, 2000);
  }

  /** Debounce re-renders on terminal resize to avoid flickering. */
  function debouncedRender() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(renderLoop, 50);
  }

  function cleanup() {
    showCursor();
    clearScreen();
    process.exit(0);
  }

  // Raw mode AFTER prompts are done
  process.stdin.setRawMode(true);
  process.stdin.resume();
  hideCursor();
  renderLoop();

  // Show controls help on startup for 4 seconds
  showStatus = true;
  statusTimer = setTimeout(() => {
    showStatus = false;
    renderLoop();
  }, 4000);

  process.stdout.on('resize', debouncedRender);

  process.stdin.on('data', (key) => {
    if (key[0] === 3 || key[0] === 113) cleanup(); // Ctrl+C or q

    // Arrow up/down are 3-byte escape sequences
    if (key[0] === 27 && key[1] === 91) {
      if (key[2] === 65) { // Arrow Up — prev theme
        themeIndex = (themeIndex - 1 + THEMES.length) % THEMES.length;
        config.colors = THEMES[themeIndex].colors;
      } else if (key[2] === 66) { // Arrow Down — next theme
        themeIndex = (themeIndex + 1) % THEMES.length;
        config.colors = THEMES[themeIndex].colors;
      } else if (key[2] === 67) { // Arrow Right — next font/shape
        if (isShapeMode) {
          shapeIndex = (shapeIndex + 1) % SHAPES.length;
          config.shape = SHAPES[shapeIndex].name;
        } else {
          fontIndex = (fontIndex + 1) % FONTS.length;
          config.font = FONTS[fontIndex];
        }
      } else if (key[2] === 68) { // Arrow Left — prev font/shape
        if (isShapeMode) {
          shapeIndex = (shapeIndex - 1 + SHAPES.length) % SHAPES.length;
          config.shape = SHAPES[shapeIndex].name;
        } else {
          fontIndex = (fontIndex - 1 + FONTS.length) % FONTS.length;
          config.font = FONTS[fontIndex];
        }
      } else {
        return;
      }
      // Only persist theme/font changes in a persistent (non-temporary) session
      if (persistent) writeConfig(config);
      flashStatus();
      renderLoop();
    }

  });
  process.on('SIGTERM', cleanup);
}
