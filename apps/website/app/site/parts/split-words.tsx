import {Children, isValidElement, type ReactNode} from 'react';

/**
 * Splits text into word spans for the scroll animations, at render time (the
 * original page rewrote the DOM after load):
 *
 * - `foot`: footer headline, `<span class="fw"><span style="--i:n">word</span></span>`
 * - `apps`: closing band headline, `<span class="w">word</span>` (assembled on scroll)
 *
 * Elements (`<em>`, `<span class="hl">`) are wrapped whole; `<br>` is kept as is.
 */
export function SplitWords({mode, children}: {mode: 'foot' | 'apps'; children: ReactNode}) {
  let index = 0;
  const out: ReactNode[] = [];
  const wrap = (content: ReactNode, key: string) => {
    const i = index++;
    return mode === 'foot' ? (
      <span className="fw" key={key}>
        <span style={{'--i': i}}>{content}</span>
      </span>
    ) : (
      <span className="w" key={key}>
        {content}
      </span>
    );
  };

  Children.toArray(children).forEach((child, c) => {
    if (typeof child === 'string') {
      child.split(/(\s+)/).forEach((token, t) => {
        if (!token) return;
        out.push(/^\s+$/.test(token) ? ' ' : wrap(token, `${c}-${t}`));
      });
    } else if (isValidElement(child) && child.type === 'br') {
      out.push(child);
    } else {
      out.push(wrap(child, `${c}`));
    }
  });
  return <>{out}</>;
}
