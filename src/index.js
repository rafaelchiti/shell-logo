#!/usr/bin/env node

import { runInteractiveUI } from './ui.js';
import { writeConfig } from './generate.js';
import { render } from './renderer.js';
import { getTerminalSize, clearScreen, hideCursor, showCursor, centerContent } from './terminal.js';
import { THEMES, FONTS } from './themes.js';
import chalk from 'chalk';
import * as p from '@clack/prompts';

const { action, config } = await runInteractiveUI();

if (action === 'generate') {
  const s = p.spinner();
  s.start('Writing .shell-logo.json...');
  writeConfig(config);
  s.stop('Config saved!');
}

startRenderLoop(config);

function startRenderLoop(config) {
  let resizeTimer;

  // Find the current theme index by matching colors
  let themeIndex = THEMES.findIndex(
    (t) => JSON.stringify(t.colors) === JSON.stringify(config.colors)
  );
  if (themeIndex === -1) themeIndex = 0;

  let fontIndex = FONTS.indexOf(config.font);
  if (fontIndex === -1) fontIndex = 0;

  let showStatus = false;
  let statusTimer;

  function renderLoop() {
    const { columns, rows } = getTerminalSize();
    const effectiveCols = Math.max(20, columns - config.padding * 4);
    const art = render(config, effectiveCols);
    clearScreen();
    process.stdout.write(centerContent(art, columns, rows, 0));
    if (showStatus) {
      const status = `  ${THEMES[themeIndex].name}  ·  ${FONTS[fontIndex]}  ·  ↑↓ theme  ←→ font  <> size  q quit`;
      process.stdout.write(`\x1B[${rows};1H` + chalk.dim(status));
    }
  }

  function flashStatus() {
    showStatus = true;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => {
      showStatus = false;
      renderLoop();
    }, 2000);
  }

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
      } else if (key[2] === 67) { // Arrow Right — next font
        fontIndex = (fontIndex + 1) % FONTS.length;
        config.font = FONTS[fontIndex];
      } else if (key[2] === 68) { // Arrow Left — prev font
        fontIndex = (fontIndex - 1 + FONTS.length) % FONTS.length;
        config.font = FONTS[fontIndex];
      } else {
        return;
      }
      writeConfig(config);
      flashStatus();
      renderLoop();
    }

    if (key[0] === 62) { // >  — bigger
      config.padding = Math.max(config.padding - 1, 0);
      writeConfig(config);
      flashStatus();
      renderLoop();
    } else if (key[0] === 60) { // <  — smaller
      config.padding = Math.min(config.padding + 1, 20);
      writeConfig(config);
      flashStatus();
      renderLoop();
    }
  });
  process.on('SIGTERM', cleanup);
}
