export function openCookiePreferences() {
  window.dispatchEvent(new Event("open-cookie-preferences"));
}