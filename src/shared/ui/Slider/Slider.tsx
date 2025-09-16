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
    const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(Number(event.target.value));
    };

    const sliderId = `slider-${label.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <div className={cn('space-y-2', className)}>
        <label
          htmlFor={sliderId}
          className="block text-sm font-medium text-white/80"
        >
          {label}: {value}
        </label>
        <input
          id={sliderId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
          aria-label={`${label}: ${value}`}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
        />
      </div>
    );
  }
);

Slider.displayName = 'Slider';
