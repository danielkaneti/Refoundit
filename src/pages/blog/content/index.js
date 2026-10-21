import employees from './tax-refund-employees.js';
import changingJobs from './tax-refund-changing-jobs.js';
import reserveDuty from './tax-refund-reserve-duty.js';
import afterBirth from './tax-refund-after-birth.js';
import degree from './tax-refund-degree.js';
import unemployment from './tax-refund-unemployment.js';

export const SITE_ORIGIN = 'https://refound-it.com';
export const BLOG_PATH = '/blog/';
export const ELIGIBILITY_PATH = '/#quiz';

export const articles = [employees, changingJobs, reserveDuty, afterBirth, degree, unemployment];

export function articlePath(slug) {
  return `${BLOG_PATH}${slug}/`;
}

export function resolveBlogPath(pathname) {
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    return { status: 404 };
  }
  const prettyPath = decodedPath.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
  const canonicalPath = prettyPath.endsWith('/') ? prettyPath : `${prettyPath}/`;
  const article = articles.find((entry) => articlePath(entry.slug) === canonicalPath);
  if (canonicalPath !== BLOG_PATH && !article) return { status: 404 };
  if (pathname !== canonicalPath) return { status: 301, location: canonicalPath };
  return { status: 200, article };
}