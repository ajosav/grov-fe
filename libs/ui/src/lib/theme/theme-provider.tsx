import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {type ResolvedTheme, ThemePreference} from '@grov/models';

import {THEME_STORAGE_KEY} from './theme-script';

interface ThemeContextValue {
  /** What the person chose: light, dark or follow the device. */
  preference: ThemePreference;
  /** What is on screen now. */
  resolved: ResolvedTheme;
  /**
   * Change the theme. `notify: false` skips `onPreferenceChange`, e.g. when
   * applying the theme saved on the account so it is not written back.
   */
  setPreference: (preference: ThemePreference, options?: {notify?: boolean}) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const isPreference = (value: unknown): value is ThemePreference =>
  value === 'light' || value === 'dark' || value === 'system';

function readStored(): ThemePreference {
  if (typeof window === 'undefined') return ThemePreference.SYSTEM;
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isPreference(stored) ? stored : ThemePreference.SYSTEM;
  } catch {
    return ThemePreference.SYSTEM;
  }
}

function systemTheme(): ResolvedTheme {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function apply(theme: ResolvedTheme): void {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
}

export interface ThemeProviderProps {
  children: ReactNode;
  /**
   * Called when the person picks a theme, e.g. to save it on their account
   * (`PATCH /v1/me {theme}`), so it follows them to other devices.
   */
  onPreferenceChange?: (preference: ThemePreference) => void;
}

export function ThemeProvider({children, onPreferenceChange}: ThemeProviderProps) {
  const [preference, setPreferenceState] = useState<ThemePreference>(readStored);
  const [system, setSystem] = useState<ResolvedTheme>(systemTheme);
  const resolved: ResolvedTheme = preference === 'system' ? system : preference;

  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setSystem(query.matches ? 'dark' : 'light');
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  useEffect(() => apply(resolved), [resolved]);

  const setPreference = useCallback(
    (next: ThemePreference, options: {notify?: boolean} = {}) => {
      setPreferenceState(next);
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // Private mode or storage full: the choice still applies for this visit.
      }
      if (options.notify !== false) onPreferenceChange?.(next);
    },
    [onPreferenceChange]
  );

  const value = useMemo(
    () => ({preference, resolved, setPreference}),
    [preference, resolved, setPreference]
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside <ThemeProvider>');
  return context;
}
