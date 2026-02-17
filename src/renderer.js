import figlet from 'figlet';
import gradient from 'gradient-string';

const FONT_CASCADE = ['Standard', 'Small', 'Mini', 'Term'];

function figletSync(text, font) {
  try {
    return figlet.textSync(text, { font });
  } catch {
    return null;
  }
}

function maxLineWidth(art) {
  return art.split('\n').reduce((max, line) => Math.max(max, line.length), 0);
}

export function render(config, columns) {
  // Build font cascade: user font first, then fallbacks (deduped)
  const fonts = [config.font, ...FONT_CASCADE.filter((f) => f !== config.font)];

  // Try each font in the cascade, pick the first that fits
  for (const font of fonts) {
    const art = figletSync(config.text, font);
    if (art && maxLineWidth(art) <= columns) {
      const grad = gradient(config.colors);
      return grad.multiline(art.trimEnd());
    }
  }

  // Last resort: plain text (no figlet)
  const plain = config.text;
  if (plain.length <= columns) {
    const grad = gradient(config.colors);
    return grad(plain);
  }

  // Truncate if even plain text doesn't fit
  const grad = gradient(config.colors);
  return grad(plain.slice(0, columns));
}
