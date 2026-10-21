import { useEffect } from 'react';
import { Container } from '@components/ui';
import BlogLayout from './components/BlogLayout';
import BlogHub from './components/BlogHub';
import ArticlePage from './components/ArticlePage';
import { PageHeader } from './components/styles';
import { resolveBlogPath } from './content/index.js';
import { pageMetadata } from './seo.js';

export default function BlogApp({ pathname }) {
  const route = resolveBlogPath(pathname);
  const metadata = pageMetadata(route.article, route.status === 404);

  useEffect(() => {
    if (route.status === 301) {
      window.location.replace(`${route.location}${window.location.search}${window.location.hash}`);
      return;
    }
    document.title = metadata.title;
  }, [route.status, route.location, metadata.title]);

  return (
    <BlogLayout>
      {route.status === 404 ? (
        <PageHeader><Container><h1>המדריך לא נמצא</h1><p><a href="/blog/">חזרה לכל המדריכים</a></p></Container></PageHeader>
      ) : route.article ? <ArticlePage article={route.article} /> : <BlogHub />}
    </BlogLayout>
  );
}