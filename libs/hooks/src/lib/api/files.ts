import {useMutation, useQuery} from '@tanstack/react-query';

import {queryKeys, useApi} from '@grov/api';

/** grov-be allows 50 paths per call. */
const URL_BATCH = 50;

/**
 * URLs for stored public paths, as a `path → url` map. Public URLs never change,
 * so they are cached for the session. Past 50 paths, ask in pages.
 */
export function useFileUrls(paths: readonly string[]) {
  const api = useApi();
  const unique = [...new Set(paths)].sort();
  return useQuery({
    queryKey: queryKeys.files.urls(unique),
    queryFn: async () => {
      const urls = new Map<string, string>();
      for (let i = 0; i < unique.length; i += URL_BATCH) {
        for (const file of await api.files.urls(unique.slice(i, i + URL_BATCH))) {
          urls.set(file.path, file.url);
        }
      }
      return urls;
    },
    enabled: unique.length > 0,
    staleTime: Infinity,
  });
}

/** Uploads one public image into `directory` (e.g. `images/products`); resolves to its stored path and URL. */
export function useUploadImage() {
  const api = useApi();
  return useMutation({
    mutationFn: ({file, directory}: {file: File; directory: string}) =>
      api.files.uploadImage(file, directory),
  });
}
