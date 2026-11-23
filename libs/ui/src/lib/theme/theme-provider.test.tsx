import {act, render, screen} from '@testing-library/react';

import {ThemeToggle} from '../components/theme-toggle';
import {ThemeProvider} from './theme-provider';
import {THEME_STORAGE_KEY} from './theme-script';

describe('ThemeProvider', () => {
  it('applies the stored preference to <html> and saves changes', async () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    const onChange = vi.fn();
    render(
      <ThemeProvider onPreferenceChange={onChange}>
        <ThemeToggle />
      </ThemeProvider>
    );
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    await act(async () => screen.getByRole('radio', {name: 'Light'}).click());
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    expect(onChange).toHaveBeenCalledWith('light');
  });
});
