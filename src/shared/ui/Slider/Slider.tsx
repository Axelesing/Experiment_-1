import React, { useCallback, useMemo } from 'react';

import { cn } from '@/shared/lib/utils';
import type { BaseComponentProps } from '@/shared/types';

/**
 * Slider component props
 */
interface SliderProps extends BaseComponentProps {
  /** Current value */
  value: number;
  /** Value change handler */
  onChange: (value: number) => void;
  /** Minimum value */
  min: number;
  /** Maximum value */
  max: number;
  /** Step increment */
  step?: number;
  /** Label for the slider */
  label: string;
  /** Whether slider is disabled */
  disabled?: boolean;
  /** Show value in label */
  showValue?: boolean;
  /** Custom value formatter */
  formatValue?: (value: number) => string;
  /** Additional description */
  description?: string;
}

/**
 * Reusable Slider component with accessibility features
 *
 * @example
 * ```tsx
 * <Slider
 *   value={50}
 *   onChange={setValue}
 *   min={0}
 *   max={100}
 *   label="Volume"
 *   showValue
 * />
 * ```
 */
export const Slider = React.memo(
  ({
    value,
    onChange,
    min,
    max,
    step = 1,
    label,
    disabled = false,
    showValue = true,
    formatValue,
    description,
    className,
  }: SliderProps) => {
    const sliderId = useMemo(
      () => `slider-${label.toLowerCase().replace(/\s+/g, '-')}`,
      [label]
    );

    const handleSliderChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = Number(event.target.value);
        onChange(newValue);
      },
      [onChange]
    );

    const displayValue = useMemo(() => {
      if (formatValue) {
        return formatValue(value);
      }
      return showValue ? value.toString() : '';
    }, [value, formatValue, showValue]);

    const percentage = useMemo(() => {
      return ((value - min) / (max - min)) * 100;
    }, [value, min, max]);

    return (
      <div className={cn('space-y-2', className)}>
        <label
          htmlFor={sliderId}
          className="block text-sm font-medium text-white/80"
        >
          {label}
          {displayValue && (
            <span className="ml-2 text-white/60">({displayValue})</span>
          )}
        </label>

        {description && <p className="text-xs text-white/60">{description}</p>}

        <div className="relative">
          <input
            id={sliderId}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleSliderChange}
            disabled={disabled}
            className={cn(
              'w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider',
              'focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'slider-thumb:appearance-none slider-thumb:w-4 slider-thumb:h-4',
              'slider-thumb:rounded-full slider-thumb:bg-white slider-thumb:cursor-pointer',
              'slider-thumb:shadow-lg slider-thumb:transition-all slider-thumb:duration-200',
              'slider-thumb:hover:scale-110 slider-thumb:focus:scale-110'
            )}
            style={{
              background: `linear-gradient(to right, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.3) ${percentage}%, rgba(255,255,255,0.2) ${percentage}%, rgba(255,255,255,0.2) 100%)`,
            }}
            aria-label={`${label}: ${displayValue}`}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
            aria-valuetext={displayValue}
            aria-disabled={disabled}
          />
        </div>
      </div>
    );
  }
);

Slider.displayName = 'Slider';
