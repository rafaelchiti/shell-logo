// Strip ANSI escape codes when calculating visual width
const ANSI_RE = /\x1B\[[0-9;]*m/g;

export function getTerminalSize() {
  return {
    columns: process.stdout.columns || 80,
    rows: process.stdout.rows || 24,
  };
}

export function clearScreen() {
  process.stdout.write('\x1B[2J\x1B[H');
}

export function hideCursor() {
  process.stdout.write('\x1B[?25l');
}

export function showCursor() {
  process.stdout.write('\x1B[?25h');
}

export function centerContent(text, columns, rows) {
  const lines = text.split('\n');

  // Calculate the max visual width (strip ANSI codes)
  const maxWidth = lines.reduce((max, line) => {
    const visual = line.replace(ANSI_RE, '').length;
    return visual > max ? visual : max;
  }, 0);

  // Horizontal padding for each line
  const leftPad = Math.max(0, Math.floor((columns - maxWidth) / 2));
  const padStr = ' '.repeat(leftPad);

  const paddedLines = lines.map((line) => padStr + line);

  const contentHeight = paddedLines.length;
  const topPad = Math.max(0, Math.floor((rows - contentHeight) / 2));

  return '\n'.repeat(topPad) + paddedLines.join('\n');
}
