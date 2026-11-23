export type ChipKind = 'lock' | 'est' | 'upd' | 'chg';

const CHIP: Record<ChipKind, [className: string, icon: string, label: string]> = {
  lock: ['c-lock', 'i-lock', 'Locked'],
  est: ['c-est', 'i-est', 'Estimate'],
  upd: ['c-upd', 'i-clock', 'Updated 2h ago'],
  chg: ['c-chg', 'i-chg', 'Price changed'],
};

/** Price status chip (DS5): icon + word. Icons come from the page's SVG sprite. */
export function PriceChip({kind}: {kind: ChipKind}) {
  const [className, icon, label] = CHIP[kind];
  return (
    <span className={`chip ${className}`}>
      <svg className="icon">
        <use href={`#${icon}`} />
      </svg>
      {label}
    </span>
  );
}

/** ₦ with thousands separators and a true minus. Sample figures are whole naira. */
export function naira(n: number): string {
  return (n < 0 ? '−' : '') + '₦' + Math.abs(Math.round(n)).toLocaleString('en-NG');
}
