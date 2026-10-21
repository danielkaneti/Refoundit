import { Container } from '@components/ui';
import { articles, articlePath, BLOG_PATH, ELIGIBILITY_PATH } from '../content/index.js';
import ArticleCard from './ArticleCard';
import { ArticleGrid, Breadcrumbs, ContentBand, EditorialNote, Eyebrow, PageHeader, ReadingColumn, TableOfContents } from './styles';

function Paragraphs({ paragraphs = [] }) {
  return paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>);
}

export default function ArticlePage({ article }) {
  const related = article.relatedArticles.map((slug) => articles.find((entry) => entry.slug === slug)).filter(Boolean);

  return (
    <>
      <article aria-labelledby="article-title">
        <PageHeader>
          <Container>
            <Breadcrumbs aria-label="מיקום באתר">
              <ol>
                <li><a href="/">ראשי</a></li>
                <li><a href={BLOG_PATH}>מדריכים</a></li>
                <li aria-current="page">{article.title}</li>
              </ol>
            </Breadcrumbs>
            <Eyebrow>{article.category} / מערכת REFOUNDIT</Eyebrow>
            <h1 id="article-title">{article.title}</h1>
            <p>{article.intro}</p>
          </Container>
        </PageHeader>
        <Container>
          <ReadingColumn>
            <TableOfContents aria-labelledby="toc-title">
              <h2 id="toc-title">במדריך הזה</h2>
              <ul>
                {article.sections.map((section) => <li key={section.id}><a href={`#${section.id}`}>{section.title}</a></li>)}
                <li><a href="#article-faq">שאלות נפוצות</a></li>
              </ul>
            </TableOfContents>
            {article.sections.map((section) => (
              <section key={section.id} aria-labelledby={section.id}>
                <h2 id={section.id}>{section.title}</h2>
                <Paragraphs paragraphs={section.paragraphs} />
                {section.bullets && <ul>{section.bullets.map((item) => <li key={item}>{item}</li>)}</ul>}
                {section.subsections?.map((subsection) => (
                  <div key={subsection.title}>
                    <h3>{subsection.title}</h3>
                    <Paragraphs paragraphs={subsection.paragraphs} />
                  </div>
                ))}
                {section.links && <ul>{section.links.map((link) => <li key={link.slug}><a href={articlePath(link.slug)}>{link.label}</a></li>)}</ul>}
              </section>
            ))}
            <section aria-labelledby="article-faq">
              <h2 id="article-faq">שאלות נפוצות</h2>
              {article.faqs.map((faq) => <div key={faq.question}><h3>{faq.question}</h3><p>{faq.answer}</p></div>)}
            </section>
            <section aria-labelledby="article-sources">
              <h2 id="article-sources">מקורות רשמיים להמשך בדיקה</h2>
              <ul>{article.sources.map((source) => <li key={source.url}><a href={source.url}>{source.title}</a></li>)}</ul>
            </section>
            <EditorialNote aria-label="הבהרה מקצועית">
              <p>המידע כללי ולימודי ואינו תחליף לייעוץ מס אישי. הכללים עשויים להשתנות ותלויים בשנת המס ובנתונים האישיים. דוגמאות הן להמחשה בלבד; אין הבטחה לזכאות או לסכום החזר.</p>
              <p>המידע נבדק מול המקורות המקושרים בתאריך <time dateTime={article.updatedOn}>{article.updatedOn.split('-').reverse().join('.')}</time>. ההוראות הרשמיות והדין הם הקובעים.</p>
            </EditorialNote>
            <p><a id="article-eligibility" href={ELIGIBILITY_PATH}>בדיקת זכאות להחזר מס</a></p>
            <p><a id="back-to-blog" href={BLOG_PATH}>חזרה לכל המדריכים</a></p>
          </ReadingColumn>
        </Container>
      </article>
      <ContentBand aria-labelledby="related-heading" $muted>
        <Container>
          <h2 id="related-heading">מדריכים נוספים שיכולים לעניין אתכם</h2>
          <ArticleGrid>{related.map((entry) => <ArticleCard key={entry.slug} article={entry} />)}</ArticleGrid>
        </Container>
      </ContentBand>
    </>
  );
}