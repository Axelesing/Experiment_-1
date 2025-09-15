import { makeAutoObservable } from 'mobx';

import { ParticleEngine } from '../../entities/particle/lib/particle-engine';

export class ParticleStore {
  private engine: ParticleEngine;
  particleCount = 100;
  particleSize = 3;
  particleSpeed = 1;
  isDrawing = false;
  mousePosition = { x: 0, y: 0 };
  lastUpdateTime = 0;
  actualParticleCount = 0;

  private colors = [
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
    makeAutoObservable(this);

    this.engine = new ParticleEngine({
      count: this.particleCount,
      size: this.particleSize,
      speed: this.particleSpeed,
      colors: this.colors,
      gravity: 0.05,
      friction: 0.99,
      bounce: 0.8,
    });

    this.actualParticleCount = 0; // Will be updated when canvas size is set
  }

  setParticleCount = (count: number) => {
    this.particleCount = count;
    this.engine.updateConfig({ count });
    this.actualParticleCount = this.engine.getParticleCount();
  };

  setParticleSize = (size: number) => {
    this.particleSize = size;
    this.engine.updateConfig({ size });
  };

  setParticleSpeed = (speed: number) => {
    this.particleSpeed = speed;
    this.engine.updateConfig({ speed });
  };

  setMousePosition = (x: number, y: number) => {
    this.mousePosition = { x, y };
    this.engine.setMousePosition(x, y);
  };

  setIsDrawing = (drawing: boolean) => {
    this.isDrawing = drawing;
  };

  setCanvasSize = (width: number, height: number) => {
    this.engine.setCanvasSize(width, height);
    // Reinitialize particles with new canvas size
    this.engine.initParticles();
    this.actualParticleCount = this.engine.getParticleCount();
  };

  addParticleBurst = (x: number, y: number, count = 20) => {
    this.engine.addBurst(x, y, count);
  };

  updateParticles = (_deltaTime: number = 1) => {
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
    this.actualParticleCount = this.engine.getParticleCount();
  };

  renderParticles = (ctx: CanvasRenderingContext2D) => {
    this.engine.render(ctx);
  };

  clearParticles = () => {
    this.engine.clear();
    this.actualParticleCount = 0;
  };

  get particles() {
    return this.engine.getParticles();
  }

  get particlesCount() {
    return this.actualParticleCount;
  }
}

export const particleStore = new ParticleStore();
