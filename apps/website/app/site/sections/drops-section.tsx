// Ported from requirements/site/index.html. Static markup; behaviour lives in ../site-behaviour.ts.
export function DropsSection() {
  return (
    <section className="sec" id="drops" aria-labelledby="drops-title">
      {' '}
      <div className="wrap drops-wrap">
        {' '}
        <div className="rv">
          {' '}
          <h2 id="drops-title">
            Buy for the month. Get it in <span className="hl">drops.</span>
          </h2>{' '}
          <p className="lead" style={{marginTop: '18px'}}>
            Fresh tomatoes don't last a month, and few kitchens have room for a month of food. So
            Grov splits your plan into up to four drops. You pay once, and each drop comes with its
            own date and items.
          </p>{' '}
          <div className="timeline" id="timeline" role="list" aria-label="Sample delivery schedule">
            {' '}
            <span className="fill" aria-hidden="true" />{' '}
            <div className="drop done" role="listitem">
              <span className="dot">1</span>
              <b className="money">₦72,400</b>
              <small>Sat 17 Oct</small>
              <span className="chip c-lock">
                <svg className="icon">
                  <use href="#i-check" />
                </svg>
                Delivered
              </span>
            </div>{' '}
            <div className="drop next" role="listitem">
              <span className="dot">2</span>
              <b className="money">₦38,100</b>
              <small>
                Sat 24 Oct
                <br />
                Edit until Thu, 6pm
              </small>
            </div>{' '}
            <div className="drop" role="listitem">
              <span className="dot">3</span>
              <b className="money">₦36,900</b>
              <small>
                Sat 31 Oct
                <br />
                Edit until Thu, 6pm
              </small>
            </div>{' '}
            <div className="drop" role="listitem">
              <span className="dot">4</span>
              <b className="money">₦37,100</b>
              <small>
                Sat 7 Nov
                <br />
                Edit until Thu, 6pm
              </small>
            </div>{' '}
          </div>{' '}
          <ul className="facts stg">
            {' '}
            <li>
              <svg className="icon">
                <use href="#i-lock" />
              </svg>
              <span>
                <b>Every drop is locked at checkout.</b> If the market moves after that, your price
                doesn't.
              </span>
            </li>{' '}
            <li>
              <svg className="icon">
                <use href="#i-card" />
              </svg>
              <span>
                <b>Pay once, at checkout.</b> The food for every drop and each delivery fee, from
                your Food balance first, then your card, a transfer or USSD.
              </span>
            </li>{' '}
            <li>
              <svg className="icon">
                <use href="#i-bell" />
              </svg>
              <span>
                <b>A reminder the day before</b> each drop's Thursday 6pm cut-off, while you can
                still change it.
              </span>
            </li>{' '}
            <li>
              <svg className="icon">
                <use href="#i-back" />
              </svg>
              <span>
                <b>Plans change.</b> Edit, move or skip a drop before its cut-off. Money for a
                skipped drop moves to the next one or back to your Food balance.
              </span>
            </li>{' '}
          </ul>{' '}
          <p className="note" style={{marginTop: '22px'}}>
            Sample schedule: Ngozi's October plan, family of 5 in Ikeja.
          </p>{' '}
        </div>{' '}
        <div
          className="drops-art card rv"
          id="drops-art"
          role="img"
          aria-label="Illustration: a month from 17 October to 15 November with drops on four Saturdays and card charges the Thursday before each later drop, and a Grov van arriving at a front door with drop 2."
        >
          {' '}
          <div className="cal">
            {' '}
            <div className="cal-h">
              <b>17 Oct – 15 Nov</b>
              <span className="cal-key">
                <span>
                  <i className="k-drop" />
                  Drop day
                </span>
                <span>
                  <i className="k-chg" />
                  Last day to edit, 6pm
                </span>
              </span>
            </div>{' '}
            <div className="cal-grid">
              <span className="wd">M</span>
              <span className="wd">T</span>
              <span className="wd">W</span>
              <span className="wd">T</span>
              <span className="wd">F</span>
              <span className="wd">S</span>
              <span className="wd">S</span>
              <span className="cd out">12</span>
              <span className="cd out">13</span>
              <span className="cd out">14</span>
              <span className="cd out">15</span>
              <span className="cd out">16</span>
              <span className="cd drop paid">17</span>
              <span className="cd">18</span>
              <span className="cd">19</span>
              <span className="cd">20</span>
              <span className="cd">21</span>
              <span className="cd chg">22</span>
              <span className="cd">23</span>
              <span className="cd drop next">24</span>
              <span className="cd">25</span>
              <span className="cd">26</span>
              <span className="cd">27</span>
              <span className="cd">28</span>
              <span className="cd chg">29</span>
              <span className="cd">30</span>
              <span className="cd drop later">31</span>
              <span className="cd mo">1</span>
              <span className="cd">2</span>
              <span className="cd">3</span>
              <span className="cd">4</span>
              <span className="cd chg">5</span>
              <span className="cd">6</span>
              <span className="cd drop later">7</span>
              <span className="cd">8</span>
              <span className="cd">9</span>
              <span className="cd">10</span>
              <span className="cd">11</span>
              <span className="cd">12</span>
              <span className="cd">13</span>
              <span className="cd">14</span>
              <span className="cd">15</span>
            </div>{' '}
          </div>{' '}
          <div className="street">
            {' '}
            <svg viewBox="0 0 480 160" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
              {' '}
              <rect x="0" y="122" width="480" height="38" style={{fill: 'var(--night-hi)'}} />{' '}
              <path
                d="M0 141H480"
                style={{stroke: 'var(--on-night)', strokeOpacity: '.5'}}
                strokeWidth="2"
                strokeDasharray="16 14"
              />{' '}
              <rect x="0" y="116" width="480" height="6" style={{fill: 'var(--line)'}} />{' '}
              <g className="tree">
                <rect x="300" y="78" width="6" height="40" style={{fill: 'var(--night-hi)'}} />
                <circle cx="303" cy="68" r="22" style={{fill: 'var(--leaf)'}} />
                <circle cx="291" cy="80" r="13" style={{fill: 'var(--leaf-strong)'}} />
              </g>{' '}
              <g className="house">
                <path d="M326 58 L392 22 L458 58 Z" style={{fill: 'var(--flame-strong)'}} />
                <rect
                  x="334"
                  y="56"
                  width="116"
                  height="62"
                  style={{fill: 'var(--surface)', stroke: 'var(--night)', strokeWidth: '2'}}
                />
                <rect x="380" y="78" width="24" height="40" rx="2" style={{fill: 'var(--night)'}} />
                <circle cx="399" cy="99" r="1.8" style={{fill: 'var(--palm)'}} />
                <rect
                  x="346"
                  y="70"
                  width="22"
                  height="18"
                  rx="2"
                  style={{fill: 'var(--sky-tint)', stroke: 'var(--night)', strokeWidth: '2'}}
                />
                <rect
                  x="416"
                  y="70"
                  width="22"
                  height="18"
                  rx="2"
                  style={{fill: 'var(--sky-tint)', stroke: 'var(--night)', strokeWidth: '2'}}
                />
              </g>{' '}
              <g className="crate">
                <rect
                  x="350"
                  y="96"
                  width="28"
                  height="22"
                  rx="3"
                  style={{fill: 'var(--palm-strong)', stroke: 'var(--night)', strokeWidth: '2'}}
                />
                <path d="M350 106H378" style={{stroke: 'var(--night)'}} strokeWidth="1.5" />
                <circle cx="356" cy="94" r="5" style={{fill: 'var(--flame)'}} />
                <circle cx="365" cy="92" r="5.5" style={{fill: 'var(--flame)'}} />
                <circle cx="373" cy="94" r="4.5" style={{fill: 'var(--danger)'}} />
                <path
                  d="M362 86q3-4 6 0"
                  style={{stroke: 'var(--leaf-strong)', fill: 'none'}}
                  strokeWidth="2.5"
                />
              </g>{' '}
              <g className="art-van">
                <use href="#v-van" x="0" y="84" width="118" height="54" />
              </g>{' '}
            </svg>{' '}
            <div className="tag">
              <span className="well t-flame">
                <svg className="icon">
                  <use href="#i-truck" />
                </svg>
              </span>
              <span>
                <b>Drop 2 · Sat 24 Oct</b>
                <small>
                  Arriving 9am–12pm · locked at <span className="money">₦38,100</span>
                </small>
              </span>
            </div>{' '}
          </div>{' '}
        </div>{' '}
      </div>{' '}
    </section>
  );
}
