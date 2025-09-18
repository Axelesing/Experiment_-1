import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  Accessibility,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';

import { Button } from '../../../shared/ui';
import type { ColorPalette } from '../../../entities/color/lib';

export interface AccessibilityCheckerProps {
  palette: ColorPalette;
  className?: string;
}

interface ContrastResult {
  ratio: number;
  level: 'AAA' | 'AA' | 'AA Large' | 'Fail';
  passed: boolean;
}

/**
 * Component for checking color accessibility and contrast ratios
 */
export const AccessibilityChecker = observer<AccessibilityCheckerProps>(
  ({ palette, className = '' }) => {
    const [showDetails, setShowDetails] = React.useState(false);

    // Convert hex to RGB
    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return { r, g, b };
    };

    // Calculate relative luminance
    const getLuminance = (r: number, g: number, b: number) => {
      const [rs, gs, bs] = [r, g, b].map((c) => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    // Calculate contrast ratio
    const getContrastRatio = (color1: string, color2: string): number => {
      const rgb1 = hexToRgb(color1);
      const rgb2 = hexToRgb(color2);

      const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
      const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

      const brightest = Math.max(lum1, lum2);
      const darkest = Math.min(lum1, lum2);

      return (brightest + 0.05) / (darkest + 0.05);
    };

    // Get contrast level
    const getContrastLevel = (ratio: number): ContrastResult => {
      if (ratio >= 7) {
        return { ratio, level: 'AAA', passed: true };
      } else if (ratio >= 4.5) {
        return { ratio, level: 'AA', passed: true };
      } else if (ratio >= 3) {
        return { ratio, level: 'AA Large', passed: true };
      } else {
        return { ratio, level: 'Fail', passed: false };
      }
    };

    // Generate contrast combinations
    const getContrastCombinations = () => {
      const combinations: Array<{
        foreground: string;
        background: string;
        result: ContrastResult;
      }> = [];

      // Test each color against white and black backgrounds
      palette.colors.forEach((color) => {
        const whiteResult = getContrastLevel(
          getContrastRatio(color, '#ffffff')
        );
        const blackResult = getContrastLevel(
          getContrastRatio(color, '#000000')
        );

        combinations.push(
          { foreground: color, background: '#ffffff', result: whiteResult },
          { foreground: color, background: '#000000', result: blackResult }
        );
      });

      // Test color combinations
      for (let i = 0; i < palette.colors.length; i++) {
        for (let j = i + 1; j < palette.colors.length; j++) {
          const result = getContrastLevel(
            getContrastRatio(palette.colors[i], palette.colors[j])
          );
          combinations.push({
            foreground: palette.colors[i],
            background: palette.colors[j],
            result,
          });
        }
      }

      return combinations;
    };

    const combinations = getContrastCombinations();
    const passedTests = combinations.filter((c) => c.result.passed).length;
    const totalTests = combinations.length;
    const passRate = Math.round((passedTests / totalTests) * 100);

    const getLevelColor = (level: string) => {
      switch (level) {
        case 'AAA':
          return 'text-green-400';
        case 'AA':
          return 'text-blue-400';
        case 'AA Large':
          return 'text-yellow-400';
        case 'Fail':
          return 'text-red-400';
        default:
          return 'text-white/60';
      }
    };

    const getLevelIcon = (level: string) => {
      switch (level) {
        case 'AAA':
        case 'AA':
        case 'AA Large':
          return <CheckCircle className="w-4 h-4" />;
        case 'Fail':
          return <XCircle className="w-4 h-4" />;
        default:
          return <AlertTriangle className="w-4 h-4" />;
      }
    };

    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Accessibility className="w-5 h-5" />
            Проверка доступности
          </h3>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Скрыть детали' : 'Показать детали'}
          </Button>
        </div>

        {/* Summary */}
        <div className="glass rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-white font-medium">Общая оценка</h4>
              <p className="text-white/70 text-sm">
                {passedTests} из {totalTests} тестов пройдено
              </p>
            </div>
            <div className="text-right">
              <div
                className={`text-2xl font-bold ${passRate >= 80 ? 'text-green-400' : passRate >= 60 ? 'text-yellow-400' : 'text-red-400'}`}
              >
                {passRate}%
              </div>
              <p className="text-white/70 text-sm">Процент успеха</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                passRate >= 80
                  ? 'bg-green-400'
                  : passRate >= 60
                    ? 'bg-yellow-400'
                    : 'bg-red-400'
              }`}
              style={{ width: `${passRate}%` }}
            />
          </div>
        </div>

        {/* Quick Tests */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* White Background Test */}
          <div className="glass rounded-lg p-4 border border-white/20">
            <h4 className="text-white font-medium mb-3">На белом фоне</h4>
            <div className="space-y-2">
              {palette.colors.map((color, index) => {
                const result = getContrastLevel(
                  getContrastRatio(color, '#ffffff')
                );
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 rounded"
                    style={{ backgroundColor: '#ffffff' }}
                  >
                    <span className="font-medium" style={{ color }}>
                      Текст
                    </span>
                    <div className="flex-1" />
                    <div
                      className={`flex items-center gap-1 ${getLevelColor(result.level)}`}
                    >
                      {getLevelIcon(result.level)}
                      <span className="text-xs">
                        {result.ratio.toFixed(1)}:1
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Black Background Test */}
          <div className="glass rounded-lg p-4 border border-white/20">
            <h4 className="text-white font-medium mb-3">На черном фоне</h4>
            <div className="space-y-2">
              {palette.colors.map((color, index) => {
                const result = getContrastLevel(
                  getContrastRatio(color, '#000000')
                );
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 rounded"
                    style={{ backgroundColor: '#000000' }}
                  >
                    <span className="font-medium" style={{ color }}>
                      Текст
                    </span>
                    <div className="flex-1" />
                    <div
                      className={`flex items-center gap-1 ${getLevelColor(result.level)}`}
                    >
                      {getLevelIcon(result.level)}
                      <span className="text-xs">
                        {result.ratio.toFixed(1)}:1
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Detailed Results */}
        {showDetails && (
          <div className="glass rounded-lg p-4 border border-white/20">
            <h4 className="text-white font-medium mb-3">
              Детальные результаты
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {combinations.map((combo, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-2 rounded border border-white/10"
                >
                  <div
                    className="w-8 h-8 rounded border border-white/20"
                    style={{ backgroundColor: combo.foreground }}
                  />
                  <span className="text-white/70">на</span>
                  <div
                    className="w-8 h-8 rounded border border-white/20"
                    style={{ backgroundColor: combo.background }}
                  />
                  <div className="flex-1">
                    <span className="text-white text-sm">
                      {combo.foreground} на {combo.background}
                    </span>
                  </div>
                  <div
                    className={`flex items-center gap-1 ${getLevelColor(combo.result.level)}`}
                  >
                    {getLevelIcon(combo.result.level)}
                    <span className="text-xs">
                      {combo.result.ratio.toFixed(1)}:1 ({combo.result.level})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="glass rounded-lg p-4 border border-white/20">
          <h4 className="text-white font-medium mb-3">Рекомендации</h4>
          <div className="space-y-2 text-sm text-white/70">
            {passRate < 60 && (
              <p className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <span>
                  Низкий процент доступности. Рекомендуется пересмотреть цвета
                  палитры.
                </span>
              </p>
            )}
            {passRate >= 60 && passRate < 80 && (
              <p className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <span>
                  Средний процент доступности. Некоторые комбинации могут быть
                  улучшены.
                </span>
              </p>
            )}
            {passRate >= 80 && (
              <p className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>
                  Отличная доступность! Палитра соответствует стандартам WCAG.
                </span>
              </p>
            )}
            <p className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">ℹ</span>
              <span>
                WCAG AA требует контрастность минимум 4.5:1 для обычного текста
                и 3:1 для крупного текста.
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }
);
