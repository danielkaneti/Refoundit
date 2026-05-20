import { useState } from 'react';
import styled from 'styled-components';

const Card = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  background: ${({ $checked, theme }) =>
    $checked ? 'rgba(0,180,160,0.08)' : theme.colors.white};
  border: 2px solid
    ${({ $checked, $hovered, theme }) =>
      $checked
        ? theme.colors.teal
        : $hovered
          ? theme.colors.gray200
          : theme.colors.gray100};
  transition: all 0.25s ease;
  transform: translateX(${({ $hovered }) => ($hovered ? '-4px' : '0')});
`;

const Checkbox = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 6px;
  flex-shrink: 0;
  border: 2px solid
    ${({ $checked, theme }) =>
      $checked ? theme.colors.teal : theme.colors.gray300};
  background: ${({ $checked, theme }) =>
    $checked ? theme.colors.teal : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
  color: white;
  font-size: 14px;
`;

const IconBadge = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: ${({ $checked, theme }) =>
    $checked ? theme.colors.teal : 'rgba(0, 180, 160, 0.08)'};
  color: ${({ $checked, theme }) =>
    $checked ? theme.colors.white : theme.colors.teal};
  font-size: 20px;
  transition: all 0.25s ease;
`;

const Label = styled.span`
  font-size: 15px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.navy};
`;

export default function CheckboxCard({ item, checked, onToggle }) {
  const [hov, setHov] = useState(false);
  const IconComponent = item.icon;

  return (
    <Card
      $checked={checked}
      $hovered={hov}
      onClick={onToggle}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <Checkbox $checked={checked}>{checked && '✓'}</Checkbox>
      <IconBadge $checked={checked}>
        <IconComponent strokeWidth={1.75} />
      </IconBadge>
      <Label>{item.label}</Label>
    </Card>
  );
}
