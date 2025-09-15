import { useRef, useCallback, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Settings,
  Shuffle,
  Upload,
  FileText,
  Code,
  Trash2,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';

import { asciiStore } from '../../shared/stores';
import { Button, Card, Slider } from '../../shared/ui';

export const AsciiArtGenerator = observer(() => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && file.type.startsWith('image/')) {
        asciiStore.setUploadedImage(file);
      } else {
        asciiStore.setError('Пожалуйста, выберите изображение');
      }
    },
    []
  );

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      asciiStore.setUploadedImage(file);
    } else {
      asciiStore.setError('Пожалуйста, перетащите изображение');
    }
  }, []);

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
    },
    []
  );

  const handleUploadAreaClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      // Проверяем, что клик не по кнопке или другому интерактивному элементу
      const target = event.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        return;
      }
      fileInputRef.current?.click();
    },
    []
  );

  useEffect(() => {
    return () => {
      asciiStore.dispose();
    };
  }, []);

  const patterns = [
    { value: 'mandelbrot', label: 'Мандельброт' },
    { value: 'sine', label: 'Синусоида' },
    { value: 'spiral', label: 'Спираль' },
    { value: 'waves', label: 'Волны' },
  ];

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            ASCII Арт генератор
          </h2>
          <p className="text-white/70">
            Конвертируйте изображения в ASCII арт или создавайте узоры!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={asciiStore.generateRandomAscii}>
            <Shuffle className="w-4 h-4" />
            Случайный
          </Button>

          <Button
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4" />
            Загрузить
          </Button>

          <Button
            variant="secondary"
            onClick={() => asciiStore.toggleSettings()}
          >
            <Settings className="w-4 h-4" />
            Настройки
          </Button>
        </div>
      </div>

      {asciiStore.error && (
        <div className="glass rounded-lg p-4 mb-6 border border-red-500/50">
          <p className="text-red-400">{asciiStore.error}</p>
        </div>
      )}

      {asciiStore.showSettings && (
        <div className="glass rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Настройки ASCII арта
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <Slider
              value={asciiStore.config.width}
              onChange={(value) => asciiStore.setConfig({ width: value })}
              min={20}
              max={200}
              label="Ширина"
            />

            <Slider
              value={asciiStore.config.height}
              onChange={(value) => asciiStore.setConfig({ height: value })}
              min={10}
              max={100}
              label="Высота"
            />

            <Slider
              value={asciiStore.config.contrast}
              onChange={(value) => asciiStore.setConfig({ contrast: value })}
              min={0.1}
              max={3}
              step={0.1}
              label="Контраст"
            />

            <Slider
              value={asciiStore.config.brightness}
              onChange={(value) => asciiStore.setConfig({ brightness: value })}
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
                onChange={(e) =>
                  asciiStore.setConfig({ characters: e.target.value })
                }
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
                onChange={(e) =>
                  asciiStore.setConfig({ fontFamily: e.target.value })
                }
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
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-white/80">
              <input
                type="checkbox"
                checked={asciiStore.config.invert}
                onChange={(e) =>
                  asciiStore.setConfig({ invert: e.target.checked })
                }
                className="rounded"
              />
              Инвертировать
            </label>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Upload Area */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">
            Загрузка изображения
          </h3>

          <div
            className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center hover:border-white/50 transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={handleUploadAreaClick}
          >
            {asciiStore.previewUrl ? (
              <div className="space-y-4">
                <img
                  src={asciiStore.previewUrl}
                  alt="Preview"
                  className="max-w-full max-h-48 mx-auto rounded-lg"
                />
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      asciiStore.convertImageToAscii();
                    }}
                  >
                    <Sparkles className="w-4 h-4" />
                    Конвертировать
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      asciiStore.clearImage();
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                    Удалить
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <ImageIcon className="w-12 h-12 text-white/50 mx-auto" />
                <p className="text-white/70">
                  Перетащите изображение сюда или нажмите для выбора
                </p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Pattern Generation */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Генерация узоров</h3>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Тип узора
              </label>
              <select
                value={asciiStore.selectedPattern}
                onChange={(e) => asciiStore.setSelectedPattern(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                style={{ colorScheme: 'dark' }}
              >
                {patterns.map((pattern) => (
                  <option
                    key={pattern.value}
                    value={pattern.value}
                    className="bg-gray-800 text-white"
                  >
                    {pattern.label}
                  </option>
                ))}
              </select>
            </div>

            <Button
              onClick={asciiStore.generatePatternAscii}
              className="w-full"
            >
              <Sparkles className="w-4 h-4" />
              Сгенерировать узор
            </Button>
          </div>
        </div>
      </div>

      {/* ASCII Output */}
      {asciiStore.currentAscii && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Результат</h3>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={asciiStore.exportAsText}>
                <FileText className="w-4 h-4" />
                TXT
              </Button>
              <Button variant="secondary" onClick={asciiStore.exportAsHtml}>
                <Code className="w-4 h-4" />
                HTML
              </Button>
              <Button variant="secondary" onClick={asciiStore.clearAscii}>
                <Trash2 className="w-4 h-4" />
                Очистить
              </Button>
            </div>
          </div>

          <div className="glass rounded-lg p-4 overflow-auto max-h-96">
            <pre
              className="text-white font-mono text-xs leading-tight whitespace-pre"
              style={{
                fontFamily: asciiStore.config.fontFamily,
                fontSize: `${asciiStore.config.fontSize}px`,
              }}
            >
              {asciiStore.currentAscii}
            </pre>
          </div>
        </div>
      )}

      {asciiStore.isLoading && (
        <div className="glass rounded-lg p-4 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-white rounded-full mx-auto mb-2"></div>
          <p className="text-white/70">Обработка...</p>
        </div>
      )}
    </Card>
  );
});
