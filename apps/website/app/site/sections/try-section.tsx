// Ported from requirements/site/index.html. Static markup; behaviour lives in ../site-behaviour.ts.
import {PlanBuilder} from '../parts/plan-builder';

export function TrySection() {
  return (
    <section className="sec" id="try" aria-labelledby="try-title">
      {' '}
      <div className="wrap">
        {' '}
        <div className="sec-head rv">
          {' '}
          <h2 id="try-title">
            Who are you feeding? Watch the plan <span className="hl">add up.</span>
          </h2>{' '}
          <p className="lead">
            Change the numbers and the slip reprints. This is how Grov sizes a plan, using sample
            Lagos prices. Real plans use live prices for your area.
          </p>{' '}
        </div>{' '}
        <PlanBuilder />{' '}
      </div>{' '}
    </section>
  );
}
