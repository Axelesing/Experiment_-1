import { useRef, useEffect, useCallback, useMemo } from 'react';

import { Play, Pause, RotateCcw, Settings } from 'lucide-react';
import { observer } from 'mobx-react-lite';

import { throttle } from '@/shared/lib/utils';
import { appStore, particleStore } from '@/shared/stores';
import { Button, Card, Slider } from '@/shared/ui';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ParticleDrawerProps {}

export const ParticleDrawer = observer((_props: ParticleDrawerProps) => {
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
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      particleStore.setCanvasSize(canvas.width, canvas.height);
    };

    resizeCanvas();
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
      throttle((e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        particleStore.setMousePosition(
          e.clientX - rect.left,
          e.clientY - rect.top
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

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    particleStore.addParticleBurst(x, y, 20);
  };

  const clearParticles = () => {
    particleStore.clearParticles();
  };

  const togglePlayPause = () => {
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
          <Button onClick={togglePlayPause}>
            {appStore.isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {appStore.isPlaying ? 'Пауза' : 'Играть'}
          </Button>

          <Button variant="secondary" onClick={clearParticles}>
            <RotateCcw className="w-4 h-4" />
            Очистить
          </Button>

          <Button variant="secondary" onClick={() => appStore.toggleSettings()}>
            <Settings className="w-4 h-4" />
            Настройки
          </Button>
        </div>
      </div>

      {appStore.showSettings && (
        <div className="glass rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Настройки частиц
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          onClick={handleClick}
        />

        <div className="absolute top-4 left-4 glass rounded-lg px-3 py-2">
          <p className="text-sm text-white/80">
            Частиц: {particleStore.particlesCount}
          </p>
        </div>
      </div>
    </Card>
  );
});
