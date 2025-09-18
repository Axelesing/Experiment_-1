import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useState } from 'react';
import { FileText, Code, Trash2, FileJson, Image } from 'lucide-react';

import { asciiStore } from '../../../shared/stores';
import { Button } from '../../../shared/ui';

/**
 * Component for displaying ASCII art output with export controls
 */
export const AsciiCanvas = observer(() => {
  const [animatedAscii, setAnimatedAscii] = useState<string>('');
  const [animationFrame, setAnimationFrame] = useState(0);

  const handleExportText = useCallback(() => {
    asciiStore.exportAsText();
  }, []);

  const handleExportHtml = useCallback(() => {
    asciiStore.exportAsHtml();
  }, []);

  const handleExportJson = useCallback(() => {
    asciiStore.exportAsJson();
  }, []);

  const handleExportSvg = useCallback(() => {
    asciiStore.exportAsSvg();
  }, []);

  const handleClearAscii = useCallback(() => {
    asciiStore.clearAscii();
  }, []);

  // Анимация ASCII арта
  useEffect(() => {
    if (!asciiStore.config.animate || !asciiStore.currentAscii) {
      setAnimatedAscii(asciiStore.currentAscii);
      return;
    }

    const interval = setInterval(() => {
      setAnimationFrame((prev) => prev + 1);
    }, 100); // Обновляем каждые 100мс

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asciiStore.config.animate, asciiStore.currentAscii]);

  // Создаем анимированную версию ASCII
  useEffect(() => {
    if (!asciiStore.config.animate || !asciiStore.currentAscii) {
      setAnimatedAscii(asciiStore.currentAscii);
      return;
    }

    const lines = asciiStore.currentAscii.split('\n');
    const animatedLines = lines.map((line, lineIndex) => {
      return line
        .split('')
        .map((char, charIndex) => {
          // Создаем несколько типов анимации
          const time = animationFrame * 0.1;

          // Волновой эффект
          const wave1 =
            Math.sin((charIndex + lineIndex + time) * 0.3) * 0.5 + 0.5;
          // Пульсирующий эффект
          const wave2 =
            Math.sin((charIndex * 0.5 + lineIndex * 0.3 + time) * 0.8) * 0.5 +
            0.5;
          // Комбинируем эффекты
          const intensity = Math.floor((wave1 + wave2) * 0.5 * 9);

          // Меняем символы в зависимости от интенсивности
          const chars = [' ', '.', ':', ';', 'o', 'O', '@', '#', '%', '&'];
          return chars[intensity] || char;
        })
        .join('');
    });

    setAnimatedAscii(animatedLines.join('\n'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asciiStore.currentAscii, animationFrame, asciiStore.config.animate]);

  if (!asciiStore.currentAscii) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Результат</h3>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="secondary"
            onClick={handleExportText}
            leftIcon={<FileText className="w-4 h-4" />}
          >
            TXT
          </Button>
          <Button
            variant="secondary"
            onClick={handleExportHtml}
            leftIcon={<Code className="w-4 h-4" />}
          >
            HTML
          </Button>
          <Button
            variant="secondary"
            onClick={handleExportJson}
            leftIcon={<FileJson className="w-4 h-4" />}
          >
            JSON
          </Button>
          <Button
            variant="secondary"
            onClick={handleExportSvg}
            leftIcon={<Image className="w-4 h-4" />}
          >
            SVG
          </Button>
          <Button
            variant="secondary"
            onClick={handleClearAscii}
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            Очистить
          </Button>
        </div>
      </div>

      <div className="glass rounded-lg p-4 overflow-auto max-h-96">
        <pre
          className={`font-mono text-xs leading-tight whitespace-pre ${
            asciiStore.config.colorize
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400 animate-pulse'
              : 'text-white'
          }`}
          style={{
            fontFamily: asciiStore.config.fontFamily,
            fontSize: `${asciiStore.config.fontSize}px`,
            backgroundSize: asciiStore.config.colorize ? '200% 200%' : 'auto',
            animation: asciiStore.config.colorize
              ? 'gradient 3s ease infinite'
              : 'none',
          }}
        >
          {asciiStore.config.animate ? animatedAscii : asciiStore.currentAscii}
        </pre>
      </div>
    </div>
  );
});
