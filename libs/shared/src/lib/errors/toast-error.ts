import {isApiError} from '@grov/api';
import {toast} from '@grov/ui';

import {backendMessage} from './backend-message';
import {errorMessage} from './error-message';

/**
 * The one failure toast: at the bottom of the screen, with grov-be's message word for word (the
 * app's copy only when grov-be never answered). `AppProviders` calls this for every failed
 * request. A caller that has more to say (the product was added but its link failed) calls it too,
 * with `context`: both share the failure's trace id, so they are one toast, not two.
 */
export function toastError(error: unknown, context?: string) {
  const message = backendMessage(error) ?? errorMessage(error);
  toast.error(context ? `${context} ${message}` : message, {
    id: isApiError(error) && error.traceId ? error.traceId : message,
    position: 'bottom-center',
  });
}
