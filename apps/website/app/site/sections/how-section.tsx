// Ported from requirements/site/index.html. Static markup; behaviour lives in ../site-behaviour.ts.
import {Shot, StepShot} from '../parts/shots';

export function HowSection() {
  return (
    <section className="sec" id="how" aria-labelledby="how-title" style={{paddingTop: '0'}}>
      {' '}
      <div className="wrap">
        {' '}
        <div className="sec-head rv">
          {' '}
          <h2 id="how-title">
            From "what are we eating?" to food at your <span className="hl">door.</span>
          </h2>{' '}
          <p className="lead">
            Five steps you can see. Nothing gets bought until you say so, and every number on the
            screen is exact.
          </p>{' '}
        </div>{' '}
        <div className="loop-grid">
          {' '}
          <ol className="steps">
            {' '}
            <li className="step on" data-step="0">
              <span className="step-n">1</span>
              <h3>Tell us who you're feeding.</h3>
              <p>
                Adults, children by age band, whether you have a freezer, foods to avoid. It takes
                about two minutes, and we never ask about income.
              </p>
              <ul>
                <li>Family, duo, solo or roommates</li>
                <li>Children by age band</li>
                <li>Kitchen and storage</li>
              </ul>
              <StepShot n={0} />
            </li>{' '}
            <li className="step" data-step="1">
              <span className="step-n">2</span>
              <h3>Get a plan, with the reasons.</h3>
              <p>
                Every line says why it's there and what it costs. Swap, remove or add anything. If
                the plan is above your budget, we say so plainly and leave the choice to you.
              </p>
              <ul>
                <li>Daily, weekly or monthly</li>
                <li>"Why" on every line</li>
                <li>Fit to budget, if you want it</li>
              </ul>
              <StepShot n={1} />
            </li>{' '}
            <li className="step" data-step="2">
              <span className="step-n">3</span>
              <h3>Choose how it reaches you.</h3>
              <p>
                Delivery to your door, pickup at a hub near you, or a market list you take to the
                market yourself. Same plan, your call.
              </p>
              <ul>
                <li>Home delivery</li>
                <li>Hub pickup</li>
                <li>Market list</li>
              </ul>
              <StepShot n={2} />
            </li>{' '}
            <li className="step" data-step="3">
              <span className="step-n">4</span>
              <h3>Pay once, receive in drops.</h3>
              <p>
                Split a month into up to four drops, or two weeks into two. Every drop is priced,
                locked and paid for at checkout. Edit or skip a drop until the Thursday before, and
                we remind you the day before that.
              </p>
              <ul>
                <li>Up to 4 drops</li>
                <li>One payment</li>
                <li>Edit until Thu 6pm</li>
              </ul>
              <StepShot n={3} />
            </li>{' '}
            <li className="step" data-step="4">
              <span className="step-n">5</span>
              <h3>See what you actually spent.</h3>
              <p>
                After each drop, Grov puts planned against actual, so next month's plan starts from
                what really happened in your kitchen.
              </p>
              <ul>
                <li>Planned vs actual</li>
                <li>Copy last month's plan</li>
              </ul>
              <StepShot n={4} />
            </li>{' '}
          </ol>{' '}
          <div className="loop-phone" aria-hidden="true">
            {' '}
            <div className="phone">
              <div className="screen" id="shots">
                {' '}
                <Shot n={0} on={true} /> <Shot n={1} on={false} /> <Shot n={2} on={false} />{' '}
                <Shot n={3} on={false} /> <Shot n={4} on={false} />{' '}
              </div>
            </div>{' '}
          </div>{' '}
        </div>{' '}
      </div>{' '}
    </section>
  );
}
