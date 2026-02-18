/**
 * Font and gradient theme definitions for shell-logo.
 *
 * FONTS  — Figlet font names available for text-mode logos.
 *          The render loop in index.js cycles through these with arrow keys.
 *          Indices 0–14 are the original set; new entries are appended so
 *          saved configs that store a font name keep working.
 *
 * THEMES — Named gradient color palettes (3 hex stops each).
 *          Used by gradient-string to colorize the rendered ASCII art.
 */

// ── Fonts ──────────────────────────────────────────────────────────────────

export const FONTS = [
  // Classic / general-purpose
  'Standard', 'Big', 'ANSI Shadow', 'Slant', 'Small',
  'ANSI Regular', 'Bloody', 'DOS Rebel', 'Graffiti', 'Larry 3D',
  'Star Wars', 'Doh', 'Ghost', 'Fraktur', 'Fire Font-k',

  // Block / pixel style — use filled Unicode characters (▄█▀) instead of
  // typical ASCII slashes and pipes, giving a "painted pixels" look.
  'Block', 'Blocks', 'Shaded Blocky', 'Small Block',
  'Dot Matrix', 'Tiles', 'Rectangles',
  'Electronic', 'Elite', 'Rebel',
  'ANSI Compact', 'Pagga', 'Delta Corps Priest 1',

  // Popular classic figlet fonts
  'Doom', 'Banner3-D', 'Colossal', 'Epic',
  'Calvin S', 'Speed', '3D-ASCII', 'Isometric1',
];

// ── Gradient themes ────────────────────────────────────────────────────────

export const THEMES = [
  // Warm
  { name: 'Sunset',          colors: ['#ff6b6b', '#ff9f43', '#feca57'] },
  { name: 'Fire',            colors: ['#ff4757', '#ff6348', '#ffdd59'] },
  { name: 'Cherry',          colors: ['#eb3349', '#f45c43', '#ff8a80'] },
  { name: 'Rose Gold',       colors: ['#f4c4f3', '#fc5c7d', '#fda085'] },
  { name: 'Magma',           colors: ['#f83600', '#f9d423', '#fe8c00'] },
  { name: 'Sunrise',         colors: ['#ff512f', '#f09819', '#ffed4a'] },
  { name: 'Copper',          colors: ['#b87333', '#da9855', '#f0c27f'] },

  // Cool
  { name: 'Ocean',           colors: ['#0abde3', '#48dbfb', '#54a0ff'] },
  { name: 'Arctic',          colors: ['#e0eafc', '#cfdef3', '#74b9ff'] },
  { name: 'Frost',           colors: ['#e8f0ff', '#b8d4f0', '#88b8e0'] },
  { name: 'Electric',        colors: ['#00f2fe', '#4facfe', '#667eea'] },

  // Green
  { name: 'Forest',          colors: ['#1dd1a1', '#2ed573', '#26de81'] },
  { name: 'Emerald',         colors: ['#11998e', '#38ef7d', '#b8ff96'] },
  { name: 'Toxic',           colors: ['#a8ff78', '#78ffd6', '#00e676'] },
  { name: 'Matrix',          colors: ['#00ff41', '#008f11', '#003b00'] },

  // Purple / pink
  { name: 'Neon',            colors: ['#c56cf0', '#fd79a8', '#ff6b6b'] },
  { name: 'Twilight',        colors: ['#5f27cd', '#c56cf0', '#48dbfb'] },
  { name: 'Cyberpunk',       colors: ['#f72585', '#7209b7', '#4cc9f0'] },
  { name: 'Grape',           colors: ['#6a0572', '#ab83a1', '#e0aaff'] },
  { name: 'Lavender Dream',  colors: ['#a18cd1', '#fbc2eb', '#f6d5f7'] },
  { name: 'Bubblegum',       colors: ['#ff77ab', '#ff99cc', '#ffbbdd'] },

  // Multi / neutral
  { name: 'Pastel',          colors: ['#fd79a8', '#feca57', '#48dbfb'] },
  { name: 'Monochrome',      colors: ['#ffffff', '#54a0ff', '#5f27cd'] },
  { name: 'Aurora',          colors: ['#00d2ff', '#3a7bd5', '#7b2ff7'] },
  { name: 'Midnight',        colors: ['#0f0c29', '#302b63', '#24c6dc'] },
];
