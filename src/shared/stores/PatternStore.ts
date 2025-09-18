import { makeAutoObservable } from 'mobx';

import {
  PatternEngine,
  type PatternConfig,
} from '../../entities/pattern/lib/pattern-engine';

export class PatternStore {
  private engine: PatternEngine;
  private updateTimeout: NodeJS.Timeout | null = null;

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
  error: string | null = null;

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
    try {
      this.error = null;
      this.patternType = type;
      this.debouncedUpdateConfig({ type });
    } catch (error) {
      this.error = `Failed to set pattern type: ${error}`;
      console.error('Error setting pattern type:', error);
    }
  };

  setComplexity = (complexity: number) => {
    try {
      this.error = null;
      this.patternComplexity = Math.max(1, Math.min(10, complexity));
      this.debouncedUpdateConfig({ complexity: this.patternComplexity });
    } catch (error) {
      this.error = `Failed to set complexity: ${error}`;
      console.error('Error setting complexity:', error);
    }
  };

  setColors = (colors: string[]) => {
    try {
      this.error = null;
      this.patternColors = colors;
      this.debouncedUpdateConfig({ colors });
    } catch (error) {
      this.error = `Failed to set colors: ${error}`;
      console.error('Error setting colors:', error);
    }
  };

  setDensity = (density: number) => {
    try {
      this.error = null;
      this.patternDensity = Math.max(0.1, Math.min(5, density));
      this.debouncedUpdateConfig({ density: this.patternDensity });
    } catch (error) {
      this.error = `Failed to set density: ${error}`;
      console.error('Error setting density:', error);
    }
  };

  setAnimation = (animation: boolean) => {
    try {
      this.error = null;
      this.patternAnimation = animation;
      this.debouncedUpdateConfig({ animation });
    } catch (error) {
      this.error = `Failed to set animation: ${error}`;
      console.error('Error setting animation:', error);
    }
  };

  setSymmetry = (symmetry: boolean) => {
    try {
      this.error = null;
      this.patternSymmetry = symmetry;
      this.debouncedUpdateConfig({ symmetry });
    } catch (error) {
      this.error = `Failed to set symmetry: ${error}`;
      console.error('Error setting symmetry:', error);
    }
  };

  setAnimationSpeed = (speed: number) => {
    this.animationSpeed = Math.max(0.1, Math.min(5, speed));
  };

  setCanvasSize = (width: number, height: number) => {
    try {
      this.error = null;
      this.engine.setCanvasSize(width, height);
    } catch (error) {
      this.error = `Failed to set canvas size: ${error}`;
      console.error('Error setting canvas size:', error);
    }
  };

  updateAnimation = (deltaTime: number) => {
    try {
      this.engine.updateAnimation(deltaTime, this.animationSpeed);
    } catch (error) {
      this.error = `Animation error: ${error}`;
      console.error('Error updating animation:', error);
    }
  };

  renderPattern = (ctx: CanvasRenderingContext2D) => {
    try {
      this.engine.render(ctx);
    } catch (error) {
      this.error = `Render error: ${error}`;
      console.error('Error rendering pattern:', error);
    }
  };

  getPointCount = () => {
    return this.engine.getPointCount();
  };

  updateColor = (index: number, color: string) => {
    if (index < 0 || index >= this.patternColors.length) {
      this.error = 'Invalid color index';
      return;
    }

    if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
      this.error = 'Invalid color format';
      return;
    }

    const newColors = [...this.patternColors];
    newColors[index] = color;
    this.setColors(newColors);
  };

  addColor = () => {
    if (this.patternColors.length >= 10) {
      this.error = 'Maximum 10 colors allowed';
      return;
    }

    const newColors = [...this.patternColors, '#ffffff'];
    this.setColors(newColors);
  };

  removeColor = (index: number) => {
    if (index < 0 || index >= this.patternColors.length) {
      this.error = 'Invalid color index';
      return;
    }

    if (this.patternColors.length <= 1) {
      this.error = 'At least one color is required';
      return;
    }

    const newColors = this.patternColors.filter((_, i) => i !== index);
    this.setColors(newColors);
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

  /**
   * Debounced config update to prevent excessive regeneration
   */
  private debouncedUpdateConfig = (config: Partial<PatternConfig>) => {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }

    this.updateTimeout = setTimeout(() => {
      try {
        this.engine.updateConfig(config);
      } catch (error) {
        this.error = `Failed to update config: ${error}`;
        console.error('Error updating config:', error);
      }
    }, 100); // 100ms debounce
  };

  /**
   * Clear error state
   */
  clearError = () => {
    this.error = null;
  };

  /**
   * Get current engine config
   */
  getEngineConfig = () => {
    return this.engine.getConfig();
  };

  /**
   * Check if pattern is being generated
   */
  isGeneratingPattern = () => {
    return this.engine.isGeneratingPattern();
  };

  /**
   * Get canvas size
   */
  getCanvasSize = () => {
    return this.engine.getCanvasSize();
  };

  /**
   * Dispose resources
   */
  dispose = () => {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
      this.updateTimeout = null;
    }
  };
}

export const patternStore = new PatternStore();
