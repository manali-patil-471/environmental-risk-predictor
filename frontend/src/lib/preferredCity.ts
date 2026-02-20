const PREFERRED_CITY_KEY = 'preferred_city';
const PREFERRED_CITY_EVENT = 'preferred-city-changed';

export function getPreferredCity(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(PREFERRED_CITY_KEY) || '';
}

export function setPreferredCity(city: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PREFERRED_CITY_KEY, city);
  window.dispatchEvent(new Event(PREFERRED_CITY_EVENT));
}

export function onPreferredCityChange(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = () => callback();
  window.addEventListener(PREFERRED_CITY_EVENT, handler);
  window.addEventListener('storage', handler);

  return () => {
    window.removeEventListener(PREFERRED_CITY_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}
