export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char] || char);
}

export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function sanitizeSubdomain(subdomain: string): string {
  return subdomain
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^-+|-+$/g, '')
    .slice(0, 63);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateAndLimitArray<T>(
  arr: unknown,
  maxLength: number = 100
): T[] {
  if (!Array.isArray(arr)) {
    return [];
  }
  return arr.slice(0, maxLength) as T[];
}

export function parseJsonSafely<T>(
  jsonString: string,
  fallback: T
): T {
  try {
    const parsed = JSON.parse(jsonString);
    return parsed as T;
  } catch {
    return fallback;
  }
}

export function validateNumberInRange(
  value: unknown,
  min: number,
  max: number,
  defaultValue: number
): number {
  const num = typeof value === 'number' ? value : Number(value);
  if (isNaN(num) || num < min || num > max) {
    return defaultValue;
  }
  return num;
}
