import {type ReactNode, useState} from 'react';

import {Command} from 'cmdk';
import {Check, ChevronsUpDown, X} from 'lucide-react';

import {cn} from '../utils/cn';
import {inputClasses} from './input';
import {Popover, PopoverContent, PopoverTrigger} from './popover';

export interface ComboboxOption {
  value: string;
  label: string;
  /** Extra words to match when searching (local names, aliases). */
  keywords?: string[];
  disabled?: boolean;
}

interface BaseProps {
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: ReactNode;
  /** Typing calls this (debounce it) for server-side search; filtering is then left to the server. */
  onSearch?: (query: string) => void;
  loading?: boolean;
  id?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  className?: string;
}

export interface ComboboxProps extends BaseProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

export interface MultiComboboxProps extends BaseProps {
  value: string[];
  onChange: (value: string[]) => void;
}

/** Searchable single select (cmdk). Use inside `<Field>`. */
export function Combobox(props: ComboboxProps) {
  const selected = props.options.find(o => o.value === props.value);
  return (
    <ComboboxShell
      {...props}
      isSelected={value => value === props.value}
      onPick={(value, close) => {
        props.onChange(value === props.value ? null : value);
        close();
      }}
      trigger={
        selected ? (
          selected.label
        ) : (
          <span className="text-ink-muted">{props.placeholder ?? 'Choose'}</span>
        )
      }
    />
  );
}

/** Searchable multi select with removable chips (foods to avoid, permissions). */
export function MultiCombobox(props: MultiComboboxProps) {
  const chosen = props.options.filter(o => props.value.includes(o.value));
  return (
    <div className="grid gap-2">
      <ComboboxShell
        {...props}
        isSelected={value => props.value.includes(value)}
        onPick={value =>
          props.onChange(
            props.value.includes(value)
              ? props.value.filter(v => v !== value)
              : [...props.value, value]
          )
        }
        trigger={
          chosen.length ? (
            `${chosen.length} selected`
          ) : (
            <span className="text-ink-muted">{props.placeholder ?? 'Choose'}</span>
          )
        }
      />
      {chosen.length ? (
        <ul className="flex flex-wrap gap-2" aria-label="Selected">
          {chosen.map(option => (
            <li key={option.value}>
              <span className="inline-flex items-center gap-1 rounded-pill bg-surface-sunken py-1 pl-3 pr-1 text-body-sm">
                {option.label}
                <button
                  type="button"
                  aria-label={`Remove ${option.label}`}
                  onClick={() => props.onChange(props.value.filter(v => v !== option.value))}
                  className="flex size-6 items-center justify-center rounded-pill hover:bg-line"
                >
                  <X aria-hidden className="size-3.5" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function ComboboxShell({
  options,
  searchPlaceholder = 'Search',
  emptyText = 'No matches',
  onSearch,
  loading,
  className,
  trigger,
  isSelected,
  onPick,
  ...aria
}: BaseProps & {
  trigger: ReactNode;
  isSelected: (value: string) => boolean;
  onPick: (value: string, close: () => void) => void;
}) {
  const [open, setOpen] = useState(false);
  const {id, 'aria-describedby': describedBy, 'aria-invalid': invalid} = aria;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-describedby={describedBy}
        aria-invalid={invalid}
        className={cn(inputClasses, 'items-center justify-between text-left', className)}
      >
        <span className="truncate">{trigger}</span>
        <ChevronsUpDown aria-hidden className="size-4 shrink-0 text-ink-muted" />
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command shouldFilter={!onSearch} className="grid">
          <Command.Input
            placeholder={searchPlaceholder}
            onValueChange={onSearch}
            className="h-12 border-b border-line bg-transparent px-4 text-body outline-none placeholder:text-ink-muted"
          />
          <Command.List className="max-h-72 overflow-y-auto p-1">
            {loading ? <Command.Loading>Searching…</Command.Loading> : null}
            <Command.Empty className="px-3 py-4 text-body-sm text-ink-muted">
              {emptyText}
            </Command.Empty>
            {options.map(option => (
              <Command.Item
                key={option.value}
                value={option.value}
                keywords={[option.label, ...(option.keywords ?? [])]}
                disabled={option.disabled}
                onSelect={() => onPick(option.value, () => setOpen(false))}
                className="flex min-h-11 cursor-default items-center gap-2 rounded-sm px-3 text-body data-[selected=true]:bg-surface-sunken data-[disabled=true]:opacity-50"
              >
                <Check
                  aria-hidden
                  className={cn('size-4', isSelected(option.value) ? 'opacity-100' : 'opacity-0')}
                />
                {option.label}
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
