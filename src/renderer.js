import figlet from 'figlet';
import gradient from 'gradient-string';
import { scaleArt } from './scaling.js';
import { SHAPES } from './shapes.js';

function figletSync(text, font) {
  try {
    return figlet.textSync(text, { font });
  } catch {
    return null;
  }
}

export function render(config, columns, rows) {
  if (config.mode === 'shape') {
    const shape = SHAPES.find((s) => s.name === config.shape);
    if (!shape) {
      const grad = gradient(config.colors);
      return grad(config.shape);
    }
    const trimmed = shape.art.replace(/^\n+/, '').trimEnd();
    const scaled = scaleArt(trimmed, columns, rows - 2);
    const grad = gradient(config.colors);
    return grad.multiline(scaled);
  }

  const art = figletSync(config.text, config.font);
  if (!art) {
    const grad = gradient(config.colors);
    return grad(config.text.slice(0, columns));
  }

  const trimmed = art.trimEnd();
  const scaled = scaleArt(trimmed, columns, rows - 2);
  const grad = gradient(config.colors);
  return grad.multiline(scaled);
}
