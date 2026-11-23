import type {Config} from '@react-router/dev/config';

// Signed-in app: a client-rendered SPA. Auth lives in httpOnly cookies on the
// API domain, so there is nothing useful to render on a server.
export default {
  ssr: false,
} satisfies Config;
