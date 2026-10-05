import { memo, useCallback, useRef } from 'react';
import styled, { css } from 'styled-components';
import { FIELD_TYPES, clamp } from '@shared/pdfGeometry';

const MIN_W = 0.02;
const MIN_H = 0.01;
const KEY_STEP = 0.005;

const typeStyles = {
  [FIELD_TYPES.text]: css`
    border-color: ${({ theme }) => theme.colors.navyMid};
    background: rgba(27, 58, 92, 0.08);
  `,
  [FIELD_TYPES.signature]: css`
    border-color: ${({ theme }) => theme.colors.gold};
    background: rgba(245, 166, 35, 0.14);
  `,
  [FIELD_TYPES.ownerSignature]: css`
    border-color: ${({ theme }) => theme.colors.teal};
    background: rgba(0, 180, 160, 0.1);
  `,
  [FIELD_TYPES.date]: css`
    border-color: #7b61ff;
    background: rgba(123, 97, 255, 0.1);
  `,
  [FIELD_TYPES.check]: css`
    border-color: ${({ theme }) => theme.colors.success};
    background: rgba(39, 174, 96, 0.1);
  `,
};

const Box = styled.div`
  position: absolute;
  border: 2px dashed;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.navy};
  direction: rtl;
  user-select: none;
  touch-action: none;
  cursor: ${({ $editable }) => ($editable ? 'move' : 'default')};
  ${({ $type }) => typeStyles[$type]}

  ${({ $selected, theme }) =>
    $selected &&
    css`
      border-style: solid;
      box-shadow: 0 0 0 3px ${theme.colors.teal};
      z-index: 2;
    `}
`;

const ResizeHandle = styled.span`
  position: absolute;
  right: 0;
  bottom: 0;
  width: 14px;
  height: 14px;
  background: ${({ theme }) => theme.colors.teal};
  border-top-left-radius: 4px;
  cursor: nwse-resize;
`;

/**
 * A positioned rectangle on a PDF page overlay. Coordinates are normalized (0..1).
 * When `editable`, it can be dragged, resized (corner handle) and nudged with the
 * keyboard: arrows move, Shift+arrows resize, Delete removes.
 */
function FieldBox({ field, selected, editable, onSelect, onChange, onDelete, label, children }) {
  const boxRef = useRef(null);
  const dragRef = useRef(null);

  const startDrag = useCallback(
    (event, mode) => {
      if (!editable) return;
      event.stopPropagation();
      event.preventDefault();
      onSelect?.(field.id);
      const overlay = boxRef.current.closest('[data-pdf-overlay]').getBoundingClientRect();
      dragRef.current = { mode, startX: event.clientX, startY: event.clientY, origin: field, overlay };
      boxRef.current.setPointerCapture(event.pointerId);
    },
    [editable, field, onSelect]
  );

  const handlePointerMove = useCallback(
    (event) => {
      const drag = dragRef.current;
      if (!drag) return;
      const dx = (event.clientX - drag.startX) / drag.overlay.width;
      const dy = (event.clientY - drag.startY) / drag.overlay.height;
      const { origin } = drag;
      onChange(
        field.id,
        drag.mode === 'move'
          ? { x: clamp(origin.x + dx, 0, 1 - origin.w), y: clamp(origin.y + dy, 0, 1 - origin.h) }
          : { w: clamp(origin.w + dx, MIN_W, 1 - origin.x), h: clamp(origin.h + dy, MIN_H, 1 - origin.y) }
      );
    },
    [field.id, onChange]
  );

  const endDrag = useCallback(() => {
    dragRef.current = null;
  }, []);

  const handleKeyDown = useCallback(
    (event) => {
      if (!editable) return;
      if ((event.key === 'Delete' || event.key === 'Backspace') && onDelete) {
        event.preventDefault();
        onDelete(field.id);
        return;
      }
      const deltas = {
        ArrowLeft: [-KEY_STEP, 0],
        ArrowRight: [KEY_STEP, 0],
        ArrowUp: [0, -KEY_STEP],
        ArrowDown: [0, KEY_STEP],
      };
      const delta = deltas[event.key];
      if (!delta) return;
      event.preventDefault();
      const [dx, dy] = delta;
      onChange(
        field.id,
        event.shiftKey
          ? { w: clamp(field.w + dx, MIN_W, 1 - field.x), h: clamp(field.h + dy, MIN_H, 1 - field.y) }
          : { x: clamp(field.x + dx, 0, 1 - field.w), y: clamp(field.y + dy, 0, 1 - field.h) }
      );
    },
    [editable, field, onChange, onDelete]
  );

  return (
    <Box
      ref={boxRef}
      id={`field-${field.id}`}
      role={editable ? 'button' : undefined}
      tabIndex={editable ? 0 : undefined}
      aria-label={label}
      aria-pressed={editable ? selected : undefined}
      $type={field.type}
      $selected={selected}
      $editable={editable}
      style={{
        left: `${field.x * 100}%`,
        top: `${field.y * 100}%`,
        width: `${field.w * 100}%`,
        height: `${field.h * 100}%`,
      }}
      onPointerDown={(event) => startDrag(event, 'move')}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={handleKeyDown}
      onFocus={editable ? () => onSelect?.(field.id) : undefined}
    >
      {children}
      {editable && selected && (
        <ResizeHandle aria-hidden="true" onPointerDown={(event) => startDrag(event, 'resize')} />
      )}
    </Box>
  );
}

export default memo(FieldBox);
