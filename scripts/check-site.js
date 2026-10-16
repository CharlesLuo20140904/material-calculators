import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, normalize, relative, resolve } from 'node:path';

const root = resolve(new URL('..', import.meta.url).pathname);
const projectPath = '/material-calculators/';
const required = ['.nojekyll', '404.html', 'robots.txt', 'sitemap.xml'];
const errors = [];

function collect(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    if (name === 'node_modules' || name.startsWith('.')) return [];
    return statSync(path).isDirectory() ? collect(path) : [path];
  });
}

function localTarget(page, reference) {
  const clean = reference.split(/[?#]/)[0];
  if (!clean || clean.startsWith('mailto:') || clean.startsWith('tel:')) return null;
  if (/^(?:https?:)?\/\//.test(clean) || clean.startsWith('data:')) return null;
  if (clean.startsWith(projectPath)) return join(root, clean.slice(projectPath.length));
  if (clean.startsWith('/')) return null;
  return resolve(dirname(page), clean);
}

function existingTarget(target) {
  if (!target) return true;
  if (existsSync(target) && statSync(target).isFile()) return true;
  return existsSync(join(target, 'index.html'));
}

function checkMetadata(path, html) {
  if (path.endsWith('404.html') || /google[a-f0-9]+\.html$/.test(path)) return;
  const fields = [
    ['title', /<title>.+<\/title>/s],
    ['description', /<meta name="description" content=".+">/s],
    ['canonical', /<link rel="canonical" href="https:\/\/.+">/s],
  ];
  fields.forEach(([label, pattern]) => {
    if (!pattern.test(html)) errors.push(`${relative(root, path)}: missing ${label}`);
  });
}

function checkReferences(path, html) {
  const references = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((match) => match[1]);
  references.forEach((reference) => {
    const target = localTarget(path, reference);
    if (!existingTarget(target)) errors.push(`${relative(root, path)}: broken ${reference}`);
  });
}

function checkStructuredData(path, html) {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  blocks.forEach((match) => {
    try {
      JSON.parse(match[1]);
    } catch {
      errors.push(`${relative(root, path)}: invalid JSON-LD`);
    }
  });
}

required.forEach((path) => {
  if (!existsSync(join(root, path))) errors.push(`missing ${path}`);
});

collect(root).filter((path) => extname(path) === '.html').forEach((path) => {
  const html = readFileSync(normalize(path), 'utf8');
  checkMetadata(path, html);
  checkReferences(path, html);
  checkStructuredData(path, html);
});

if (errors.length) {
  errors.forEach((error) => console.error(error));
  process.exit(1);
}

console.log('Site metadata and local references are valid.');
