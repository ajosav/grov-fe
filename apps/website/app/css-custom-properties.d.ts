import 'react';

// The site sets CSS custom properties inline (style={{'--i': 2}}).
declare module 'react' {
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined;
  }
}
