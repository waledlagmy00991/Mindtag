import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compile } from '@tailwindcss/node';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const srcDir = path.join(projectRoot, 'src');
const inputCssPath = path.join(srcDir, 'index.tailwind.css');
const outputCssPath = path.join(srcDir, 'index.css');

const contentExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.html']);
const tokenPattern = /[A-Za-z0-9_:/.[\]()%#,!?-]+/g;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return walk(fullPath);
    }
    return contentExtensions.has(path.extname(entry.name)) ? [fullPath] : [];
  }));

  return files.flat();
}

function extractCandidates(content) {
  const candidates = new Set();
  const stringPattern = /`([^`]+)`|'([^']+)'|"([^"]+)"/g;

  for (const match of content.matchAll(stringPattern)) {
    const literal = match[1] ?? match[2] ?? match[3] ?? '';
    for (const token of literal.match(tokenPattern) ?? []) {
      if (
        token.length > 1 &&
        !token.startsWith('http') &&
        !token.startsWith('/api') &&
        !token.startsWith('/app') &&
        !token.startsWith('/hubs')
      ) {
        candidates.add(token);
      }
    }
  }

  return candidates;
}

async function buildCss() {
  const inputCss = await readFile(inputCssPath, 'utf8');
  const sourceFiles = await walk(srcDir);
  const candidates = new Set();

  for (const file of sourceFiles) {
    const content = await readFile(file, 'utf8');
    for (const candidate of extractCandidates(content)) {
      candidates.add(candidate);
    }
  }

  const compiler = await compile(inputCss, {
    base: projectRoot,
    from: inputCssPath,
    onDependency() {},
  });

  const css = compiler.build([...candidates].sort());
  await writeFile(outputCssPath, css, 'utf8');
  console.log(`Generated ${path.relative(projectRoot, outputCssPath)} with ${candidates.size} candidates.`);
}

await buildCss();
