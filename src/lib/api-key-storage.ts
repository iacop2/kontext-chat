const API_KEY_STORAGE_KEY = 'fal-api-key';

export function getStoredApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(API_KEY_STORAGE_KEY);
}

export function setStoredApiKey(apiKey: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
  window.dispatchEvent(new Event('apiKeyChanged'));
}

export function removeStoredApiKey(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(API_KEY_STORAGE_KEY);
  window.dispatchEvent(new Event('apiKeyChanged'));
}

export function validateApiKey(apiKey: string): boolean {
  // Basic validation for FAL API key format
  return apiKey.length > 0 && apiKey.trim().length > 0;
}