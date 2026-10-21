# Blog Publishing

## Architecture

The homepage, admin portal, and signing experience retain their existing client-side rendering. The blog uses the same React components, theme, and styled-components library, with build-time HTML rendering and client hydration. It does not introduce a router or another framework.

`npm run build` first builds the Vite client and manifest, then bundles the isolated blog renderer and writes complete Hebrew HTML and collected CSS to `dist/blog/`. The temporary renderer lives in the ignored `node_modules/.cache/refoundit-blog/` directory. Blog pages have a dedicated HTML document rather than inheriting homepage metadata or structured data.

The Cloudflare Pages Function at `functions/blog/[[path]].js` is scoped to the blog. It serves existing directory URLs through `env.ASSETS`, redirects known aliases to their trailing-slash URL, and returns an actual HTTP 404 with noindex for unknown articles. It does not change routing for `/admin`, `/sign/`, or `/api/`. Keep the private-path rules in `public/_headers` and `public/robots.txt`.

## Add An Article

1. Create a content module in `src/pages/blog/content/`, following a neighboring article.
2. Supply a unique slug, title, card description, SEO title, SEO description, category, and visual key. Supported visual keys are `guide`, `work`, `reserve`, `birth`, `degree`, and `unemployment`; unknown keys use the book icon.
3. Write an introduction that answers the question, substantive sections with unique IDs, visible FAQs, official sources, and contextual internal links. Sections support paragraphs, bullets, H3 subsections, and links by article slug. Do not put HTML into strings.
4. Supply related article slugs and an accurate `updatedOn` date in `YYYY-MM-DD` format. Change this date only after reviewing the article content and sources, not on every build. Add reciprocal links where useful.
5. Import the module and add it to the published `articles` array in `content/index.js`. Unregistered modules are drafts: they get no route, hub link, or sitemap entry. Never publish empty placeholders.
6. Run `npm run build` and `npm run test:blog`. Commit the updated `public/sitemap.xml` together with the article. No separate route or page component is required.

Canonicals always derive from `SITE_ORIGIN` and the slug. The same published registry drives static generation, URL validation, hub links, related links, and the sitemap. The sitemap includes `/`, `/blog/`, and published articles only; article lastmod dates reflect editorial updates. There is no second manually maintained route list.

The regression suite validates all registered articles automatically; adding an article does not require adding a separate route test.

## Editorial Requirements

Use current Tax Authority and National Insurance sources and link to them visibly. Verify conditions against the relevant tax year, especially graduation benefits, reserve-duty measures, and family tax credits. Examples must be hypothetical, not testimonials or refund estimates. A change in circumstances is a reason to check, not evidence of eligibility.

Do not promise refunds, publish unsupported averages or processing times, or describe the quiz as a final tax calculation. Explain that a full calculation can reveal no refund or a liability. Do not invent author credentials, professional review, or publication dates. Current Article JSON-LD uses organizational authorship and the visible review date as dateModified. It intentionally omits FAQPage markup: this commercial site is not a government or health authority eligible for Google's restricted FAQ rich results.

The CTA links to `/#quiz`, preserving the original eligibility questions, result, contact, and WhatsApp workflow. Do not duplicate or silently pre-answer the quiz.

## Visuals

Blog cards use the existing React Icons library rather than unrelated stock photos. The social preview is the checked-in `public/images/blog-share.png`, a 1200 x 630 branded bitmap. To regenerate it on Windows, run `./scripts/create-blog-share.ps1`; the script reads the existing theme palette. Generation is optional and is not a production build requirement.

## Verification

- `npm run build`: client build, blog renderer, static pages, and sitemap.
- `npm run test:blog`: registry, alias redirects, 404 handler, raw HTML content, metadata, Article/BreadcrumbList JSON-LD, and sitemap consistency. Run after a build.
- `npx wrangler pages dev dist --port 8790`: verify production-style direct loads, refreshes, HTTP statuses, and private routes. Vite preview does not emulate Functions.
- Inspect the hub and article at desktop and mobile widths, keyboard navigation, internal links, hydration console errors, and `/#quiz` arrival. Disable JavaScript to verify that article text, navigation, FAQs, and metadata remain available.

Deploy using `npm run build` to Cloudflare Pages with `dist` as the output. A deployment configured to run only `vite build` will omit static articles. After deployment, verify representative live URLs and submit `https://refound-it.com/sitemap.xml` in Google Search Console. Crawlable HTML does not guarantee indexing or rankings.