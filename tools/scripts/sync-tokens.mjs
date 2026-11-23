/**
 * Copies the Grov design tokens into @grov/ui.
 *
 * Source of truth: ../requirements/design/system/tokens.json, compiled by
 * design/tools/gen_tailwind_css.py into tokens.css (CSS variables, light + dark)
 * and tailwind.css (Tailwind v4 theme + shadcn aliases). Never edit the copies
 * in libs/ui by hand: change tokens.json, regenerate, then run `yarn sync:tokens`.
 */
import {readFileSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const source = resolve(root, process.env.GROV_DESIGN_DIR ?? '../requirements/design/system');
const target = resolve(root, 'libs/ui/src/lib/styles');

const banner = from =>
  `/* Copied from ${from} by \`yarn sync:tokens\`. Do not edit: change tokens.json and re-sync. */\n`;

const tokens = readFileSync(resolve(source, 'tokens.css'), 'utf8');
writeFileSync(resolve(target, 'tokens.css'), banner('design/system/tokens.css') + tokens);

// tailwind.css starts with `@import "tailwindcss";`; @grov/ui/styles.css imports Tailwind once itself.
const theme = readFileSync(resolve(source, 'tailwind.css'), 'utf8').replace(
  /^@import\s+["']tailwindcss["'];\s*$/m,
  ''
);
writeFileSync(resolve(target, 'theme.css'), banner('design/system/tailwind.css') + theme);

console.log(`Synced tokens from ${source}`);
