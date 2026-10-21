import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { ServerStyleSheet, ThemeProvider } from 'styled-components';
import theme from '@styles/theme';
import GlobalStyles from '@styles/GlobalStyles';
import BlogApp from './index';
import { resolveBlogPath } from './content/index.js';
import { pageMetadata, structuredData } from './seo.js';

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

export function renderBlog(pathname, assets) {
  const route = resolveBlogPath(pathname);
  const notFound = route.status === 404;
  const metadata = pageMetadata(route.article, notFound);
  const sheet = new ServerStyleSheet();

  try {
    const markup = renderToString(sheet.collectStyles(
      <StrictMode><ThemeProvider theme={theme}><GlobalStyles /><BlogApp pathname={pathname} /></ThemeProvider></StrictMode>
    ));
    const schema = JSON.stringify(structuredData(route.article)).replace(/</g, '\\u003c');
    return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<title>${escapeHtml(metadata.title)}</title>
<meta name="description" content="${escapeHtml(metadata.description)}" />
<meta name="robots" content="${metadata.robots}" />
${metadata.canonical ? `<link rel="canonical" href="${metadata.canonical}" />` : ''}
<meta property="og:title" content="${escapeHtml(metadata.title)}" />
<meta property="og:description" content="${escapeHtml(metadata.description)}" />
<meta property="og:type" content="${metadata.type}" />
<meta property="og:locale" content="he_IL" />
<meta property="og:site_name" content="REFOUNDIT" />
${metadata.canonical ? `<meta property="og:url" content="${metadata.canonical}" />` : ''}
<meta property="og:image" content="${metadata.image}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="REFOUNDIT - מדריכים להחזרי מס לשכירים" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(metadata.title)}" />
<meta name="twitter:description" content="${escapeHtml(metadata.description)}" />
<meta name="twitter:image" content="${metadata.image}" />
${notFound ? '' : `<script type="application/ld+json">${schema}</script>`}
${sheet.getStyleTags()}
</head>
<body><div id="root" data-blog-prerendered="true">${markup}</div><script type="module" src="/${assets.file}"></script></body>
</html>`;
  } finally {
    sheet.seal();
  }
}