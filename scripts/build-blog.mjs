import { build } from 'vite';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { articles, articlePath, BLOG_PATH, SITE_ORIGIN } from '../src/pages/blog/content/index.js';

const rendererDir = 'node_modules/.cache/refoundit-blog';
await build({
  ssr: { noExternal: ['styled-components'] },
  build: {
    ssr: 'src/pages/blog/render.jsx',
    outDir: rendererDir,
    emptyOutDir: true,
    rollupOptions: { output: { entryFileNames: 'render.mjs' } },
  },
});

const { renderBlog } = await import(pathToFileURL(resolve(rendererDir, 'render.mjs')));
const manifest = JSON.parse(await readFile('dist/.vite/manifest.json', 'utf8'));
const assets = manifest['index.html'];
if (!assets?.file) throw new Error('Vite client entry missing from manifest');

const paths = [BLOG_PATH, ...articles.map((article) => articlePath(article.slug))];
for (const pathname of paths) {
  const directory = resolve('dist', pathname.slice(1));
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, 'index.html'), renderBlog(pathname, assets));
}
await mkdir('dist/blog/404', { recursive: true });
await writeFile('dist/blog/404/index.html', renderBlog('/blog/not-found/', assets));

const urls = ['/', ...paths].map((pathname) => {
  const article = articles.find((entry) => articlePath(entry.slug) === pathname);
  return `  <url>\n    <loc>${SITE_ORIGIN}${pathname}</loc>${article ? `\n    <lastmod>${article.updatedOn}</lastmod>` : ''}\n  </url>`;
});
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
await writeFile('public/sitemap.xml', sitemap);
await writeFile('dist/sitemap.xml', sitemap);
console.log(`Generated ${paths.length} blog pages and sitemap (${urls.length} URLs).`);