// Ported from requirements/site/index.html. Static markup; behaviour lives in ../site-behaviour.ts.
export function JourneyRail() {
  return (
    <nav className="journey" aria-label="Page journey">
      {' '}
      <span className="j-rail" aria-hidden="true">
        <span className="j-fill" />
      </span>{' '}
      <ol className="j-stops">
        {' '}
        <li>
          <a href="#try">
            <i aria-hidden="true" />
            <span>Plan</span>
          </a>
        </li>{' '}
        <li>
          <a href="#how">
            <i aria-hidden="true" />
            <span>Lock</span>
          </a>
        </li>{' '}
        <li>
          <a href="#who">
            <i aria-hidden="true" />
            <span>Who's eating</span>
          </a>
        </li>{' '}
        <li>
          <a href="#drops">
            <i aria-hidden="true" />
            <span>Drops</span>
          </a>
        </li>{' '}
        <li>
          <a href="#save">
            <i aria-hidden="true" />
            <span>Save</span>
          </a>
        </li>{' '}
        <li>
          <a href="#get">
            <i aria-hidden="true" />
            <span>Join</span>
          </a>
        </li>{' '}
      </ol>{' '}
      <span className="j-mark" aria-hidden="true">
        <svg className="icon">
          <use href="#i-bag" />
        </svg>
      </span>{' '}
    </nav>
  );
}
