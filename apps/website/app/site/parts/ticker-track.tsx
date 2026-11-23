import {type ChipKind, PriceChip} from './price-chip';

type Item = [
  initial: string,
  name: string,
  unit: string,
  price: string,
  status: ChipKind,
  tone: string,
];

/** Sample market items (illustration only). Rendered twice so the marquee loops seamlessly. */
const ITEMS: Item[] = [
  ['R', 'Rice, local parboiled', '4.5 kg', '₦21,000', 'lock', 't-flame'],
  ['B', 'Brown beans', '2.5 kg', '₦8,400', 'est', 't-sky'],
  ['T', 'Tomatoes', '3 kg', '₦6,500', 'upd', 't-flame'],
  ['G', 'Garri, white', '2.5 kg', '₦5,200', 'lock', 't-sky'],
  ['E', 'Eggs', '1 crate (30)', '₦5,900', 'lock', 't-flame'],
  ['Y', 'Yam', '2 tubers', '₦7,800', 'est', 't-sky'],
  ['P', 'Palm oil', '5 litres', '₦10,400', 'chg', 't-flame'],
  ['O', 'Onions', 'half bag ≈ 12 kg', '₦14,000', 'upd', 't-sky'],
  ['C', 'Chicken, frozen', '1 carton share', '₦6,900', 'lock', 't-flame'],
  ['A', 'Ata rodo', '1 kg', '₦1,600', 'upd', 't-sky'],
];

export function TickerTrack() {
  return (
    <div className="ticker-track" id="ticker">
      {[false, true].map(copy =>
        ITEMS.map(([initial, name, unit, price, status, tone]) => (
          <div className="tk" key={`${copy}-${name}`} aria-hidden={copy || undefined}>
            <span className={`ini ${tone}`}>{initial}</span>
            <b>{name}</b>
            <span className="u">{unit}</span>
            <span className="money">{price}</span>
            <PriceChip kind={status} />
          </div>
        ))
      )}
    </div>
  );
}
