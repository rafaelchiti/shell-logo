import figlet from 'figlet';
import gradient from 'gradient-string';
import { scaleArt } from './scaling.js';

function figletSync(text, font) {
  try {
    return figlet.textSync(text, { font });
  } catch {
    return null;
  }
}

export function render(config, columns, rows) {
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
