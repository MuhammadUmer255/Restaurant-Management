import React from 'react';

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
  isPositive?: boolean;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  height = 36,
  width = 120,
  isPositive = true,
}) => {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * (width - 4) + 2;
    const y = height - 4 - ((val - min) / range) * (height - 8);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const strokeColor = isPositive ? '#71717a' : '#a1a1aa';
  const lastPoint = points[points.length - 1].split(',').map(Number);

  return (
    <svg
      width={width}
      height={height}
      className="overflow-visible inline-block shrink-0 opacity-80"
      aria-hidden="true"
    >
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={lastPoint[0]}
        cy={lastPoint[1]}
        r="2"
        fill={strokeColor}
      />
    </svg>
  );
};
