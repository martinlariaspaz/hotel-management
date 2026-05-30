import { existsSync, readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

const uiPackagePath = resolve('ui', 'package.json');

if (!existsSync(uiPackagePath)) {
  console.log('[ui] ui/package.json no existe. Se omite el frontend por ahora.');
  process.exit(0);
}

const packageJson = JSON.parse(readFileSync(uiPackagePath, 'utf8'));

if (!packageJson.scripts?.dev) {
  console.log('[ui] ui/package.json no tiene script "dev". Se omite el frontend.');
  process.exit(0);
}

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const child = spawn(npmCommand, ['run', 'dev'], {
  cwd: resolve('ui'),
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    child.kill(signal);
  });
}

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
