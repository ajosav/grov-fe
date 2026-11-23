// Ported from requirements/site/index.html. Static markup; behaviour lives in ../site-behaviour.ts.
export function CitiesSection() {
  return (
    <section className="sec" id="cities" style={{paddingTop: '0'}} aria-labelledby="cities-title">
      {' '}
      <div className="wrap">
        {' '}
        <div className="sec-head rv">
          {' '}
          <h2 id="cities-title">
            Your city, <span className="hl">your market.</span>
          </h2>{' '}
          <p className="lead">
            Grov opens city by city. Each one gets its own suppliers, price lists, hubs and delivery
            partners, so the prices you see come from markets near you.
          </p>{' '}
        </div>{' '}
        <div className="cities2 stg">
          {' '}
          <article className="cty">
            <div className="cty-art">
              <svg viewBox="0 0 400 240" aria-hidden="true">
                <rect width="400" height="240" style={{fill: 'var(--surface-sunken)'}} />
                <circle cx="318" cy="58" r="26" style={{fill: 'var(--flame)'}} />
                <rect x="0" y="75" width="19" height="75" style={{fill: 'var(--night-hi)'}} />
                <rect x="13" y="83" width="3" height="4" style={{fill: 'var(--palm)'}} />
                <rect x="5" y="123" width="3" height="4" style={{fill: 'var(--palm)'}} />
                <rect x="5" y="133" width="3" height="4" style={{fill: 'var(--palm)'}} />
                <rect x="22" y="44" width="33" height="106" style={{fill: 'var(--night-hi)'}} />
                <rect x="35" y="52" width="3" height="4" style={{fill: 'var(--palm)'}} />
                <rect x="43" y="52" width="3" height="4" style={{fill: 'var(--palm)'}} />
                <rect x="35" y="82" width="3" height="4" style={{fill: 'var(--palm)'}} />
                <rect x="43" y="82" width="3" height="4" style={{fill: 'var(--palm)'}} />
                <rect x="43" y="92" width="3" height="4" style={{fill: 'var(--palm)'}} />
                <rect x="27" y="112" width="3" height="4" style={{fill: 'var(--palm)'}} />
                <rect x="43" y="122" width="3" height="4" style={{fill: 'var(--palm)'}} />
                <rect x="58" y="97" width="25" height="53" style={{fill: 'var(--night-hi)'}} />
                <rect x="86" y="34" width="19" height="116" style={{fill: 'var(--night-hi)'}} />
                <rect x="99" y="52" width="3" height="4" style={{fill: 'var(--palm)'}} />
                <rect x="99" y="122" width="3" height="4" style={{fill: 'var(--palm)'}} />
                <rect x="91" y="132" width="3" height="4" style={{fill: 'var(--palm)'}} />
                <rect x="108" y="82" width="21" height="68" style={{fill: 'var(--night-hi)'}} />
                <rect x="121" y="100" width="3" height="4" style={{fill: 'var(--palm)'}} />
                <rect x="121" y="110" width="3" height="4" style={{fill: 'var(--palm)'}} />
                <rect x="121" y="130" width="3" height="4" style={{fill: 'var(--palm)'}} />
                <rect x="132" y="65" width="37" height="85" style={{fill: 'var(--night-hi)'}} />
                <rect x="153" y="93" width="3" height="4" style={{fill: 'var(--palm)'}} />
                <rect x="161" y="93" width="3" height="4" style={{fill: 'var(--palm)'}} />
                <rect x="145" y="123" width="3" height="4" style={{fill: 'var(--palm)'}} />
                <rect x="172" y="110" width="29" height="40" style={{fill: 'var(--night-hi)'}} />
                <rect x="177" y="118" width="3" height="4" style={{fill: 'var(--palm)'}} />
                <rect x="185" y="118" width="3" height="4" style={{fill: 'var(--palm)'}} />
                <rect x="204" y="97" width="37" height="53" style={{fill: 'var(--night-hi)'}} />
                <rect x="225" y="125" width="3" height="4" style={{fill: 'var(--palm)'}} />
                <rect x="233" y="135" width="3" height="4" style={{fill: 'var(--palm)'}} />
                <rect x="244" y="81" width="37" height="69" style={{fill: 'var(--night-hi)'}} />
                <rect x="249" y="89" width="3" height="4" style={{fill: 'var(--palm)'}} />
                <rect x="273" y="89" width="3" height="4" style={{fill: 'var(--palm)'}} />
                <rect x="273" y="99" width="3" height="4" style={{fill: 'var(--palm)'}} />
                <rect x="265" y="139" width="3" height="4" style={{fill: 'var(--palm)'}} />
                <rect x="284" y="109" width="37" height="41" style={{fill: 'var(--night-hi)'}} />
                <rect x="313" y="117" width="3" height="4" style={{fill: 'var(--palm)'}} />
                <rect x="289" y="137" width="3" height="4" style={{fill: 'var(--palm)'}} />
                <rect x="324" y="73" width="37" height="77" style={{fill: 'var(--night-hi)'}} />
                <rect x="329" y="81" width="3" height="4" style={{fill: 'var(--palm)'}} />
                <rect x="337" y="91" width="3" height="4" style={{fill: 'var(--palm)'}} />
                <rect x="337" y="101" width="3" height="4" style={{fill: 'var(--palm)'}} />
                <rect x="353" y="111" width="3" height="4" style={{fill: 'var(--palm)'}} />
                <rect x="345" y="121" width="3" height="4" style={{fill: 'var(--palm)'}} />
                <rect x="353" y="131" width="3" height="4" style={{fill: 'var(--palm)'}} />
                <rect x="364" y="94" width="22" height="56" style={{fill: 'var(--night-hi)'}} />
                <rect x="369" y="112" width="3" height="4" style={{fill: 'var(--palm)'}} />
                <rect x="389" y="104" width="23" height="46" style={{fill: 'var(--night-hi)'}} />
                <rect x="0" y="150" width="400" height="90" style={{fill: 'var(--sky-tint)'}} />
                <path
                  d="M0 172 C120 162 260 162 400 172"
                  style={{stroke: 'var(--night)', fill: 'none'}}
                  strokeWidth="5"
                />
                <rect x="24" y="174" width="5" height="40" style={{fill: 'var(--night)'}} />
                <rect x="68" y="174" width="5" height="40" style={{fill: 'var(--night)'}} />
                <rect x="112" y="174" width="5" height="40" style={{fill: 'var(--night)'}} />
                <rect x="156" y="174" width="5" height="40" style={{fill: 'var(--night)'}} />
                <rect x="200" y="174" width="5" height="40" style={{fill: 'var(--night)'}} />
                <rect x="244" y="174" width="5" height="40" style={{fill: 'var(--night)'}} />
                <rect x="288" y="174" width="5" height="40" style={{fill: 'var(--night)'}} />
                <rect x="332" y="174" width="5" height="40" style={{fill: 'var(--night)'}} />
                <rect x="376" y="174" width="5" height="40" style={{fill: 'var(--night)'}} />
                <path
                  d="M0 196 Q40 190 80 196 T160 196 T240 196 T320 196 T400 196"
                  style={{stroke: 'var(--sky-strong)', strokeOpacity: '.35', fill: 'none'}}
                  strokeWidth="3"
                />
                <use href="#v-danfo" x="150" y="150" width="46" height="22" />
                <use href="#v-van" x="250" y="151" width="44" height="21" />
              </svg>
            </div>
            <div className="cty-txt">
              <h3>Lagos</h3>
              <p>Mainland and Island, area by area.</p>
              <span className="chip c-upd">
                <svg className="icon">
                  <use href="#i-check" />
                </svg>
                Waitlist open
              </span>
            </div>
          </article>{' '}
          <article className="cty">
            <div className="cty-art">
              <svg viewBox="0 0 400 240" aria-hidden="true">
                <rect width="400" height="240" style={{fill: 'var(--surface-sunken)'}} />
                <circle cx="84" cy="54" r="22" style={{fill: 'var(--flame)'}} />
                <path d="M0 150 Q80 104 170 132 T400 118 V240 H0Z" style={{fill: 'var(--line)'}} />
                <g>
                  <rect x="246" y="36" width="34" height="118" style={{fill: 'var(--night)'}} />
                  <rect x="242" y="30" width="42" height="10" style={{fill: 'var(--night)'}} />
                  <rect x="258" y="18" width="10" height="14" style={{fill: 'var(--night)'}} />
                  <rect x="259" y="46" width="4" height="5" style={{fill: 'var(--palm)'}} />
                  <rect x="268" y="46" width="4" height="5" style={{fill: 'var(--palm)'}} />
                  <rect x="250" y="58" width="4" height="5" style={{fill: 'var(--palm)'}} />
                  <rect x="268" y="58" width="4" height="5" style={{fill: 'var(--palm)'}} />
                  <rect x="250" y="70" width="4" height="5" style={{fill: 'var(--palm)'}} />
                  <rect x="259" y="70" width="4" height="5" style={{fill: 'var(--palm)'}} />
                  <rect x="250" y="82" width="4" height="5" style={{fill: 'var(--palm)'}} />
                  <rect x="259" y="82" width="4" height="5" style={{fill: 'var(--palm)'}} />
                  <rect x="268" y="82" width="4" height="5" style={{fill: 'var(--palm)'}} />
                  <rect x="259" y="94" width="4" height="5" style={{fill: 'var(--palm)'}} />
                  <rect x="268" y="94" width="4" height="5" style={{fill: 'var(--palm)'}} />
                  <rect x="250" y="106" width="4" height="5" style={{fill: 'var(--palm)'}} />
                  <rect x="268" y="106" width="4" height="5" style={{fill: 'var(--palm)'}} />
                  <rect x="250" y="118" width="4" height="5" style={{fill: 'var(--palm)'}} />
                  <rect x="259" y="118" width="4" height="5" style={{fill: 'var(--palm)'}} />
                  <rect x="250" y="130" width="4" height="5" style={{fill: 'var(--palm)'}} />
                  <rect x="259" y="130" width="4" height="5" style={{fill: 'var(--palm)'}} />
                  <rect x="268" y="130" width="4" height="5" style={{fill: 'var(--palm)'}} />
                </g>
                <rect x="-11" y="158" width="40" height="22" style={{fill: 'var(--surface)'}} />
                <path d="M-14 160 L9 146 L32 160 Z" style={{fill: 'var(--flame-strong)'}} />
                <rect x="31" y="158" width="42" height="22" style={{fill: 'var(--surface)'}} />
                <path d="M28 160 L52 146 L76 160 Z" style={{fill: 'var(--palm-strong)'}} />
                <rect x="81" y="158" width="38" height="22" style={{fill: 'var(--surface)'}} />
                <path d="M78 160 L100 146 L122 160 Z" style={{fill: 'var(--flame-strong)'}} />
                <rect x="119" y="158" width="37" height="22" style={{fill: 'var(--surface)'}} />
                <path d="M116 160 L137 146 L159 160 Z" style={{fill: 'var(--flame-strong)'}} />
                <rect x="162" y="158" width="42" height="22" style={{fill: 'var(--surface)'}} />
                <path d="M159 160 L183 146 L207 160 Z" style={{fill: 'var(--palm-strong)'}} />
                <rect x="214" y="158" width="40" height="22" style={{fill: 'var(--surface)'}} />
                <path d="M211 160 L234 146 L257 160 Z" style={{fill: 'var(--flame-strong)'}} />
                <rect x="250" y="158" width="39" height="22" style={{fill: 'var(--surface)'}} />
                <path d="M247 160 L269 146 L292 160 Z" style={{fill: 'var(--flame-strong)'}} />
                <rect x="302" y="158" width="44" height="22" style={{fill: 'var(--surface)'}} />
                <path d="M299 160 L324 146 L349 160 Z" style={{fill: 'var(--palm-strong)'}} />
                <rect x="343" y="158" width="40" height="22" style={{fill: 'var(--surface)'}} />
                <path d="M340 160 L363 146 L386 160 Z" style={{fill: 'var(--flame-strong)'}} />
                <rect x="8" y="184" width="37" height="22" style={{fill: 'var(--surface)'}} />
                <path d="M5 186 L26 172 L48 186 Z" style={{fill: 'var(--palm-strong)'}} />
                <rect x="54" y="184" width="39" height="22" style={{fill: 'var(--surface)'}} />
                <path d="M51 186 L73 172 L96 186 Z" style={{fill: 'var(--flame-strong)'}} />
                <rect x="94" y="184" width="46" height="22" style={{fill: 'var(--surface)'}} />
                <path d="M91 186 L117 172 L143 186 Z" style={{fill: 'var(--flame-strong)'}} />
                <rect x="142" y="184" width="40" height="22" style={{fill: 'var(--surface)'}} />
                <path d="M139 186 L162 172 L185 186 Z" style={{fill: 'var(--palm-strong)'}} />
                <rect x="185" y="184" width="38" height="22" style={{fill: 'var(--surface)'}} />
                <path d="M182 186 L204 172 L226 186 Z" style={{fill: 'var(--flame-strong)'}} />
                <rect x="230" y="184" width="40" height="22" style={{fill: 'var(--surface)'}} />
                <path d="M227 186 L250 172 L273 186 Z" style={{fill: 'var(--flame-strong)'}} />
                <rect x="275" y="184" width="37" height="22" style={{fill: 'var(--surface)'}} />
                <path d="M272 186 L293 172 L315 186 Z" style={{fill: 'var(--palm-strong)'}} />
                <rect x="319" y="184" width="46" height="22" style={{fill: 'var(--surface)'}} />
                <path d="M316 186 L342 172 L368 186 Z" style={{fill: 'var(--flame-strong)'}} />
                <rect x="364" y="184" width="44" height="22" style={{fill: 'var(--surface)'}} />
                <path d="M361 186 L386 172 L411 186 Z" style={{fill: 'var(--flame-strong)'}} />
                <rect x="405" y="184" width="38" height="22" style={{fill: 'var(--surface)'}} />
                <path d="M402 186 L424 172 L446 186 Z" style={{fill: 'var(--palm-strong)'}} />
                <rect x="-11" y="210" width="43" height="22" style={{fill: 'var(--surface)'}} />
                <path d="M-14 212 L10 198 L35 212 Z" style={{fill: 'var(--flame-strong)'}} />
                <rect x="34" y="210" width="37" height="22" style={{fill: 'var(--surface)'}} />
                <path d="M31 212 L52 198 L74 212 Z" style={{fill: 'var(--flame-strong)'}} />
                <rect x="82" y="210" width="40" height="22" style={{fill: 'var(--surface)'}} />
                <path d="M79 212 L102 198 L125 212 Z" style={{fill: 'var(--palm-strong)'}} />
                <rect x="118" y="210" width="40" height="22" style={{fill: 'var(--surface)'}} />
                <path d="M115 212 L138 198 L161 212 Z" style={{fill: 'var(--flame-strong)'}} />
                <rect x="166" y="210" width="44" height="22" style={{fill: 'var(--surface)'}} />
                <path d="M163 212 L188 198 L213 212 Z" style={{fill: 'var(--flame-strong)'}} />
                <rect x="209" y="210" width="42" height="22" style={{fill: 'var(--surface)'}} />
                <path d="M206 212 L230 198 L254 212 Z" style={{fill: 'var(--palm-strong)'}} />
                <rect x="256" y="210" width="45" height="22" style={{fill: 'var(--surface)'}} />
                <path d="M253 212 L278 198 L304 212 Z" style={{fill: 'var(--flame-strong)'}} />
                <rect x="298" y="210" width="42" height="22" style={{fill: 'var(--surface)'}} />
                <path d="M295 212 L319 198 L343 212 Z" style={{fill: 'var(--flame-strong)'}} />
                <rect x="345" y="210" width="38" height="22" style={{fill: 'var(--surface)'}} />
                <path d="M342 212 L364 198 L386 212 Z" style={{fill: 'var(--palm-strong)'}} />
              </svg>
            </div>
            <div className="cty-txt">
              <h3>Ibadan</h3>
              <p>Its own suppliers and hubs, its own prices.</p>
              <span className="chip c-upd">
                <svg className="icon">
                  <use href="#i-check" />
                </svg>
                Waitlist open
              </span>
            </div>
          </article>{' '}
          <a className="cty cty-you" href="#join">
            <div className="cty-art">
              <svg viewBox="0 0 400 240" aria-hidden="true">
                <rect width="400" height="240" style={{fill: 'var(--surface)'}} />
                <g>
                  <path d="M36 120 Q80 84 124 120 Z" style={{fill: 'var(--flame)'}} />
                  <rect x="78" y="120" width="4" height="54" style={{fill: 'var(--night)'}} />
                  <rect
                    x="46"
                    y="160"
                    width="68"
                    height="14"
                    rx="3"
                    style={{
                      fill: 'var(--surface-sunken)',
                      stroke: 'var(--night)',
                      strokeWidth: '2',
                    }}
                  />
                  <path d="M156 120 Q200 84 244 120 Z" style={{fill: 'var(--sky-strong)'}} />
                  <rect x="198" y="120" width="4" height="54" style={{fill: 'var(--night)'}} />
                  <rect
                    x="166"
                    y="160"
                    width="68"
                    height="14"
                    rx="3"
                    style={{
                      fill: 'var(--surface-sunken)',
                      stroke: 'var(--night)',
                      strokeWidth: '2',
                    }}
                  />
                  <path d="M276 120 Q320 84 364 120 Z" style={{fill: 'var(--flame-strong)'}} />
                  <rect x="318" y="120" width="4" height="54" style={{fill: 'var(--night)'}} />
                  <rect
                    x="286"
                    y="160"
                    width="68"
                    height="14"
                    rx="3"
                    style={{
                      fill: 'var(--surface-sunken)',
                      stroke: 'var(--night)',
                      strokeWidth: '2',
                    }}
                  />
                </g>
                <g transform="translate(200 54)">
                  <path
                    d="M0 34 C-22 8 -22 -20 0 -20 C22 -20 22 8 0 34Z"
                    style={{fill: 'var(--night)'}}
                  />
                  <path
                    d="M-7 -4H7M0 -11V3"
                    style={{stroke: 'var(--on-night)'}}
                    strokeWidth="3.4"
                    strokeLinecap="round"
                  />
                </g>
                <rect
                  x="0"
                  y="174"
                  width="400"
                  height="66"
                  style={{fill: 'var(--surface-sunken)'}}
                />
              </svg>
            </div>
            <div className="cty-txt">
              <h3>Your city?</h3>
              <p>Tell us where you are when you join. It helps us decide where Grov opens next.</p>
              <span className="chip c-chg">
                <svg className="icon">
                  <use href="#i-plus" />
                </svg>
                Add your city
              </span>
            </div>
          </a>{' '}
        </div>{' '}
        <ul className="every stg" aria-label="What every Grov city gets">
          {' '}
          <li>
            <span className="well t-flame">
              <svg className="icon">
                <use href="#i-users" />
              </svg>
            </span>
            <span>
              <b>Local suppliers</b>Checked before they sell on Grov
            </span>
          </li>{' '}
          <li>
            <span className="well t-sky">
              <svg className="icon">
                <use href="#i-list" />
              </svg>
            </span>
            <span>
              <b>Its own price list</b>Every price with its status
            </span>
          </li>{' '}
          <li>
            <span className="well t-flame">
              <svg className="icon">
                <use href="#i-hub" />
              </svg>
            </span>
            <span>
              <b>Pickup hubs</b>On campuses and in estates
            </span>
          </li>{' '}
          <li>
            <span className="well t-sky">
              <svg className="icon">
                <use href="#i-truck" />
              </svg>
            </span>
            <span>
              <b>Delivery partners</b>Drops on the day you chose
            </span>
          </li>{' '}
        </ul>{' '}
      </div>{' '}
    </section>
  );
}
