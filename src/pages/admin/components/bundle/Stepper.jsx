import { memo } from 'react';
import styled, { css } from 'styled-components';

const List = styled.ol`
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
`;

const StepButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: ${({ theme }) => theme.radii.full};
  border: 1px solid ${({ theme }) => theme.colors.gray200};
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.gray500};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  span {
    display: inline-grid;
    place-items: center;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.gray100};
    font-size: 12px;
  }

  ${({ $state, theme }) =>
    $state === 'current' &&
    css`
      border-color: #1e3a5f;
      color: #1e3a5f;
      span {
        background: #1e3a5f;
        color: ${theme.colors.white};
      }
    `}

  ${({ $state, theme }) =>
    $state === 'done' &&
    css`
      color: ${theme.colors.navy};
      span {
        background: ${theme.colors.teal};
        color: ${theme.colors.white};
      }
    `}
`;

function Stepper({ steps, current, onSelect }) {
  return (
    <nav aria-label="שלבי בניית החבילה">
      <List>
        {steps.map((label, index) => {
          const state = index === current ? 'current' : index < current ? 'done' : 'todo';
          return (
            <li key={label}>
              <StepButton
                id={`bundle-step-${index}`}
                type="button"
                $state={state}
                aria-current={state === 'current' ? 'step' : undefined}
                onClick={() => onSelect(index)}
              >
                <span aria-hidden="true">{state === 'done' ? '✓' : index + 1}</span>
                {label}
              </StepButton>
            </li>
          );
        })}
      </List>
    </nav>
  );
}

export default memo(Stepper);
