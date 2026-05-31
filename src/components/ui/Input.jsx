import { useId } from 'react';
import styled, { css } from 'styled-components';

const InputWrapper = styled.div`
  margin-top: ${({ $noMargin }) => ($noMargin ? '0' : '16px')};
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 6px;
  color: ${({ theme }) => theme.colors.navy};
`;

const RequiredMark = styled.span`
  color: ${({ theme }) => theme.colors.danger};
  margin-inline-start: 2px;
`;

const baseInputStyles = css`
  width: 100%;
  padding: 14px 18px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 2px solid ${({ $hasError, theme }) =>
    $hasError ? theme.colors.danger : theme.colors.gray200};
  font-size: 16px;
  direction: ${({ $dir }) => $dir || 'rtl'};
  outline: none;
  transition: border-color 0.3s ease;
  background: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.fonts.body};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.teal};
  }

  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.colors.teal};
    outline-offset: 2px;
    border-color: ${({ theme }) => theme.colors.teal};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.gray300};
  }
`;

const StyledInput = styled.input`
  ${baseInputStyles}
`;

const StyledTextarea = styled.textarea`
  ${baseInputStyles}
  min-height: 100px;
  resize: vertical;
`;

const ErrorText = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.danger};
  margin-top: 4px;
  display: block;
`;

export default function Input({
  label,
  error,
  textarea = false,
  dir,
  noMargin = false,
  required = false,
  id: idProp,
  ...props
}) {
  const generatedId = useId();
  const id = idProp || generatedId;
  const errorId = `${id}-error`;
  const Component = textarea ? StyledTextarea : StyledInput;

  return (
    <InputWrapper $noMargin={noMargin}>
      {label && (
        <Label htmlFor={id}>
          {label}
          {required && (
            <>
              <RequiredMark aria-hidden="true"> *</RequiredMark>
              <span className="sr-only"> (שדה חובה)</span>
            </>
          )}
        </Label>
      )}
      <Component
        id={id}
        $hasError={!!error}
        $dir={dir}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {error && (
        <ErrorText id={errorId} role="alert">
          {error}
        </ErrorText>
      )}
    </InputWrapper>
  );
}
