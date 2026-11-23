import {Toaster as Sonner, type ToasterProps} from 'sonner';

import {useTheme} from '../theme/theme-provider';

export {toast} from 'sonner';

/** Toasts follow the app theme and Grov tokens. Mount once, inside ThemeProvider. */
export function Toaster(props: ToasterProps) {
  const {resolved} = useTheme();
  return (
    <Sonner
      theme={resolved}
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            'group rounded-md border border-line bg-surface-raised text-ink shadow-raised font-sans text-body',
          description: 'text-ink-muted',
          actionButton: 'bg-primary text-primary-foreground',
          cancelButton: 'bg-surface-sunken text-ink',
        },
      }}
      {...props}
    />
  );
}
