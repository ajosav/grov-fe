// Ported from requirements/site/index.html. Static markup; behaviour lives in ../site-behaviour.ts.
export function SaveSection() {
  return (
    <section className="sec" id="save" style={{paddingTop: '0'}} aria-labelledby="save-title">
      {' '}
      <div className="wrap save-grid">
        {' '}
        <div className="rv">
          {' '}
          <h2 id="save-title">
            Save towards your next <span className="hl">basket.</span>
          </h2>{' '}
          <p className="lead" style={{marginTop: '18px'}}>
            Put a little aside for December's food, a pool share or next month's plan. Grov savings
            are for food on Grov, nothing else.
          </p>{' '}
          <ul className="save-points stg">
            {' '}
            <li>
              <svg className="icon">
                <use href="#i-lock" />
              </svg>
              <span>Your basket's price locks once the goal is fully paid.</span>
            </li>{' '}
            <li>
              <svg className="icon">
                <use href="#i-back" />
              </svg>
              <span>Change your mind? Release it back to your Food balance any time.</span>
            </li>{' '}
            <li>
              <svg className="icon">
                <use href="#i-check" />
              </svg>
              <span>For food only. No cash-outs.</span>
            </li>{' '}
          </ul>{' '}
        </div>{' '}
        <div className="card goal rv" id="goal">
          {' '}
          <small>December food goal</small>{' '}
          <p className="big-n money">
            ₦45,000 <span className="of">of ₦120,000</span>
          </p>{' '}
          <div className="bar">
            <i />
          </div>{' '}
          <p style={{marginTop: '10px', fontSize: '15px', color: 'var(--ink-muted)'}}>
            Estimate until fully paid · target Fri 11 Dec
          </p>{' '}
          <div className="ways stg">
            {' '}
            <span>
              <svg className="icon">
                <use href="#i-plus" />
              </svg>
              Top up any time
            </span>{' '}
            <span>
              <svg className="icon">
                <use href="#i-cal" />
              </svg>
              Auto-save weekly
            </span>{' '}
            <span>
              <svg className="icon">
                <use href="#i-round" />
              </svg>
              Round up orders
            </span>{' '}
          </div>{' '}
        </div>{' '}
      </div>{' '}
    </section>
  );
}
