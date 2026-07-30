/**
 * Safe string utilities to prevent "Cannot read properties of undefined" errors
 */

/**
 * Safely slice a string without throwing errors if undefined/null
 */
export const safeSlice = (str: string | undefined | null, length: number = 8): string => {
  if (!str) return '';
  return str.slice(0, length);
};

/**
 * Safely convert to uppercase
 */
export const safeToUpperCase = (str: string | undefined | null): string => {
  if (!str) return '';
  return str.toUpperCase();
};

/**
 * Safely get initials from a name
 */
export const getSafeInitials = (name: string | undefined | null): string => {
  if (!name) return 'U';
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Safely format a UUID for display
 */
export const formatId = (id: string | undefined | null, prefix: string = '', length: number = 8): string => {
  if (!id) return `${prefix}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const shortId = safeSlice(id, length);
  return `${prefix}${safeToUpperCase(shortId)}`;
};