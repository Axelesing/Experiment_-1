import { observer } from 'mobx-react-lite';
import { useCallback } from 'react';

import { asciiStore } from '../../../shared/stores';
import { Slider } from '../../../shared/ui';

/**
 * Component for ASCII art settings and configuration
 */
export const AsciiSettings = observer(() => {
  const handleWidthChange = useCallback((value: number) => {
    asciiStore.setConfig({ width: value });
  }, []);

  const handleHeightChange = useCallback((value: number) => {
    asciiStore.setConfig({ height: value });
  }, []);

  const handleContrastChange = useCallback((value: number) => {
    asciiStore.setConfig({ contrast: value });
  }, []);

  const handleBrightnessChange = useCallback((value: number) => {
    asciiStore.setConfig({ brightness: value });
  }, []);

  const handleFontSizeChange = useCallback((value: number) => {
    asciiStore.setConfig({ fontSize: value });
  }, []);

  const handleCharactersChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      asciiStore.setConfig({ characters: e.target.value });
    },
    []
  );

  const handleFontFamilyChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      asciiStore.setConfig({ fontFamily: e.target.value });
    },
    []
  );

  const handleQualityChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      asciiStore.setConfig({
        quality: e.target.value as 'low' | 'medium' | 'high',
      });
    },
    []
  );

  const handleInvertChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      asciiStore.setConfig({ invert: e.target.checked });
    },
    []
  );

  const handleColorizeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      asciiStore.setConfig({ colorize: e.target.checked });
    },
    []
  );

  const handleAnimateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      asciiStore.setConfig({ animate: e.target.checked });
    },
    []
  );

  if (!asciiStore.showSettings) {
    return null;
  }

  return (
    <div className="glass rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        Настройки ASCII арта
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Slider
          value={asciiStore.config.width}
          onChange={handleWidthChange}
          min={20}
          max={200}
          label="Ширина"
        />

        <Slider
          value={asciiStore.config.height}
          onChange={handleHeightChange}
          min={10}
          max={100}
          label="Высота"
        />

        <Slider
          value={asciiStore.config.contrast}
          onChange={handleContrastChange}
          min={0.1}
          max={3}
          step={0.1}
          label="Контраст"
        />

        <Slider
          value={asciiStore.config.brightness}
          onChange={handleBrightnessChange}
          min={-1}
          max={1}
          step={0.1}
          label="Яркость"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Символы
          </label>
          <input
            type="text"
            value={asciiStore.config.characters}
            onChange={handleCharactersChange}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            placeholder="@%#*+=-:. "
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Шрифт
          </label>
          <select
            value={asciiStore.config.fontFamily}
            onChange={handleFontFamilyChange}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            style={{ colorScheme: 'dark' }}
          >
            <option value="Courier New" className="bg-gray-800 text-white">
              Courier New
            </option>
            <option value="monospace" className="bg-gray-800 text-white">
              Monospace
            </option>
            <option value="Consolas" className="bg-gray-800 text-white">
              Consolas
            </option>
            <option value="JetBrains Mono" className="bg-gray-800 text-white">
              JetBrains Mono
            </option>
            <option value="Fira Code" className="bg-gray-800 text-white">
              Fira Code
            </option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Размер шрифта
          </label>
          <Slider
            value={asciiStore.config.fontSize}
            onChange={handleFontSizeChange}
            min={8}
            max={24}
            step={1}
            label=""
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Качество
          </label>
          <select
            value={asciiStore.config.quality || 'medium'}
            onChange={handleQualityChange}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            style={{ colorScheme: 'dark' }}
          >
            <option value="low" className="bg-gray-800 text-white">
              Низкое
            </option>
            <option value="medium" className="bg-gray-800 text-white">
              Среднее
            </option>
            <option value="high" className="bg-gray-800 text-white">
              Высокое
            </option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-white/80">
          <input
            type="checkbox"
            checked={asciiStore.config.invert}
            onChange={handleInvertChange}
            className="rounded"
          />
          Инвертировать
        </label>

        <label className="flex items-center gap-2 text-white/80">
          <input
            type="checkbox"
            checked={asciiStore.config.colorize || false}
            onChange={handleColorizeChange}
            className="rounded"
          />
          Цветной ASCII
        </label>

        <label className="flex items-center gap-2 text-white/80">
          <input
            type="checkbox"
            checked={asciiStore.config.animate || false}
            onChange={handleAnimateChange}
            className="rounded"
          />
          Анимация
        </label>
      </div>
    </div>
  );
});
