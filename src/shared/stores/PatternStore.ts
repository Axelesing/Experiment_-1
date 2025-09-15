import { makeAutoObservable } from 'mobx';

import {
  PatternEngine,
  type PatternConfig,
} from '../../entities/pattern/lib/pattern-engine';

export class PatternStore {
  private engine: PatternEngine;

  // Make pattern properties observable
  patternType: PatternConfig['type'] = 'geometric';
  patternComplexity = 5;
  patternColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
  patternDensity = 1;
  patternAnimation = false;
  patternSymmetry = false;

  isGenerating = false;
  animationSpeed = 1;
  lastUpdateTime = 0;
  showSettings = false;

  // Computed property for current pattern
  get currentPattern(): PatternConfig {
    return {
      type: this.patternType,
      complexity: this.patternComplexity,
      colors: this.patternColors,
      density: this.patternDensity,
      animation: this.patternAnimation,
      symmetry: this.patternSymmetry,
    };
  }

  constructor() {
    makeAutoObservable(this);

    this.engine = new PatternEngine(this.currentPattern);
    // Don't generate pattern here - wait for canvas size
  }

  setPatternType = (type: PatternConfig['type']) => {
    this.patternType = type;
    this.engine.updateConfig({ type });
    this.engine.generatePattern(); // Force regeneration
  };

  setComplexity = (complexity: number) => {
    this.patternComplexity = complexity;
    this.engine.updateConfig({ complexity });
    this.engine.generatePattern(); // Force regeneration
  };

  setColors = (colors: string[]) => {
    this.patternColors = colors;
    this.engine.updateConfig({ colors });
    this.engine.generatePattern(); // Force regeneration
  };

  setDensity = (density: number) => {
    this.patternDensity = density;
    this.engine.updateConfig({ density });
    this.engine.generatePattern(); // Force regeneration
  };

  setAnimation = (animation: boolean) => {
    this.patternAnimation = animation;
    this.engine.updateConfig({ animation });
    this.engine.generatePattern(); // Force regeneration
  };

  setSymmetry = (symmetry: boolean) => {
    this.patternSymmetry = symmetry;
    this.engine.updateConfig({ symmetry });
    this.engine.generatePattern(); // Force regeneration
  };

  setAnimationSpeed = (speed: number) => {
    this.animationSpeed = speed;
  };

  setCanvasSize = (width: number, height: number) => {
    this.engine.setCanvasSize(width, height);
  };

  updateAnimation = (deltaTime: number) => {
    this.engine.updateAnimation(deltaTime, this.animationSpeed);
  };

  renderPattern = (ctx: CanvasRenderingContext2D) => {
    this.engine.render(ctx);
  };

  getPointCount = () => {
    return this.engine.getPointCount();
  };

  updateColor = (index: number, color: string) => {
    const newColors = [...this.patternColors];
    newColors[index] = color;
    this.setColors(newColors);
  };

  addColor = () => {
    const newColors = [...this.patternColors, '#ffffff'];
    this.setColors(newColors);
  };

  removeColor = (index: number) => {
    if (this.patternColors.length > 1) {
      const newColors = this.patternColors.filter((_, i) => i !== index);
      this.setColors(newColors);
    }
  };

  toggleSettings = () => {
    this.showSettings = !this.showSettings;
  };

  generateRandomPattern = () => {
    const types: PatternConfig['type'][] = [
      'geometric',
      'organic',
      'fractal',
      'spiral',
    ];
    const randomType = types[Math.floor(Math.random() * types.length)];

    this.patternType = randomType;
    this.patternComplexity = Math.floor(Math.random() * 10) + 1;
    this.patternColors = this.generateRandomColors();
    this.patternDensity = Math.random() * 2 + 0.5;
    this.patternAnimation = Math.random() > 0.5;
    this.patternSymmetry = Math.random() > 0.5;

    this.engine.updateConfig(this.currentPattern);
  };

  private generateRandomColors = (): string[] => {
    const colorPalettes = [
      ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'],
      ['#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43'],
      ['#a8e6cf', '#ffd3a5', '#fd9853', '#a8e6cf', '#dcedc1'],
      ['#ff7675', '#74b9ff', '#0984e3', '#00b894', '#fdcb6e'],
      ['#6c5ce7', '#a29bfe', '#fd79a8', '#fdcb6e', '#e17055'],
    ];

    return colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
  };
}

export const patternStore = new PatternStore();
