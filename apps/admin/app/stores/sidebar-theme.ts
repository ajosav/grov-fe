import {createStore} from '@grov/store';

/**
 * Sidebar themes. Each one re-scopes the colour tokens of the console frame,
 * the sidebar and the top bar (see `[data-sidebar-theme]` in app.css), text and
 * accent included. Page content keeps the admin's light or dark mode. Default follows that mode; the others look the
 * same in both.
 */
export const SIDEBAR_THEMES = [
  {id: 'default', name: 'Default', note: 'Follows light or dark mode', mode: null},
  {id: 'grey', name: 'Grey', note: 'Cool grey, slate text', mode: 'light'},
  {id: 'lavender', name: 'Lavender', note: 'Soft violet, violet accent', mode: 'light'},
  {id: 'night', name: 'Night', note: 'The brand’s dark canvas', mode: 'dark'},
  {id: 'ember', name: 'Ember', note: 'Deep brown, flame accent', mode: 'dark'},
  {id: 'forest', name: 'Forest', note: 'Deep green, leaf accent', mode: 'dark'},
  {id: 'ocean', name: 'Ocean', note: 'Deep blue, sky accent', mode: 'dark'},
] as const;

export type SidebarThemeId = (typeof SIDEBAR_THEMES)[number]['id'];

const known = new Set<string>(SIDEBAR_THEMES.map(t => t.id));

interface SidebarThemeState {
  theme: SidebarThemeId;
  setTheme: (theme: SidebarThemeId) => void;
}

/** Per browser for now. Move to the admin's profile when grov-be stores admin preferences. */
export const useSidebarThemeStore = createStore<SidebarThemeState>(
  set => ({theme: 'default', setTheme: theme => set({theme})}),
  {persist: {storage: 'local', key: 'admin.sidebar-theme', partialize: s => ({theme: s.theme})}}
);

/** The saved theme, falling back to Default if storage holds a theme that no longer exists. */
export function useSidebarTheme(): [SidebarThemeId, (theme: SidebarThemeId) => void] {
  const theme = useSidebarThemeStore(s => s.theme);
  const setTheme = useSidebarThemeStore(s => s.setTheme);
  return [known.has(theme) ? theme : 'default', setTheme];
}

/**
 * Attributes for a themed element. `data-theme` re-applies the design-system
 * tokens for the theme's mode inside it, so brand changes reach every theme;
 * Default sets nothing and inherits the page.
 */
export function sidebarThemeProps(theme: SidebarThemeId): {
  'data-sidebar-theme'?: string;
  'data-theme'?: 'light' | 'dark';
} {
  const found = SIDEBAR_THEMES.find(t => t.id === theme);
  if (!found || found.mode === null) return {};
  return {'data-sidebar-theme': found.id, 'data-theme': found.mode};
}
