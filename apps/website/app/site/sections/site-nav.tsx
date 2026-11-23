// Ported from requirements/site/index.html. Static markup; behaviour lives in ../site-behaviour.ts.
export function SiteNav() {
  return (
    <header className="nav" id="nav">
      {' '}
      <div className="wrap">
        {' '}
        <nav className="nav-bar frost" aria-label="Main">
          {' '}
          <a href="#top" aria-label="Grov home">
            {' '}
            <img
              className="nav-logo light"
              src="/brand/grov-wordmark-reverse.svg"
              alt="Grov"
              width="57"
              height="28"
            />{' '}
            <img
              className="nav-logo dark"
              src="/brand/grov-wordmark.svg"
              alt=""
              width="57"
              height="28"
            />{' '}
          </a>{' '}
          <div className="nav-links">
            {' '}
            <a href="#try">Try it</a> <a href="#how">How it works</a>{' '}
            <a href="#who">Families and students</a> <a href="#drops">Drops</a>{' '}
            <a href="#faq">Questions</a>{' '}
          </div>{' '}
          <a className="pill pill-light" href="#join">
            Join the waitlist
          </a>{' '}
        </nav>{' '}
      </div>{' '}
    </header>
  );
}
