import { useRef, useEffect, useCallback, useMemo } from 'react';

import { Play, Pause, RotateCcw, Settings, Sparkles } from 'lucide-react';
import { observer } from 'mobx-react-lite';

import { throttle } from '../../shared/lib/utils';
import { appStore, particleStore } from '../../shared/stores';
import { Button, Card, Slider } from '../../shared/ui';

export const ParticleDrawer = observer(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(null);

  const updateParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and render particles using optimized engine
    particleStore.updateParticles();
    particleStore.renderParticles(ctx);
  }, []);

  const animate = useCallback(() => {
    if (appStore.isPlaying) {
      updateParticles();
    }
    animationRef.current = requestAnimationFrame(animate);
  }, [updateParticles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      if (width > 0 && height > 0) {
        canvas.width = width;
        canvas.height = height;
        particleStore.setCanvasSize(width, height);
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
    animate();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate]);

  const handleMouseMove = useMemo(
    () =>
      throttle((event: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        particleStore.setMousePosition(
          event.clientX - rect.left,
          event.clientY - rect.top
        );
      }, 16), // ~60fps
    []
  );

  const handleMouseDown = () => {
    particleStore.setIsDrawing(true);
  };

  const handleMouseUp = () => {
    particleStore.setIsDrawing(false);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    particleStore.addParticleBurst(x, y, 20);
  };

  const handleClearParticles = () => {
    particleStore.clearParticles();
  };

  const handleTogglePlayPause = () => {
    appStore.togglePlayPause();
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Рисовалка частиц
          </h2>
          <p className="text-white/70">
            Кликните и рисуйте частицами! Двигайте мышью для взаимодействия.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleTogglePlayPause}
            leftIcon={
              appStore.isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )
            }
          >
            {appStore.isPlaying ? 'Пауза' : 'Играть'}
          </Button>

          <Button
            variant="secondary"
            onClick={handleClearParticles}
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            Очистить
          </Button>

          <Button
            variant="secondary"
            onClick={() => appStore.toggleSettings()}
            leftIcon={<Settings className="w-4 h-4" />}
          >
            Настройки
          </Button>
        </div>
      </div>

      {appStore.showSettings && (
        <div className="glass rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Настройки частиц
          </h3>

          {/* Preset Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white/80 mb-2">
              Предустановки
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {particleStore.presets.map((preset) => (
                <Button
                  key={preset.name}
                  variant={
                    particleStore.currentPreset === preset.name
                      ? 'primary'
                      : 'secondary'
                  }
                  size="sm"
                  onClick={() => particleStore.applyPreset(preset.name)}
                  className="text-xs"
                >
                  {preset.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Basic Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Slider
              value={particleStore.particleCount}
              onChange={particleStore.setParticleCount}
              min={50}
              max={500}
              label="Количество"
            />

            <Slider
              value={particleStore.particleSize}
              onChange={particleStore.setParticleSize}
              min={1}
              max={10}
              label="Размер"
            />

            <Slider
              value={particleStore.particleSpeed}
              onChange={particleStore.setParticleSpeed}
              min={0.5}
              max={3}
              step={0.1}
              label="Скорость"
            />
          </div>

          {/* Advanced Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Slider
              value={particleStore.trailLength}
              onChange={particleStore.setTrailLength}
              min={0}
              max={30}
              label="Длина следа"
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="particleInteraction"
                checked={particleStore.particleInteraction}
                onChange={(e) =>
                  particleStore.setParticleInteraction(e.target.checked)
                }
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="particleInteraction"
                className="text-sm text-white/80"
              >
                Взаимодействие частиц
              </label>
            </div>
          </div>
        </div>
      )}

      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full h-96 bg-black/20 rounded-lg border border-white/20 cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={handleCanvasClick}
        />

        <div className="absolute top-4 left-4 glass rounded-lg px-3 py-2">
          <p className="text-sm text-white/80">
            Частиц: {particleStore.particlesCount}
          </p>
        </div>

        <div className="absolute top-4 right-4 glass rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-white/80" />
            <p className="text-sm text-white/80">
              {particleStore.currentPreset}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
});
