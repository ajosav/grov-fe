# Data: endpoints, query hooks, cache, errors

_Part of the `frontend` skill. **[enforced]** = checked by ESLint, `check:arch`, typecheck, hooks or CI._

## The stack

`@grov/api` endpoint function → `@grov/hooks` hook → component.

- Only `@grov/api` talks HTTP: no `axios` import or `fetch()` elsewhere **[enforced: `check:arch` http-client]**.
- Only `@grov/hooks` calls `useQuery` / `useMutation` / `useInfiniteQuery` **[enforced: `check:arch` query-hooks]**. Components import the hook.
- Request and response types come from `@grov/models`, which aliases the generated OpenAPI types (`schemas.ts`). Never hand-write a type the spec describes; run `yarn generate:api-types` when grov-be exports a new spec.

The client (`createApiClient`) already: sends `X-Client: web` + credentials (cookies), echoes the CSRF cookie on unsafe methods, unwraps the envelope, turns every failure into `ApiError`, and on a 401 runs one shared refresh then retries once (`auth.md`). Don't re-implement any of it.

## Add a resource

```bash
yarn generate:api-types                                  # if the entity type is new
yarn gen:resource orders --entity Order                  # /v1/orders
yarn gen:resource price-markups --entity PriceMarkup --admin   # /v1/admin/..., keys under 'admin'
```

The generator writes `endpoints/<name>.ts`, query keys, `createApi` wiring, `hooks/lib/api/<name>.ts` and the type alias. Then fill the endpoint functions from the spec:

```ts
export function ordersApi(client: ApiClient) {
  return {
    list: (cursor?: string) =>
      client.requestEnvelope<Order[]>({method: 'get', url: '/v1/orders', params: {cursor}}),
    get: (id: string) => client.request<Order>({method: 'get', url: `/v1/orders/${id}`}),
    cancel: (id: string, body: CancelOrderBody) =>
      client.request<Order>({method: 'post', url: `/v1/orders/${id}/cancel`, data: body}),
  };
}
```

- `request` returns `data`; `requestEnvelope` keeps `meta` (pagination).
- URLs are literal paths from the spec; ids are interpolated, never concatenated from user input without encoding (`encodeURIComponent` for free text).
- Request bodies are typed with `RequestBody<'/v1/…', 'post'>` aliases.

## Query keys

Arrays, one factory per resource in `query-keys.ts`, shaped so a prefix invalidates the family: `orders.all`, `orders.list`, `orders.detail(id)`. Admin resources start with `'admin'` so switching store invalidates them. Never inline a key array in a hook.

## Hooks

```ts
export function useCancelOrder() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({id, body}: {id: string; body: CancelOrderBody}) => api.orders.cancel(id, body),
    onSuccess: async order => {
      queryClient.setQueryData(queryKeys.orders.detail(order.id), order);
      await queryClient.invalidateQueries({queryKey: queryKeys.orders.list});
    },
  });
}
```

- After a mutation, update or invalidate exactly the keys it changes (set the returned resource, invalidate lists). A stale screen after a mutation is a bug.
- Optimistic updates only for low-risk toggles; never for money, orders or payments.
- Lists are cursor-paginated: `useInfiniteQuery` + `meta.nextCursor`. Never offset pages.
- `staleTime`: default 30 s; reference data (config, permission catalogue) longer; balances, baskets and checkout previews `0`.
- `enabled` for queries that need an id or an open dialog. Don't fetch what isn't on screen.
- `useMe()` is the only source of "signed in", gates and access; it resolves to `null` when signed out.

## Money and server-owned values

The server computes totals, prices, fees, balances and states. Display what the API returns with `<Money kobo>` / `formatNaira`; never add up lines to show a total, never derive a status. Checkout sends the previewed total and basket version back exactly as received (D66).

## Idempotency

When grov-be requires `Idempotency-Key` on a POST (orders, payments, top-ups, refunds), create one key per user intent (`crypto.randomUUID()` when the user starts the action, kept in the mutation variables) and reuse it on retry. Never generate it inside `mutationFn`.

## Errors and copy

- Every failure is an `ApiError {status, code, fieldErrors, params}`. Branch on `code` (`ErrorCode` in `@grov/models`).
- User copy comes from `errorMessage(error)` (`@grov/shared`); add a code there when a screen needs specific words. Never render `error.message` (developer text from the server).
- Field errors → `error.fieldError('phone')` → `form.setError` (`forms.md`).
- Network and 5xx are retried by TanStack Query for queries (twice); mutations are never auto-retried.

## Realtime

Not wired yet. When grov-be's SSE stream is added, events update or invalidate the query cache in one provider; components keep reading hooks.
