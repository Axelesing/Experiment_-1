import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Eye, EyeOff, Info } from 'lucide-react';

import { Button } from '../../../shared/ui';
import type { ColorPalette } from '../../../entities/color/lib';

export interface ColorBlindnessSimulatorProps {
  palette: ColorPalette;
  className?: string;
}

interface ColorBlindnessType {
  id: string;
  name: string;
  description: string;
  prevalence: string;
  matrix: number[][];
}

/**
 * Component for simulating different types of color blindness
 */
export const ColorBlindnessSimulator = observer<ColorBlindnessSimulatorProps>(
  ({ palette, className = '' }) => {
    const [activeSimulation, setActiveSimulation] = useState<string | null>(
      null
    );
    const [showInfo, setShowInfo] = useState(false);

    const colorBlindnessTypes: ColorBlindnessType[] = [
      {
        id: 'protanopia',
        name: 'Протанопия',
        description: 'Неспособность воспринимать красный цвет',
        prevalence: '1% мужчин',
        matrix: [
          [0.567, 0.433, 0],
          [0.558, 0.442, 0],
          [0, 0.242, 0.758],
        ],
      },
      {
        id: 'deuteranopia',
        name: 'Дейтеранопия',
        description: 'Неспособность воспринимать зеленый цвет',
        prevalence: '1% мужчин',
        matrix: [
          [0.625, 0.375, 0],
          [0.7, 0.3, 0],
          [0, 0.3, 0.7],
        ],
      },
      {
        id: 'tritanopia',
        name: 'Тританопия',
        description: 'Неспособность воспринимать синий цвет',
        prevalence: '0.003% населения',
        matrix: [
          [0.95, 0.05, 0],
          [0, 0.433, 0.567],
          [0, 0.475, 0.525],
        ],
      },
      {
        id: 'protanomaly',
        name: 'Протаномалия',
        description: 'Слабое восприятие красного цвета',
        prevalence: '1% мужчин',
        matrix: [
          [0.817, 0.183, 0],
          [0.333, 0.667, 0],
          [0, 0.125, 0.875],
        ],
      },
      {
        id: 'deuteranomaly',
        name: 'Дейтераномалия',
        description: 'Слабое восприятие зеленого цвета',
        prevalence: '5% мужчин',
        matrix: [
          [0.8, 0.2, 0],
          [0.258, 0.742, 0],
          [0, 0.142, 0.858],
        ],
      },
      {
        id: 'tritanomaly',
        name: 'Тританомалия',
        description: 'Слабое восприятие синего цвета',
        prevalence: '0.01% населения',
        matrix: [
          [0.967, 0.033, 0],
          [0, 0.733, 0.267],
          [0, 0.183, 0.817],
        ],
      },
      {
        id: 'achromatopsia',
        name: 'Ахроматопсия',
        description: 'Полная цветовая слепота',
        prevalence: '0.003% населения',
        matrix: [
          [0.299, 0.587, 0.114],
          [0.299, 0.587, 0.114],
          [0.299, 0.587, 0.114],
        ],
      },
    ];

    // Convert hex to RGB
    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return [r, g, b];
    };

    // Convert RGB to hex
    const rgbToHex = (r: number, g: number, b: number) => {
      const toHex = (c: number) => {
        const hex = Math.round(Math.max(0, Math.min(255, c))).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    };

    // Apply color blindness simulation
    const simulateColorBlindness = (color: string, matrix: number[][]) => {
      const [r, g, b] = hexToRgb(color);

      const newR = r * matrix[0][0] + g * matrix[0][1] + b * matrix[0][2];
      const newG = r * matrix[1][0] + g * matrix[1][1] + b * matrix[1][2];
      const newB = r * matrix[2][0] + g * matrix[2][1] + b * matrix[2][2];

      return rgbToHex(newR, newG, newB);
    };

    // Get simulated colors for a specific type
    const getSimulatedColors = (type: ColorBlindnessType) => {
      return palette.colors.map((color) =>
        simulateColorBlindness(color, type.matrix)
      );
    };

    const handleSimulationToggle = (typeId: string) => {
      setActiveSimulation(activeSimulation === typeId ? null : typeId);
    };

    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Симулятор цветовой слепоты
          </h3>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowInfo(!showInfo)}
            leftIcon={<Info className="w-4 h-4" />}
          >
            Информация
          </Button>
        </div>

        {/* Info Panel */}
        {showInfo && (
          <div className="glass rounded-lg p-4 border border-white/20">
            <h4 className="text-white font-medium mb-3">О цветовой слепоте</h4>
            <div className="space-y-2 text-sm text-white/70">
              <p>
                Цветовая слепота (дальтонизм) — это нарушение цветового
                восприятия, которое затрагивает около 8% мужчин и 0.5% женщин.
              </p>
              <p>
                Используйте этот симулятор, чтобы проверить, как ваша палитра
                выглядит для людей с различными типами цветовой слепоты.
              </p>
              <p>
                <strong>Рекомендации:</strong> Убедитесь, что важная информация
                не передается только через цвет, используйте дополнительные
                визуальные подсказки (иконки, текст, формы).
              </p>
            </div>
          </div>
        )}

        {/* Original Palette */}
        <div className="glass rounded-lg p-4 border border-white/20">
          <h4 className="text-white font-medium mb-3">Оригинальная палитра</h4>
          <div className="grid grid-cols-5 gap-2">
            {palette.colors.map((color, index) => (
              <div key={index} className="text-center">
                <div
                  className="w-full h-16 rounded border border-white/20 mb-2"
                  style={{ backgroundColor: color }}
                />
                <p className="text-white/70 text-xs font-mono">{color}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Color Blindness Types */}
        <div className="space-y-3">
          {colorBlindnessTypes.map((type) => {
            const isActive = activeSimulation === type.id;
            const simulatedColors = getSimulatedColors(type);

            return (
              <div
                key={type.id}
                className="glass rounded-lg p-4 border border-white/20"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-white font-medium">{type.name}</h4>
                    <p className="text-white/60 text-sm">{type.description}</p>
                    <p className="text-white/50 text-xs">
                      Распространенность: {type.prevalence}
                    </p>
                  </div>
                  <Button
                    variant={isActive ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => handleSimulationToggle(type.id)}
                    leftIcon={
                      isActive ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )
                    }
                  >
                    {isActive ? 'Скрыть' : 'Показать'}
                  </Button>
                </div>

                {isActive && (
                  <div className="space-y-3">
                    {/* Simulated Colors */}
                    <div>
                      <h5 className="text-white/80 text-sm font-medium mb-2">
                        Как видит человек с {type.name.toLowerCase()}
                      </h5>
                      <div className="grid grid-cols-5 gap-2">
                        {simulatedColors.map((color, index) => (
                          <div key={index} className="text-center">
                            <div
                              className="w-full h-16 rounded border border-white/20 mb-2"
                              style={{ backgroundColor: color }}
                            />
                            <p className="text-white/70 text-xs font-mono">
                              {color}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Comparison */}
                    <div>
                      <h5 className="text-white/80 text-sm font-medium mb-2">
                        Сравнение
                      </h5>
                      <div className="space-y-2">
                        {palette.colors.map((originalColor, index) => {
                          const simulatedColor = simulatedColors[index];
                          const isSimilar = originalColor === simulatedColor;

                          return (
                            <div
                              key={index}
                              className="flex items-center gap-3"
                            >
                              <div
                                className="w-8 h-8 rounded border border-white/20"
                                style={{ backgroundColor: originalColor }}
                                title={`Оригинал: ${originalColor}`}
                              />
                              <span className="text-white/50">→</span>
                              <div
                                className="w-8 h-8 rounded border border-white/20"
                                style={{ backgroundColor: simulatedColor }}
                                title={`Симуляция: ${simulatedColor}`}
                              />
                              <div className="flex-1">
                                <p className="text-white/70 text-sm">
                                  {isSimilar ? 'Без изменений' : 'Цвет изменен'}
                                </p>
                              </div>
                              {!isSimilar && (
                                <span className="text-yellow-400 text-xs">
                                  ⚠️ Изменение
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Recommendations */}
        <div className="glass rounded-lg p-4 border border-white/20">
          <h4 className="text-white font-medium mb-3">
            Рекомендации по доступности
          </h4>
          <div className="space-y-2 text-sm text-white/70">
            <div className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span>
              <span>Используйте достаточный контраст между цветами</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span>
              <span>Добавляйте иконки или текст к цветовым индикаторам</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span>
              <span>Тестируйте палитру с помощью симулятора</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span>
              <span>
                Избегайте передачи важной информации только через цвет
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
