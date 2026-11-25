import {useEffect} from 'react';

import {BudgetSection} from '../site/sections/budget-section';
import {CitiesSection} from '../site/sections/cities-section';
import {DropsSection} from '../site/sections/drops-section';
import {FaqSection} from '../site/sections/faq-section';
import {GetSection} from '../site/sections/get-section';
import {HeroSection} from '../site/sections/hero-section';
import {HowSection} from '../site/sections/how-section';
import {JourneyRail} from '../site/sections/journey-rail';
import {SaveSection} from '../site/sections/save-section';
import {SiteFooter} from '../site/sections/site-footer';
import {SiteNav} from '../site/sections/site-nav';
import {SvgSprite} from '../site/sections/svg-sprite';
import {TickerBand} from '../site/sections/ticker-band';
import {TickerNote} from '../site/sections/ticker-note';
import {TrySection} from '../site/sections/try-section';
import {WhoSection} from '../site/sections/who-section';
import {setupSiteBehaviour} from '../site/site-behaviour';
import type {Route} from './+types/home';

const TITLE = 'Grov food planning';
const DESCRIPTION =
  'Grov turns your food budget into a plan for everyone you feed, locks the prices, and brings it in up to four drops. Coming soon to Android and iPhone, city by city.';

export const meta: Route.MetaFunction = () => [
  {title: TITLE},
  {name: 'description', content: DESCRIPTION},
  {property: 'og:title', content: TITLE},
  {property: 'og:description', content: DESCRIPTION},
  {property: 'og:type', content: 'website'},
  {property: 'og:image', content: '/img/hero-mile12.webp'},
];

/** The public landing page, prerendered to static HTML at build time. */
export default function Home() {
  useEffect(() => setupSiteBehaviour(), []);
  return (
    <>
      <SvgSprite />
      <SiteNav />
      <JourneyRail />
      <main id="top">
        <HeroSection />
        <div className="sheet">
          <TickerBand />
          <TickerNote />
          <TrySection />
          <HowSection />
          <WhoSection />
          <DropsSection />
          <BudgetSection />
          <SaveSection />
          <CitiesSection />
          <GetSection />
          <FaqSection />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
