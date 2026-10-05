import styled, { css } from 'styled-components';
import { HiOutlineLogout } from 'react-icons/hi';
import { useLogout } from '../api/auth';
import { Content, Page } from './styles';

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  background: ${({ theme }) => theme.colors.navy};
  color: ${({ theme }) => theme.colors.white};
`;

const HeaderInner = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 clamp(16px, 3vw, 32px);
  height: 64px;
  display: flex;
  align-items: center;
  gap: 24px;
`;

const Brand = styled.span`
  font-weight: 900;
  font-size: 20px;
  letter-spacing: 0.5px;

  span {
    color: ${({ theme }) => theme.colors.teal};
  }
`;

const Tabs = styled.nav`
  display: flex;
  gap: 4px;
  flex: 1;
`;

const Tab = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.gray300};
  font-size: 15px;
  font-weight: 600;
  padding: 8px 14px;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.white};
  }

  ${({ $active, theme }) =>
    $active &&
    css`
      color: ${theme.colors.white};
      background: rgba(255, 255, 255, 0.1);
    `}
`;

const LogoutButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
`;

export const ADMIN_TABS = [
  { id: 'docs', label: 'מסמכים' },
  { id: 'templates', label: 'תבניות' },
  { id: 'settings', label: 'הגדרות' },
];

export default function AdminShell({ activeTab, onTabChange, children }) {
  const logout = useLogout();

  return (
    <Page>
      <Header>
        <HeaderInner>
          <Brand>
            REFOUND<span>IT</span>
          </Brand>
          <Tabs aria-label="ניווט פורטל ניהול">
            {ADMIN_TABS.map((tab) => (
              <Tab
                key={tab.id}
                id={`admin-tab-${tab.id}`}
                type="button"
                $active={activeTab === tab.id}
                aria-current={activeTab === tab.id ? 'page' : undefined}
                onClick={() => onTabChange(tab.id)}
              >
                {tab.label}
              </Tab>
            ))}
          </Tabs>
          <LogoutButton
            id="admin-logout"
            type="button"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
          >
            יציאה
            <HiOutlineLogout aria-hidden="true" />
          </LogoutButton>
        </HeaderInner>
      </Header>
      <Content id="main-content">{children}</Content>
    </Page>
  );
}
