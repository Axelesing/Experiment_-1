import { makeAutoObservable } from 'mobx';

import type { PatternConfig } from '@/shared/types';

export class PatternStore {
  currentPattern: PatternConfig = {
    type: 'geometric',
    complexity: 5,
    colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'],
    size: 100,
  };

  isGenerating = false;
  animationSpeed = 1;

  constructor() {
    makeAutoObservable(this);
  }

  setPatternType = (type: PatternConfig['type']) => {
    this.currentPattern.type = type;
  };

  setComplexity = (complexity: number) => {
    this.currentPattern.complexity = complexity;
  };

  setColors = (colors: string[]) => {
    this.currentPattern.colors = colors;
  };

  setSize = (size: number) => {
    this.currentPattern.size = size;
  };

  setAnimationSpeed = (speed: number) => {
    this.animationSpeed = speed;
  };

  generateRandomPattern = () => {
    const types: PatternConfig['type'][] = [
      'geometric',
      'organic',
      'fractal',
      'spiral',
    ];
    const randomType = types[Math.floor(Math.random() * types.length)];

    this.currentPattern = {
      type: randomType,
      complexity: Math.floor(Math.random() * 10) + 1,
      colors: this.generateRandomColors(),
      size: Math.floor(Math.random() * 200) + 50,
    };
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
