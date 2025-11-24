import { expect, test } from 'bun:test';
import fs from 'fs';
import path from 'path';

const templateRoot = path.join(__dirname, '..', 'bin', 'templates', 'base');

test('template files exist', () => {
  const required = ['package.json', 'tsconfig.json', '.env.example', '.gitignore', 'src/index.ts'];
  for (const file of required) {
    const filePath = path.join(templateRoot, file);
    expect(fs.existsSync(filePath)).toBe(true);
  }
});

test('template package.json has required fields', () => {
  const pkgPath = path.join(templateRoot, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  expect(pkg.scripts?.dev).toBeDefined();
  expect(pkg.dependencies?.telegraf).toBeDefined();
});

test('.env.example includes BOT_TOKEN placeholder', () => {
  const envPath = path.join(templateRoot, '.env.example');
  const envContent = fs.readFileSync(envPath, 'utf8');
  expect(envContent).toContain('BOT_TOKEN=');
});
