import styled from 'styled-components';
import { LuArrowLeft, LuBaby, LuBookOpen, LuBriefcaseBusiness, LuCalendarDays, LuGraduationCap, LuShieldCheck } from 'react-icons/lu';
import { articlePath } from '../content/index.js';

const visuals = {
  guide: LuBookOpen,
  work: LuBriefcaseBusiness,
  reserve: LuShieldCheck,
  birth: LuBaby,
  degree: LuGraduationCap,
  unemployment: LuCalendarDays,
};

const Card = styled.article`
  min-width: 0;
  height: 100%;
  border: 1px solid ${({ theme }) => theme.colors.gray200};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.white};
  overflow: hidden;

  a {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 24px;
    gap: 16px;
  }

  a:hover h3 { color: ${({ theme }) => theme.colors.tealDark}; }
  h3 { font-size: 22px; line-height: 1.5; color: ${({ theme }) => theme.colors.navy}; }
  p { font-size: 16px; line-height: 1.8; color: ${({ theme }) => theme.colors.gray500}; }
`;

const Visual = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 64px;
  color: ${({ theme }) => theme.colors.tealDark};
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray100};
  padding-bottom: 16px;

  span { font-size: 13px; font-weight: 700; }
`;

const ReadMore = styled.span`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: auto;
  color: ${({ theme }) => theme.colors.tealDark};
  font-size: 15px;
  font-weight: 700;
`;

export default function ArticleCard({ article }) {
  const Icon = visuals[article.visual] || LuBookOpen;
  const titleId = `card-${article.slug}`;

  return (
    <Card>
      <a id={`read-${article.slug}`} href={articlePath(article.slug)} aria-labelledby={titleId}>
        <Visual aria-hidden="true"><Icon size={38} strokeWidth={1.5} /><span>{article.category}</span></Visual>
        <h3 id={titleId}>{article.title}</h3>
        <p>{article.description}</p>
        <ReadMore>למדריך המלא <LuArrowLeft aria-hidden="true" /></ReadMore>
      </a>
    </Card>
  );
}