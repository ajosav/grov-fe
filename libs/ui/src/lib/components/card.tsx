import {type HTMLAttributes} from 'react';

import {cn} from '../utils/cn';

export function Card({className, ...props}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-lg border border-line bg-surface text-ink shadow-glass', className)}
      {...props}
    />
  );
}

export function CardHeader({className, ...props}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('grid gap-1.5 p-6 pb-0', className)} {...props} />;
}

export function CardTitle({className, children, ...props}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-title-sm', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({className, ...props}: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-body text-ink-muted', className)} {...props} />;
}

export function CardContent({className, ...props}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6', className)} {...props} />;
}

export function CardFooter({className, ...props}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center gap-3 p-6 pt-0', className)} {...props} />;
}
