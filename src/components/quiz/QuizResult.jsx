import styled from 'styled-components';
import { LuSparkles, LuCircleHelp, LuLightbulb, LuMail, LuRotateCcw } from 'react-icons/lu';
import { FaWhatsapp } from 'react-icons/fa';
import { Button } from '@components/ui';
import { fadeInUp, checkmark } from '@styles/animations';
import { openWhatsApp } from '@utils/whatsapp';

const Wrapper = styled.div`
  animation: ${fadeInUp} 0.5s ease;
  text-align: center;
  padding: 20px 0;
`;

const IconCircle = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  animation: ${checkmark} 0.5s ease;
  font-size: 36px;
  box-shadow: 0 8px 24px rgba(10, 22, 40, 0.08);
`;

const Title = styled.h3`
  font-size: ${({ $large }) => ($large ? '26px' : '24px')};
  font-weight: 800;
  color: ${({ theme }) => theme.colors.navy};
  margin-bottom: 12px;
`;

const Desc = styled.p`
  color: ${({ theme }) => theme.colors.gray500};
  margin-bottom: 32px;
  font-size: 16px;
  line-height: 1.7;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
`;

const scrollTo = (id) =>
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

export default function QuizResult({ paidTax, hasSelections, onReset }) {
  if (paidTax === 'כן' && hasSelections) {
    return (
      <Wrapper>
        <IconCircle $bg="linear-gradient(135deg, #00B4A0, #00D4BC)" $color="#fff">
          <LuSparkles strokeWidth={1.75} />
        </IconCircle>
        <Title $large>יש סיכוי גבוה שמגיע לך החזר מס!</Title>
        <Desc>
          על סמך התשובות שלך, נראה שיש לך זכאות פוטנציאלית להחזר.
          <br />
          השאירו פרטים ונחזור אליכם בהקדם!
        </Desc>
        <ButtonRow>
          <Button size="lg" onClick={() => scrollTo('contact')}>
            השאירו פרטים
            <LuMail strokeWidth={1.75} />
          </Button>
          <Button
            variant="whatsapp"
            size="lg"
            onClick={() => openWhatsApp('eligible')}
          >
            דברו איתנו בוואטסאפ
            <FaWhatsapp />
          </Button>
        </ButtonRow>
      </Wrapper>
    );
  }

  if (paidTax === 'כן') {
    return (
      <Wrapper>
        <IconCircle $bg="linear-gradient(135deg, #F5A623, #FFD07B)" $color="#fff">
          <LuCircleHelp strokeWidth={1.75} />
        </IconCircle>
        <Title>ייתכן שעדיין מגיע לך החזר!</Title>
        <Desc>
          גם אם לא בחרת אף אפשרות, ישנם מקרים נוספים שבגינם ייתכן שמגיע לך
          החזר.
          <br />
          צרו איתנו קשר לבדיקה מעמיקה יותר.
        </Desc>
        <Button size="lg" onClick={() => scrollTo('contact')}>
          צרו קשר לבדיקה
        </Button>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <IconCircle $bg="rgba(0, 180, 160, 0.1)" $color="#00B4A0">
        <LuLightbulb strokeWidth={1.75} />
      </IconCircle>
      <Title>הסיכוי להחזר נמוך יותר, אבל...</Title>
      <Desc>
        אם לא שילמת מס הכנסה, הסיכוי לקבלת החזר הינו נמוך. יחד עם זאת, ישנם
        מקרים נוספים שבגינם את/ה עשוי/ה להימצא זכאי/ת.
        <br />
        צרו קשר ונבדוק יחד!
      </Desc>
      <ButtonRow>
        <Button onClick={onReset}>
          התחל מחדש
          <LuRotateCcw strokeWidth={1.75} />
        </Button>
        <Button variant="whatsapp" onClick={() => openWhatsApp('inquiry')}>
          שאלו אותנו בוואטסאפ
          <FaWhatsapp />
        </Button>
      </ButtonRow>
    </Wrapper>
  );
}
