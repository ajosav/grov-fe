import {type HTMLAttributes} from 'react';

import {cn} from '../utils/cn';

/**
 * Grov surfaces (design system "Glass", DS11): a glass card on the warm wash,
 * and at most one hero panel per screen. Blur drops automatically for reduced
 * transparency, or when `.lowend` is on <html> (DS16: low-end Android).
 */
export function GlassCard({
  strong,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & {strong?: boolean}) {
  return (
    <div
      className={cn('rounded-lg text-ink', strong ? 'glass-strong' : 'glass', className)}
      {...props}
    />
  );
}

export function HeroPanel({
  tone = 'night',
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & {tone?: 'night' | 'flame'}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl p-6',
        tone === 'night' ? 'bg-night text-on-night' : 'bg-flame-tint text-ink',
        className
      )}
      {...props}
    />
  );
}

/** Screen background: canvas with the soft wash (static gradient, cheap on every device). */
export function Wash({className, ...props}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('min-h-dvh bg-wash text-ink', className)} {...props} />;
}
