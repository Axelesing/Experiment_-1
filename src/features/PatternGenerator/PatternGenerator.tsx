import { useRef, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { Settings, Download, Shuffle } from 'lucide-react';

import { patternStore } from '../../shared/stores';
import { Button, Card, Slider } from '../../shared/ui';
import type { PatternConfig } from '../../entities/pattern/lib/pattern-engine';

export const PatternGenerator = observer(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(null);
  const lastTimeRef = useRef<number>(0);

  const updatePattern = useCallback((deltaTime: number = 1) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update animation with real deltaTime
    patternStore.updateAnimation(deltaTime);

    // Render pattern
    patternStore.renderPattern(ctx);
  }, []);

  const animate = useCallback(() => {
    const currentTime = performance.now();
    const deltaTime = lastTimeRef.current
      ? (currentTime - lastTimeRef.current) / 16.67
      : 1; // 60fps baseline
    lastTimeRef.current = currentTime;

    updatePattern(deltaTime);
    animationRef.current = requestAnimationFrame(animate);
  }, [updatePattern]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      if (width > 0 && height > 0) {
        canvas.width = width;
        canvas.height = height;
        patternStore.setCanvasSize(width, height);
      }
    };

    // Use setTimeout to ensure canvas is rendered
    setTimeout(resizeCanvas, 0);
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  useEffect(() => {
    if (patternStore.patternAnimation) {
      lastTimeRef.current = 0; // Reset time when starting animation
      animate();
    } else {
      updatePattern(1); // Static render
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate, updatePattern, patternStore.patternAnimation]);

  // Update pattern when settings change (but not animation)
  useEffect(() => {
    if (!patternStore.patternAnimation) {
      updatePattern(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    patternStore.patternType,
    patternStore.patternComplexity,
    patternStore.patternDensity,
    patternStore.patternSymmetry,
    patternStore.patternColors,
    updatePattern,
  ]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `pattern-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleGenerateRandomPattern = () => {
    patternStore.generateRandomPattern();
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Генератор узоров
          </h2>
          <p className="text-white/70">
            Создавайте красивые геометрические и органические узоры!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleGenerateRandomPattern}>
            <Shuffle className="w-4 h-4" />
            Случайный
          </Button>

          <Button variant="secondary" onClick={handleDownload}>
            <Download className="w-4 h-4" />
            Скачать
          </Button>

          <Button
            variant="secondary"
            onClick={() => patternStore.toggleSettings()}
          >
            <Settings className="w-4 h-4" />
            Настройки
          </Button>
        </div>
      </div>

      {patternStore.showSettings && (
        <div className="glass rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Настройки узора
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Тип узора
              </label>
              <select
                value={patternStore.patternType}
                onChange={(e) =>
                  patternStore.setPatternType(
                    e.target.value as PatternConfig['type']
                  )
                }
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                style={{
                  colorScheme: 'dark',
                }}
              >
                <option value="geometric" className="bg-gray-800 text-white">
                  Геометрический
                </option>
                <option value="organic" className="bg-gray-800 text-white">
                  Органический
                </option>
                <option value="fractal" className="bg-gray-800 text-white">
                  Фрактальный
                </option>
                <option value="spiral" className="bg-gray-800 text-white">
                  Спиральный
                </option>
              </select>
            </div>

            <Slider
              value={patternStore.patternComplexity}
              onChange={patternStore.setComplexity}
              min={1}
              max={10}
              label="Сложность"
            />

            <Slider
              value={patternStore.patternDensity}
              onChange={patternStore.setDensity}
              min={0.5}
              max={3}
              step={0.1}
              label="Плотность"
            />

            <Slider
              value={patternStore.animationSpeed}
              onChange={patternStore.setAnimationSpeed}
              min={0.1}
              max={5}
              step={0.1}
              label="Скорость анимации"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-white/80">
              <input
                type="checkbox"
                checked={patternStore.patternAnimation}
                onChange={(e) => patternStore.setAnimation(e.target.checked)}
                className="rounded"
              />
              Анимация
            </label>

            <label className="flex items-center gap-2 text-white/80">
              <input
                type="checkbox"
                checked={patternStore.patternSymmetry}
                onChange={(e) => patternStore.setSymmetry(e.target.checked)}
                className="rounded"
              />
              Симметрия
            </label>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-white/80 mb-2">
              Цвета
            </label>
            <div className="flex gap-2 flex-wrap">
              {patternStore.patternColors.map((color, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) =>
                      patternStore.updateColor(index, e.target.value)
                    }
                    className="w-8 h-8 rounded border border-white/20"
                  />
                  <button
                    onClick={() => patternStore.removeColor(index)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={patternStore.addColor}
                className="w-8 h-8 rounded border-2 border-dashed border-white/40 flex items-center justify-center text-white/60 hover:border-white/60 hover:text-white/80"
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full h-96 bg-black/20 rounded-lg border border-white/20"
        />

        <div className="absolute top-4 left-4 glass rounded-lg px-3 py-2">
          <p className="text-sm text-white/80">
            Точек: {patternStore.getPointCount()}
          </p>
          {patternStore.patternAnimation && (
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <p className="text-xs text-green-400">Анимация активна</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
});
