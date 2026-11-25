import {cn} from '../utils/cn';

export interface SparklineProps {
  values: number[];
  className?: string;
}

export function Sparkline({values, className}: SparklineProps) {
  if (values.length < 2) return <div aria-hidden className={cn('h-10', className)} />;
  const max = Math.max(1, ...values);
  const x = (i: number) => (i / (values.length - 1)) * 100;
  const y = (v: number) => 38 - (v / max) * 34;
  const line = values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(2)},${y(v).toFixed(2)}`);
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      className={cn('h-10 w-full', className)}
    >
      <path d={`${line.join(' ')} L100,40 L0,40 Z`} className="fill-chart-4 opacity-15" />
      <path
        d={line.join(' ')}
        fill="none"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
        className="stroke-chart-4"
      />
    </svg>
  );
}
