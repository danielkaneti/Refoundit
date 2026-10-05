import { useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import styled from 'styled-components';

const INK = '#0A1628';
const LINE_WIDTH = 2.6;
const TRIM_PADDING = 8;

const Canvas = styled.canvas`
  display: block;
  width: 100%;
  height: 220px;
  border: 2px dashed ${({ theme }) => theme.colors.gray300};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.white};
  touch-action: none;
  cursor: crosshair;
`;

/** Crops the drawing to its ink bounds so it scales nicely into the signature box. */
function trimmedDataUrl(canvas) {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  const { data } = ctx.getImageData(0, 0, width, height);
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * 4 + 3] > 0) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return null;

  const out = document.createElement('canvas');
  out.width = maxX - minX + 1 + TRIM_PADDING * 2;
  out.height = maxY - minY + 1 + TRIM_PADDING * 2;
  out.getContext('2d').drawImage(canvas, minX - TRIM_PADDING, minY - TRIM_PADDING, out.width, out.height, 0, 0, out.width, out.height);
  return out.toDataURL('image/png');
}

/**
 * Freehand signature canvas (mouse, touch, pen).
 * ref API: clear(), isEmpty(), toDataUrl(), drawText(text)
 */
export default function SignaturePad({ ref, id, onInkChange, label }) {
  const canvasRef = useRef(null);
  const lastPoint = useRef(null);
  const hasInk = useRef(false);

  const setInk = useCallback(
    (value) => {
      if (hasInk.current === value) return;
      hasInk.current = value;
      onInkChange?.(value);
    },
    [onInkChange]
  );

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);
    const ctx = canvas.getContext('2d');
    ctx.scale(ratio, ratio);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = LINE_WIDTH;
    ctx.strokeStyle = INK;
    ctx.fillStyle = INK;
    setInk(false);
  }, [setInk]);

  // ResizeObserver also fires when the canvas first becomes visible (e.g. inside a <dialog>).
  useEffect(() => {
    let lastWidth = 0;
    const handleWidth = (width) => {
      if (width && width !== lastWidth) {
        lastWidth = width;
        resize();
      }
    };
    handleWidth(Math.round(canvasRef.current.getBoundingClientRect().width));
    const observer = new ResizeObserver(([entry]) => handleWidth(Math.round(entry.contentRect.width)));
    observer.observe(canvasRef.current);
    return () => observer.disconnect();
  }, [resize]);

  const pointFrom = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const handlePointerDown = useCallback(
    (event) => {
      event.preventDefault();
      canvasRef.current.setPointerCapture(event.pointerId);
      const point = pointFrom(event);
      const ctx = canvasRef.current.getContext('2d');
      ctx.beginPath();
      ctx.arc(point.x, point.y, LINE_WIDTH / 2, 0, Math.PI * 2);
      ctx.fill();
      lastPoint.current = point;
      setInk(true);
    },
    [setInk]
  );

  const handlePointerMove = useCallback((event) => {
    if (!lastPoint.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const point = pointFrom(event);
    const mid = { x: (lastPoint.current.x + point.x) / 2, y: (lastPoint.current.y + point.y) / 2 };
    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.quadraticCurveTo(lastPoint.current.x, lastPoint.current.y, mid.x, mid.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    lastPoint.current = point;
  }, []);

  const handlePointerUp = useCallback(() => {
    lastPoint.current = null;
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      clear: resize,
      isEmpty: () => !hasInk.current,
      toDataUrl: () => trimmedDataUrl(canvasRef.current),
      /** Typed-signature alternative (keyboard / assistive tech users). */
      drawText: (text) => {
        resize();
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const ctx = canvas.getContext('2d');
        ctx.direction = 'rtl';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = "italic 600 44px Heebo, Arial, sans-serif";
        ctx.fillText(text, rect.width / 2, rect.height / 2, rect.width - 24);
        setInk(Boolean(text.trim()));
      },
    }),
    [resize, setInk]
  );

  return (
    <Canvas
      ref={canvasRef}
      id={id}
      role="img"
      aria-label={label}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    />
  );
}
