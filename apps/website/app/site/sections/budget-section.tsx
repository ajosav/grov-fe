// Ported from requirements/site/index.html. Static markup; behaviour lives in ../site-behaviour.ts.
export function BudgetSection() {
  return (
    <section className="sec" style={{paddingTop: '0'}} aria-labelledby="budget-title">
      {' '}
      <div className="wrap">
        {' '}
        <div className="sec-head rv">
          {' '}
          <h2 id="budget-title">
            Your budget is a guide, <span className="hl">not a wall.</span>
          </h2>{' '}
          <p className="lead">
            Grov always shows the full plan and the full total. If it's above your budget, you'll
            know exactly by how much, and checkout still works.
          </p>{' '}
        </div>{' '}
        <div className="budget">
          {' '}
          <div className="card rv" id="budget-card">
            {' '}
            <p style={{fontWeight: 700, color: 'var(--ink-muted)'}}>October plan</p>{' '}
            <p className="big-n money" data-count="184500">
              ₦184,500
            </p>{' '}
            <div className="compare">
              {' '}
              <div className="bigbar" aria-hidden="true">
                <i />
                <s />
              </div>{' '}
              <div className="cmp-row">
                <span>Your budget</span>
                <b className="money">₦160,000</b>
              </div>{' '}
              <div className="cmp-row">
                <span>Above your budget</span>
                <b className="money">₦24,500</b>
              </div>{' '}
              <div className="neutral">
                <svg className="icon">
                  <use href="#i-spark" />
                </svg>
                <span>
                  <b>Fit to budget is optional.</b> Grov suggests swaps and you tick the lines you
                  want changed. Nothing else moves.
                </span>
              </div>{' '}
            </div>{' '}
          </div>{' '}
          <div className="card rv">
            {' '}
            <h3>Every price says how sure it is.</h3>{' '}
            <ul className="status-list stg">
              {' '}
              <li>
                <b>Rice, local parboiled</b>
                <span className="chip c-lock">
                  <svg className="icon">
                    <use href="#i-lock" />
                  </svg>
                  Locked
                </span>
                <small>
                  Price fixed for your order · <span className="money">₦21,000</span>
                </small>
              </li>{' '}
              <li>
                <b>Brown beans, 2.5 kg</b>
                <span className="chip c-est">
                  <svg className="icon">
                    <use href="#i-est" />
                  </svg>
                  Estimate
                </span>
                <small>
                  Between <span className="money">₦8,100</span> and{' '}
                  <span className="money">₦8,700</span> until we weigh it
                </small>
              </li>{' '}
              <li>
                <b>Tomatoes, small basket</b>
                <span className="chip c-upd">
                  <svg className="icon">
                    <use href="#i-clock" />
                  </svg>
                  Updated 2h ago
                </span>
                <small>Fresh prices move daily, so we tell you when we last checked</small>
              </li>{' '}
              <li>
                <b>Palm oil, 5 litres</b>
                <span className="chip c-chg">
                  <svg className="icon">
                    <use href="#i-chg" />
                  </svg>
                  Price changed
                </span>
                <small>
                  <s className="money">₦9,800</s> → <span className="money">₦10,400</span> since you
                  built the plan
                </small>
              </li>{' '}
              <li>
                <b>Ponmo</b>
                <span className="chip c-out">
                  <svg className="icon">
                    <use href="#i-out" />
                  </svg>
                  Out of stock
                </span>
                <small>Pick a swap or remove it</small>
              </li>{' '}
            </ul>{' '}
          </div>{' '}
        </div>{' '}
      </div>{' '}
    </section>
  );
}
