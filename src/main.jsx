import { StrictMode, Suspense, lazy } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { ThemeProvider } from 'styled-components';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import theme from '@styles/theme';
import GlobalStyles from '@styles/GlobalStyles';
import App from './App';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

// Admin portal and signing page are lazy-loaded so the marketing site bundle stays small.
const AdminApp = lazy(() => import('./pages/admin'));
const SignApp = lazy(() => import('./pages/sign'));
const BlogApp = lazy(() => import('./pages/blog'));

function Root() {
  const { pathname } = window.location;
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return <AdminApp />;
  if (pathname.startsWith('/sign/')) return <SignApp />;
  if (pathname === '/blog' || pathname.startsWith('/blog/')) return <BlogApp pathname={pathname} />;
  return <App />;
}

const rootElement = document.getElementById('root');
const application = (
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <Suspense fallback={null}>
          <Root />
        </Suspense>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
);

if (rootElement.dataset.blogPrerendered) {
  const { default: BlogApp } = await import('./pages/blog');
  hydrateRoot(rootElement, <StrictMode><ThemeProvider theme={theme}><GlobalStyles /><BlogApp pathname={window.location.pathname} /></ThemeProvider></StrictMode>);
} else {
  createRoot(rootElement).render(application);
}
