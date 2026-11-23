import {useEffect, useState} from 'react';

/** Whole seconds until `until` (ISO instant), ticking every second; 0 once passed. */
export function useCountdown(until: string | null | undefined): number {
  const target = until ? Date.parse(until) : NaN;
  const compute = () =>
    Number.isFinite(target) ? Math.max(0, Math.ceil((target - Date.now()) / 1000)) : 0;
  const [seconds, setSeconds] = useState(compute);

  useEffect(() => {
    setSeconds(compute());
    if (!Number.isFinite(target)) return undefined;
    const timer = window.setInterval(() => {
      const next = compute();
      setSeconds(next);
      if (next === 0) window.clearInterval(timer);
    }, 1000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- compute only depends on target
  }, [target]);

  return seconds;
}
