import {type ReactNode, useMemo} from 'react';

/** Finale skyline: deterministic (seeded) so prerendered and hydrated markup match. */
export function Skyline() {
  const shapes = useMemo(() => {
    let seed = 7;
    const rnd = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    const out: ReactNode[] = [];
    let x = 0;
    let k = 0;
    while (x < 1440) {
      const w = 46 + Math.floor(rnd() * 80);
      const h = 90 + Math.floor(rnd() * 230);
      const y = 360 - h;
      const tone =
        rnd() < 0.5
          ? 'var(--night-hi)'
          : 'color-mix(in srgb,var(--night-hi) 70%,var(--on-night) 6%)';
      out.push(<rect key={k++} x={x} y={y} width={w - 4} height={h} style={{fill: tone}} />);
      for (let wy = y + 14; wy < 350; wy += 16) {
        for (let wx = x + 8; wx < x + w - 12; wx += 12) {
          if (rnd() < 0.24) {
            const opacity = (0.45 + rnd() * 0.5).toFixed(2);
            out.push(
              <rect
                key={k++}
                x={wx}
                y={wy}
                width={5}
                height={7}
                rx={1}
                style={{fill: 'var(--palm)', opacity}}
              />
            );
          }
        }
      }
      x += w;
    }
    out.push(
      <rect key={k++} x={0} y={340} width={1440} height={20} style={{fill: 'var(--night)'}} />
    );
    for (let bx = 10; bx < 1440; bx += 36) {
      out.push(
        <circle key={k++} cx={bx} cy={342} r={1.6} style={{fill: 'var(--palm)', opacity: 0.8}} />
      );
    }
    return out;
  }, []);

  return (
    <svg className="sky" viewBox="0 0 1440 360" preserveAspectRatio="xMidYMax slice">
      {shapes}
    </svg>
  );
}
