/**
 * Config persistence — writes config to the XDG folder structure.
 *
 * Uses atomic writes (write to tmp file, then rename) to prevent corruption
 * if two terminals write to the same folder config simultaneously.
 */

import { writeFileSync, renameSync, mkdirSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { randomBytes } from 'node:crypto';
import { configPath, folderConfigDir, metaPath } from './paths.js';

/**
 * Write data to a file atomically: write to a temp file in the same
 * directory, then rename. This avoids partial reads if another process
 * is reading the file at the same time.
 */
function atomicWriteSync(targetPath, data) {
  const dir = dirname(targetPath);
  const tmpPath = join(dir, `.tmp.${randomBytes(6).toString('hex')}`);
  writeFileSync(tmpPath, data);
  renameSync(tmpPath, targetPath);
}

/**
 * Persist a config object to the XDG folder for `cwd`.
 * Creates the directory tree if it doesn't exist yet.
 * Also writes a meta.json with the original folder path (best-effort).
 * Returns the path the config was written to.
 */
export function writeConfig(config, cwd = process.cwd()) {
  const dir = folderConfigDir(cwd);
  mkdirSync(dir, { recursive: true });

  atomicWriteSync(configPath(cwd), JSON.stringify(config, null, 2) + '\n');

  // meta.json stores the original folder path so humans can identify
  // which hash directory belongs to which project.
  try {
    atomicWriteSync(metaPath(cwd), JSON.stringify({ path: resolve(cwd) }, null, 2) + '\n');
  } catch {
    // Best-effort — not critical if this fails
  }

  return configPath(cwd);
}
