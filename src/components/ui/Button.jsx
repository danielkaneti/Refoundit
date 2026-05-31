import { useState } from 'react';
import styled, { css } from 'styled-components';

const variants = {
  primary: css`
    background: ${({ theme }) => theme.colors.teal};
    color: ${({ theme }) => theme.colors.white};
    box-shadow: 0 4px 16px rgba(0, 180, 160, 0.25);

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.tealLight};
      box-shadow: 0 8px 32px rgba(0, 180, 160, 0.4);
      transform: translateY(-2px);
    }
  `,
  secondary: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.white};
    border: 2px solid ${({ theme }) => theme.colors.white};

    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.15);
      transform: translateY(-2px);
    }
  `,
  outline: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.teal};
    border: 2px solid ${({ theme }) => theme.colors.teal};

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.teal};
      color: ${({ theme }) => theme.colors.white};
      transform: translateY(-2px);
    }
  `,
  whatsapp: css`
    background: #25d366;
    color: ${({ theme }) => theme.colors.white};
    box-shadow: 0 4px 16px rgba(37, 211, 102, 0.25);

    &:hover:not(:disabled) {
      background: #1da851;
      box-shadow: 0 8px 32px rgba(37, 211, 102, 0.4);
      transform: translateY(-2px);
    }
  `,
  ghost: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.navy};

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.gray100};
    }
  `,
};

const sizes = {
  sm: css`
    padding: 10px 24px;
    font-size: 14px;
  `,
  md: css`
    padding: 14px 36px;
    font-size: 16px;
  `,
  lg: css`
    padding: 18px 48px;
    font-size: 18px;
  `,
};

const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  cursor: pointer;
  font-weight: 700;
  border-radius: ${({ theme }) => theme.radii.full};
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
  white-space: nowrap;

  ${({ $variant }) => variants[$variant] || variants.primary}
  ${({ $size }) => sizes[$size] || sizes.md}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  ${({ $fullWidth }) => $fullWidth && css`width: 100%;`}

  &:focus {
    outline: none;
  }

  &:focus-visible {
    outline: 3px solid white;
    outline-offset: 3px;
  }
`;

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  type = 'button',
  ...props
}) {
  return (
    <StyledButton $variant={variant} $size={size} $fullWidth={fullWidth} type={type} {...props}>
      {children}
    </StyledButton>
  );
}
