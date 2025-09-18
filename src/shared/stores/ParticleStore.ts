import { makeAutoObservable, runInAction } from 'mobx';

import {
  ParticleEngine,
  PARTICLE_PRESETS,
  ParticlePreset,
} from '../../entities/particle/lib/particle-engine';

/**
 * Particle system management store
 * Handles particle generation, animation, and interaction
 */
export class ParticleStore {
  private engine: ParticleEngine;

  /** Target particle count */
  particleCount = 100;

  /** Particle size in pixels */
  particleSize = 3;

  /** Particle movement speed multiplier */
  particleSpeed = 1;

  /** Whether user is currently drawing */
  isDrawing = false;

  /** Current mouse position */
  mousePosition = { x: 0, y: 0 };

  /** Last update timestamp for delta time calculation */
  lastUpdateTime = 0;

  /** Actual number of particles currently active */
  actualParticleCount = 0;

  /** Current preset name */
  currentPreset = 'Классический';

  /** Trail length for particles */
  trailLength = 0;

  /** Whether particles interact with each other */
  particleInteraction = false;

  /** Available particle colors */
  private readonly colors: string[] = [
    '#ff6b6b',
    '#4ecdc4',
    '#45b7d1',
    '#96ceb4',
    '#feca57',
    '#ff9ff3',
    '#54a0ff',
    '#5f27cd',
    '#00d2d3',
    '#ff9f43',
  ];

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });

    this.engine = new ParticleEngine({
      count: this.particleCount,
      size: this.particleSize,
      speed: this.particleSpeed,
      colors: this.colors,
      gravity: 0.05,
      friction: 0.99,
      bounce: 0.8,
      trailLength: this.trailLength,
      particleInteraction: this.particleInteraction,
    });

    this.actualParticleCount = 0; // Will be updated when canvas size is set
  }

  /**
   * Computed property to get current particle configuration
   */
  get config() {
    return {
      count: this.particleCount,
      size: this.particleSize,
      speed: this.particleSpeed,
      colors: this.colors,
    };
  }

  /**
   * Sets the target particle count
   * @param count - Number of particles
   */
  setParticleCount(count: number): void {
    runInAction(() => {
      this.particleCount = count;
      this.engine.updateConfig({ count });
      this.actualParticleCount = this.engine.getParticleCount();
    });
  }

  /**
   * Sets the particle size
   * @param size - Particle size in pixels
   */
  setParticleSize(size: number): void {
    runInAction(() => {
      this.particleSize = size;
      this.engine.updateConfig({ size });
    });
  }

  /**
   * Sets the particle speed multiplier
   * @param speed - Speed multiplier
   */
  setParticleSpeed(speed: number): void {
    runInAction(() => {
      this.particleSpeed = speed;
      this.engine.updateConfig({ speed });
    });
  }

  /**
   * Sets the mouse position for particle interaction
   * @param x - X coordinate
   * @param y - Y coordinate
   */
  setMousePosition(x: number, y: number): void {
    runInAction(() => {
      this.mousePosition = { x, y };
      this.engine.setMousePosition(x, y);
    });
  }

  /**
   * Sets the drawing state
   * @param drawing - Whether user is drawing
   */
  setIsDrawing(drawing: boolean): void {
    runInAction(() => {
      this.isDrawing = drawing;
    });
  }

  /**
   * Sets the canvas size and reinitializes particles
   * @param width - Canvas width
   * @param height - Canvas height
   */
  setCanvasSize(width: number, height: number): void {
    runInAction(() => {
      this.engine.setCanvasSize(width, height);
      // Reinitialize particles with new canvas size
      this.engine.initParticles();
      this.actualParticleCount = this.engine.getParticleCount();
    });
  }

  /**
   * Adds a burst of particles at specified coordinates
   * @param x - X coordinate
   * @param y - Y coordinate
   * @param count - Number of particles to add
   */
  addParticleBurst(x: number, y: number, count = 20): void {
    this.engine.addBurst(x, y, count);
  }

  /**
   * Updates particle system with delta time
   */
  updateParticles(): void {
    const currentTime = performance.now();
    const actualDeltaTime = this.lastUpdateTime
      ? (currentTime - this.lastUpdateTime) / 16.67
      : 1; // 60fps baseline
    this.lastUpdateTime = currentTime;

    this.engine.update(actualDeltaTime);

    // Add new particles if drawing
    if (this.isDrawing && Math.random() < 0.3) {
      this.engine.addParticle(this.mousePosition.x, this.mousePosition.y);
    }

    // Update actual particle count for UI
    runInAction(() => {
      this.actualParticleCount = this.engine.getParticleCount();
    });
  }

  /**
   * Renders particles to canvas context
   * @param ctx - Canvas rendering context
   */
  renderParticles(ctx: CanvasRenderingContext2D): void {
    this.engine.render(ctx);
  }

  /**
   * Clears all particles from the system
   */
  clearParticles(): void {
    runInAction(() => {
      this.engine.clear();
      this.actualParticleCount = 0;
    });
  }

  /**
   * Gets current particles array
   */
  get particles() {
    return this.engine.getParticles();
  }

  /**
   * Gets current particle count
   */
  get particlesCount(): number {
    return this.actualParticleCount;
  }

  /**
   * Sets the trail length for particles
   * @param length - Trail length (0 to disable)
   */
  setTrailLength(length: number): void {
    runInAction(() => {
      this.trailLength = length;
      this.engine.updateConfig({ trailLength: length });
    });
  }

  /**
   * Sets whether particles interact with each other
   * @param interaction - Whether to enable particle interaction
   */
  setParticleInteraction(interaction: boolean): void {
    runInAction(() => {
      this.particleInteraction = interaction;
      this.engine.updateConfig({ particleInteraction: interaction });
    });
  }

  /**
   * Applies a particle preset
   * @param presetName - Name of the preset to apply
   */
  applyPreset(presetName: string): void {
    const preset = PARTICLE_PRESETS.find((p) => p.name === presetName);
    if (!preset) return;

    runInAction(() => {
      this.currentPreset = presetName;

      // Apply preset configuration
      if (preset.config.colors) {
        // Update colors in engine
        this.engine.updateConfig({ colors: preset.config.colors });
      }

      if (preset.config.trailLength !== undefined) {
        this.trailLength = preset.config.trailLength;
      }

      if (preset.config.particleInteraction !== undefined) {
        this.particleInteraction = preset.config.particleInteraction;
      }

      // Apply all preset config to engine
      this.engine.updateConfig(preset.config);
    });
  }

  /**
   * Gets available particle presets
   */
  get presets(): ParticlePreset[] {
    return PARTICLE_PRESETS;
  }

  /**
   * Resets the store to initial state
   */
  reset(): void {
    runInAction(() => {
      this.particleCount = 100;
      this.particleSize = 3;
      this.particleSpeed = 1;
      this.isDrawing = false;
      this.mousePosition = { x: 0, y: 0 };
      this.lastUpdateTime = 0;
      this.actualParticleCount = 0;
      this.currentPreset = 'Классический';
      this.trailLength = 0;
      this.particleInteraction = false;

      // Reinitialize engine with default config
      this.engine.updateConfig({
        count: this.particleCount,
        size: this.particleSize,
        speed: this.particleSpeed,
        colors: this.colors,
        trailLength: this.trailLength,
        particleInteraction: this.particleInteraction,
      });
    });
  }
}

export const particleStore = new ParticleStore();
