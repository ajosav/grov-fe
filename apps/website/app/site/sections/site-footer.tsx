// Ported from requirements/site/index.html. Static markup; behaviour lives in ../site-behaviour.ts.
import {SplitWords} from '../parts/split-words';

export function SiteFooter() {
  return (
    <footer>
      {' '}
      <div className="wrap">
        {' '}
        <div className="foot-top">
          {' '}
          <p className="foot-big">
            <SplitWords mode="foot">
              Market sorted.
              <br />
              Month <em>planned.</em>
            </SplitWords>
          </p>{' '}
          <div className="foot-meta">
            {' '}
            <img
              src="/brand/grov-wordmark-reverse.svg"
              alt="Grov"
              width="82"
              height="40"
              style={{height: '40px', width: 'auto'}}
            />{' '}
            <a className="pill pill-light" href="#join">
              Join the waitlist
            </a>{' '}
            <div className="soon-row" style={{margin: '0'}}>
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
        </div>{' '}
        <div className="credits">
          {' '}
          <p>
            © 2026 Grov · Made in Nigeria · Plans, prices and names on this page are samples for
            illustration.
          </p>{' '}
          <p>Photos from Wikimedia Commons, CC BY-SA 4.0:</p>{' '}
          <ul>
            {' '}
            <li>
              <a href="https://commons.wikimedia.org/wiki/File:Mile-12-market-lagos.jpg">
                Mile 12 market, Lagos · S.aderogba
              </a>
            </li>{' '}
            <li>
              <a href="https://commons.wikimedia.org/wiki/File:The_Tomato_Seller.jpg">
                The tomato seller · UjahT
              </a>
            </li>{' '}
            <li>
              <a href="https://commons.wikimedia.org/wiki/File:Pepper_and_tomatoes_in_Owode_Market,_Offa,_Kwara_State.jpg">
                Pepper and tomatoes, Owode Market · James Rhoda
              </a>
            </li>{' '}
          </ul>{' '}
        </div>{' '}
      </div>{' '}
    </footer>
  );
}
