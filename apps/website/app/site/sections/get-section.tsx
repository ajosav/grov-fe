// Ported from requirements/site/index.html. Static markup; behaviour lives in ../site-behaviour.ts.
import {Skyline} from '../parts/skyline';
import {SplitWords} from '../parts/split-words';
import {Waitlist} from '../parts/waitlist';

export function GetSection() {
  return (
    <section className="apps sec" id="get" aria-labelledby="apps-title">
      {' '}
      <div className="night" aria-hidden="true">
        {' '}
        <i className="moon" /> <Skyline />{' '}
      </div>{' '}
      <div className="boards" aria-hidden="true">
        {' '}
        <div className="bb">
          <div className="bb-face">
            <small>On Grov</small>
            <b>Market sorted.</b>
            <span>Plan the month in minutes</span>
          </div>
          <i className="bb-pole" />
        </div>{' '}
        <div className="bb">
          <div className="bb-face">
            <span className="chip c-lock">
              <svg className="icon">
                <use href="#i-lock" />
              </svg>
              Locked
            </span>
            <b className="money">₦184,500</b>
            <span>October, for a family of 5</span>
          </div>
          <i className="bb-pole" />
        </div>{' '}
        <div className="bb">
          <div className="bb-face">
            <small>Staples</small>
            <b>Rice, beans, yam.</b>
            <span>By the kilo, priced</span>
          </div>
          <i className="bb-pole" />
        </div>{' '}
      </div>{' '}
      <div className="wrap apps-inner rv">
        {' '}
        <div className="soon-row">
          {' '}
          <span className="soon">
            <svg className="icon">
              <use href="#i-android" />
            </svg>
            Android<small>Soon</small>
          </span>{' '}
          <span className="soon">
            <svg className="icon">
              <use href="#i-phone" />
            </svg>
            iPhone<small>Soon</small>
          </span>{' '}
        </div>{' '}
        <h2 id="apps-title">
          <SplitWords mode="apps">
            Grov is coming to <span className="hl">Android and iPhone.</span>
          </SplitWords>
        </h2>{' '}
        <p className="lead">
          Built to run well on everyday Android phones and patchy data, with your plan still there
          when you're offline. Join the waitlist and we'll text you when it opens in your area.
        </p>{' '}
        <Waitlist variant="end" />{' '}
      </div>{' '}
    </section>
  );
}
