/**
 * Path resolution for XDG-based config storage.
 *
 * Configs are stored per-folder under:
 *   $XDG_CONFIG_HOME/shell-logo/folders/<hash>/config.json
 *
 * where <hash> is the first 16 hex chars of SHA-256(absolute CWD).
 * Falls back to ~/.config/shell-logo/ when XDG_CONFIG_HOME is unset.
 */

import { createHash } from 'node:crypto';
import { resolve, join } from 'node:path';
import { homedir } from 'node:os';

/** Root directory for all shell-logo config: $XDG_CONFIG_HOME/shell-logo/ */
export function configRoot() {
  const base = process.env.XDG_CONFIG_HOME || join(homedir(), '.config');
  return join(base, 'shell-logo');
}

/** Deterministic 16-char hex hash of the absolute path for `cwd`. */
export function folderHash(cwd = process.cwd()) {
  return createHash('sha256').update(resolve(cwd)).digest('hex').slice(0, 16);
}

/** Per-folder config directory: <configRoot>/folders/<hash>/ */
export function folderConfigDir(cwd = process.cwd()) {
  return join(configRoot(), 'folders', folderHash(cwd));
}

/** Path to the per-folder config file (text, colors, font). */
export function configPath(cwd = process.cwd()) {
  return join(folderConfigDir(cwd), 'config.json');
}

/** Path to the per-folder meta file (stores original absolute path for debugging). */
export function metaPath(cwd = process.cwd()) {
  return join(folderConfigDir(cwd), 'meta.json');
}

/** Path to the legacy config file (.shell-logo.json in the working directory). */
export function legacyConfigPath(cwd = process.cwd()) {
  return join(resolve(cwd), '.shell-logo.json');
}
