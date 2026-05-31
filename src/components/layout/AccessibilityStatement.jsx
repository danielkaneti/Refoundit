import { useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { LuX } from 'react-icons/lu';
import { COMPANY, CONTACT } from '@data/config';

const fadeIn = keyframes`
  from { opacity: 0 }
  to   { opacity: 1 }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(40px) }
  to   { opacity: 1; transform: translateY(0) }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(10, 22, 40, 0.75);
  z-index: 9000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  overflow-y: auto;
  padding: 32px 16px;
  animation: ${fadeIn} 0.25s ease;
`;

const Panel = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.lg};
  max-width: 760px;
  width: 100%;
  padding: 48px 40px;
  position: relative;
  animation: ${slideUp} 0.35s cubic-bezier(0.16, 1, 0.3, 1);

  @media (max-width: 600px) {
    padding: 32px 20px;
  }
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 20px;
  inset-inline-start: 20px;
  background: ${({ theme }) => theme.colors.gray100};
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.navy};
  transition: background 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.gray200};
  }

  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.colors.teal};
    outline-offset: 3px;
  }
`;

const H1 = styled.h1`
  font-size: clamp(22px, 4vw, 32px);
  font-weight: 800;
  color: ${({ theme }) => theme.colors.navy};
  margin-bottom: 8px;
`;

const Lead = styled.p`
  font-size: 15px;
  color: ${({ theme }) => theme.colors.gray500};
  margin-bottom: 36px;
  line-height: 1.6;
`;

const H2 = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.navy};
  margin: 28px 0 10px;
  padding-bottom: 6px;
  border-bottom: 2px solid ${({ theme }) => theme.colors.teal};
  display: inline-block;
`;

const P = styled.p`
  font-size: 15px;
  line-height: 1.75;
  color: #333;
  margin-bottom: 8px;
`;

const Ul = styled.ul`
  padding-inline-start: 20px;
  margin-bottom: 8px;

  li {
    font-size: 15px;
    line-height: 1.75;
    color: #333;
    margin-bottom: 4px;
  }
`;

const ContactLink = styled.a`
  color: ${({ theme }) => theme.colors.teal};
  font-weight: 600;
  text-decoration: underline;

  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.colors.teal};
    outline-offset: 3px;
    border-radius: 2px;
  }
`;

const Badge = styled.span`
  display: inline-block;
  background: ${({ theme }) => theme.colors.teal};
  color: white;
  font-size: 13px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: ${({ theme }) => theme.radii.full};
  margin-bottom: 24px;
`;

export default function AccessibilityStatement({ onClose }) {
  const panelRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();

    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();

      if (e.key === 'Tab') {
        const focusable = panelRef.current?.querySelectorAll(
          'a[href], button, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <Overlay onClick={(e) => e.target === e.currentTarget && onClose()} aria-modal="true" role="dialog" aria-labelledby="a11y-title">
      <Panel ref={panelRef}>
        <CloseBtn ref={closeRef} onClick={onClose} aria-label="סגור הצהרת נגישות">
          <LuX size={20} aria-hidden="true" />
        </CloseBtn>

        <H1 id="a11y-title">הצהרת נגישות</H1>
        <Lead>
          {COMPANY.name} מחויבת לנגישות דיגיטלית ולאפשר לכל אדם לעשות שימוש מלא
          באתר, לרבות אנשים עם מוגבלויות.
        </Lead>

        <Badge>תאימות: WCAG 2.1 AA | ת"י 5568</Badge>

        <H2>רמת נגישות</H2>
        <P>
          אתר זה עומד ברמת תאימות <strong>AA</strong> של תקן{' '}
          <strong>WCAG 2.1</strong> ותקן הנגישות הישראלי{' '}
          <strong>ת"י 5568</strong>, בהתאם לדרישות חוק שוויון זכויות לאנשים עם
          מוגבלות (תשנ"ח–1998) ותקנות הנגישות לשירות.
        </P>

        <H2>האמצעים שננקטו</H2>
        <Ul>
          <li>כל התמונות, האייקונים והאלמנטים הגרפיים מכילים חלופות טקסטואליות מתאימות.</li>
          <li>הניווט באתר מלא באמצעות מקלדת בלבד, כולל קפיצה לתוכן הראשי.</li>
          <li>יחסי ניגודיות צבע עומדים בדרישות מינימום 4.5:1 לטקסט רגיל ו-3:1 לטקסט גדול.</li>
          <li>האתר תואם לקוראי מסך מובילים (NVDA, JAWS, VoiceOver).</li>
          <li>כל הטפסים מכילים תוויות נגישות, הודעות שגיאה ואינדיקציות לשדות חובה.</li>
          <li>מבנה כותרות היררכי ותקין (H1 → H2 → H3).</li>
          <li>האתר תומך בשינוי גודל טקסט עד 200% ללא פגיעה בתפקוד.</li>
          <li>ממשק דו-לשוני RTL מלא בעברית.</li>
        </Ul>

        <H2>מגבלות ידועות</H2>
        <P>
          אנו עושים כל מאמץ להבטיח נגישות מלאה. ייתכן שחלקים מסוימים בתוכן
          מוטמע (כגון וידאו של צד שלישי) אינם תחת שליטתנו המלאה. אנו עובדים
          באופן שוטף לשיפור הנגישות.
        </P>

        <H2>יצירת קשר בנושא נגישות</H2>
        <P>
          נתקלתם בבעיית נגישות או זקוקים לסיוע? נשמח לעזור.
        </P>
        <P>
          דוא"ל:{' '}
          <ContactLink href={`mailto:${CONTACT.email}?subject=פנייה בנושא נגישות`}>
            {CONTACT.email}
          </ContactLink>
        </P>
     
        <P>
          אנו מתחייבים לחזור אליכם תוך <strong>5 ימי עסקים</strong>.
        </P>

        <H2>מנגנון משוב</H2>
        <P>
          אם מצאתם תוכן שאינו נגיש, אנא פנו אלינו עם פרטי הדף ותיאור הבעיה.
          אנו לוקחים כל פנייה ברצינות ומשפרים את האתר בהתאם.
        </P>

        <H2>תאריך עדכון אחרון</H2>
        <P>הצהרה זו עודכנה לאחרונה בחודש מאי 2026.</P>
      </Panel>
    </Overlay>
  );
}
