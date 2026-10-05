import { useMemo } from 'react';

const TOKEN_RE = /^\/sign\/([A-Za-z0-9_-]{43})\/?$/;

/** Reads the signing token from /sign/<token>; null when malformed. */
export default function useSignToken() {
  return useMemo(() => window.location.pathname.match(TOKEN_RE)?.[1] ?? null, []);
}
