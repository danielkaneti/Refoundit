import { useEffect, useState } from 'react';

/** Blob URL for in-memory bytes (e.g. a PNG from the API), revoked on change/unmount. */
export default function useObjectUrl(bytes, type) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!bytes) {
      setUrl(null);
      return undefined;
    }
    const next = URL.createObjectURL(new Blob([bytes], { type }));
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [bytes, type]);

  return url;
}
