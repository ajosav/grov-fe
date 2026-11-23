import {create, type StateCreator} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';

import {appConfig} from '@grov/models';

export interface CreateStoreOptions<T> {
  /**
   * Persist to `local` (survives restarts) or `session` storage (this tab only).
   * Never persist tokens, tickets or other secrets: auth lives in httpOnly cookies.
   */
  persist?: {storage: 'local' | 'session'; key: string; partialize?: (state: T) => Partial<T>};
}

/**
 * Zustand store for client-only UI state. Server data belongs in TanStack Query
 * (`@grov/hooks`), never copied into a store.
 */
export function createStore<T extends object>(
  initializer: StateCreator<T, [], []>,
  options: CreateStoreOptions<T> = {}
) {
  if (!options.persist) return create<T>()(initializer);
  const {storage, key, partialize} = options.persist;
  return create<T>()(
    persist(initializer, {
      name: `${appConfig.cookiePrefix}.${key}`,
      storage: createJSONStorage(() => (storage === 'local' ? localStorage : sessionStorage)),
      partialize: partialize as ((state: T) => T) | undefined,
    }) as StateCreator<T, [], []>
  );
}
