import figlet from 'figlet';
import gradient from 'gradient-string';

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

function scaleArt(art, targetWidth) {
  const lines = art.split('\n');
  const artWidth = maxLineWidth(art);
  if (artWidth <= targetWidth) return art;

  return lines
    .map((line) => {
      if (line.length === 0) return '';
      const result = [];
      for (let i = 0; i < targetWidth; i++) {
        const srcIndex = Math.floor((i * artWidth) / targetWidth);
        result.push(srcIndex < line.length ? line[srcIndex] : ' ');
      }
      return result.join('');
    })
    .join('\n');
}

export function render(config, columns) {
  const art = figletSync(config.text, config.font);
  if (!art) {
    // Font not available — fall back to plain text
    const grad = gradient(config.colors);
    return grad(config.text.slice(0, columns));
  }

  const trimmed = art.trimEnd();
  const scaled = scaleArt(trimmed, columns);
  const grad = gradient(config.colors);
  return grad.multiline(scaled);
}
