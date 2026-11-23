/**
 * Scaffolds a data resource the way references/data.md describes: endpoint
 * functions in @grov/api, query keys, query/mutation hooks in @grov/hooks and the
 * type alias in @grov/models. Never hand-roll this wiring.
 *
 *   yarn gen:resource orders --entity Order            # /v1/orders
 *   yarn gen:resource price-markups --entity PriceMarkup --admin   # /v1/admin/price-markups
 *
 * Then: fill in the endpoint functions from the OpenAPI spec, delete what you
 * don't need, and add tests. Run `yarn generate:api-types` first if the entity
 * type is new.
 */
import {existsSync, readFileSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';

const [name, ...rest] = process.argv.slice(2);
const flag = (key: string) => rest.includes(`--${key}`);
const option = (key: string) => {
  const i = rest.indexOf(`--${key}`);
  return i >= 0 ? rest[i + 1] : undefined;
};

if (!name || !/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name)) {
  console.error('Usage: yarn gen:resource <kebab-plural> --entity <Pascal> [--admin]');
  process.exit(1);
}
const entity = option('entity');
if (!entity || !/^[A-Z][A-Za-z0-9]*$/.test(entity)) {
  console.error('--entity <PascalCase> is required (the OpenAPI schema name, e.g. Order)');
  process.exit(1);
}
const admin = flag('admin');

const ROOT = process.cwd();
const camel = name.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());
const pascal = camel.charAt(0).toUpperCase() + camel.slice(1);
const apiName = `${admin ? 'admin' + pascal : camel}Api`;
const key = admin ? `admin${pascal}` : camel;
const url = `/v1/${admin ? 'admin/' : ''}${name}`;
const fileName = admin ? `admin-${name}` : name;

const endpointFile = join(ROOT, 'libs/api/src/lib/endpoints', `${fileName}.ts`);
const hooksFile = join(ROOT, 'libs/hooks/src/lib/api', `${fileName}.ts`);
for (const file of [endpointFile, hooksFile]) {
  if (existsSync(file)) {
    console.error(`${file} already exists`);
    process.exit(1);
  }
}

function insert(file: string, marker: string, text: string): void {
  const path = join(ROOT, file);
  const source = readFileSync(path, 'utf8');
  const anchor = source.indexOf(marker);
  if (anchor < 0) throw new Error(`Marker "${marker}" not found in ${file}`);
  const lineStart = source.lastIndexOf('\n', anchor) + 1;
  writeFileSync(path, source.slice(0, lineStart) + text + source.slice(lineStart));
}

writeFileSync(
  endpointFile,
  `import type {${entity}} from '@grov/models';

import type {ApiClient} from '../client';

/** \`${url}\`. Fill in from the OpenAPI spec; delete what this resource doesn't have. */
export function ${apiName}(client: ApiClient) {
  return {
    list: (cursor?: string) =>
      client.requestEnvelope<${entity}[]>({method: 'get', url: '${url}', params: {cursor}}),
    get: (id: string) => client.request<${entity}>({method: 'get', url: \`${url}/\${id}\`}),
  };
}
export type ${apiName.charAt(0).toUpperCase() + apiName.slice(1)} = ReturnType<typeof ${apiName}>;
`
);

writeFileSync(
  hooksFile,
  `import {useInfiniteQuery, useQuery} from '@tanstack/react-query';

import {queryKeys, useApi} from '@grov/api';

/** Cursor-paginated list (references/data.md → Rules). */
export function use${pascal}() {
  const api = useApi();
  return useInfiniteQuery({
    queryKey: queryKeys.${key}.list,
    queryFn: ({pageParam}) => api.${key}.list(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: page => page.meta?.nextCursor ?? undefined,
  });
}

export function use${entity}(id: string) {
  const api = useApi();
  return useQuery({queryKey: queryKeys.${key}.detail(id), queryFn: () => api.${key}.get(id)});
}
`
);

const keys = `    ${key}: {
      all: [${admin ? `'admin', ` : ''}'${name}'] as const,
      list: [${admin ? `'admin', ` : ''}'${name}', 'list'] as const,
      detail: (id: string) => [${admin ? `'admin', ` : ''}'${name}', id] as const,
    },
`;
// Admin keys start with 'admin', so switching store invalidates them (useSwitchStore).
insert('libs/api/src/lib/query-keys.ts', '// gen:resource:keys', keys.replace(/^ {4}/gm, '  '));
insert(
  'libs/api/src/lib/api-provider.tsx',
  '// gen:resource:api',
  `    ${key}: endpoints.${apiName}(client),\n`
);
insert(
  'libs/api/src/lib/endpoints/index.ts',
  '// gen:resource:exports',
  `export * from './${fileName}';\n`
);
insert(
  'libs/hooks/src/index.ts',
  '// gen:resource:exports',
  `export * from './lib/api/${fileName}';\n`
);

const schemas = readFileSync(join(ROOT, 'libs/models/src/lib/schemas.ts'), 'utf8');
const generated = readFileSync(join(ROOT, 'libs/models/src/lib/generated/api.ts'), 'utf8');
if (!new RegExp(`type ${entity}\\b`).test(schemas)) {
  insert(
    'libs/models/src/lib/schemas.ts',
    '// gen:resource:types',
    `export type ${entity} = Schemas['${entity}'];\n`
  );
}
if (!new RegExp(`\\b${entity}: \\{`).test(generated)) {
  console.warn(
    `! ${entity} is not in the OpenAPI types yet. Run \`yarn generate:api-types\` after grov-be exports it.`
  );
}

console.log(`Created ${fileName}: endpoints, query keys, hooks and the ${entity} type alias.
Next: fill in the endpoints from the spec, add mutations with cache updates, write tests, run \`yarn format\`.`);
