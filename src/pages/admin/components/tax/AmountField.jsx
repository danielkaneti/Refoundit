import { memo, useCallback } from 'react';
import styled from 'styled-components';
import { Input } from '@components/ui';
import { parseAmount } from '../../utils/tax/taxEngine';

const Hint = styled.small`
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.gray500};
`;

/** Numeric money/points input. Shows a validation message for non-numeric or negative values. */
function AmountField({ id, label, hint, value, onChange, placeholder = '0' }) {
  const { error } = parseAmount(value);
  const handleChange = useCallback((event) => onChange(event.target.value), [onChange]);
  const showHint = Boolean(hint) && !error;
  // Input sets its own aria-describedby for errors — only override it for the hint.
  const describedBy = showHint ? { 'aria-describedby': `${id}-hint` } : {};

  return (
    <div>
      <Input
        id={id}
        label={label}
        value={value}
        onChange={handleChange}
        inputMode="decimal"
        autoComplete="off"
        dir="ltr"
        placeholder={placeholder}
        error={error}
        noMargin
        {...describedBy}
      />
      {showHint && <Hint id={`${id}-hint`}>{hint}</Hint>}
    </div>
  );
}

export default memo(AmountField);
