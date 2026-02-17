import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

export function writeConfig(config) {
  const configPath = join(process.cwd(), '.shell-logo.json');
  writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
  return configPath;
}
