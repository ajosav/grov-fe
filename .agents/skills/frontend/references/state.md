# Client state: component state, stores, URL

_Part of the `frontend` skill. **[enforced]** = checked by ESLint, `check:arch`, typecheck, hooks or CI._

Pick the smallest home that works:

| State                                                                                     | Home                                                                              |
| ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Anything from the API                                                                     | TanStack Query via `@grov/hooks` (`data.md`) — never copied into state or a store |
| One component (open/closed, input draft, hover)                                           | `useState` / `useReducer`                                                         |
| A form                                                                                    | react-hook-form (`forms.md`)                                                      |
| Filters, tabs, search, selected item, page cursor that should survive reload or be shared | URL search params (`useSearchParams`)                                             |
| Shared by several screens of one flow, client-only (sign-in steps, a multi-step wizard)   | a Zustand store in `@grov/store`                                                  |
| App-wide dependency (API client, theme, query client)                                     | context from a provider in `AppProviders`                                         |

## Stores

```ts
export const usePlanSetupStore = createStore<PlanSetupState>(
  set => ({
    step: 0,
    answers: {},
    next: () => set(s => ({step: s.step + 1})),
    reset: () => set({step: 0, answers: {}}),
  }),
  {persist: {storage: 'session', key: 'plan-setup', partialize: ({answers}) => ({answers})}}
);
```

- Create stores with `createStore` from `@grov/store`; it namespaces persisted keys with the cookie prefix. Direct `localStorage`/`sessionStorage` use is limited to the known owners (theme, device id, `createStore`) **[enforced: `check:arch` storage-access]**.
- Persist only what must survive a reload, with `partialize`. `session` for a flow, `local` for a preference.
- Never persist tokens, tickets, server data or PII beyond what the flow needs (the sign-in store keeps the email for the tab, the registration ticket in memory only) — `security.md`.
- Select narrowly: `useSignInStore(s => s.email)`, not the whole store.
- Every store has a `reset`, called when the flow finishes or the person signs out.

## Derived state

Compute it during render (or `useMemo` when it's expensive). Don't mirror props or query data into `useState` with an effect.

## Effects

`useEffect` is for synchronising with something outside React (DOM APIs, subscriptions, timers). Not for fetching (hooks do that), not for deriving state, not for responding to events (use the handler). Every effect cleans up what it starts **[enforced: react-hooks rules]**.
