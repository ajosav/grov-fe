// Ported from requirements/site/index.html. Static markup; behaviour lives in ../site-behaviour.ts.
export function FaqSection() {
  return (
    <section className="sec" id="faq" aria-labelledby="faq-title">
      {' '}
      <div className="wrap faq">
        {' '}
        <div className="rv">
          {' '}
          <h2 id="faq-title">
            Good <span className="hl">questions.</span>
          </h2>{' '}
          <p className="lead" style={{marginTop: '18px'}}>
            Something else on your mind? Join the waitlist and reply to our text.
          </p>{' '}
        </div>{' '}
        <div className="rv">
          {' '}
          <details open>
            <summary>
              When does Grov open?
              <span className="pm">
                <svg className="icon">
                  <use href="#i-plus" />
                </svg>
              </span>
            </summary>
            <p>
              We're getting ready now, city by city and area by area. We don't have a date to share
              yet. Join the waitlist and we'll text you when Grov opens where you live.
            </p>
          </details>{' '}
          <details>
            <summary>
              Do I have to set a budget?
              <span className="pm">
                <svg className="icon">
                  <use href="#i-plus" />
                </svg>
              </span>
            </summary>
            <p>
              No. A budget is optional. If you set one, Grov shows how your plan compares and never
              stops you checking out.
            </p>
          </details>{' '}
          <details>
            <summary>
              What if prices go up after I pay?
              <span className="pm">
                <svg className="icon">
                  <use href="#i-plus" />
                </svg>
              </span>
            </summary>
            <p>
              Your drops are locked at checkout, so the price you agreed is the price you pay for
              every drop, even if the market moves.
            </p>
          </details>{' '}
          <details>
            <summary>
              Do I pay for every drop up front?
              <span className="pm">
                <svg className="icon">
                  <use href="#i-plus" />
                </svg>
              </span>
            </summary>
            <p>
              Yes. You pay once at checkout for the food in every drop and each drop's delivery fee,
              from your Food balance first and then your card. Until 6pm on the Thursday before a
              drop you can edit, move or skip it, and we remind you the day before. Money for a
              skipped drop moves to the next drop or back to your Food balance.
            </p>
          </details>{' '}
          <details>
            <summary>
              Can I take my food balance out as cash?
              <span className="pm">
                <svg className="icon">
                  <use href="#i-plus" />
                </svg>
              </span>
            </summary>
            <p>
              No. Your Food balance and savings goals are for buying food on Grov. Refunds land in
              your Food balance straight away, or back on your card if you prefer.
            </p>
          </details>{' '}
          <details>
            <summary>
              Will Grov tell me what to eat?
              <span className="pm">
                <svg className="icon">
                  <use href="#i-plus" />
                </svg>
              </span>
            </summary>
            <p>
              Only if you ask. Food goals like Balanced or Growing kids are general guidance written
              with a dietitian. There are no calorie counts and no weight-loss promises.
            </p>
          </details>{' '}
        </div>{' '}
      </div>{' '}
    </section>
  );
}
