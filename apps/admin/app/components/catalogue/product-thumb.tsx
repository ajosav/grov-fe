import {ImageOff} from 'lucide-react';

import {cn} from '@grov/ui';

/** A square cover photo, or a quiet placeholder when the product has none yet. */
export function ProductThumb({
  url,
  name,
  className,
}: {
  url: string | undefined;
  name: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-surface-sunken text-ink-muted',
        className
      )}
    >
      {url ? (
        <img src={url} alt="" loading="lazy" className="size-full object-cover" />
      ) : (
        <ImageOff aria-hidden className="size-4" />
      )}
      <span className="sr-only">{url ? `Photo of ${name}` : `No photo for ${name}`}</span>
    </div>
  );
}
