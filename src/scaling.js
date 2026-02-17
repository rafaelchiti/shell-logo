export function measureArt(art) {
  const lines = art.split('\n');
  const width = lines.reduce((max, line) => Math.max(max, line.length), 0);
  return { width, height: lines.length };
}

export function scaleArt(art, targetWidth, targetHeight) {
  const lines = art.split('\n');
  const { width: artWidth, height: artHeight } = measureArt(art);

  if (artWidth <= targetWidth && artHeight <= targetHeight) return art;

  const scaleFactor = Math.min(
    targetWidth / artWidth,
    targetHeight / artHeight,
    1.0
  );

  const newWidth = Math.floor(artWidth * scaleFactor);
  const newHeight = Math.floor(artHeight * scaleFactor);

  const result = [];
  for (let j = 0; j < newHeight; j++) {
    const srcRow = Math.floor(j * artHeight / newHeight);
    const line = lines[srcRow] || '';
    if (line.length === 0) {
      result.push('');
      continue;
    }
    const row = [];
    for (let i = 0; i < newWidth; i++) {
      const srcCol = Math.floor(i * artWidth / newWidth);
      row.push(srcCol < line.length ? line[srcCol] : ' ');
    }
    result.push(row.join(''));
  }

  return result.join('\n');
}
