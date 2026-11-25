import {type ReactNode} from 'react';

import {ChevronDown} from 'lucide-react';

import {cn} from '../utils/cn';
import {Button} from './button';
import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger} from './dropdown-menu';

type SplitButtonVariant = 'primary' | 'night' | 'outline';

const DIVIDER: Record<SplitButtonVariant, string> = {
  primary: 'border-l border-primary-foreground/25',
  night: 'border-l border-on-night/25',
  outline: '-ml-px',
};

export interface SplitButtonProps {
  /** The main action's content. With `asChild`, a single element such as a router `<Link>`. */
  children: ReactNode;
  asChild?: boolean;
  onClick?: () => void;
  /** The other actions: `DropdownMenuItem`s (and separators) shown from the chevron. */
  menu: ReactNode;
  /** Accessible name of the chevron, e.g. "More actions for Rice 50 kg". */
  menuLabel: string;
  variant?: SplitButtonVariant;
  size?: 'sm' | 'md';
  className?: string;
}

/** A main action joined to a menu of related ones ("View product ▾"). */
export function SplitButton({
  children,
  asChild = false,
  onClick,
  menu,
  menuLabel,
  variant = 'night',
  size = 'sm',
  className,
}: SplitButtonProps) {
  return (
    <div className={cn('inline-flex shrink-0 items-stretch', className)}>
      <Button
        variant={variant}
        size={size}
        asChild={asChild}
        onClick={onClick}
        className="rounded-r-none pr-3"
      >
        {children}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            size={size}
            aria-label={menuLabel}
            className={cn('rounded-l-none px-2.5 [&_svg]:size-4', DIVIDER[variant])}
          >
            <ChevronDown aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">{menu}</DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
