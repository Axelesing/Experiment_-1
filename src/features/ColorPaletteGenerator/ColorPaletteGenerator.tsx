import { useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Settings,
  Shuffle,
  Copy,
  Heart,
  History,
  Palette,
  FileText,
  Code,
  Scissors,
  Eye,
  Accessibility,
  Layout,
  EyeOff,
  Download,
  Layers,
  Paintbrush,
  GitCompare,
} from 'lucide-react';

import { colorStore } from '../../shared/stores';
import { Button, Card, Slider, ColorPicker } from '../../shared/ui';
import {
  PalettePreview,
  AccessibilityChecker,
  PaletteTemplates,
  ColorBlindnessSimulator,
  PaletteComparison,
} from './components';
import type { ColorPalette, ColorConfig } from '../../entities/color/lib';
import type { PaletteTemplate } from '../../entities/color/lib/palette-templates';

type TabId =
  | 'generator'
  | 'templates'
  | 'preview'
  | 'accessibility'
  | 'colorblind'
  | 'comparison';

export const ColorPaletteGenerator = observer(() => {
  const [activeTab, setActiveTab] = useState<TabId>('generator');

  const handleColorClick = useCallback(async (color: string) => {
    await colorStore.copyToClipboard(color);
  }, []);

  const handlePaletteCopy = useCallback(async () => {
    await colorStore.copyPaletteToClipboard();
  }, []);

  const handleFavoriteToggle = useCallback((palette: ColorPalette) => {
    if (colorStore.isFavorite(palette.id)) {
      colorStore.removeFromFavorites(palette.id);
      return;
    }

    colorStore.addToFavorites(palette);
  }, []);

  const handleTemplateSelect = useCallback((template: PaletteTemplate) => {
    // Convert template to ColorPalette format
    const palette: ColorPalette = {
      id: template.id,
      name: template.name,
      colors: template.colors,
      algorithm: 'template',
      createdAt: new Date(),
    };

    colorStore.setCurrentPalette(palette);
    colorStore.addToHistory(palette);
    setActiveTab('generator');
  }, []);

  useEffect(() => {
    // Generate initial palette
    if (!colorStore.currentPalette) {
      colorStore.generatePalette();
    }
  }, []);

  const algorithms = [
    { value: 'harmony', label: 'Гармония' },
    { value: 'monochromatic', label: 'Монохромная' },
    { value: 'analogous', label: 'Аналогичная' },
    { value: 'complementary', label: 'Дополнительная' },
    { value: 'triadic', label: 'Триада' },
    { value: 'tetradic', label: 'Тетрада' },
    { value: 'gradient', label: 'Градиент' },
    { value: 'random', label: 'Случайная' },
  ];

  const tabs: Array<{
    id: TabId;
    label: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  }> = [
    { id: 'generator', label: 'Генератор', icon: Palette },
    { id: 'templates', label: 'Шаблоны', icon: Layout },
    { id: 'preview', label: 'Превью', icon: Eye },
    { id: 'accessibility', label: 'Доступность', icon: Accessibility },
    { id: 'colorblind', label: 'Цветовая слепота', icon: EyeOff },
    { id: 'comparison', label: 'Сравнение', icon: GitCompare },
  ];

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Генератор цветовых палитр
          </h2>
          <p className="text-white/70">
            Создавайте гармоничные цветовые схемы для ваших проектов!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={colorStore.generateRandomPalette}
            leftIcon={<Shuffle className="w-4 h-4" />}
          >
            Случайная
          </Button>

          <Button
            variant="secondary"
            onClick={() => colorStore.toggleSettings()}
            leftIcon={<Settings className="w-4 h-4" />}
          >
            Настройки
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              leftIcon={<Icon className="w-4 h-4" />}
            >
              {tab.label}
            </Button>
          );
        })}
      </div>

      {colorStore.error && (
        <div className="glass rounded-lg p-4 mb-6 border border-red-500/50">
          <p className="text-red-400">{colorStore.error}</p>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'generator' && (
        <>
          {colorStore.showSettings && (
            <div className="glass rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Настройки генерации
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Алгоритм
                  </label>
                  <select
                    value={colorStore.config.algorithm}
                    onChange={(e) => {
                      const newAlgorithm = e.target
                        .value as ColorConfig['algorithm'];
                      colorStore.setConfig({
                        algorithm: newAlgorithm,
                      });
                    }}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    style={{ colorScheme: 'dark' }}
                  >
                    {algorithms.map((algo) => (
                      <option
                        key={algo.value}
                        value={algo.value}
                        className="bg-gray-800 text-white"
                      >
                        {algo.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Базовый цвет
                  </label>
                  <ColorPicker
                    value={colorStore.config.baseColor}
                    onChange={(color) =>
                      colorStore.setConfig({ baseColor: color })
                    }
                    showAdvanced={true}
                  />
                </div>

                <Slider
                  value={colorStore.config.count}
                  onChange={(value) => colorStore.setConfig({ count: value })}
                  min={3}
                  max={10}
                  label="Количество цветов"
                />

                <Slider
                  value={colorStore.config.saturation}
                  onChange={(value) =>
                    colorStore.setConfig({ saturation: value })
                  }
                  min={20}
                  max={100}
                  label="Насыщенность"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Slider
                  value={colorStore.config.lightness}
                  onChange={(value) =>
                    colorStore.setConfig({ lightness: value })
                  }
                  min={10}
                  max={90}
                  label="Яркость"
                />

                <Slider
                  value={colorStore.config.variation}
                  onChange={(value) =>
                    colorStore.setConfig({ variation: value })
                  }
                  min={5}
                  max={50}
                  label="Вариация"
                />
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'templates' && (
        <PaletteTemplates onSelectTemplate={handleTemplateSelect} />
      )}

      {activeTab === 'preview' && colorStore.currentPalette && (
        <PalettePreview palette={colorStore.currentPalette} />
      )}

      {activeTab === 'accessibility' && colorStore.currentPalette && (
        <AccessibilityChecker palette={colorStore.currentPalette} />
      )}

      {activeTab === 'colorblind' && colorStore.currentPalette && (
        <ColorBlindnessSimulator palette={colorStore.currentPalette} />
      )}

      {activeTab === 'comparison' && (
        <PaletteComparison
          currentPalette={colorStore.currentPalette!}
          paletteHistory={colorStore.paletteHistory}
          onSelectPalette={(palette) => colorStore.setCurrentPalette(palette)}
        />
      )}

      {/* Current Palette */}
      {colorStore.currentPalette && (
        <div className="glass rounded-lg p-6 border border-white/20 mb-6 mt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {colorStore.currentPalette.name}
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() =>
                    colorStore.currentPalette &&
                    handleFavoriteToggle(colorStore.currentPalette)
                  }
                  leftIcon={
                    <Heart
                      className={`w-4 h-4 ${
                        colorStore.isFavorite(colorStore.currentPalette!.id)
                          ? 'fill-red-500 text-red-500'
                          : ''
                      }`}
                    />
                  }
                >
                  {colorStore.isFavorite(colorStore.currentPalette!.id)
                    ? 'В избранном'
                    : 'В избранное'}
                </Button>

                <Button
                  variant="secondary"
                  onClick={handlePaletteCopy}
                  leftIcon={<Copy className="w-4 h-4" />}
                >
                  Копировать
                </Button>
              </div>
            </div>

            {/* Export Buttons */}
            <div className="space-y-3">
              <h4 className="text-white/80 text-sm font-medium">
                Экспорт палитры
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={colorStore.exportAsJson}
                  leftIcon={<FileText className="w-4 h-4" />}
                >
                  JSON
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={colorStore.exportAsCss}
                  leftIcon={<Code className="w-4 h-4" />}
                >
                  CSS
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={colorStore.exportAsScss}
                  leftIcon={<Scissors className="w-4 h-4" />}
                >
                  SCSS
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={colorStore.exportAsAse}
                  leftIcon={<Download className="w-4 h-4" />}
                >
                  ASE
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={colorStore.exportAsSketch}
                  leftIcon={<Layers className="w-4 h-4" />}
                >
                  Sketch
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={colorStore.exportAsFigma}
                  leftIcon={<Paintbrush className="w-4 h-4" />}
                >
                  Figma
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={colorStore.exportAsTailwind}
                  leftIcon={<Code className="w-4 h-4" />}
                >
                  Tailwind
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={colorStore.exportAsLess}
                  leftIcon={<FileText className="w-4 h-4" />}
                >
                  LESS
                </Button>
              </div>
            </div>

            {/* Color Swatches */}
            <div className="space-y-3">
              <h4 className="text-white/80 text-sm font-medium">
                Цветовая палитра
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {colorStore.currentPalette.colors.map((color, index) => (
                  <div
                    key={index}
                    className="group relative cursor-pointer"
                    onClick={() => handleColorClick(color)}
                  >
                    <div
                      className="w-full h-24 rounded-lg border border-white/20 shadow-lg transition-transform duration-200 group-hover:scale-105"
                      style={{ backgroundColor: color }}
                    />
                    <div className="mt-2 text-center">
                      <p className="text-white/80 text-sm font-mono">{color}</p>
                      <p className="text-white/60 text-xs">
                        Клик для копирования
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Generate New Palette Button */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={colorStore.generatePalette}
                size="lg"
                leftIcon={<Palette className="w-5 h-5" />}
              >
                Сгенерировать новую палитру
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* History */}
      {colorStore.paletteHistory.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">История палитр</h3>
            <Button
              variant="secondary"
              onClick={colorStore.clearHistory}
              size="sm"
              leftIcon={<History className="w-4 h-4" />}
            >
              Очистить
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {colorStore.paletteHistory.slice(0, 6).map((palette) => (
              <div
                key={palette.id}
                className="glass rounded-lg p-4 cursor-pointer hover:bg-white/20 transition-colors"
                onClick={() => colorStore.setCurrentPalette(palette)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-medium text-sm">
                    {palette.name}
                  </h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFavoriteToggle(palette);
                    }}
                    className="text-white/60 hover:text-red-500 transition-colors"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        colorStore.isFavorite(palette.id)
                          ? 'fill-red-500 text-red-500'
                          : ''
                      }`}
                    />
                  </button>
                </div>

                <div className="flex gap-1">
                  {palette.colors.slice(0, 5).map((color, index) => (
                    <div
                      key={index}
                      className="flex-1 h-8 rounded border border-white/20"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                <p className="text-white/60 text-xs mt-2">
                  {palette.algorithm} • {palette.colors.length} цветов
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {colorStore.isLoading && (
        <div className="glass rounded-lg p-4 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-white rounded-full mx-auto mb-2"></div>
          <p className="text-white/70">Генерация палитры...</p>
        </div>
      )}
    </Card>
  );
});
