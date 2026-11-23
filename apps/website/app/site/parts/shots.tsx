import {type ReactNode} from 'react';

/**
 * The five "How it works" phone screens. Each is rendered in the sticky phone
 * (desktop) and again under its step (phones), so the markup lives here once.
 */
const SHOTS: Record<number, ReactNode> = {
  0: (
    <>
      {' '}
      <div className="s-head">
        <small>Step 2 of 6</small>
        <b>Who's eating?</b>
      </div>{' '}
      <div className="s-list">
        {' '}
        <div className="s-item">
          <span className="ini t-flame">A</span>
          <span className="t">
            <b>Adults</b>
            <small>18 and over</small>
          </span>
          <span className="mini-ctl">
            <span>−</span>
            <b>2</b>
            <span>+</span>
          </span>
        </div>{' '}
        <div className="s-item">
          <span className="ini t-sky">K</span>
          <span className="t">
            <b>Children 6–12</b>
            <small>School age</small>
          </span>
          <span className="mini-ctl">
            <span>−</span>
            <b>2</b>
            <span>+</span>
          </span>
        </div>{' '}
        <div className="s-item">
          <span className="ini t-flame">T</span>
          <span className="t">
            <b>Teens 13–17</b>
          </span>
          <span className="mini-ctl">
            <span>−</span>
            <b>1</b>
            <span>+</span>
          </span>
        </div>{' '}
        <div className="s-item">
          <span className="ini t-sky">F</span>
          <span className="t">
            <b>We have a freezer</b>
            <small>Plans bulk protein</small>
          </span>
          <span className="tog" />
        </div>{' '}
        <div className="s-item">
          <span className="ini" style={{background: 'var(--surface-sunken)'}}>
            X
          </span>
          <span className="t">
            <b>Foods to avoid</b>
            <small>Groundnuts</small>
          </span>
        </div>{' '}
      </div>{' '}
      <div className="cta-mini">Continue</div>{' '}
    </>
  ),
  1: (
    <>
      {' '}
      <div className="s-head">
        <small>October · 17 Oct – 15 Nov</small>
        <b>Your plan</b>
      </div>{' '}
      <div className="s-list">
        {' '}
        <div className="s-item">
          <span className="ini t-flame">R</span>
          <span className="t">
            <b>Rice, local parboiled</b>
            <small>4.5 kg</small>
            <br />
            <span className="why">Why: 5 people · 4 weeks</span>
          </span>
          <span className="r">
            <b className="money">₦21,000</b>
            <span className="chip c-lock">
              <svg className="icon">
                <use href="#i-lock" />
              </svg>
              Locked
            </span>
          </span>
        </div>{' '}
        <div className="s-item">
          <span className="ini t-sky">B</span>
          <span className="t">
            <b>Brown beans</b>
            <small>2.5 kg</small>
          </span>
          <span className="r">
            <b className="money">₦8,400</b>
            <span className="chip c-est">
              <svg className="icon">
                <use href="#i-est" />
              </svg>
              Estimate
            </span>
          </span>
        </div>{' '}
        <div className="s-item">
          <span className="ini" style={{background: 'var(--surface-sunken)'}}>
            G
          </span>
          <span className="t">
            <b>Garri, white</b>
            <small>2.5 kg</small>
          </span>
          <span className="r">
            <b className="money">₦5,200</b>
            <span className="chip c-upd">
              <svg className="icon">
                <use href="#i-clock" />
              </svg>
              2h ago
            </span>
          </span>
        </div>{' '}
        <div className="s-item">
          <span className="ini t-flame">E</span>
          <span className="t">
            <b>Eggs</b>
            <small>2 crates (60)</small>
          </span>
          <span className="r">
            <b className="money">₦11,800</b>
            <span className="chip c-lock">
              <svg className="icon">
                <use href="#i-lock" />
              </svg>
              Locked
            </span>
          </span>
        </div>{' '}
      </div>{' '}
      <div className="s-total">
        <small>Plan total · 38 items + 4 drops</small>
        <b className="money">₦184,500</b>
        <p>
          <span className="money">₦24,500</span> above your <span className="money">₦160,000</span>{' '}
          budget
        </p>
        <div className="bar">
          <i style={{width: '86.7%'}} />
          <s style={{width: '13.3%'}} />
        </div>
      </div>{' '}
    </>
  ),
  2: (
    <>
      {' '}
      <div className="s-head">
        <small>
          Plan · <span className="money">₦184,500</span>
        </small>
        <b>How do you want it?</b>
      </div>{' '}
      <div className="opt sel">
        <span className="well t-flame">
          <svg className="icon">
            <use href="#i-truck" />
          </svg>
        </span>
        <span>
          <b>Delivery to your door</b>
          <small>Ikeja · in up to 4 drops</small>
        </span>
        <span className="radio" />
      </div>{' '}
      <div className="opt">
        <span className="well t-sky">
          <svg className="icon">
            <use href="#i-hub" />
          </svg>
        </span>
        <span>
          <b>Pick up at a hub</b>
          <small>Free above the hub minimum</small>
        </span>
        <span className="radio" />
      </div>{' '}
      <div className="opt">
        <span className="well" style={{background: 'var(--surface-sunken)'}}>
          <svg className="icon">
            <use href="#i-list" />
          </svg>
        </span>
        <span>
          <b>Market list</b>
          <small>Shop it yourself, ticking as you go</small>
        </span>
        <span className="radio" />
      </div>{' '}
      <div className="cta-mini">Choose delivery days</div>{' '}
    </>
  ),
  3: (
    <>
      {' '}
      <div className="s-head">
        <small>All 4 locked at checkout</small>
        <b>Delivery schedule</b>
      </div>{' '}
      <div className="dr paid">
        <span className="d">
          <small>Sat</small>
          <b>17</b>
        </span>
        <span className="t">
          <b>Drop 1 · 14 items</b>
          <small>First drop</small>
        </span>
        <span className="money">₦72,400</span>
      </div>{' '}
      <div className="dr">
        <span className="d">
          <small>Sat</small>
          <b>24</b>
        </span>
        <span className="t">
          <b>Drop 2 · 9 items</b>
          <small>Edit until Thu 22 Oct, 6pm</small>
        </span>
        <span className="money">₦38,100</span>
      </div>{' '}
      <div className="dr">
        <span className="d">
          <small>Sat</small>
          <b>31</b>
        </span>
        <span className="t">
          <b>Drop 3 · 8 items</b>
          <small>Edit until Thu 29 Oct, 6pm</small>
        </span>
        <span className="money">₦36,900</span>
      </div>{' '}
      <div className="dr">
        <span className="d">
          <small>Sat</small>
          <b>07</b>
        </span>
        <span className="t">
          <b>Drop 4 · 7 items</b>
          <small>Edit until Thu 5 Nov, 6pm</small>
        </span>
        <span className="money">₦37,100</span>
      </div>{' '}
      <div className="s-total">
        <small>Paid today, all 4 drops</small>
        <b className="money">₦184,500</b>
        <p>₦7,400 Food balance · ₦177,100 card •• 4417</p>
      </div>{' '}
    </>
  ),
  4: (
    <>
      {' '}
      <div className="s-head">
        <small>October</small>
        <b>Planned vs actual</b>
      </div>{' '}
      <div className="pa">
        {' '}
        <div className="h-row" style={{fontSize: '12px'}}>
          Spent so far{' '}
          <span className="chip c-lock" style={{fontSize: '9px', padding: '3px 6px'}}>
            <svg className="icon" style={{width: '10px', height: '10px'}}>
              <use href="#i-check" />
            </svg>
            On plan
          </span>
        </div>{' '}
        <p className="pa-big money">₦110,500</p>{' '}
        <div className="bars">
          <div>
            <i style={{height: '80%'}} />
            <i style={{height: '78%'}} />
          </div>
          <div>
            <i style={{height: '42%'}} />
            <i style={{height: '44%'}} />
          </div>
          <div>
            <i style={{height: '40%'}} />
            <i style={{height: '0'}} />
          </div>
          <div>
            <i style={{height: '41%'}} />
            <i style={{height: '0'}} />
          </div>
        </div>{' '}
        <div className="lbl">
          <span>Drop 1</span>
          <span>Drop 2</span>
          <span>Drop 3</span>
          <span>Drop 4</span>
        </div>{' '}
        <div className="pa-row">
          <span>Planned for drops 1–2</span>
          <b className="money">₦110,500</b>
        </div>{' '}
        <div className="pa-row">
          <span>Swapped: ponmo for kpomo</span>
          <b className="money">−₦600</b>
        </div>{' '}
      </div>{' '}
      <div className="s-item" style={{margin: '0 10px'}}>
        <span className="ini t-leaf">
          <svg className="icon" style={{width: '14px', height: '14px'}}>
            <use href="#i-round" />
          </svg>
        </span>
        <span className="t">
          <b>Copy this plan to November</b>
          <small>Keeps your swaps</small>
        </span>
      </div>{' '}
    </>
  ),
};

export function Shot({n, on, relative}: {n: number; on?: boolean; relative?: boolean}) {
  return (
    <div
      className={on ? 'shot on' : 'shot'}
      data-s={n}
      style={relative ? {position: 'relative'} : undefined}
    >
      {SHOTS[n]}
    </div>
  );
}

/** The phone shown under each step on narrow screens (was cloned from #shots by script). */
export function StepShot({n}: {n: number}) {
  return (
    <div className="step-shot" data-shot={n}>
      <div className="phone" aria-hidden="true">
        <div className="screen">
          <Shot n={n} on />
        </div>
      </div>
    </div>
  );
}
