import React from 'react';

import { cn } from '@/shared/lib/utils';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  label: string;
  className?: string;
}

export const Slider = React.memo(
  ({ value, onChange, min, max, step = 1, label, className }: SliderProps) => {
    return (
      <div className={cn('space-y-2', className)}>
        <label className="block text-sm font-medium text-white/80">
          {label}: {value}
        </label>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>
    );
  }
);

Slider.displayName = 'Slider';
