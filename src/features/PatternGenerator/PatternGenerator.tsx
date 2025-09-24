import { useRef, useEffect, useCallback, useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Settings,
  Download,
  Shuffle,
  AlertCircle,
  Loader2,
} from 'lucide-react';

import { patternStore } from '../../shared/stores';
import { Button, Card, Slider } from '../../shared/ui';
import type { PatternConfig } from '../../entities/pattern/lib/pattern-engine';

export const PatternGenerator = observer(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(null);
  const lastTimeRef = useRef<number>(0);
  const [isDownloading, setIsDownloading] = useState(false);

  // Use grouped functionality from store
  const config = patternStore.config;
  const animation = patternStore.animation;
  const colors = patternStore.colors;
  const canvasActions = patternStore.canvas;
  const ui = patternStore.ui;
  const actions = patternStore.actions;

  const updatePattern = useCallback((deltaTime: number = 1) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update animation with real deltaTime
    animation.updateAnimation(deltaTime);

    // Render pattern
    canvasActions.renderPattern(ctx);
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
        canvasActions.setCanvasSize(width, height);
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
    if (config.patternAnimation) {
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
  }, [animate, updatePattern, config.patternAnimation]);

  // Update pattern when settings change (but not animation)
  useEffect(() => {
    if (!config.patternAnimation) {
      updatePattern(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    config.patternType,
    config.patternComplexity,
    config.patternDensity,
    config.patternSymmetry,
    config.patternColors,
    updatePattern,
  ]);

  const handleDownload = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      setIsDownloading(true);

      // Create a high-resolution version for download
      const scale = 2; // 2x resolution
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');

      if (!tempCtx) throw new Error('Failed to create temporary canvas');

      tempCanvas.width = canvas.width * scale;
      tempCanvas.height = canvas.height * scale;

      // Scale up the context
      tempCtx.scale(scale, scale);

      // Render the pattern at higher resolution
      canvasActions.renderPattern(tempCtx);

      // Download the high-res version
      const link = document.createElement('a');
      link.download = `pattern-${config.patternType}-${Date.now()}.png`;
      link.href = tempCanvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (error) {
      console.error('Download failed:', error);
      ui.error = `Download failed: ${error}`;
    } finally {
      setIsDownloading(false);
    }
  }, []);

  const handleGenerateRandomPattern = useCallback(() => {
    try {
      ui.clearError();
      actions.generateRandomPattern();
    } catch (error) {
      console.error('Failed to generate random pattern:', error);
    }
  }, [ui, actions]);

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
          <Button
            onClick={handleGenerateRandomPattern}
            leftIcon={<Shuffle className="w-4 h-4" />}
            disabled={actions.isGeneratingPattern()}
          >
            Случайный
          </Button>

          <Button
            variant="secondary"
            onClick={handleDownload}
            leftIcon={
              isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )
            }
            disabled={isDownloading || canvasActions.getPointCount() === 0}
          >
            {isDownloading ? 'Скачивание...' : 'Скачать'}
          </Button>

          <Button
            variant="secondary"
            onClick={() => ui.toggleSettings()}
            leftIcon={<Settings className="w-4 h-4" />}
          >
            Настройки
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {ui.error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-400 font-medium">Ошибка</p>
            <p className="text-red-300 text-sm">{ui.error}</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={ui.clearError}
            className="text-red-400 hover:text-red-300"
          >
            ×
          </Button>
        </div>
      )}

      {ui.showSettings && (
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
                value={config.patternType}
                onChange={(e) =>
                  config.setPatternType(e.target.value as PatternConfig['type'])
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
              value={config.patternComplexity}
              onChange={config.setComplexity}
              min={1}
              max={10}
              label="Сложность"
            />

            <Slider
              value={config.patternDensity}
              onChange={config.setDensity}
              min={0.5}
              max={3}
              step={0.1}
              label="Плотность"
            />

            <Slider
              value={animation.animationSpeed}
              onChange={animation.setAnimationSpeed}
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
                checked={config.patternAnimation}
                onChange={(e) => config.setAnimation(e.target.checked)}
                className="rounded"
              />
              Анимация
            </label>

            <label className="flex items-center gap-2 text-white/80">
              <input
                type="checkbox"
                checked={config.patternSymmetry}
                onChange={(e) => config.setSymmetry(e.target.checked)}
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
              {colors.patternColors.map((color, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => colors.updateColor(index, e.target.value)}
                    className="w-8 h-8 rounded border border-white/20"
                  />
                  <button
                    onClick={() => colors.removeColor(index)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={colors.addColor}
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
          <div className="flex items-center gap-2">
            <p className="text-sm text-white/80">
              Точек: {patternStore.getPointCount()}
            </p>
            {patternStore.isGeneratingPattern() && (
              <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
            )}
          </div>

          <div className="text-xs text-white/60 mt-1">
            Тип: {patternStore.patternType} | Сложность:{' '}
            {patternStore.patternComplexity}
          </div>

          {patternStore.patternAnimation && (
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <p className="text-xs text-green-400">Анимация активна</p>
            </div>
          )}

          {patternStore.patternSymmetry && (
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <p className="text-xs text-purple-400">Симметрия включена</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
});
