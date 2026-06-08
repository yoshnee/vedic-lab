/* ============================================================
   useDebounce — returns `value` after it has stopped changing for
   `delayMs`. Used to throttle the place-search API to ~one request per
   typing pause. The effect cleanup clears the pending timer on every
   change and on unmount, so no state update lands after unmount.
   ============================================================ */
import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
