import {useState} from 'react';

import {Plus, X} from 'lucide-react';

import type {AuditFacets} from '@grov/models';
import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@grov/ui';

import {
  AUDIT_FILTER_FIELDS,
  type AuditFilter,
  type AuditFilterField,
  type AuditFilterOperator,
  fieldLabel,
  OPERATOR_LABEL,
  valueLabel,
  valueOptions,
} from '../../lib/audit/filters';

const MAX_FILTERS = 8;

export interface AuditFilterBarProps {
  filters: AuditFilter[];
  onChange: (filters: AuditFilter[]) => void;
  /** Values the pickers can offer; the pickers show nothing to choose until it loads. */
  facets: AuditFacets | undefined;
}

/** Filter chips ("Action type is not Delete") plus an Add filter popover. */
export function AuditFilterBar({filters, onChange, facets}: AuditFilterBarProps) {
  const toggle = (index: number) =>
    onChange(
      filters.map((filter, i) =>
        i === index ? {...filter, op: filter.op === 'is' ? 'not' : 'is'} : filter
      )
    );
  const remove = (index: number) => onChange(filters.filter((_, i) => i !== index));

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filters">
      {filters.map((filter, index) => (
        <span
          key={`${filter.field}:${filter.op}:${filter.value}`}
          className="inline-flex h-9 max-w-full items-center gap-1 rounded-pill border border-line bg-surface pr-1 pl-3 text-body-sm"
        >
          <span className="font-semibold">{fieldLabel(filter.field)}</span>
          <button
            type="button"
            onClick={() => toggle(index)}
            aria-label={`${fieldLabel(filter.field)} ${OPERATOR_LABEL[filter.op]}. Switch to ${
              OPERATOR_LABEL[filter.op === 'is' ? 'not' : 'is']
            }`}
            className="rounded-sm px-1.5 text-ink-muted hover:bg-surface-sunken hover:text-ink"
          >
            {OPERATOR_LABEL[filter.op]}
          </button>
          <span className="max-w-48 truncate">{valueLabel(filter, facets)}</span>
          <button
            type="button"
            onClick={() => remove(index)}
            aria-label={`Remove filter: ${fieldLabel(filter.field)} ${OPERATOR_LABEL[filter.op]} ${valueLabel(filter, facets)}`}
            className="flex size-7 items-center justify-center rounded-pill text-ink-muted hover:bg-surface-sunken hover:text-ink"
          >
            <X aria-hidden className="size-4" />
          </button>
        </span>
      ))}
      {filters.length < MAX_FILTERS ? (
        <AddFilter facets={facets} onAdd={filter => onChange([...filters, filter])} />
      ) : null}
      {filters.length > 0 ? (
        <Button variant="ghost" size="sm" onClick={() => onChange([])}>
          Clear filters
        </Button>
      ) : null}
    </div>
  );
}

function AddFilter({
  facets,
  onAdd,
}: {
  facets: AuditFacets | undefined;
  onAdd: (f: AuditFilter) => void;
}) {
  const [open, setOpen] = useState(false);
  const [field, setField] = useState<AuditFilterField>('kind');
  const [op, setOp] = useState<AuditFilterOperator>('is');
  const [value, setValue] = useState('');
  const options = valueOptions(field, facets);

  const reset = () => {
    setField('kind');
    setOp('is');
    setValue('');
  };
  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onAdd({field, op, value: trimmed});
    setOpen(false);
    reset();
  };

  return (
    <Popover
      open={open}
      onOpenChange={next => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <Plus aria-hidden /> Add filter
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <form
          className="grid gap-3"
          onSubmit={event => {
            event.preventDefault();
            submit();
          }}
        >
          <Select
            value={field}
            onValueChange={next => {
              setField(next as AuditFilterField);
              setValue('');
            }}
          >
            <SelectTrigger aria-label="Filter by" className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AUDIT_FILTER_FIELDS.map(f => (
                <SelectItem key={f.field} value={f.field}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={op} onValueChange={next => setOp(next as AuditFilterOperator)}>
            <SelectTrigger aria-label="Operator" className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="is">is</SelectItem>
              <SelectItem value="not">is not</SelectItem>
            </SelectContent>
          </Select>
          {options ? (
            <Select value={value} onValueChange={setValue}>
              <SelectTrigger aria-label="Value" className="h-10">
                <SelectValue placeholder="Choose a value" />
              </SelectTrigger>
              <SelectContent>
                {options.map(o => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              aria-label="Value"
              placeholder="Paste a record ID"
              value={value}
              onChange={e => setValue(e.target.value)}
              className="h-10"
              autoFocus
            />
          )}
          <Button type="submit" size="sm" disabled={!value.trim()}>
            Apply filter
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}
