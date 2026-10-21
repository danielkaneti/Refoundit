import { Container } from '@components/ui';
import { articles } from '../content/index.js';
import ArticleCard from './ArticleCard';
import { ArticleGrid, Breadcrumbs, ContentBand, Eyebrow, PageHeader } from './styles';

export default function BlogHub() {
  return (
    <>
      <PageHeader>
        <Container>
          <Breadcrumbs aria-label="מיקום באתר">
            <ol><li><a href="/">ראשי</a></li><li aria-current="page">מדריכים</li></ol>
          </Breadcrumbs>
          <Eyebrow>REFOUNDIT / מרכז הידע</Eyebrow>
          <h1>מדריכים ומידע על החזרי מס</h1>
          <p>עבודה חדשה, לידה, מילואים או סיום תואר? כאן בודקים מה חשוב לדעת, אילו מסמכים להכין ומתי כדאי לבחון את המס ששילמתם.</p>
        </Container>
      </PageHeader>
      <ContentBand aria-labelledby="articles-heading" $muted>
        <Container>
          <h2 id="articles-heading">מה תרצו לבדוק?</h2>
          <ArticleGrid>{articles.map((article) => <ArticleCard key={article.slug} article={article} />)}</ArticleGrid>
        </Container>
      </ContentBand>
    </>
  );
}