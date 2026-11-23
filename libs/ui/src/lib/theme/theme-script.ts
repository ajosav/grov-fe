import {appConfig} from '@grov/models';

/** localStorage key for the theme preference on this browser. */
export const THEME_STORAGE_KEY = `${appConfig.cookiePrefix}.theme`;

/**
 * Inline script for `<head>`: applies the stored or OS theme before first paint
 * so dark-mode users never see a light flash. Keep it tiny and dependency-free.
 */
export const themeInitScript = `(function(){try{var p=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY
)})||'system';var d=p==='dark'||(p!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;r.dataset.theme=d?'dark':'light';r.classList.toggle('dark',d);r.style.colorScheme=d?'dark':'light';}catch(e){}})();`;
