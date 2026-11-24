import {readdirSync, readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';

import {SIDEBAR_THEMES} from './sidebar-theme';

/**
 * Keeps the admin in step with the design system. The admin adds a type scale
 * and sidebar themes on top of @grov/ui; these checks fail when a brand or token
 * change would leave them behind (renamed tokens, a theme that hard-codes the
 * brand accent, contrast that a new brand colour breaks).
 */
// Vitest provides __dirname; jsdom's import.meta.url is not a file URL.
const read = (path: string) => readFileSync(join(__dirname, path), 'utf8');
const adminCss = read('../app.css');
const stylesDir = join(__dirname, '../../../../libs/ui/src/lib/styles');
// Every stylesheet of the design system (tokens, theme, brand overrides …).
const uiStyles = readdirSync(stylesDir)
  .filter(name => name.endsWith('.css'))
  .map(name => readFileSync(join(stylesDir, name), 'utf8'))
  .join('\n');
const tokensCss = read('../../../../libs/ui/src/lib/styles/tokens.css');

type Vars = Record<string, string>;

function block(css: string, selector: string): string {
  const start = css.indexOf(selector);
  if (start < 0) throw new Error(`no block for ${selector}`);
  const open = css.indexOf('{', start);
  return css.slice(open + 1, css.indexOf('}', open));
}

function vars(body: string): Vars {
  return Object.fromEntries(
    [...body.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(m => [m[1] ?? '', (m[2] ?? '').trim()])
  );
}

const brand = {
  light: vars(block(tokensCss, ':root, [data-theme="light"]')),
  dark: vars(block(tokensCss, '[data-theme="dark"], .dark')),
};

const themeBlock = (id: string) => vars(block(adminCss, `[data-sidebar-theme='${id}']`));

function resolve(name: string, scope: Vars, depth = 0): string {
  const value = scope[name];
  if (!value || depth > 8) throw new Error(`--${name} is not defined`);
  const ref = /^var\(--([\w-]+)\)$/.exec(value);
  return ref?.[1] ? resolve(ref[1], scope, depth + 1) : value;
}

function luminance(hex: string): number {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map(i => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return ((hi ?? 0) + 0.05) / ((lo ?? 0) + 0.05);
}

describe('admin design contract', () => {
  it('only overrides tokens the design system defines', () => {
    const defined = new Set([...uiStyles.matchAll(/--([\w-]+):/g)].map(m => m[1]));
    const overridden = new Set([...adminCss.matchAll(/--([\w-]+):/g)].map(m => m[1]));
    const unknown = [...overridden].filter(name => !defined.has(name));
    expect(unknown, 'renamed or removed in @grov/ui: update apps/admin/app/app.css').toEqual([]);
  });

  it('keeps the brand fonts (only sizes and weights change)', () => {
    expect(adminCss).not.toMatch(/(?:^|[\s;{])--font-[\w-]+\s*:|font-family\s*:/m);
  });

  it('has one CSS block per sidebar theme', () => {
    const inCss = [...adminCss.matchAll(/\[data-sidebar-theme='([\w-]+)'\]/g)].map(m => m[1]);
    const themed = SIDEBAR_THEMES.filter(t => t.mode !== null).map(t => t.id);
    expect(new Set(inCss)).toEqual(new Set(themed));
  });

  it('builds Night only from brand tokens', () => {
    expect(block(adminCss, "[data-sidebar-theme='night']")).not.toMatch(/#[0-9a-f]{3,8}/i);
  });

  it('takes the accent from the brand in Grey, Night and Ember', () => {
    for (const id of ['grey', 'night', 'ember']) {
      const own = Object.keys(themeBlock(id));
      expect(
        own.filter(n => /^(flame|on-bright)/.test(n)),
        id
      ).toEqual([]);
    }
  });

  describe.each(
    [
      ...SIDEBAR_THEMES.filter(t => t.mode !== null).map(t => ({
        id: t.id,
        mode: t.mode as 'light' | 'dark',
      })),
      {id: 'default', mode: 'light' as const},
      {id: 'default', mode: 'dark' as const},
    ].map(t => [`${t.id} (${t.mode})`, t] as const)
  )('%s meets WCAG AA', (_, {id, mode}) => {
    // `data-theme` on the element re-applies the brand tokens for its mode, then
    // the theme overrides its own. Default's sidebar is the surface.
    const scope: Vars = {
      sidebar: 'var(--surface)',
      ...brand[mode],
      ...(id === 'default' ? {} : themeBlock(id)),
    };
    const c = (a: string, b: string) => contrast(resolve(a, scope), resolve(b, scope));

    it('text on the sidebar', () => expect(c('ink', 'sidebar')).toBeGreaterThanOrEqual(7));
    it('muted text on the sidebar', () =>
      expect(c('ink-muted', 'sidebar')).toBeGreaterThanOrEqual(4.5));
    it('muted text on a hover or active row', () =>
      expect(c('ink-muted', 'surface-sunken')).toBeGreaterThanOrEqual(4.5));
    it('accent icon on the active row', () =>
      expect(c('flame-strong', 'surface-sunken')).toBeGreaterThanOrEqual(3));
    it('Inbox count', () => expect(c('on-bright', 'flame')).toBeGreaterThanOrEqual(4.5));
  });
});
