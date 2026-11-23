import {type ReactNode} from 'react';

import {ArrowLeft} from 'lucide-react';

import {cn} from '../utils/cn';
import {Button} from './button';

export interface AppBarProps {
  title: ReactNode;
  onBack?: () => void;
  action?: ReactNode;
  className?: string;
}

export function AppBar({title, onBack, action, className}: AppBarProps) {
  return (
    <header className={cn('grid h-14 grid-cols-[3rem_1fr_3rem] items-center gap-2', className)}>
      <div>
        {onBack ? (
          <Button variant="ghost" size="icon" aria-label="Back" onClick={onBack}>
            <ArrowLeft />
          </Button>
        ) : null}
      </div>
      <h1 className="truncate text-center text-title-sm">{title}</h1>
      <div className="flex justify-end">{action}</div>
    </header>
  );
}
