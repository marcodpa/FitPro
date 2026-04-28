import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const p = (f: string) => join(process.cwd(), 'src/data', f);

export function load<T>(file: string): T[] {
  if (!existsSync(p(file))) return [];
  try { return JSON.parse(readFileSync(p(file), 'utf-8')); } catch { return []; }
}

export function save(file: string, data: unknown[]): void {
  writeFileSync(p(file), JSON.stringify(data, null, 2));
}

export function makeId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
