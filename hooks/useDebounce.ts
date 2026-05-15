import { useEffect, useState } from "react";

/**
 * Debounces a value by the given delay (ms).
 * Use this for search inputs to avoid firing an API call on every keystroke.
 *
 * @example
 * const debouncedSearch = useDebounce(search, 400);
 * useEffect(() => { fetchResults(debouncedSearch); }, [debouncedSearch]);
 */
export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
