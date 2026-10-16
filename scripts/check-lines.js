import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const extensions = new Set(['.html', '.css', '.js']);

function collect(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    if (name === 'node_modules' || name.startsWith('.')) return [];
    return statSync(path).isDirectory() ? collect(path) : [path];
  });
}

function codeLines(path) {
  return readFileSync(path, 'utf8')
    .split('\n')
    .filter((line) => line.trim() && !line.trim().startsWith('//')).length;
}

const oversized = collect(root)
  .filter((path) => extensions.has(extname(path)))
  .map((path) => ({ path, lines: codeLines(path) }))
  .filter(({ lines }) => lines > 250);

if (oversized.length) {
  oversized.forEach(({ path, lines }) => {
    console.error(`${relative(root, path)}: ${lines} code lines`);
  });
  process.exit(1);
}

console.log('All source files are within the 250-line limit.');
