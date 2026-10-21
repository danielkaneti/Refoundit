import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { parse } from 'parse5';
import { articles, articlePath, resolveBlogPath, SITE_ORIGIN } from '../src/pages/blog/content/index.js';
import { onRequest } from '../functions/blog/[[path]].js';

function elements(node, name) {
  return [...(node.nodeName === name ? [node] : []), ...(node.childNodes || []).flatMap((child) => elements(child, name))];
}

function attribute(node, name) {
  return node.attrs?.find((entry) => entry.name === name)?.value;
}

function text(node) {
  return node.nodeName === '#text' ? node.value : (node.childNodes || []).map(text).join('');
}

test('blog hub has one canonical URL', () => {
  assert.equal(resolveBlogPath('/blog/').status, 200);
  assert.deepEqual(resolveBlogPath('/blog'), { status: 301, location: '/blog/' });
});

test('unknown blog paths are not homepage aliases', () => {
  assert.equal(resolveBlogPath('/blog/not-an-article/').status, 404);
  assert.equal(resolveBlogPath('/blog/tax-refund-employees/extra/').status, 404);
});

test('published articles resolve and normalize', () => {
  assert.ok(articles.length >= 6);
  for (const article of articles) {
    const pathname = articlePath(article.slug);
    assert.equal(resolveBlogPath(pathname).article, article);
    assert.deepEqual(resolveBlogPath(pathname.slice(0, -1)), { status: 301, location: pathname });
    assert.deepEqual(resolveBlogPath(`${pathname}index.html`), { status: 301, location: pathname });
    assert.deepEqual(resolveBlogPath(`${pathname.slice(0, -1)}.html`), { status: 301, location: pathname });
  }
});

test('content registry has unique metadata and valid references', () => {
  for (const field of ['slug', 'title', 'seoTitle', 'seoDescription']) {
    assert.equal(new Set(articles.map((article) => article[field])).size, articles.length, field);
  }
  for (const article of articles) {
    assert.ok(article.sections.length >= 5);
    assert.ok(article.faqs.length >= 3);
    assert.ok(article.sources.length >= 2);
    assert.equal(new Set(article.sections.map((section) => section.id)).size, article.sections.length);
    const references = [...article.relatedArticles, ...article.sections.flatMap((section) => (section.links || []).map((link) => link.slug))];
    assert.ok(references.every((slug) => articles.some((entry) => entry.slug === slug)), article.slug);
    for (const source of article.sources) {
      const url = new URL(source.url);
      assert.equal(url.protocol, 'https:');
      assert.ok(['www.gov.il', 'www.btl.gov.il'].includes(url.hostname));
    }
  }
});

test('Cloudflare handler serves static pages, redirects aliases, and returns real 404s', async () => {
  const fetched = [];
  const env = { ASSETS: { fetch: async (request) => {
    fetched.push(new URL(request.url).pathname);
    return new Response('<h1>Static page</h1>', { headers: { 'Content-Type': 'text/html', ETag: 'asset' } });
  } } };
  const request = (pathname, method = 'GET') => onRequest({ request: new Request(`${SITE_ORIGIN}${pathname}`, { method }), env });
  assert.equal((await request('/blog/')).status, 200);
  const redirect = await request('/blog?ref=test');
  assert.equal(redirect.status, 301);
  assert.equal(redirect.headers.get('Location'), `${SITE_ORIGIN}/blog/?ref=test`);
  const missing = await request('/blog/missing/');
  assert.equal(missing.status, 404);
  assert.equal(missing.headers.get('X-Robots-Tag'), 'noindex, follow');
  assert.equal(missing.headers.get('ETag'), null);
  assert.equal(fetched.at(-1), '/blog/404/');
  assert.equal(await (await request('/blog/missing/', 'HEAD')).text(), '');
  assert.equal((await request('/blog/', 'POST')).status, 405);
  assert.equal(resolveBlogPath('/blog/%broken').status, 404);
});

