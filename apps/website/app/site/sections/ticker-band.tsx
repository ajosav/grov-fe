// Ported from requirements/site/index.html. Static markup; behaviour lives in ../site-behaviour.ts.
import {TickerTrack} from '../parts/ticker-track';

export function TickerBand() {
  return (
    <div className="ticker" aria-label="Sample market items with local units and price status">
      {' '}
      <TickerTrack />{' '}
    </div>
  );
}
