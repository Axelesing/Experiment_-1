import { useRef, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { Trash2, Image as ImageIcon, Sparkles } from 'lucide-react';

import { asciiStore } from '../../../shared/stores';
import { Button } from '../../../shared/ui';

/**
 * Component for ASCII art generation controls and image upload
 */
export const AsciiControls = observer(() => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (file.type.startsWith('image/')) {
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
    if (!file) return;

    if (file.type.startsWith('image/')) {
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

  const handleConvertImage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    asciiStore.convertImageToAscii();
  }, []);

  const handleClearImage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    asciiStore.clearImage();
  }, []);

  const handlePatternChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      asciiStore.setSelectedPattern(e.target.value);
    },
    []
  );

  const handleGeneratePattern = useCallback(() => {
    asciiStore.generatePatternAscii();
  }, []);

  const patterns = [
    { value: 'mandelbrot', label: 'Мандельброт' },
    { value: 'sine', label: 'Синусоида' },
    { value: 'spiral', label: 'Спираль' },
    { value: 'waves', label: 'Волны' },
    { value: 'julia', label: 'Множество Жюлиа' },
    { value: 'sierpinski', label: 'Треугольник Серпинского' },
    { value: 'dragon', label: 'Кривая дракона' },
  ];

  return (
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
                  onClick={handleConvertImage}
                  leftIcon={<Sparkles className="w-4 h-4" />}
                >
                  Конвертировать
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleClearImage}
                  leftIcon={<Trash2 className="w-4 h-4" />}
                >
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
              onChange={handlePatternChange}
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
            onClick={handleGeneratePattern}
            className="w-full"
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Сгенерировать узор
          </Button>
        </div>
      </div>
    </div>
  );
});
