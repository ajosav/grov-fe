import type {FileUrl, StoredFile} from '@grov/models';

import type {ApiClient} from '../client';

/** `/v1/files`: uploads and URLs for stored paths. Public paths get a CDN URL that never changes. */
export function filesApi(client: ApiClient) {
  return {
    /** One image per call so a bad file doesn't hold up the others; the server checks the type from the bytes. */
    uploadImage: (file: File, directory: string) => {
      const form = new FormData();
      form.append('file', file);
      form.append('path', directory);
      return client.request<StoredFile>({method: 'post', url: '/v1/files', data: form});
    },
    /** Up to 50 paths in one call (comma-separated). */
    urls: (paths: readonly string[]) =>
      client.request<FileUrl[]>({
        method: 'get',
        url: '/v1/files/urls',
        params: {paths: paths.join(',')},
      }),
  };
}
export type FilesApi = ReturnType<typeof filesApi>;
