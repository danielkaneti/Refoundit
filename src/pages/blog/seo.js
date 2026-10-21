import { SITE_ORIGIN, BLOG_PATH, articlePath } from './content/index.js';

export const BLOG_IMAGE = '/images/blog-share.png';

export function pageMetadata(article, notFound = false) {
  return {
    title: notFound ? 'המדריך לא נמצא | REFOUNDIT' : article?.seoTitle || 'מדריכים על החזרי מס לשכירים בישראל | REFOUNDIT',
    description: notFound ? 'המדריך המבוקש אינו קיים. ניתן לחזור למרכז המידע של REFOUNDIT.' : article?.seoDescription || 'מרכז המידע של REFOUNDIT: מדריכים להחזרי מס לשכירים בעקבות החלפת עבודה, אבטלה, מילואים, לידה וסיום תואר, עם מקורות רשמיים ובדיקת זכאות ראשונית.',
    canonical: notFound ? null : `${SITE_ORIGIN}${article ? articlePath(article.slug) : BLOG_PATH}`,
    robots: notFound ? 'noindex, follow' : 'index, follow',
    type: article ? 'article' : 'website',
    image: `${SITE_ORIGIN}${BLOG_IMAGE}`,
  };
}

export function structuredData(article) {
  const metadata = pageMetadata(article);
  const breadcrumbs = [
    { '@type': 'ListItem', position: 1, name: 'ראשי', item: `${SITE_ORIGIN}/` },
    { '@type': 'ListItem', position: 2, name: 'מדריכים', item: `${SITE_ORIGIN}${BLOG_PATH}` },
  ];
  if (article) breadcrumbs.push({ '@type': 'ListItem', position: 3, name: article.title, item: metadata.canonical });

  const graph = [{ '@type': 'BreadcrumbList', itemListElement: breadcrumbs }];
  if (article) {
    graph.push({
      '@type': 'Article',
      '@id': `${metadata.canonical}#article`,
      headline: article.title,
      description: article.seoDescription,
      inLanguage: 'he-IL',
      mainEntityOfPage: metadata.canonical,
      image: metadata.image,
      author: { '@type': 'Organization', name: 'REFOUNDIT', url: `${SITE_ORIGIN}/` },
      publisher: { '@type': 'Organization', name: 'REFOUNDIT', url: `${SITE_ORIGIN}/` },
      dateModified: article.updatedOn,
      citation: article.sources.map((source) => source.url),
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}