test('built blog pages contain crawlable content, unique heads, and matching JSON-LD', async () => {
  const paths = ['/blog/', ...articles.map((article) => articlePath(article.slug))];
  for (const pathname of paths) {
    const document = parse(await readFile(`dist${pathname}index.html`, 'utf8'));
    const article = articles.find((entry) => articlePath(entry.slug) === pathname);
    assert.equal(elements(document, 'h1').length, 1, pathname);
    const canonical = elements(document, 'link').filter((node) => attribute(node, 'rel') === 'canonical');
    assert.equal(canonical.length, 1);
    assert.equal(attribute(canonical[0], 'href'), `${SITE_ORIGIN}${pathname}`);
    const metadata = elements(document, 'meta');
    assert.equal(attribute(metadata.find((node) => attribute(node, 'name') === 'robots'), 'content'), 'index, follow');
    assert.equal(metadata.filter((node) => attribute(node, 'name') === 'description').length, 1);
    assert.equal(attribute(metadata.find((node) => attribute(node, 'property') === 'og:url'), 'content'), `${SITE_ORIGIN}${pathname}`);
    const schemas = elements(document, 'script').filter((node) => attribute(node, 'type') === 'application/ld+json').map((node) => JSON.parse(text(node)));
    const graph = schemas.flatMap((schema) => schema['@graph']);
    assert.equal(graph.some((schema) => schema['@type'] === 'FAQPage'), false);
    assert.equal(graph.some((schema) => schema['@type'] === 'AccountingService'), false);
    const breadcrumbs = graph.find((schema) => schema['@type'] === 'BreadcrumbList');
    assert.equal(breadcrumbs.itemListElement.at(-1).item, `${SITE_ORIGIN}${pathname}`);
    const links = elements(document, 'a');
    assert.ok(links.some((node) => attribute(node, 'href') === '/#quiz'));
    const ids = [];
    function collectIds(node) {
      const id = attribute(node, 'id');
      if (id) ids.push(id);
      for (const child of node.childNodes || []) collectIds(child);
    }
    collectIds(document);
    assert.equal(ids.length, new Set(ids).size, `Duplicate element IDs: ${pathname}`);
    for (const link of links) {
      const href = attribute(link, 'href');
      if (href?.startsWith('#')) assert.ok(ids.includes(href.slice(1)), `Missing fragment ${href} on ${pathname}`);
      if (href?.startsWith('/blog/')) assert.equal(resolveBlogPath(href).status, 200, `Broken blog link: ${href}`);
    }
    if (article) {
      assert.equal(text(elements(document, 'title')[0]), article.seoTitle);
      assert.equal(attribute(metadata.find((node) => attribute(node, 'name') === 'description'), 'content'), article.seoDescription);
      assert.equal(text(elements(document, 'h1')[0]), article.title);
      const body = text(elements(document, 'body')[0]);
      assert.ok(body.includes(article.intro));
      for (const section of article.sections) assert.ok(body.includes(section.title));
      for (const faq of article.faqs) assert.ok(body.includes(faq.answer));
      const schema = graph.find((entry) => entry['@type'] === 'Article');
      assert.equal(schema.headline, article.title);
      assert.equal(schema.mainEntityOfPage, `${SITE_ORIGIN}${pathname}`);
      assert.equal(schema.dateModified, article.updatedOn);
    } else {
      for (const entry of articles) assert.ok(links.some((node) => attribute(node, 'href') === articlePath(entry.slug)));
    }
  }
});

test('sitemap lists only published canonical public URLs', async () => {
  const sitemap = await readFile('public/sitemap.xml', 'utf8');
  assert.equal(sitemap, await readFile('dist/sitemap.xml', 'utf8'));
  const locations = elements(parse(sitemap), 'loc').map(text);
  assert.deepEqual(locations, [`${SITE_ORIGIN}/`, `${SITE_ORIGIN}/blog/`, ...articles.map((article) => `${SITE_ORIGIN}${articlePath(article.slug)}`)]);
  const missing = parse(await readFile('dist/blog/404/index.html', 'utf8'));
  assert.equal(attribute(elements(missing, 'meta').find((node) => attribute(node, 'name') === 'robots'), 'content'), 'noindex, follow');
  assert.equal(elements(missing, 'link').some((node) => attribute(node, 'rel') === 'canonical'), false);
});

test('social preview is a real 1200 by 630 PNG included in the build', async () => {
  const image = await readFile('public/images/blog-share.png');
  assert.deepEqual(image.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  assert.equal(image.readUInt32BE(16), 1200);
  assert.equal(image.readUInt32BE(20), 630);
  assert.deepEqual(await readFile('dist/images/blog-share.png'), image);
});