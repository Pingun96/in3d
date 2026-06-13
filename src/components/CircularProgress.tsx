import React from 'react';

interface CircularProgressProps {
  value: number;
  max: number;
  title: string;
  unit?: string;
  size?: number;
  strokeWidth?: number;
  color?: string; // 'green' | 'orange' | 'amber' | 'blue'
  icon?: React.ReactNode;
  onClick?: () => void;
  clickable?: boolean;
}

export function CircularProgress({
  value,
  max,
  title,
  unit = '°C',
  size = 120,
  strokeWidth = 8,
  color = 'green',
  icon,
  onClick,
  clickable = false
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percent = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0;
  const strokeDashoffset = circumference - percent * circumference;

  let colorValue = '#00e676'; // green
  if (color === 'orange') colorValue = '#ff5252';
  if (color === 'amber') colorValue = '#ffd740';
  if (color === 'blue') colorValue = '#40c4ff';

  return (
    <div 
      className={`flex flex-col items-center justify-center transition-transform duration-200 ${clickable ? 'cursor-pointer active:scale-95 group' : ''}`}
      onClick={onClick}
    >
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background Circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#2c2e33"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colorValue}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        
        {/* Value Text Inside */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {icon && <div className="mb-1" style={{ color: colorValue }}>{icon}</div>}
          <div className="text-3xl font-bold tracking-tighter text-white">
            {value}<span className="text-sm font-normal text-[#a0a0a0] ml-1">{unit}</span>
          </div>
        </div>
      </div>
      <div className="mt-3 text-xs font-semibold tracking-wider text-[#a0a0a0] uppercase">
        {title}
      </div>
    </div>
  );
}
