import * as p from '@clack/prompts';
import chalk from 'chalk';
import { tryLoadConfig } from './config.js';

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

const FONT_OPTIONS = [
  { value: 'Standard', label: 'Standard' },
  { value: 'Big', label: 'Big' },
  { value: 'ANSI Shadow', label: 'ANSI Shadow' },
  { value: 'Slant', label: 'Slant' },
  { value: 'Small', label: 'Small' },
];

function handleCancel(value) {
  if (p.isCancel(value)) {
    p.cancel('Cancelled.');
    process.exit(0);
  }
  return value;
}

async function promptGenerate() {
  const text = handleCancel(
    await p.text({
      message: 'What text should the logo display?',
      placeholder: 'HELLO',
      validate: (val) => {
        if (!val || val.trim() === '') return 'Text is required.';
      },
    })
  );

  // Pick 3 random unique colors as defaults
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

  const font = handleCancel(
    await p.select({
      message: 'Pick a font:',
      options: FONT_OPTIONS,
    })
  );

  return {
    action: 'generate',
    config: { text: text.trim(), colors, font },
  };
}

export async function runInteractiveUI() {
  p.intro(chalk.bold('terminal-logo'));

  const action = handleCancel(
    await p.select({
      message: 'What would you like to do?',
      options: [
        { value: 'generate', label: 'Generate', hint: 'create .shell-logo.json' },
        { value: 'run', label: 'Run', hint: 'display current logo' },
      ],
    })
  );

  if (action === 'generate') {
    return promptGenerate();
  }

  // action === 'run'
  const config = tryLoadConfig();
  if (!config) {
    p.log.error(
      'No valid .shell-logo.json found in the current directory.\n' +
        '  Run again and choose "Generate" to create one.'
    );
    p.outro('Done');
    process.exit(1);
  }

  p.outro('Launching logo...');
  return { action: 'run', config };
}
