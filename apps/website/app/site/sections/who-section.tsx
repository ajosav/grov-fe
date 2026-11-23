// Ported from requirements/site/index.html. Static markup; behaviour lives in ../site-behaviour.ts.
export function WhoSection() {
  return (
    <section className="who sec" id="who" aria-labelledby="who-title">
      {' '}
      <div className="wrap">
        {' '}
        <div className="sec-head rv">
          {' '}
          <h2 id="who-title">
            A full house in Ikeja, or four flatmates in <span className="hl">Yaba.</span>
          </h2>{' '}
          <div>
            {' '}
            <p className="lead" style={{marginBottom: '22px'}}>
              Grov plans for whoever you feed. Pick yours.
            </p>{' '}
            <div className="switch" role="tablist" aria-label="Who are you feeding?">
              {' '}
              <span className="thumb" aria-hidden="true" />{' '}
              <button role="tab" aria-selected="true" aria-controls="p-fam" id="t-fam">
                Families
              </button>{' '}
              <button
                role="tab"
                aria-selected="false"
                aria-controls="p-stu"
                id="t-stu"
                tabIndex={-1}
              >
                Students
              </button>{' '}
            </div>{' '}
          </div>{' '}
        </div>{' '}
        <div className="panels">
          {' '}
          <div className="panel" id="p-fam" role="tabpanel" aria-labelledby="t-fam">
            {' '}
            <div className="pic rv">
              {' '}
              <img
                src="/img/tomato-seller.webp"
                alt="A trader arranging fresh tomatoes and peppers on her market table"
                loading="lazy"
                width="720"
                height="960"
              />{' '}
              <div className="tag">
                <span className="well t-sky">
                  <svg className="icon">
                    <use href="#i-users" />
                  </svg>
                </span>
                <span>
                  <b>Chicken carton pool · Ikeja</b>
                  <small>
                    5 of 8 shares · <span className="money">₦6,900</span> each · 2 days left
                  </small>
                </span>
              </div>{' '}
            </div>{' '}
            <div className="rv">
              {' '}
              <h3 className="big">
                Feed five without the <em>Saturday guesswork.</em>
              </h3>{' '}
              <ul className="feat stg">
                {' '}
                <li>
                  <span className="well">
                    <svg className="icon">
                      <use href="#i-kid" />
                    </svg>
                  </span>
                  <span>
                    <b>Planned around your children</b>
                    <span>Portions follow each child's age band, from toddlers to teens.</span>
                  </span>
                </li>{' '}
                <li>
                  <span className="well">
                    <svg className="icon">
                      <use href="#i-cal" />
                    </svg>
                  </span>
                  <span>
                    <b>Buy monthly, receive weekly</b>
                    <span>One plan for the month, delivered in up to four drops.</span>
                  </span>
                </li>{' '}
                <li>
                  <span className="well">
                    <svg className="icon">
                      <use href="#i-users" />
                    </svg>
                  </span>
                  <span>
                    <b>Share a chicken carton with neighbours</b>
                    <span>
                      Bulk protein pools in your area. Grov only buys once every share is taken.
                    </span>
                  </span>
                </li>{' '}
                <li>
                  <span className="well">
                    <svg className="icon">
                      <use href="#i-leaf" />
                    </svg>
                  </span>
                  <span>
                    <b>Food goals, without the diet talk</b>
                    <span>
                      Balanced, Growing kids, More protein and more. General guidance written with a
                      dietitian, no calorie counting.
                    </span>
                  </span>
                </li>{' '}
              </ul>{' '}
            </div>{' '}
          </div>{' '}
          <div className="panel" id="p-stu" role="tabpanel" aria-labelledby="t-stu" hidden>
            {' '}
            <div className="pic">
              {' '}
              <img
                src="/img/pepper-bowls.webp"
                alt="Bowls of red peppers and tomatoes laid out at a market stall"
                loading="lazy"
                width="720"
                height="960"
              />{' '}
              <div className="tag">
                <span className="well t-flame">
                  <svg className="icon">
                    <use href="#i-split" />
                  </svg>
                </span>
                <span>
                  <b>Flat basket · 4 people</b>
                  <small>
                    <span className="money">₦9,250</span> each · pickup at the campus hub, Sat
                  </small>
                </span>
              </div>{' '}
            </div>{' '}
            <div>
              {' '}
              <h3 className="big">
                Small packs, <em>split four ways,</em> picked up on your way home.
              </h3>{' '}
              <ul className="feat stg">
                {' '}
                <li>
                  <span className="well">
                    <svg className="icon">
                      <use href="#i-user" />
                    </svg>
                  </span>
                  <span>
                    <b>Solo and duo plans</b>
                    <span>
                      Small packs sized for one or two, and storage-aware if you have no freezer.
                    </span>
                  </span>
                </li>{' '}
                <li>
                  <span className="well">
                    <svg className="icon">
                      <use href="#i-split" />
                    </svg>
                  </span>
                  <span>
                    <b>Split one basket with your flatmates</b>
                    <span>Everyone pays their own share. No more chasing transfers.</span>
                  </span>
                </li>{' '}
                <li>
                  <span className="well">
                    <svg className="icon">
                      <use href="#i-hub" />
                    </svg>
                  </span>
                  <span>
                    <b>Free pickup at campus and estate hubs</b>
                    <span>Skip the delivery fee when your basket meets the hub minimum.</span>
                  </span>
                </li>{' '}
                <li>
                  <span className="well">
                    <svg className="icon">
                      <use href="#i-pot" />
                    </svg>
                  </span>
                  <span>
                    <b>Lean weeks and single portions</b>
                    <span>
                      A tighter plan for the week before allowance lands, and cooked food in single
                      portions.
                    </span>
                  </span>
                </li>{' '}
              </ul>{' '}
            </div>{' '}
          </div>{' '}
        </div>{' '}
      </div>{' '}
    </section>
  );
}
