import { cookies } from 'next/headers';

export const getCookie = async (name: string): Promise<string> => {
  if (typeof window === 'undefined') {
    const cookieStore = cookies();
    return (await cookieStore).get(name)?.value || '';
  }
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
  return '';
};

export const setCookie = async (name: string, value: string, days = 365): Promise<void> => {
  if (typeof window === 'undefined') return;
  
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
};
