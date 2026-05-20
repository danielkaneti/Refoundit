import { useState } from 'react';
import styled from 'styled-components';
import useScrollPosition from '@hooks/useScrollPosition';
import { Button, Container } from '@components/ui';

const NAV_LINKS = [
  { label: 'בדיקת זכאות', href: '#quiz' },
  { label: 'איך זה עובד', href: '#process' },
  { label: 'למה אנחנו', href: '#benefits' },
  { label: 'שאלות נפוצות', href: '#faq' },
  { label: 'צור קשר', href: '#contact' },
];

const Nav = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  padding: ${({ $scrolled }) => ($scrolled ? '12px 0' : '20px 0')};
  background: ${({ $scrolled }) =>
    $scrolled ? 'rgba(10,22,40,0.95)' : 'transparent'};
  backdrop-filter: ${({ $scrolled }) => ($scrolled ? 'blur(20px)' : 'none')};
  border-bottom: ${({ $scrolled }) =>
    $scrolled ? '1px solid rgba(255,255,255,0.1)' : 'none'};
  transition: all 0.4s ease;
`;

const NavInner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const LogoLink = styled.a`
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
`;

const LogoMark = styled.div`
  width: 42px;
  height: 42px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.teal},
    ${({ theme }) => theme.colors.tealLight}
  );
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 18px;
  color: white;
`;

const LogoText = styled.span`
  font-size: 22px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.white};
  letter-spacing: -0.5px;
`;

const DesktopNav = styled.div`
  display: flex;
  align-items: center;
  gap: 32px;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`;

const NavLink = styled.a`
  color: rgba(255, 255, 255, 0.85);
  font-size: 15px;
  font-weight: 500;
  transition: color 0.2s;

  &:hover {
    color: ${({ theme }) => theme.colors.teal};
  }
`;

const MobileToggle = styled.button`
  display: none;
  flex-direction: column;
  gap: 5px;
  padding: 8px;
  background: none;
  border: none;
  cursor: pointer;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: flex;
  }
`;

const ToggleLine = styled.div`
  width: 24px;
  height: 2px;
  background: ${({ theme }) => theme.colors.white};
  transition: all 0.3s;
  transform: ${({ $open, $index }) =>
    $open
      ? $index === 0
        ? 'rotate(45deg) translate(5px, 5px)'
        : $index === 2
          ? 'rotate(-45deg) translate(5px, -5px)'
          : 'scaleX(0)'
      : 'none'};
`;

const MobileMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(10, 22, 40, 0.98);
  backdrop-filter: blur(20px);
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const MobileLink = styled.a`
  color: rgba(255, 255, 255, 0.85);
  font-size: 16px;
  font-weight: 500;
  padding: 8px 0;
  transition: color 0.2s;

  &:hover {
    color: ${({ theme }) => theme.colors.teal};
  }
`;

const scrollTo = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

export default function Navbar() {
  const scrollY = useScrollPosition();
  const [menuOpen, setMenuOpen] = useState(false);
  const scrolled = scrollY > 50;

  return (
    <Nav $scrolled={scrolled}>
      <Container>
        <NavInner>
          <LogoLink href="#">
            <LogoMark>R</LogoMark>
            <LogoText>REFOUNDIT</LogoText>
          </LogoLink>

          <DesktopNav>
            {NAV_LINKS.map((link) => (
              <NavLink key={link.href} href={link.href}>
                {link.label}
              </NavLink>
            ))}
            <Button size="sm" onClick={() => scrollTo('quiz')}>
              בדקו עכשיו
            </Button>
          </DesktopNav>

          <MobileToggle onClick={() => setMenuOpen(!menuOpen)}>
            {[0, 1, 2].map((i) => (
              <ToggleLine key={i} $open={menuOpen} $index={i} />
            ))}
          </MobileToggle>
        </NavInner>
      </Container>

      {menuOpen && (
        <MobileMenu>
          {NAV_LINKS.map((link) => (
            <MobileLink
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </MobileLink>
          ))}
        </MobileMenu>
      )}
    </Nav>
  );
}
