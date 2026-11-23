import {useEffect, useRef, useState} from 'react';

import {type Band, canStep, computePlan, type Counts, maxDrops, type Weeks} from './plan-maths';
import {naira, PriceChip} from './price-chip';

const BANDS: {key: Band; label: string; hint: string; fewer: string; more: string}[] = [
  {
    key: 'ad',
    label: 'Adults',
    hint: '18 and over',
    fewer: 'One fewer adult',
    more: 'One more adult',
  },
  {key: 'te', label: 'Teens', hint: '13 to 17', fewer: 'One fewer teen', more: 'One more teen'},
  {
    key: 'ki',
    label: 'Children',
    hint: '6 to 12',
    fewer: 'One fewer child aged 6 to 12',
    more: 'One more child aged 6 to 12',
  },
  {
    key: 'li',
    label: 'Little ones',
    hint: '1 to 5. Babies under 6 months aren’t food-planned.',
    fewer: 'One fewer child aged 1 to 5',
    more: 'One more child aged 1 to 5',
  },
];

const PERIODS: {value: Weeks; label: string}[] = [
  {value: 1, label: 'A week'},
  {value: 2, label: '2 weeks'},
  {value: 4, label: 'A month'},
];

/** "Who are you feeding? Watch the plan add up." Sample maths only; see plan-maths.ts. */
export function PlanBuilder() {
  const [counts, setCounts] = useState<Counts>({ad: 2, te: 1, ki: 2, li: 0});
  const [weeks, setWeeks] = useState<Weeks>(4);
  const [drops, setDrops] = useState(4);
  const [heldDrops, setHeldDrops] = useState<number | null>(null);
  const [budget, setBudget] = useState('160,000');
  const [printTick, setPrintTick] = useState(0);
  const slip = useRef<HTMLDivElement>(null);

  const plan = computePlan(counts, weeks, drops, Number(budget.replace(/\D/g, '')) || 0);
  const reprint = () => setPrintTick(t => t + 1);

  // "The slip reprints": restart the CSS animation on every change.
  useEffect(() => {
    const el = slip.current;
    if (!el || printTick === 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      return;
    el.classList.remove('print');
    void el.offsetWidth;
    el.classList.add('print');
  }, [printTick]);

  const changePeriod = (next: Weeks) => {
    const max = maxDrops(next);
    if (drops > max) {
      setHeldDrops(held => held ?? drops);
      setDrops(max);
    } else if (heldDrops !== null && heldDrops <= max) {
      setDrops(heldDrops);
      setHeldDrops(null);
    }
    setWeeks(next);
    reprint();
  };

  return (
    <div className="try-grid">
      <form
        className="card rv"
        id="builder"
        aria-label="Plan builder"
        onSubmit={e => e.preventDefault()}
      >
        {BANDS.map(({key, label, hint, fewer, more}) => (
          <div className="ctl" key={key}>
            <span>
              <b id={`l-${key}`}>{label}</b>
              <small>{hint}</small>
            </span>
            <span className="step-ctl" role="group" aria-labelledby={`l-${key}`}>
              <button
                type="button"
                aria-label={fewer}
                disabled={!canStep(counts, key, -1)}
                onClick={() => {
                  setCounts(c => ({...c, [key]: c[key] - 1}));
                  reprint();
                }}
              >
                −
              </button>
              <output aria-live="polite">{counts[key]}</output>
              <button
                type="button"
                aria-label={more}
                disabled={!canStep(counts, key, 1)}
                onClick={() => {
                  setCounts(c => ({...c, [key]: c[key] + 1}));
                  reprint();
                }}
              >
                +
              </button>
            </span>
          </div>
        ))}

        <div className="ctl">
          <span>
            <b id="l-pe">Plan for</b>
            <small>Buy once, receive in drops</small>
          </span>
          <fieldset className="seg-light" aria-labelledby="l-pe">
            {PERIODS.map(p => (
              <label key={p.value}>
                <input
                  type="radio"
                  name="pe"
                  value={p.value}
                  checked={weeks === p.value}
                  onChange={() => changePeriod(p.value)}
                />
                <span>{p.label}</span>
              </label>
            ))}
          </fieldset>
        </div>

        <div className="ctl">
          <span>
            <b id="l-dr">Drops</b>
            <small id="dr-hint">{plan.dropsHint}</small>
          </span>
          <fieldset className="seg-light" aria-labelledby="l-dr">
            {[1, 2, 3, 4].map(n => (
              <label key={n}>
                <input
                  type="radio"
                  name="dr"
                  value={n}
                  checked={drops === n}
                  disabled={n > maxDrops(weeks)}
                  onChange={() => {
                    setDrops(n);
                    setHeldDrops(null);
                    reprint();
                  }}
                />
                <span>{n}</span>
              </label>
            ))}
          </fieldset>
        </div>

        <div className="ctl">
          <span>
            <b>
              <label htmlFor="bud">Budget</label>
            </b>
            <small>Optional. A guide, never a wall.</small>
          </span>
          <span className="budget-in">
            ₦
            <input
              id="bud"
              inputMode="numeric"
              autoComplete="off"
              aria-describedby="slip-budget"
              value={budget}
              onChange={e => {
                const digits = e.target.value.replace(/\D/g, '').slice(0, 9);
                setBudget(digits ? Number(digits).toLocaleString('en-NG') : '');
              }}
            />
          </span>
        </div>
      </form>

      <div className="slip-wrap rv">
        <div className="slip" id="slip" ref={slip}>
          <div className="slip-head">
            <img src="/brand/grov-wordmark.svg" alt="Grov" width={45} height={22} />
            <small>
              <b id="s-people">{plan.people}</b> · Ikeja, Lagos
              <br />
              <span id="s-period">{plan.period}</span>
            </small>
          </div>
          <ul className="slip-lines" id="s-lines">
            {plan.lines.map(line => (
              <li key={line.name}>
                <b>{line.name}</b>
                <span className="amt">
                  <span className="money">{naira(line.price)}</span>
                  {line.status ? <PriceChip kind={line.status} /> : null}
                </span>
                <small>{line.amount}</small>
              </li>
            ))}
          </ul>
          <div className="slip-sum">
            <div>
              <span>Food</span>
              <span className="money">{naira(plan.food)}</span>
            </div>
            <div>
              <span>{plan.feesLabel}</span>
              <span className="money">{naira(plan.fees)}</span>
            </div>
          </div>
          <div className="slip-total">
            <span>
              Plan total
              <small
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--ink-muted)',
                }}
              >
                Paid once, at checkout
              </small>
            </span>
            <b className="money" aria-live="polite">
              {naira(plan.total)}
            </b>
          </div>
          <p className="slip-budget" id="slip-budget">
            {plan.budget.kind === 'none' ? (
              'No budget set. That’s fine; the plan stands on its own.'
            ) : plan.budget.kind === 'above' ? (
              <>
                <b>{naira(plan.budget.difference)} above</b> your {naira(plan.budget.budget)}{' '}
                budget. Checkout still works.
              </>
            ) : plan.budget.kind === 'under' ? (
              <>
                <b>{naira(plan.budget.difference)} under</b> your {naira(plan.budget.budget)}{' '}
                budget.
              </>
            ) : (
              <>
                <b>Right on</b> your budget.
              </>
            )}
          </p>
          <ul className="slip-drops" id="s-drops">
            {plan.drops.map((drop, i) => (
              <li key={drop.date}>
                <span className="d">{i + 1}</span>
                <span>
                  {drop.date}
                  <small>{drop.note}</small>
                </span>
                <span className="money">{naira(drop.amount)}</span>
              </li>
            ))}
          </ul>
          <p className="note" style={{marginTop: '14px'}}>
            Sample plan and prices, for illustration. Delivery fee is a placeholder.
          </p>
        </div>
      </div>
    </div>
  );
}
