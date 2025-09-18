import { useState, useCallback, useEffect } from 'react';
import { observer } from 'mobx-react-lite';

export interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  showAdvanced?: boolean;
  className?: string;
}

interface HSLColor {
  h: number;
  s: number;
  l: number;
}

interface RGBColor {
  r: number;
  g: number;
  b: number;
}

/**
 * Advanced color picker component with HSL/RGB support
 */
export const ColorPicker = observer<ColorPickerProps>(
  ({ value, onChange, showAdvanced = false, className = '' }) => {
    const [hsl, setHsl] = useState<HSLColor>({ h: 0, s: 0, l: 0 });
    const [rgb, setRgb] = useState<RGBColor>({ r: 0, g: 0, b: 0 });
    const [showAdvancedPanel, setShowAdvancedPanel] = useState(showAdvanced);

    // Convert hex to HSL
    const hexToHsl = useCallback((hex: string): HSLColor => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0;
      let s = 0;
      const l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;
          case g:
            h = (b - r) / d + 2;
            break;
          case b:
            h = (r - g) / d + 4;
            break;
        }
        h /= 6;
      }

      return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100),
      };
    }, []);

    // Convert hex to RGB
    const hexToRgb = useCallback((hex: string): RGBColor => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return { r, g, b };
    }, []);

    // Convert HSL to hex
    const hslToHex = useCallback((h: number, s: number, l: number): string => {
      h = h / 360;
      s = s / 100;
      l = l / 100;

      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      let r, g, b;

      if (s === 0) {
        r = g = b = l;
      } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
      }

      const toHex = (c: number) => {
        const hex = Math.round(c * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };

      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }, []);

    // Convert RGB to hex
    const rgbToHex = useCallback((r: number, g: number, b: number): string => {
      const toHex = (c: number) => {
        const hex = Math.round(Math.max(0, Math.min(255, c))).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }, []);

    // Update internal state when value changes
    useEffect(() => {
      if (value && value.match(/^#[0-9A-Fa-f]{6}$/)) {
        setHsl(hexToHsl(value));
        setRgb(hexToRgb(value));
      }
    }, [value, hexToHsl, hexToRgb]);

    // Handle HSL changes
    const handleHslChange = useCallback(
      (newHsl: Partial<HSLColor>) => {
        const updatedHsl = { ...hsl, ...newHsl };
        setHsl(updatedHsl);
        const hex = hslToHex(updatedHsl.h, updatedHsl.s, updatedHsl.l);
        onChange(hex);
      },
      [hsl, hslToHex, onChange]
    );

    // Handle RGB changes
    const handleRgbChange = useCallback(
      (newRgb: Partial<RGBColor>) => {
        const updatedRgb = { ...rgb, ...newRgb };
        setRgb(updatedRgb);
        const hex = rgbToHex(updatedRgb.r, updatedRgb.g, updatedRgb.b);
        onChange(hex);
      },
      [rgb, rgbToHex, onChange]
    );

    // Handle direct hex input
    const handleHexChange = useCallback(
      (hex: string) => {
        if (hex.match(/^#[0-9A-Fa-f]{6}$/)) {
          onChange(hex);
        }
      },
      [onChange]
    );

    return (
      <div className={`space-y-4 ${className}`}>
        {/* Basic Color Picker */}
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-12 h-10 rounded border border-white/20 cursor-pointer"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => handleHexChange(e.target.value)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm font-mono"
            placeholder="#ff6b6b"
          />
          {showAdvanced && (
            <button
              onClick={() => setShowAdvancedPanel(!showAdvancedPanel)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm hover:bg-white/20 transition-colors"
            >
              {showAdvancedPanel ? 'Скрыть' : 'Показать'} HSL/RGB
            </button>
          )}
        </div>

        {/* Advanced Controls */}
        {showAdvanced && showAdvancedPanel && (
          <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
            {/* HSL Controls */}
            <div>
              <h4 className="text-white font-medium mb-3">HSL</h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-white/70 mb-1">
                    Hue
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={hsl.h}
                    onChange={(e) =>
                      handleHslChange({ h: parseInt(e.target.value) })
                    }
                    className="w-full"
                  />
                  <input
                    type="number"
                    min="0"
                    max="360"
                    value={hsl.h}
                    onChange={(e) =>
                      handleHslChange({ h: parseInt(e.target.value) || 0 })
                    }
                    className="w-full mt-1 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/70 mb-1">
                    Saturation
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={hsl.s}
                    onChange={(e) =>
                      handleHslChange({ s: parseInt(e.target.value) })
                    }
                    className="w-full"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={hsl.s}
                    onChange={(e) =>
                      handleHslChange({ s: parseInt(e.target.value) || 0 })
                    }
                    className="w-full mt-1 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/70 mb-1">
                    Lightness
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={hsl.l}
                    onChange={(e) =>
                      handleHslChange({ l: parseInt(e.target.value) })
                    }
                    className="w-full"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={hsl.l}
                    onChange={(e) =>
                      handleHslChange({ l: parseInt(e.target.value) || 0 })
                    }
                    className="w-full mt-1 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-xs"
                  />
                </div>
              </div>
            </div>

            {/* RGB Controls */}
            <div>
              <h4 className="text-white font-medium mb-3">RGB</h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-white/70 mb-1">
                    Red
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={rgb.r}
                    onChange={(e) =>
                      handleRgbChange({ r: parseInt(e.target.value) })
                    }
                    className="w-full"
                  />
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={rgb.r}
                    onChange={(e) =>
                      handleRgbChange({ r: parseInt(e.target.value) || 0 })
                    }
                    className="w-full mt-1 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/70 mb-1">
                    Green
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={rgb.g}
                    onChange={(e) =>
                      handleRgbChange({ g: parseInt(e.target.value) })
                    }
                    className="w-full"
                  />
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={rgb.g}
                    onChange={(e) =>
                      handleRgbChange({ g: parseInt(e.target.value) || 0 })
                    }
                    className="w-full mt-1 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/70 mb-1">
                    Blue
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={rgb.b}
                    onChange={(e) =>
                      handleRgbChange({ b: parseInt(e.target.value) })
                    }
                    className="w-full"
                  />
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={rgb.b}
                    onChange={(e) =>
                      handleRgbChange({ b: parseInt(e.target.value) || 0 })
                    }
                    className="w-full mt-1 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);
