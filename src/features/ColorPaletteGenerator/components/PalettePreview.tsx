import React from 'react';
import { observer } from 'mobx-react-lite';
import { Eye, Smartphone, Monitor, Palette } from 'lucide-react';

import { Button } from '../../../shared/ui';
import type { ColorPalette } from '../../../entities/color/lib';

export interface PalettePreviewProps {
  palette: ColorPalette;
  className?: string;
}

/**
 * Component for previewing color palette in different contexts
 */
type PreviewType = 'web' | 'mobile' | 'ui';

export const PalettePreview = observer<PalettePreviewProps>(
  ({ palette, className = '' }) => {
    const [activePreview, setActivePreview] =
      React.useState<PreviewType>('web');

    const previewStyles: Record<
      PreviewType,
      {
        title: string;
        icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
        examples: Array<{ name: string; colors: number[] }>;
      }
    > = {
      web: {
        title: 'Веб-сайт',
        icon: Monitor,
        examples: [
          { name: 'Header', colors: [0, 1, 2] },
          { name: 'Content', colors: [1, 2, 3] },
          { name: 'Sidebar', colors: [2, 3, 4] },
          { name: 'Footer', colors: [3, 4, 0] },
        ],
      },
      mobile: {
        title: 'Мобильное приложение',
        icon: Smartphone,
        examples: [
          { name: 'Navigation', colors: [0, 1] },
          { name: 'Cards', colors: [1, 2, 3] },
          { name: 'Buttons', colors: [2, 3] },
          { name: 'Background', colors: [4, 0] },
        ],
      },
      ui: {
        title: 'UI Компоненты',
        icon: Palette,
        examples: [
          { name: 'Primary', colors: [0] },
          { name: 'Secondary', colors: [1] },
          { name: 'Success', colors: [2] },
          { name: 'Warning', colors: [3] },
          { name: 'Error', colors: [4] },
        ],
      },
    };

    const currentPreview = previewStyles[activePreview];

    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Предварительный просмотр
          </h3>

          <div className="flex gap-1">
            {Object.entries(previewStyles).map(([key, style]) => {
              const Icon = style.icon;
              return (
                <Button
                  key={key}
                  variant={activePreview === key ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setActivePreview(key as PreviewType)}
                  leftIcon={<Icon className="w-4 h-4" />}
                >
                  {style.title}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentPreview.examples.map((example, index) => (
            <div
              key={index}
              className="glass rounded-lg p-4 border border-white/20"
            >
              <h4 className="text-white font-medium mb-3">{example.name}</h4>

              <div className="space-y-2">
                {example.colors.map((colorIndex, colorIdx) => {
                  const color =
                    palette.colors[colorIndex % palette.colors.length];
                  return (
                    <div key={colorIdx} className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded border border-white/20"
                        style={{ backgroundColor: color }}
                      />
                      <div className="flex-1">
                        <div
                          className="h-6 rounded border border-white/20"
                          style={{ backgroundColor: color }}
                        />
                      </div>
                      <span className="text-white/70 text-xs font-mono">
                        {color}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Color Usage Examples */}
        <div className="glass rounded-lg p-4 border border-white/20">
          <h4 className="text-white font-medium mb-3">Примеры использования</h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Button Examples */}
            <div className="space-y-2">
              <h5 className="text-white/80 text-sm font-medium">Кнопки</h5>
              <div className="space-y-2">
                <button
                  className="w-full px-4 py-2 rounded-lg text-white font-medium transition-colors"
                  style={{ backgroundColor: palette.colors[0] }}
                >
                  Основная кнопка
                </button>
                <button
                  className="w-full px-4 py-2 rounded-lg border-2 transition-colors"
                  style={{
                    borderColor: palette.colors[1],
                    color: palette.colors[1],
                    backgroundColor: 'transparent',
                  }}
                >
                  Вторичная кнопка
                </button>
              </div>
            </div>

            {/* Card Examples */}
            <div className="space-y-2">
              <h5 className="text-white/80 text-sm font-medium">Карточки</h5>
              <div
                className="p-3 rounded-lg border"
                style={{
                  backgroundColor: palette.colors[2] + '20',
                  borderColor: palette.colors[2] + '40',
                }}
              >
                <div
                  className="w-full h-2 rounded mb-2"
                  style={{ backgroundColor: palette.colors[3] }}
                />
                <div
                  className="w-3/4 h-2 rounded"
                  style={{ backgroundColor: palette.colors[4] }}
                />
              </div>
            </div>

            {/* Text Examples */}
            <div className="space-y-2">
              <h5 className="text-white/80 text-sm font-medium">Текст</h5>
              <div className="space-y-1">
                <h6
                  className="text-lg font-bold"
                  style={{ color: palette.colors[0] }}
                >
                  Заголовок
                </h6>
                <p className="text-sm" style={{ color: palette.colors[1] }}>
                  Основной текст
                </p>
                <p className="text-xs" style={{ color: palette.colors[2] }}>
                  Вторичный текст
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
