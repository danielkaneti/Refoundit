import { useState } from 'react';
import styled from 'styled-components';
import { Button, Input } from '@components/ui';
import { CONTACT } from '@data/config';
import { validateContactForm } from '@utils/validation';

/* Changed from styled.div to styled.form for semantic form landmark (WCAG 1.3.1) */
const Form = styled.form`
  background: ${({ theme }) => theme.colors.white};
  padding: clamp(24px, 4vw, 40px);
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

export default function ContactForm({ onSuccess }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState({});

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validateContactForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const subject = 'פנייה חדשה מאתר REFOUNDIT';
    const body = `שם: ${form.firstName} ${form.lastName}\nטלפון: ${form.phone}\nמייל: ${form.email}\nהודעה: ${form.message}`;

    window.open(
      `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      '_blank'
    );

    onSuccess?.();
  };

  return (
    <Form onSubmit={handleSubmit} noValidate aria-label="טופס יצירת קשר">
      <Row>
        <Input
          label="שם פרטי"
          required
          noMargin
          placeholder="הכנס שם פרטי"
          value={form.firstName}
          error={errors.firstName}
          onChange={(e) => updateField('firstName', e.target.value)}
        />
        <Input
          label="שם משפחה"
          required
          noMargin
          placeholder="הכנס שם משפחה"
          value={form.lastName}
          error={errors.lastName}
          onChange={(e) => updateField('lastName', e.target.value)}
        />
      </Row>


      <Input
        label="אימייל (אופציונלי)"
        type="email"
        dir="ltr"
        placeholder="your@email.com"
        value={form.email}
        onChange={(e) => updateField('email', e.target.value)}
      />

      <Input
        label="הודעה (אופציונלי)"
        textarea
        placeholder="ספרו לנו במה נוכל לעזור..."
        value={form.message}
        onChange={(e) => updateField('message', e.target.value)}
      />

      <Button
        type="submit"
        fullWidth
        size="lg"
        style={{ marginTop: 24 }}
      >
        {/* Emoji aria-hidden — text label is sufficient for AT */}
        <span aria-hidden="true">📨</span> שלח פרטים
      </Button>
    </Form>
  );
}
