import { useCallback, useState } from 'react';
import styled from 'styled-components';
import { Button, Input } from '@components/ui';
import { useLogin } from '../api/auth';
import { Card, ErrorText, Heading, Muted } from './styles';

const Wrap = styled.div`
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 16px;
  background: linear-gradient(160deg, ${({ theme }) => theme.colors.navy}, ${({ theme }) => theme.colors.navyMid});
`;

const Form = styled(Card).attrs({ as: 'form' })`
  width: min(400px, 100%);
`;

export default function LoginForm() {
  const [password, setPassword] = useState('');
  const login = useLogin();

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      if (password) login.mutate(password);
    },
    [login, password]
  );

  return (
    <Wrap>
      <Form onSubmit={handleSubmit} aria-labelledby="admin-login-title" noValidate>
        <Heading id="admin-login-title">כניסה לפורטל ניהול</Heading>
        <Muted>REFOUNDIT · ניהול מסמכים לחתימה</Muted>
        <Input
          id="admin-password"
          label="סיסמה"
          type="password"
          dir="ltr"
          autoComplete="current-password"
          required
          autoFocus
          value={password}
          error={login.error?.message}
          onChange={(event) => setPassword(event.target.value)}
        />
        <div style={{ marginTop: 24 }}>
          <Button id="admin-login-submit" type="submit" fullWidth disabled={login.isPending || !password}>
            {login.isPending ? 'מתחבר…' : 'כניסה'}
          </Button>
        </div>
      </Form>
    </Wrap>
  );
}
