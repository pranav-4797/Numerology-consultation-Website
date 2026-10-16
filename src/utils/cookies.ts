/**
 * Client-side Cookie & Storage Utilities for Divya Urja
 * Manages persistent user preferences, consent, and session tokens.
 */

export const COOKIE_CONSENT_KEY = 'divyaurja_cookie_consent';
export const COOKIE_LANG_KEY = 'divyaurja_lang';
export const COOKIE_RECENT_PRODUCTS_KEY = 'divyaurja_recent_products';
export const COOKIE_CACHE_ENABLED_KEY = 'divyaurja_cache_enabled';

/**
 * Sets a client cookie with a given name, value, and expiration in days.
 */
export function setCookie(name: string, value: string, days = 365, path = '/'): void {
  if (typeof document === 'undefined') return;
  try {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    const secure = window.location.protocol === 'https:' ? ';Secure' : '';
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=${path};SameSite=Lax${secure}`;
  } catch (err) {
    console.warn('Could not set cookie:', err);
  }
}

/**
 * Gets a cookie value by name. Returns null if not found or running on server.
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  try {
    const nameEQ = `${encodeURIComponent(name)}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1);
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length));
      }
    }
  } catch (err) {
    console.warn('Could not read cookie:', err);
  }
  return null;
}

/**
 * Deletes a cookie by setting its expiration date in the past.
 */
export function deleteCookie(name: string, path = '/'): void {
  if (typeof document === 'undefined') return;
  try {
    document.cookie = `${encodeURIComponent(name)}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path}`;
  } catch (err) {
    console.warn('Could not delete cookie:', err);
  }
}

/**
 * Checks if the user has recorded a cookie & caching consent preference.
 */
export function getCookieConsent(): 'all' | 'essential' | null {
  const cookieVal = getCookie(COOKIE_CONSENT_KEY);
  if (cookieVal === 'all' || cookieVal === 'essential') return cookieVal;

  if (typeof localStorage !== 'undefined') {
    try {
      const localVal = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (localVal === 'all' || localVal === 'essential') return localVal;
    } catch {
      // ignore
    }
  }
  return null;
}

/**
 * Records user consent preference in both cookie and localStorage for high durability.
 */
export function setCookieConsent(preference: 'all' | 'essential'): void {
  setCookie(COOKIE_CONSENT_KEY, preference, 365);
  setCookie(COOKIE_CACHE_ENABLED_KEY, preference === 'all' ? '1' : '0', 365);

  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, preference);
      localStorage.setItem(COOKIE_CACHE_ENABLED_KEY, preference === 'all' ? '1' : '0');
    } catch {
      // ignore
    }
  }
}
