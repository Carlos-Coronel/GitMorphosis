import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve('.e2e-site');
const target = resolve(root, 'GitMorphosis');
rmSync(root, { recursive: true, force: true });
mkdirSync(root, { recursive: true });
cpSync(resolve('out'), target, { recursive: true });
