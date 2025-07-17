import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateStringsInObject(obj: any, maxLength = 1000) {
  const seen = new WeakSet();

  function truncate(value: any): any {
    if (typeof value === 'string') {
      return value.length > maxLength
        ? value.slice(0, maxLength) + '... [truncated]'
        : value;
    } else if (Array.isArray(value)) {
      return value.map(truncate);
    } else if (value && typeof value === 'object') {
      if (seen.has(value)) return '[Circular]';
      seen.add(value);
      const result: Record<string, any> = {};
      for (const key in value) {
        result[key] = truncate(value[key]);
      }
      return result;
    }
    return value;
  }

  return truncate(obj);
}