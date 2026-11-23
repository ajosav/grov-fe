/**
 * Architecture rules that ESLint can't express. Runs in the pre-push hook and CI
 * (`yarn check:arch`). Every rule names the reference in the frontend skill
 * (.agents/skills/frontend/references) that explains it.
 *
 * Change a rule only through a reviewed PR that also updates its reference
 * (CONTRIBUTING.md §6). AI agents never edit this file to get a check passing.
 *
 *   yarn check:arch
 */
import {existsSync, readdirSync, readFileSync, statSync} from 'node:fs';
import {basename, dirname, join, relative, sep} from 'node:path';

const ROOT = process.cwd();
const REFS = '.agents/skills/frontend/references';

const RULE_DOC: Record<string, string> = {
  'deep-import': 'layout.md',
  'lib-purity': 'layout.md',
  'file-naming': 'code-style.md',
  'env-access': 'code-style.md',
  'env-documented': 'tooling.md',
  'brand-literal': 'code-style.md',
  'http-client': 'data.md',
  'query-hooks': 'data.md',
  'permission-literal': 'auth.md',
  'storage-access': 'security.md',
  'token-colors': 'styling.md',
  'route-module': 'routing.md',
  'test-files': 'testing.md',
};

interface Violation {
  file: string;
  line: number;
  rule: string;
  message: string;
}
const violations: Violation[] = [];

const rel = (p: string): string => relative(ROOT, p).split(sep).join('/');

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap(name => {
    if (['node_modules', 'build', 'dist', '.react-router', 'generated', 'public'].includes(name)) {
      return [];
    }
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return /\.(ts|tsx)$/.test(name) ? [full] : [];
  });
}

function report(file: string, line: number, rule: string, message: string): void {
  violations.push({file: rel(file), line, rule, message});
}

const lineOf = (text: string, index: number): number => text.slice(0, index).split('\n').length;

