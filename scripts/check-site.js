import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, normalize, relative, resolve } from 'node:path';

const root = resolve(new URL('..', import.meta.url).pathname);
const projectPath = '/material-calculators/';
const required = ['.nojekyll', '404.html', 'CNAME', 'ads.txt', 'robots.txt', 'sitemap.xml'];
const productionDomain = 'usefulweblab.com';
const publisherId = 'pub-7381591341067052';
const calculatorPages = [
  'paint/index.html', 'tile/index.html', 'wallpaper/index.html',
  'flooring/index.html', 'drywall/index.html', 'concrete/index.html',
];
const calculatorLinks = ['paint', 'tile', 'wallpaper', 'flooring', 'drywall', 'concrete'];
const trustPages = ['about', 'contact', 'methodology', 'editorial-policy', 'privacy'];
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

function checkProductionDomain(path, html) {
  if (path.endsWith('404.html') || /google[a-f0-9]+\.html$/.test(path)) return;
  if (html.includes('charlesluo20140904.github.io')) {
    errors.push(`${relative(root, path)}: old GitHub Pages URL remains`);
  }
}

function checkAdsense(path, html) {
  const relativePath = relative(root, path);
  const monetized = ['index.html', ...calculatorPages];
  if (!monetized.includes(relativePath)) return;
  if (!html.includes(`ca-${publisherId}`)) {
    errors.push(`${relativePath}: missing AdSense publisher ID`);
  }
}

function checkToolNavigation(path, html) {
  const relativePath = relative(root, path);
  if (!calculatorPages.includes(relativePath)) return;
  const navigation = html.match(/<nav class="main-nav"[\s\S]*?<\/nav>/)?.[0] || '';
  calculatorLinks.forEach((slug) => {
    const currentLink = `href="./">${slug[0].toUpperCase()}${slug.slice(1)}`;
    if (!navigation.includes(`href="../${slug}/"`) && !navigation.includes(currentLink)) {
      errors.push(`${relativePath}: missing ${slug} in calculator navigation`);
    }
  });
}

function checkDeploymentFiles() {
  const cname = readFileSync(join(root, 'CNAME'), 'utf8').trim();
  const ads = readFileSync(join(root, 'ads.txt'), 'utf8').trim();
  if (cname !== productionDomain) errors.push('CNAME: unexpected production domain');
  if (!ads.includes(`google.com, ${publisherId}, DIRECT`)) {
    errors.push('ads.txt: missing direct Google seller entry');
  }
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

function visibleWordCount(html) {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z0-9#]+;/gi, ' ');
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function checkGuideQuality(path, html) {
  const relativePath = relative(root, path);
  if (!relativePath.startsWith('guides/')) return;
  if (visibleWordCount(html) < 450) errors.push(`${relativePath}: guide is under 450 visible words`);
  if (!html.includes('class="source-note"')) errors.push(`${relativePath}: missing source note`);
  if (!html.includes('"author"')) errors.push(`${relativePath}: missing structured author`);
  if (!html.includes('/about/')) errors.push(`${relativePath}: missing publisher link`);
  if (!html.includes('/methodology/')) errors.push(`${relativePath}: missing methodology link`);
}

function checkTrustLinks(path, html) {
  const relativePath = relative(root, path);
  if (relativePath === '404.html' || /google[a-f0-9]+\.html$/.test(relativePath)) return;
  ['about/', 'methodology/', 'contact/', 'privacy/'].forEach((target) => {
    if (!html.includes(target)) errors.push(`${relativePath}: missing trust link ${target}`);
  });
}

function sitemapPaths() {
  const xml = readFileSync(join(root, 'sitemap.xml'), 'utf8');
  return new Set([...xml.matchAll(/<loc>https:\/\/usefulweblab\.com\/(.*?)<\/loc>/g)]
    .map((match) => match[1]));
}

function checkContentInventory() {
  const guides = collect(join(root, 'guides')).filter((path) => path.endsWith('index.html'));
  if (guides.length < 12) errors.push(`guides: expected at least 12, found ${guides.length}`);
  trustPages.forEach((slug) => {
    if (!existsSync(join(root, slug, 'index.html'))) errors.push(`missing ${slug}/index.html`);
  });
  const sitemap = sitemapPaths();
  [...calculatorLinks, ...trustPages].forEach((slug) => {
    if (!sitemap.has(`${slug}/`)) errors.push(`sitemap: missing ${slug}/`);
  });
  guides.forEach((path) => {
    const slug = `${relative(root, dirname(path)).replaceAll('\\', '/')}/`;
    if (!sitemap.has(slug)) errors.push(`sitemap: missing ${slug}`);
  });
}

required.forEach((path) => {
  if (!existsSync(join(root, path))) errors.push(`missing ${path}`);
});
if (!errors.length) checkDeploymentFiles();
checkContentInventory();

collect(root).filter((path) => extname(path) === '.html').forEach((path) => {
  const html = readFileSync(normalize(path), 'utf8');
  checkMetadata(path, html);
  checkProductionDomain(path, html);
  checkAdsense(path, html);
  checkReferences(path, html);
  checkStructuredData(path, html);
  checkToolNavigation(path, html);
  checkGuideQuality(path, html);
  checkTrustLinks(path, html);
});

if (errors.length) {
  errors.forEach((error) => console.error(error));
  process.exit(1);
}

console.log('Site metadata and local references are valid.');
