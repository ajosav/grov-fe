// Ported from requirements/site/index.html. Static markup; behaviour lives in ../site-behaviour.ts.
export function SvgSprite() {
  return (
    <svg width="0" height="0" style={{position: 'absolute'}} aria-hidden="true">
      {' '}
      <symbol id="i-lock" viewBox="0 0 24 24">
        <rect x="5" y="11" width="14" height="10" rx="2.5" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      </symbol>{' '}
      <symbol id="i-clock" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </symbol>{' '}
      <symbol id="i-est" viewBox="0 0 24 24">
        <path d="M4 12h4l2-5 4 10 2-5h4" />
      </symbol>{' '}
      <symbol id="i-chg" viewBox="0 0 24 24">
        <path d="M7 17 17 7M9 7h8v8" />
      </symbol>{' '}
      <symbol id="i-out" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <path d="M6 6l12 12" />
      </symbol>{' '}
      <symbol id="i-bell" viewBox="0 0 24 24">
        <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" />
        <path d="M10 20a2 2 0 0 0 4 0" />
      </symbol>{' '}
      <symbol id="i-eye" viewBox="0 0 24 24">
        <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
        <circle cx="12" cy="12" r="3" />
      </symbol>{' '}
      <symbol id="i-list" viewBox="0 0 24 24">
        <path d="M9 6h11M9 12h11M9 18h11" />
        <circle cx="4.5" cy="6" r="1" />
        <circle cx="4.5" cy="12" r="1" />
        <circle cx="4.5" cy="18" r="1" />
      </symbol>{' '}
      <symbol id="i-bag" viewBox="0 0 24 24">
        <path d="M5 8h14l-1 12H6z" />
        <path d="M9 8a3 3 0 0 1 6 0" />
      </symbol>{' '}
      <symbol id="i-users" viewBox="0 0 24 24">
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5" />
        <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.8c2 .7 3.2 2.5 3.6 5.2" />
      </symbol>{' '}
      <symbol id="i-pot" viewBox="0 0 24 24">
        <path d="M4 10h16v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" />
        <path d="M2 10h20M9 6c0-1 1-1.5 1-2.5M14 6c0-1 1-1.5 1-2.5" />
      </symbol>{' '}
      <symbol id="i-spark" viewBox="0 0 24 24">
        <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
      </symbol>{' '}
      <symbol id="i-home" viewBox="0 0 24 24">
        <path d="M3.5 11 12 4l8.5 7" />
        <path d="M5.5 9.5V20h13V9.5" />
      </symbol>{' '}
      <symbol id="i-truck" viewBox="0 0 24 24">
        <path d="M2.5 6h11v10h-11zM13.5 9.5h4l3 3.5V16h-7" />
        <circle cx="6.5" cy="17.5" r="1.8" />
        <circle cx="17" cy="17.5" r="1.8" />
      </symbol>{' '}
      <symbol id="i-jar" viewBox="0 0 24 24">
        <rect x="6" y="7" width="12" height="14" rx="3" />
        <path d="M8 3h8v4H8zM10 12h4" />
      </symbol>{' '}
      <symbol id="i-user" viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c1-4 4-6 8-6s7 2 8 6" />
      </symbol>{' '}
      <symbol id="i-check" viewBox="0 0 24 24">
        <path d="M4.5 12.5l4.5 4.5L19.5 6.5" />
      </symbol>{' '}
      <symbol id="i-kid" viewBox="0 0 24 24">
        <circle cx="12" cy="6" r="3" />
        <path d="M8 21v-5l-2-3 3-3h6l3 3-2 3v5" />
      </symbol>{' '}
      <symbol id="i-leaf" viewBox="0 0 24 24">
        <path d="M5 19c0-8 5-13 15-14-1 10-6 15-14 15" />
        <path d="M5 19 13 11" />
      </symbol>{' '}
      <symbol id="i-split" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3v18M12 12l7.5-5" />
      </symbol>{' '}
      <symbol id="i-cal" viewBox="0 0 24 24">
        <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
        <path d="M3.5 10h17M8 3v4M16 3v4" />
      </symbol>{' '}
      <symbol id="i-card" viewBox="0 0 24 24">
        <rect x="2.5" y="5.5" width="19" height="13" rx="2.5" />
        <path d="M2.5 10h19M6.5 14.5h4" />
      </symbol>{' '}
      <symbol id="i-plus" viewBox="0 0 24 24">
        <path d="M12 5v14M5 12h14" />
      </symbol>{' '}
      <symbol id="i-round" viewBox="0 0 24 24">
        <path d="M20 12a8 8 0 1 1-2.3-5.6" />
        <path d="M20 4v5h-5" />
      </symbol>{' '}
      <symbol id="i-back" viewBox="0 0 24 24">
        <path d="M9 14 4 9l5-5" />
        <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
      </symbol>{' '}
      <symbol id="i-android" viewBox="0 0 24 24">
        <path d="M5 10a7 7 0 0 1 14 0v7H5z" />
        <path d="M8 4.5 9.5 7M16 4.5 14.5 7" />
        <circle cx="9.5" cy="10.5" r=".6" />
        <circle cx="14.5" cy="10.5" r=".6" />
        <path d="M8 17v3M16 17v3" />
      </symbol>{' '}
      <symbol id="i-phone" viewBox="0 0 24 24">
        <rect x="6.5" y="2.5" width="11" height="19" rx="3" />
        <path d="M10.5 5.5h3" />
      </symbol>{' '}
      <symbol id="v-danfo" viewBox="0 0 64 30">
        <rect
          x="2"
          y="4"
          width="56"
          height="18"
          rx="4"
          fill="#FFC72C"
          stroke="#0B0B0B"
          strokeWidth="1.6"
        />
        <path d="M2 16h56M2 12.5h56" stroke="#0B0B0B" strokeWidth="1.3" />
        <rect x="7" y="7" width="9" height="5" rx="1" fill="#0B0B0B" opacity=".82" />
        <rect x="18" y="7" width="9" height="5" rx="1" fill="#0B0B0B" opacity=".82" />
        <rect x="29" y="7" width="9" height="5" rx="1" fill="#0B0B0B" opacity=".82" />
        <path d="M45 7h7l4 6h-11z" fill="#0B0B0B" opacity=".82" />
        <circle cx="14" cy="23" r="4.4" fill="#0B0B0B" />
        <circle cx="14" cy="23" r="1.6" fill="#F7F5F0" />
        <circle cx="47" cy="23" r="4.4" fill="#0B0B0B" />
        <circle cx="47" cy="23" r="1.6" fill="#F7F5F0" />
      </symbol>{' '}
      <symbol id="v-keke" viewBox="0 0 46 30">
        <path d="M6 6h26l6 6v8H6z" fill="#FFC72C" stroke="#0B0B0B" strokeWidth="1.6" />
        <path d="M4 6h30" stroke="#0B0B0B" strokeWidth="3" strokeLinecap="round" />
        <rect x="11" y="9" width="9" height="6" rx="1" fill="#0B0B0B" opacity=".82" />
        <path d="M26 9h6l3 4h-9z" fill="#0B0B0B" opacity=".82" />
        <circle cx="12" cy="23" r="4" fill="#0B0B0B" />
        <circle cx="35" cy="23" r="4" fill="#0B0B0B" />
      </symbol>{' '}
      <symbol id="v-van" viewBox="0 0 66 30">
        <path
          d="M2 5h40v17H2z"
          fill="#F7F5F0"
          stroke="#0B0B0B"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M42 9h10l8 7v6H42z"
          fill="#F7F5F0"
          stroke="#0B0B0B"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M45 11h6l5 5h-11z" fill="#0B0B0B" opacity=".82" />
        <rect x="2" y="15" width="40" height="3" fill="#FF550C" />
        <text
          x="8"
          y="13"
          fontFamily="Bricolage Grotesque,sans-serif"
          fontWeight="800"
          fontSize="8"
          fill="#0B0B0B"
        >
          grov
        </text>
        <circle cx="13" cy="23" r="4.4" fill="#0B0B0B" />
        <circle cx="13" cy="23" r="1.6" fill="#F7F5F0" />
        <circle cx="50" cy="23" r="4.4" fill="#0B0B0B" />
        <circle cx="50" cy="23" r="1.6" fill="#F7F5F0" />
      </symbol>{' '}
      <symbol id="v-okada" viewBox="0 0 44 30">
        <circle cx="9" cy="23" r="5" fill="none" stroke="#0B0B0B" strokeWidth="2.4" />
        <circle cx="35" cy="23" r="5" fill="none" stroke="#0B0B0B" strokeWidth="2.4" />
        <path
          d="M9 23l9-8h10l7 8M28 15l3-6h4"
          stroke="#0B0B0B"
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect
          x="4"
          y="8"
          width="11"
          height="9"
          rx="1.5"
          fill="#FF550C"
          stroke="#0B0B0B"
          strokeWidth="1.4"
        />
        <circle cx="24" cy="4.5" r="3" fill="#0B0B0B" />
        <path
          d="M23 8l-2 8h6"
          stroke="#0B0B0B"
          strokeWidth="2.6"
          fill="none"
          strokeLinecap="round"
        />
      </symbol>{' '}
      <symbol id="i-hub" viewBox="0 0 24 24">
        <path d="M3 21V9l9-5 9 5v12" />
        <path d="M9 21v-6h6v6" />
      </symbol>{' '}
    </svg>
  );
}