/** Source with comments blanked (line numbers kept), so rules see code only. */
function stripComments(text: string): string {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
    .replace(
      /(^|[^:'"`])\/\/.*$/gm,
      (m, lead: string) => lead + ' '.repeat(m.length - lead.length)
    );
}

const IMPORT_RE =
  /(?:import|export)\s[^'"]*?from\s*['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)|import\s+['"]([^'"]+)['"]/g;

function importsOf(text: string): {specifier: string; line: number; clause: string}[] {
  return [...text.matchAll(IMPORT_RE)].map(m => ({
    specifier: m[1] ?? m[2] ?? m[3] ?? '',
    line: lineOf(text, m.index ?? 0),
    clause: m[0],
  }));
}

const isTest = (file: string) =>
  /\.test\.tsx?$/.test(file) || rel(file).startsWith('libs/test-utils/');
const project = (file: string): string => {
  const [area, name] = rel(file).split('/');
  return area === 'apps' || area === 'libs' ? `${area}/${name}` : (area ?? '');
};

const files = [...walk(join(ROOT, 'apps')), ...walk(join(ROOT, 'libs'))];

// Permission keys from the generated catalogue, to spot hand-typed keys.
const permissionFile = join(ROOT, 'libs/models/src/lib/permission-keys.generated.ts');
const permissionKeys = new Set(
  existsSync(permissionFile)
    ? [...readFileSync(permissionFile, 'utf8').matchAll(/\|\s*'([^']+)'/g)].map(m => m[1] ?? '')
    : []
);

const ALLOWED_DEEP = new Set(['@grov/ui/styles.css', '@grov/ui/tokens.css']);
const LIB_BANNED: Record<string, RegExp> = {
  'libs/models': /^(react|react-dom|react-router|@tanstack\/|axios|zustand|radix-ui)/,
  'libs/ui': /^(react-router|@tanstack\/|axios|zustand)/,
  'libs/api': /^(react-router|zustand|radix-ui)/,
  'libs/store': /^(react-router|@tanstack\/|axios|radix-ui)/,
};
const QUERY_HOOKS = /\b(useQuery|useMutation|useInfiniteQuery|useSuspenseQuery|useQueries)\b/;
const STORAGE_ALLOWED = new Set([
  'libs/ui/src/lib/theme/theme-provider.tsx',
  'libs/ui/src/lib/theme/theme-script.ts',
  'libs/api/src/lib/device.ts',
  'libs/store/src/lib/create-store.ts',
]);

for (const file of files) {
  const r = rel(file);
  const raw = readFileSync(file, 'utf8');
  const code = stripComments(raw);
  const proj = project(file);
  const test = isTest(file);

  // file-naming: kebab-case files (React Router's root/routes and type files excepted)
  const name = basename(file);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*(\.[a-z0-9-]+)*\.(ts|tsx)$/.test(name) && !r.includes('/+types/')) {
    report(file, 1, 'file-naming', `"${name}" is not kebab-case`);
  }

  for (const {specifier, line, clause} of importsOf(code)) {
    // deep-import: libraries are used through their public index only
    if (/^@grov\/[^/]+\/.+/.test(specifier) && !ALLOWED_DEEP.has(specifier)) {
      report(
        file,
        line,
        'deep-import',
        `import "${specifier}" through "@grov/${specifier.split('/')[1]}"`
      );
    }
    if (specifier.startsWith('.') && /(^|\/)\.\.\/(\.\.\/)*(libs|apps)\//.test(specifier)) {
      report(
        file,
        line,
        'deep-import',
        `relative import "${specifier}" crosses a project; use @grov/<lib>`
      );
    }
    // lib-purity: what each lib may not depend on (third-party side of the Nx boundaries)
    const banned = LIB_BANNED[proj];
    if (banned && !test && banned.test(specifier)) {
      report(file, line, 'lib-purity', `${proj} may not import "${specifier}"`);
    }
    // http-client: only @grov/api talks HTTP
    if (specifier === 'axios' && proj !== 'libs/api') {
      report(file, line, 'http-client', 'only @grov/api may import axios');
    }
    // query-hooks: server state hooks live in @grov/hooks
    if (
      specifier === '@tanstack/react-query' &&
      QUERY_HOOKS.test(clause) &&
      proj !== 'libs/hooks' &&
      !test
    ) {
      report(
        file,
        line,
        'query-hooks',
        'useQuery/useMutation belong in @grov/hooks; import the hook from there'
      );
    }
  }

  // http-client: no fetch() outside @grov/api
  for (const m of code.matchAll(/\bfetch\s*\(/g)) {
    if (proj !== 'libs/api' && !test)
      report(file, lineOf(code, m.index ?? 0), 'http-client', 'use @grov/api, not fetch()');
  }

  // env-access: VITE_* read in one place
  for (const m of code.matchAll(/import\.meta\.env|process\.env/g)) {
    if (r !== 'libs/models/src/lib/config.ts' && !r.endsWith('.config.ts') && !test) {
      report(
        file,
        lineOf(code, m.index ?? 0),
        'env-access',
        `read configuration through appConfig (@grov/models), not ${m[0]}`
      );
    }
  }

  // brand-literal: the product name is configuration (D65). Exempt: the config
  // default itself, and the website (marketing copy and wordmark).
  if (!proj.startsWith('apps/website') && r !== 'libs/models/src/lib/config.ts') {
    const withoutImports = code.replace(/@grov\//g, '@x/');
    for (const m of withoutImports.matchAll(/['"`>][^'"`<\n]*\bgrov\b[^'"`<\n]*/gi)) {
      report(
        file,
        lineOf(code, m.index ?? 0),
        'brand-literal',
        'use appConfig.brandName instead of the product name'
      );
    }
  }

  // permission-literal: use PERMISSIONS.*, never a typed key
  if (r !== rel(permissionFile) && !test) {
    for (const m of code.matchAll(/['"`]([a-z][a-z0-9-]*(?:\.[a-z][a-z0-9-]*){1,3})['"`]/g)) {
      if (permissionKeys.has(m[1] ?? '')) {
        report(
          file,
          lineOf(code, m.index ?? 0),
          'permission-literal',
          `use PERMISSIONS.* instead of '${m[1]}'`
        );
      }
    }
  }

  // storage-access: browser storage only through the known owners
  for (const m of code.matchAll(/\b(localStorage|sessionStorage|document\.cookie\s*=)/g)) {
    if (
      !STORAGE_ALLOWED.has(r) &&
      !test &&
      !(proj === 'libs/api' && m[1]?.startsWith('document'))
    ) {
      report(
        file,
        lineOf(code, m.index ?? 0),
        'storage-access',
        `${m[1]} outside its owners; use createStore (@grov/store)`
      );
    }
  }

  // token-colors: no hex colours in class names or inline styles (website keeps its own CSS)
  if (!proj.startsWith('apps/website')) {
    for (const m of code.matchAll(
      /-\[#[0-9a-fA-F]{3,8}\]|:\s*['"]#[0-9a-fA-F]{3,8}['"]|\b(rgb|hsl)a?\(/g
    )) {
      report(
        file,
        lineOf(code, m.index ?? 0),
        'token-colors',
        'use a token (bg-surface, text-ink …), not a raw colour'
      );
    }
  }

  // test-files: tests sit next to the code as *.test.ts(x)
  if (/\.spec\.tsx?$/.test(name) || r.includes('/__tests__/')) {
    report(file, 1, 'test-files', 'name tests *.test.ts(x) and keep them next to the code');
  }
}

// route-module: every route file exists and has a default export
for (const app of ['app', 'admin', 'website']) {
  const routesFile = join(ROOT, 'apps', app, 'app/routes.ts');
  if (!existsSync(routesFile)) continue;
  const text = readFileSync(routesFile, 'utf8');
  for (const m of text.matchAll(/['"](routes\/[^'"]+\.tsx)['"]/g)) {
    const target = join(dirname(routesFile), m[1] ?? '');
    const line = lineOf(text, m.index ?? 0);
    if (!existsSync(target)) {
      report(routesFile, line, 'route-module', `${m[1]} does not exist`);
    } else if (!/export default\b/.test(readFileSync(target, 'utf8'))) {
      report(target, 1, 'route-module', 'route modules have a default export (the page component)');
    }
  }
}

// env-documented: every VITE_* variable read in config is in .env.example
const config = join(ROOT, 'libs/models/src/lib/config.ts');
const example = existsSync(join(ROOT, '.env.example'))
  ? readFileSync(join(ROOT, '.env.example'), 'utf8')
  : '';
if (existsSync(config)) {
  const text = readFileSync(config, 'utf8');
  for (const m of text.matchAll(/env\.(VITE_[A-Z0-9_]+)/g)) {
    if (!new RegExp(`^${m[1]}=`, 'm').test(example)) {
      report(
        config,
        lineOf(text, m.index ?? 0),
        'env-documented',
        `${m[1]} is missing from .env.example`
      );
    }
  }
}

if (violations.length > 0) {
  for (const v of violations) {
    console.error(`${v.file}:${v.line}  [${v.rule}] ${v.message}  → ${REFS}/${RULE_DOC[v.rule]}`);
  }
  console.error(`\n✖ ${violations.length} architecture violation(s)`);
  process.exit(1);
}
console.log(`✓ architecture: ${files.length} files, ${Object.keys(RULE_DOC).length} rules`);
