// Ported from requirements/site/index.html. Static markup; behaviour lives in ../site-behaviour.ts.
import {Waitlist} from '../parts/waitlist';

export function HeroSection() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      {' '}
      <div className="hero-photo">
        <img src="/img/hero-mile12.webp" alt="" width="1680" height="972" fetchPriority="high" />
      </div>{' '}
      <div className="wrap hero-grid">
        {' '}
        <div>
          {' '}
          <p className="where fade">
            <i aria-hidden="true" />
            Coming soon, city by city
          </p>{' '}
          <h1 id="hero-title">
            {' '}
            <span className="line">
              <span>The month's food,</span>
            </span>{' '}
            <span className="line">
              <span>planned and priced</span>
            </span>{' '}
            <span className="line">
              <span>
                before <em>you pay.</em>
              </span>
            </span>{' '}
          </h1>{' '}
          <p className="lead fade" style={{animationDelay: '.45s'}}>
            Grov turns your food budget into a plan for everyone you feed, locks the prices, and
            brings it to you in up to four drops. For busy families and for students sharing a flat.
          </p>{' '}
          <Waitlist variant="hero" />{' '}
          <div className="soon-row fade" style={{animationDelay: '.75s'}}>
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
        </div>{' '}
        <figure className="stage" id="stage">
          {' '}
          <div className="ph-col">
            {' '}
            <div className="phone" aria-hidden="true">
              {' '}
              <div className="screen" id="home-screen">
                {' '}
                <div className="scene on" data-scene="home">
                  {' '}
                  <div className="h-top">
                    {' '}
                    <div className="h-hi">
                      <span className="h-av">N</span>
                      <span>
                        <small>Good morning</small>
                        <b>Ngozi</b>
                      </span>
                      <span className="h-bell">
                        <svg className="icon">
                          <use href="#i-bell" />
                        </svg>
                      </span>
                    </div>{' '}
                    <p className="h-lab">
                      Food balance{' '}
                      <svg className="icon">
                        <use href="#i-eye" />
                      </svg>
                    </p>{' '}
                    <p className="h-big money">₦52,400</p>{' '}
                    <span className="h-acct">
                      7700124481 <span>Copy</span>
                    </span>{' '}
                    <p className="h-meta">October · Growing kids · drop 2 Sat</p>{' '}
                    <div className="h-btns">
                      <span>Add money</span>
                      <span>Shop</span>
                    </div>{' '}
                  </div>{' '}
                  <div className="h-sheet">
                    {' '}
                    <div className="h-tiles">
                      {' '}
                      <div>
                        <span className="t-flame">
                          <svg className="icon">
                            <use href="#i-bag" />
                          </svg>
                        </span>
                        Shop
                      </div>{' '}
                      <div>
                        <span className="t-sky">
                          <svg className="icon">
                            <use href="#i-list" />
                          </svg>
                        </span>
                        Plan
                      </div>{' '}
                      <div>
                        <span className="t-palm">
                          <svg className="icon">
                            <use href="#i-truck" />
                          </svg>
                        </span>
                        Orders
                      </div>{' '}
                      <div>
                        <span className="t-leaf">
                          <svg className="icon">
                            <use href="#i-jar" />
                          </svg>
                        </span>
                        Save
                      </div>{' '}
                    </div>{' '}
                    <div className="h-news">
                      <b>Week-box for Growing kids</b>
                      <small>Ready for Saturday's drop</small>
                      <i>See packages</i>
                    </div>{' '}
                    <div>
                      {' '}
                      <div className="h-row">
                        This month <a>2 of 4</a>
                      </div>{' '}
                      <div className="h-drops" style={{marginTop: '8px'}}>
                        {' '}
                        <div className="on">
                          <b>
                            <svg className="icon">
                              <use href="#i-check" />
                            </svg>
                          </b>
                          Paid
                        </div>{' '}
                        <div className="next">
                          <b>2</b>Sat 24
                        </div>{' '}
                        <div>
                          <b>3</b>31 Oct
                        </div>{' '}
                        <div>
                          <b>4</b>7 Nov
                        </div>{' '}
                      </div>{' '}
                    </div>{' '}
                    <div>
                      {' '}
                      <div className="h-save">
                        December food <i className="money">₦45,000 of ₦120,000</i>
                      </div>{' '}
                      <div className="bar">
                        <i style={{width: '38%'}} />
                      </div>{' '}
                    </div>{' '}
                  </div>{' '}
                  <div className="h-nav">
                    <span className="on">
                      <svg className="icon">
                        <use href="#i-home" />
                      </svg>
                      Home
                    </span>
                    <span>
                      <svg className="icon">
                        <use href="#i-bag" />
                      </svg>
                      Shop
                    </span>
                    <span>
                      <svg className="icon">
                        <use href="#i-truck" />
                      </svg>
                      Orders
                    </span>
                    <span>
                      <svg className="icon">
                        <use href="#i-jar" />
                      </svg>
                      Save
                    </span>
                    <span>
                      <svg className="icon">
                        <use href="#i-user" />
                      </svg>
                      Account
                    </span>
                  </div>{' '}
                </div>{' '}
                <div className="scene" data-scene="plan">
                  {' '}
                  <div className="s-head">
                    <small>October · 17 Oct – 15 Nov</small>
                    <b>Your plan</b>
                  </div>{' '}
                  <div className="s-list">
                    {' '}
                    <div className="s-item" style={{'--i': '0'}}>
                      <span className="ini t-flame">R</span>
                      <span className="t">
                        <b>Rice, local parboiled</b>
                        <small>4.5 kg</small>
                        <br />
                        <span className="why">Why: 5 people · 4 weeks</span>
                      </span>
                      <span className="r">
                        <b className="money">₦21,000</b>
                        <span className="swap">
                          <span className="chip c-est">
                            <svg className="icon">
                              <use href="#i-est" />
                            </svg>
                            Estimate
                          </span>
                          <span className="chip c-lock">
                            <svg className="icon">
                              <use href="#i-lock" />
                            </svg>
                            Locked
                          </span>
                        </span>
                      </span>
                    </div>{' '}
                    <div className="s-item" style={{'--i': '1'}}>
                      <span className="ini t-sky">B</span>
                      <span className="t">
                        <b>Brown beans</b>
                        <small>2.5 kg</small>
                      </span>
                      <span className="r">
                        <b className="money">₦8,400</b>
                        <span className="swap">
                          <span className="chip c-est">
                            <svg className="icon">
                              <use href="#i-est" />
                            </svg>
                            Estimate
                          </span>
                          <span className="chip c-lock">
                            <svg className="icon">
                              <use href="#i-lock" />
                            </svg>
                            Locked
                          </span>
                        </span>
                      </span>
                    </div>{' '}
                    <div className="s-item" style={{'--i': '2'}}>
                      <span className="ini" style={{background: 'var(--surface-sunken)'}}>
                        G
                      </span>
                      <span className="t">
                        <b>Garri, white</b>
                        <small>2.5 kg</small>
                      </span>
                      <span className="r">
                        <b className="money">₦5,200</b>
                        <span className="swap">
                          <span className="chip c-upd">
                            <svg className="icon">
                              <use href="#i-clock" />
                            </svg>
                            2h ago
                          </span>
                          <span className="chip c-lock">
                            <svg className="icon">
                              <use href="#i-lock" />
                            </svg>
                            Locked
                          </span>
                        </span>
                      </span>
                    </div>{' '}
                    <div className="s-item" style={{'--i': '3'}}>
                      <span className="ini t-flame">E</span>
                      <span className="t">
                        <b>Eggs</b>
                        <small>2 crates (60)</small>
                      </span>
                      <span className="r">
                        <b className="money">₦11,800</b>
                        <span className="swap">
                          <span className="chip c-est">
                            <svg className="icon">
                              <use href="#i-est" />
                            </svg>
                            Estimate
                          </span>
                          <span className="chip c-lock">
                            <svg className="icon">
                              <use href="#i-lock" />
                            </svg>
                            Locked
                          </span>
                        </span>
                      </span>
                    </div>{' '}
                  </div>{' '}
                  <div className="s-total" style={{'--i': '4'}}>
                    <small>Plan total · 38 items + 4 drops</small>
                    <b className="money">₦184,500</b>
                    <p>
                      <span className="money">₦24,500</span> above your{' '}
                      <span className="money">₦160,000</span> budget. Your call.
                    </p>
                    <div className="bar">
                      <i style={{width: '86.7%'}} />
                      <s style={{width: '13.3%'}} />
                    </div>
                  </div>{' '}
                </div>{' '}
                <div className="scene" data-scene="shop">
                  {' '}
                  <div className="c-top">
                    <small>Shop · Ikeja · sample prices</small>{' '}
                    <p className="c-q">
                      <span className="on">4.5 kg</span>
                      <span>2.5 kg</span>
                      <span>2 tubers</span>
                      <span>2.5 kg</span>
                    </p>{' '}
                  </div>{' '}
                  <div className="dish-stage">
                    {' '}
                    <div className="dish on">
                      <svg className="stuff" viewBox="0 0 120 100" aria-hidden="true">
                        <path
                          d="M34 22 Q60 4 86 22"
                          style={{fill: 'none', stroke: 'var(--night)', strokeWidth: '3'}}
                        />
                        <path
                          d="M26 30h68l-7 62H33z"
                          style={{
                            fill: 'var(--surface)',
                            stroke: 'var(--night)',
                            strokeWidth: '3',
                            strokeLinejoin: 'round',
                          }}
                        />
                        <ellipse
                          cx="60"
                          cy="30"
                          rx="34"
                          ry="8"
                          style={{
                            fill: 'var(--surface-sunken)',
                            stroke: 'var(--night)',
                            strokeWidth: '3',
                          }}
                        />
                        <path
                          d="M38 27h3M48 31h3M57 26h3M66 31h3M75 27h3M44 34h3M70 34h3"
                          style={{
                            stroke: 'var(--line-strong)',
                            strokeWidth: '2',
                            strokeLinecap: 'round',
                          }}
                        />
                        <rect
                          x="34"
                          y="54"
                          width="52"
                          height="16"
                          rx="3"
                          style={{fill: 'var(--flame)'}}
                        />
                        <text
                          x="60"
                          y="66"
                          textAnchor="middle"
                          fontFamily="Plus Jakarta Sans,sans-serif"
                          fontWeight="800"
                          fontSize="10"
                          style={{fill: 'var(--on-bright)'}}
                        >
                          RICE
                        </text>
                      </svg>
                      <b>Rice, local parboiled</b>
                      <small>4.5 kg · ₦4,670 per kg</small>
                      <span className="d-row">
                        <b className="money">₦21,000</b>
                        <span className="chip c-lock">
                          <svg className="icon">
                            <use href="#i-lock" />
                          </svg>
                          Locked
                        </span>
                      </span>
                    </div>{' '}
                    <div className="dish">
                      <svg className="stuff" viewBox="0 0 120 100" aria-hidden="true">
                        <path
                          d="M22 48 Q60 22 98 48"
                          style={{
                            fill: 'var(--palm-strong)',
                            stroke: 'var(--night)',
                            strokeWidth: '2.5',
                          }}
                        />
                        <ellipse
                          cx="40"
                          cy="42"
                          rx="4.6"
                          ry="3"
                          transform="rotate(20 40 42)"
                          style={{fill: 'var(--flame-strong)'}}
                        />
                        <ellipse
                          cx="52"
                          cy="36"
                          rx="4.6"
                          ry="3"
                          transform="rotate(-15 52 36)"
                          style={{fill: 'var(--surface)'}}
                        />
                        <ellipse
                          cx="64"
                          cy="34"
                          rx="4.6"
                          ry="3"
                          transform="rotate(30 64 34)"
                          style={{fill: 'var(--flame-strong)'}}
                        />
                        <ellipse
                          cx="76"
                          cy="38"
                          rx="4.6"
                          ry="3"
                          transform="rotate(-25 76 38)"
                          style={{fill: 'var(--surface)'}}
                        />
                        <ellipse
                          cx="86"
                          cy="44"
                          rx="4.6"
                          ry="3"
                          transform="rotate(10 86 44)"
                          style={{fill: 'var(--flame-strong)'}}
                        />
                        <ellipse
                          cx="47"
                          cy="46"
                          rx="4.6"
                          ry="3"
                          transform="rotate(-30 47 46)"
                          style={{fill: 'var(--surface)'}}
                        />
                        <ellipse
                          cx="60"
                          cy="43"
                          rx="4.6"
                          ry="3"
                          transform="rotate(15 60 43)"
                          style={{fill: 'var(--flame-strong)'}}
                        />
                        <ellipse
                          cx="72"
                          cy="45"
                          rx="4.6"
                          ry="3"
                          transform="rotate(-10 72 45)"
                          style={{fill: 'var(--surface)'}}
                        />
                        <ellipse
                          cx="34"
                          cy="47"
                          rx="4.6"
                          ry="3"
                          transform="rotate(5 34 47)"
                          style={{fill: 'var(--surface)'}}
                        />
                        <path
                          d="M18 48h84q-6 36-42 36t-42-36z"
                          style={{
                            fill: 'var(--on-night)',
                            stroke: 'var(--night)',
                            strokeWidth: '3',
                            strokeLinejoin: 'round',
                          }}
                        />
                        <path
                          d="M18 48h84"
                          style={{stroke: 'var(--sky-strong)', strokeWidth: '5'}}
                        />
                        <path
                          d="M42 66q18 8 36 0"
                          style={{
                            fill: 'none',
                            stroke: 'var(--flame)',
                            strokeWidth: '3',
                            strokeLinecap: 'round',
                          }}
                        />
                      </svg>
                      <b>Brown beans (oloyin)</b>
                      <small>2.5 kg · ₦3,360 per kg</small>
                      <span className="d-row">
                        <b className="money">₦8,400</b>
                        <span className="chip c-est">
                          <svg className="icon">
                            <use href="#i-est" />
                          </svg>
                          Estimate
                        </span>
                      </span>
                    </div>{' '}
                    <div className="dish">
                      <svg className="stuff" viewBox="0 0 120 100" aria-hidden="true">
                        <path
                          d="M14 62 C14 44 40 36 70 40 C96 44 110 52 108 62 C106 74 84 78 58 76 C32 74 14 74 14 62Z"
                          style={{
                            fill: 'var(--palm-strong)',
                            stroke: 'var(--night)',
                            strokeWidth: '3',
                          }}
                        />
                        <path
                          d="M24 48 C26 32 48 26 74 28 C98 30 112 36 110 46 C108 56 90 58 66 56 C40 54 22 58 24 48Z"
                          style={{
                            fill: 'color-mix(in srgb,var(--palm-strong) 80%,var(--night))',
                            stroke: 'var(--night)',
                            strokeWidth: '3',
                          }}
                        />
                        <path
                          d="M40 62l3 2M58 66l3-2M76 64l2 3M90 60l3 1M46 42l3 1M66 40l2 2M86 42l3-1"
                          style={{stroke: 'var(--night)', strokeWidth: '2', strokeLinecap: 'round'}}
                        />
                        <path
                          d="M58 76c2 4 6 6 10 5"
                          style={{fill: 'none', stroke: 'var(--surface)', strokeWidth: '2'}}
                        />
                      </svg>
                      <b>Yam</b>
                      <small>2 medium tubers</small>
                      <span className="d-row">
                        <b className="money">₦7,800</b>
                        <span className="chip c-upd">
                          <svg className="icon">
                            <use href="#i-clock" />
                          </svg>
                          Updated 2h ago
                        </span>
                      </span>
                    </div>{' '}
                    <div className="dish">
                      <svg className="stuff" viewBox="0 0 120 100" aria-hidden="true">
                        <path
                          d="M30 38 Q60 6 90 38"
                          style={{
                            fill: 'var(--palm-tint)',
                            stroke: 'var(--night)',
                            strokeWidth: '2.5',
                          }}
                        />
                        <circle cx="44" cy="32" r="1.6" style={{fill: 'var(--palm-strong)'}} />
                        <circle cx="52" cy="26" r="1.6" style={{fill: 'var(--palm-strong)'}} />
                        <circle cx="60" cy="22" r="1.6" style={{fill: 'var(--palm-strong)'}} />
                        <circle cx="68" cy="27" r="1.6" style={{fill: 'var(--palm-strong)'}} />
                        <circle cx="76" cy="32" r="1.6" style={{fill: 'var(--palm-strong)'}} />
                        <circle cx="56" cy="33" r="1.6" style={{fill: 'var(--palm-strong)'}} />
                        <circle cx="64" cy="34" r="1.6" style={{fill: 'var(--palm-strong)'}} />
                        <circle cx="48" cy="36" r="1.6" style={{fill: 'var(--palm-strong)'}} />
                        <circle cx="72" cy="36" r="1.6" style={{fill: 'var(--palm-strong)'}} />
                        <circle cx="60" cy="29" r="1.6" style={{fill: 'var(--palm-strong)'}} />
                        <path
                          d="M28 38h64l-6 46H34z"
                          style={{
                            fill: 'var(--sky-tint)',
                            stroke: 'var(--night)',
                            strokeWidth: '3',
                            strokeLinejoin: 'round',
                          }}
                        />
                        <path d="M28 38h64" style={{stroke: 'var(--night)', strokeWidth: '5'}} />
                        <path
                          d="M34 84h52"
                          style={{stroke: 'var(--night)', strokeWidth: '5', strokeLinecap: 'round'}}
                        />
                        <text
                          x="60"
                          y="66"
                          textAnchor="middle"
                          fontFamily="Plus Jakarta Sans,sans-serif"
                          fontWeight="800"
                          fontSize="10"
                          style={{fill: 'var(--sky-strong)'}}
                        >
                          2.5 KG
                        </text>
                      </svg>
                      <b>Garri, white</b>
                      <small>2.5 kg · ₦2,080 per kg</small>
                      <span className="d-row">
                        <b className="money">₦5,200</b>
                        <span className="chip c-lock">
                          <svg className="icon">
                            <use href="#i-lock" />
                          </svg>
                          Locked
                        </span>
                      </span>
                    </div>{' '}
                  </div>{' '}
                  <div className="bk">
                    {' '}
                    <div className="bk-h">
                      <b>In this week's basket</b>
                      <span>7 items</span>
                    </div>{' '}
                    <div className="bk-row" style={{'--i': '0'}}>
                      <span className="ini t-flame">P</span>
                      <span className="t">
                        <b>Palm oil</b>
                        <small>5 litres</small>
                      </span>
                      <span className="r">
                        <b className="money">₦10,400</b>
                        <span className="chip c-chg">
                          <svg className="icon">
                            <use href="#i-chg" />
                          </svg>
                          Price changed
                        </span>
                      </span>
                    </div>{' '}
                    <div className="bk-row" style={{'--i': '1'}}>
                      <span className="ini t-sky">O</span>
                      <span className="t">
                        <b>Onions</b>
                        <small>Half bag ≈ 12 kg</small>
                      </span>
                      <span className="r">
                        <b className="money">₦14,000</b>
                        <span className="chip c-upd">
                          <svg className="icon">
                            <use href="#i-clock" />
                          </svg>
                          2h ago
                        </span>
                      </span>
                    </div>{' '}
                    <div className="bk-row" style={{'--i': '2'}}>
                      <span className="ini t-flame">E</span>
                      <span className="t">
                        <b>Eggs</b>
                        <small>1 crate (30)</small>
                      </span>
                      <span className="r">
                        <b className="money">₦5,900</b>
                        <span className="chip c-lock">
                          <svg className="icon">
                            <use href="#i-lock" />
                          </svg>
                          Locked
                        </span>
                      </span>
                    </div>{' '}
                    <div className="bk-total" style={{'--i': '3'}}>
                      <span>Basket so far</span>
                      <b className="money">₦72,700</b>
                    </div>{' '}
                  </div>{' '}
                  <div className="c-road">
                    <svg className="rider">
                      <use href="#v-okada" />
                    </svg>
                  </div>{' '}
                  <div className="h-nav">
                    <span>
                      <svg className="icon">
                        <use href="#i-home" />
                      </svg>
                      Home
                    </span>
                    <span className="on">
                      <svg className="icon">
                        <use href="#i-bag" />
                      </svg>
                      Shop
                    </span>
                    <span>
                      <svg className="icon">
                        <use href="#i-truck" />
                      </svg>
                      Orders
                    </span>
                    <span>
                      <svg className="icon">
                        <use href="#i-jar" />
                      </svg>
                      Save
                    </span>
                    <span>
                      <svg className="icon">
                        <use href="#i-user" />
                      </svg>
                      Account
                    </span>
                  </div>{' '}
                </div>{' '}
                <div className="scene" data-scene="drop">
                  {' '}
                  <div className="s-head">
                    <small>Drop 2 · Sat 24 Oct</small>
                    <b>On the way</b>
                  </div>{' '}
                  <div className="map">
                    {' '}
                    <svg viewBox="0 0 256 210" preserveAspectRatio="none">
                      <path
                        d="M0 60H256M0 130H256M60 0V210M170 0V210M0 185L256 20"
                        stroke="var(--line)"
                        strokeWidth="7"
                        fill="none"
                      />
                      <path
                        className="route"
                        d="M28 180 C 80 180, 92 120, 140 118 S 206 70, 232 34"
                        stroke="var(--flame)"
                        strokeWidth="3.5"
                        strokeDasharray="7 6"
                        strokeLinecap="round"
                        fill="none"
                      />
                      <circle cx="28" cy="180" r="7" fill="var(--night)" />
                      <circle cx="232" cy="34" r="9" fill="var(--flame)" />
                      <circle cx="232" cy="34" r="3.5" fill="var(--surface)" />
                    </svg>{' '}
                    <svg className="van-dot">
                      <use href="#v-van" />
                    </svg>{' '}
                    <span className="pin p-hub">Hub · Ikeja</span>
                    <span className="pin p-home">Home</span>{' '}
                  </div>{' '}
                  <div className="s-list" style={{marginTop: '8px'}}>
                    {' '}
                    <div className="s-item">
                      <span className="ini t-flame">
                        <svg className="icon" style={{width: '14px', height: '14px'}}>
                          <use href="#i-clock" />
                        </svg>
                      </span>
                      <span className="t">
                        <b>Arriving 9am–12pm</b>
                        <small>9 items · checked at the hub</small>
                      </span>
                    </div>{' '}
                    <div className="s-item">
                      <span className="ini t-leaf">
                        <svg className="icon" style={{width: '14px', height: '14px'}}>
                          <use href="#i-lock" />
                        </svg>
                      </span>
                      <span className="t">
                        <b>
                          Locked at <span className="money">₦38,100</span>
                        </b>
                        <small>Paid at checkout · edit until Thu 6pm</small>
                      </span>
                    </div>{' '}
                  </div>{' '}
                </div>{' '}
                <i className="sweep" />{' '}
              </div>{' '}
            </div>{' '}
            <div className="scene-dots" role="group" aria-label="App screens">
              {' '}
              <button
                type="button"
                data-go="0"
                aria-pressed="true"
                aria-label="Show the Home screen"
              >
                <i />
              </button>{' '}
              <button
                type="button"
                data-go="1"
                aria-pressed="false"
                aria-label="Show the plan screen"
              >
                <i />
              </button>{' '}
              <button
                type="button"
                data-go="2"
                aria-pressed="false"
                aria-label="Show the shop screen"
              >
                <i />
              </button>{' '}
              <button
                type="button"
                data-go="3"
                aria-pressed="false"
                aria-label="Show a drop on the way"
              >
                <i />
              </button>{' '}
            </div>{' '}
          </div>{' '}
          <figcaption className="notes" aria-live="polite">
            {' '}
            <span className="callout r c1 show" data-scene="home">
              <i className="n">1</i>
              <b>Food balance</b>Put aside for food. It spends on Grov only.
            </span>{' '}
            <span className="callout r c2 show" data-scene="home">
              <i className="n">2</i>
              <b>Your own account number</b>Top up by transfer, any time.
            </span>{' '}
            <span className="callout r c3 show" data-scene="home">
              <i className="n">3</i>
              <b>This month, 2 of 4</b>Drop 2 lands Saturday. All four priced and locked.
            </span>{' '}
            <span className="callout r c4 show" data-scene="home">
              <i className="n">4</i>
              <b>December food</b>Saving towards a basket. Its price locks once it's paid.
            </span>{' '}
            <span className="callout r" data-scene="plan" style={{top: '118px'}}>
              <i className="n">1</i>
              <b>A reason on every line</b>Who you feed and for how long, never a guess.
            </span>{' '}
            <span className="callout r" data-scene="plan" style={{top: '262px'}}>
              <i className="n">2</i>
              <b>Estimates become locks</b>At checkout, every price is fixed for the month.
            </span>{' '}
            <span className="callout r" data-scene="plan" style={{top: '470px'}}>
              <i className="n">3</i>
              <b>Above budget? Your call.</b>We show the gap plainly. Checkout still works.
            </span>{' '}
            <span className="callout r" data-scene="shop" style={{top: '118px'}}>
              <i className="n">1</i>
              <b>Real weights, clear prices</b>Kilos and litres on every item, with the price per kg
              so you can compare.
            </span>{' '}
            <span className="callout r" data-scene="shop" style={{top: '330px'}}>
              <i className="n">2</i>
              <b>Every price shows its status</b>Locked, estimate or updated 2h ago, before you buy.
            </span>{' '}
            <span className="callout r" data-scene="drop" style={{top: '150px'}}>
              <i className="n">1</i>
              <b>Follow every drop</b>From the hub in Ikeja to your door, 9am to 12pm.
            </span>{' '}
            <span className="callout r" data-scene="drop" style={{top: '470px'}}>
              <i className="n">2</i>
              <b>Paid once, at checkout</b>All four drops in one payment, from your Food balance
              first, then your card. Edit or skip a drop until Thursday 6pm.
            </span>{' '}
          </figcaption>{' '}
        </figure>{' '}
      </div>{' '}
      <div className="traffic" aria-hidden="true">
        {' '}
        <svg className="veh" style={{'--d': '16s', '--dl': '-3s', '--w': '64px'}}>
          <use href="#v-danfo" />
        </svg>{' '}
        <svg className="veh" style={{'--d': '21s', '--dl': '-12s', '--w': '66px'}}>
          <use href="#v-van" />
        </svg>{' '}
        <svg className="veh" style={{'--d': '12s', '--dl': '-7s', '--w': '44px'}}>
          <use href="#v-okada" />
        </svg>{' '}
        <svg className="veh back" style={{'--d': '18s', '--dl': '-5s', '--w': '46px'}}>
          <use href="#v-keke" />
        </svg>{' '}
        <svg className="veh back" style={{'--d': '24s', '--dl': '-16s', '--w': '64px'}}>
          <use href="#v-danfo" />
        </svg>{' '}
      </div>{' '}
    </section>
  );
}
