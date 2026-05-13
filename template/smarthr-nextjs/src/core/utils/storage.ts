// Client-side storage utilities with fallback for SSR
type StorageType = 'local' | 'session';

const isBrowser = typeof window !== 'undefined';

export const getStorage = (type: StorageType = 'local'): Storage | null => {
  if (!isBrowser) return null;
  try {
    return type === 'local' ? window.localStorage : window.sessionStorage;
  } catch (e) {
    console.warn('Storage is not available', e);
    return null;
  }
};

export const getItem = (key: string, type: StorageType = 'local'): string | null => {
  if (!isBrowser) return null;
  try {
    const storage = getStorage(type);
    return storage?.getItem(key) || null;
  } catch (e) {
    console.warn(`Error reading ${key} from ${type}Storage`, e);
    return null;
  }
};

export const setItem = (key: string, value: string, type: StorageType = 'local'): void => {
  if (!isBrowser) return;
  try {
    const storage = getStorage(type);
    storage?.setItem(key, value);
  } catch (e) {
    console.warn(`Error setting ${key} in ${type}Storage`, e);
  }
};

// Cookie fallback for SSR
export const getCookie = (name: string): string | null => {
  if (!isBrowser) return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

export const setCookie = (name: string, value: string, days = 365): void => {
  if (!isBrowser) return;
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
};
