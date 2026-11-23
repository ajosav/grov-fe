import {cn} from '../utils/cn';

export interface AvatarProps {
  name: string;
  className?: string;
}

/** Initial avatar (data-saver friendly, DS10). */
export function Avatar({name, className}: AvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex size-10 shrink-0 items-center justify-center rounded-pill bg-flame-tint font-display text-title-sm text-flame-strong',
        className
      )}
    >
      {initial}
    </span>
  );
}
