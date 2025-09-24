import { useCallback, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Settings, Shuffle, Upload } from 'lucide-react';

import { asciiStore } from '../../shared/stores';
import { Button, Card } from '../../shared/ui';
import { AsciiCanvas, AsciiControls, AsciiSettings } from './components';

export const AsciiArtGenerator = observer(() => {
  useEffect(() => {
    return () => {
      asciiStore.dispose();
    };
  }, []);

  const handleRandomGenerate = useCallback(() => {
    asciiStore.generateRandomAscii();
  }, []);

  const handleSettingsToggle = useCallback(() => {
    asciiStore.toggleSettings();
  }, []);

  const handleUploadClick = useCallback(() => {
    // Создаем скрытый input элемент для загрузки файла
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && file.type.startsWith('image/')) {
        asciiStore.setUploadedImage(file);
      } else {
        asciiStore.setError('Пожалуйста, выберите изображение');
      }
    };
    input.click();
  }, []);

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
          <Button
            onClick={handleRandomGenerate}
            leftIcon={<Shuffle className="w-4 h-4" />}
          >
            Случайный
          </Button>

          <Button
            variant="secondary"
            onClick={handleUploadClick}
            leftIcon={<Upload className="w-4 h-4" />}
          >
            Загрузить
          </Button>

          <Button
            variant="secondary"
            onClick={handleSettingsToggle}
            leftIcon={<Settings className="w-4 h-4" />}
          >
            Настройки
          </Button>
        </div>
      </div>

      {asciiStore.error && (
        <div className="glass rounded-lg p-4 mb-6 border border-red-500/50">
          <p className="text-red-400">{asciiStore.error}</p>
        </div>
      )}

      <AsciiSettings />

      <AsciiControls />

      <AsciiCanvas />

      {asciiStore.isLoading && (
        <div className="glass rounded-lg p-4 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-white rounded-full mx-auto mb-2"></div>
          <p className="text-white/70">Обработка...</p>
        </div>
      )}
    </Card>
  );
});
