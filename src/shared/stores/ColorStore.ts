import { makeAutoObservable } from 'mobx';

import {
  ColorEngine,
  type ColorPalette,
  type ColorConfig,
} from '@/entities/color/lib';

export class ColorStore {
  private engine = new ColorEngine();

  showSettings = false;
  currentPalette: ColorPalette | null = null;
  paletteHistory: ColorPalette[] = [];
  isLoading = false;
  error: string | null = null;
  favoritePalettes: ColorPalette[] = [];

  // Make config observable
  config: ColorConfig = {
    algorithm: 'harmony',
    baseColor: '#ff6b6b',
    count: 5,
    saturation: 70,
    lightness: 50,
    variation: 20,
  };

  constructor() {
    makeAutoObservable(this);
    this.loadFavorites();
  }

  setConfig = (config: Partial<ColorConfig>) => {
    this.config = { ...this.config, ...config };
    this.engine.setConfig(this.config);
  };

  toggleSettings = () => {
    this.showSettings = !this.showSettings;
  };

  setLoading = (loading: boolean) => {
    this.isLoading = loading;
  };

  setError = (error: string | null) => {
    this.error = error;
  };

  setCurrentPalette = (palette: ColorPalette | null) => {
    this.currentPalette = palette;
  };

  generatePalette = () => {
    this.setLoading(true);
    this.setError(null);

    try {
      const palette = this.engine.generatePalette();
      this.setCurrentPalette(palette);
      this.addToHistory(palette);
    } catch (error) {
      console.log(error);
      this.setError('Ошибка генерации цветовой палитры');
    } finally {
      this.setLoading(false);
    }
  };

  generateRandomPalette = () => {
    const randomConfig = {
      algorithm: this.getRandomAlgorithm(),
      baseColor: this.generateRandomColor(),
      count: Math.floor(Math.random() * 6) + 3, // 3-8 colors
      saturation: Math.floor(Math.random() * 40) + 50, // 50-90%
      lightness: Math.floor(Math.random() * 40) + 40, // 40-80%
      variation: Math.floor(Math.random() * 30) + 10, // 10-40%
    };

    this.setConfig(randomConfig);
    this.generatePalette();
  };

  private getRandomAlgorithm(): ColorConfig['algorithm'] {
    const algorithms: ColorConfig['algorithm'][] = [
      'monochromatic',
      'analogous',
      'complementary',
      'triadic',
      'tetradic',
      'random',
      'harmony',
      'gradient',
    ];
    return algorithms[Math.floor(Math.random() * algorithms.length)];
  }

  private generateRandomColor(): string {
    const hue = Math.floor(Math.random() * 360);
    const saturation = Math.floor(Math.random() * 40) + 60; // 60-100%
    const lightness = Math.floor(Math.random() * 40) + 40; // 40-80%

    return this.hslToHex(hue, saturation, lightness);
  }

  private hslToHex(h: number, s: number, l: number): string {
    h = h / 360;
    s = s / 100;
    l = l / 100;

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    const toHex = (c: number) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  addToHistory = (palette: ColorPalette) => {
    this.paletteHistory.unshift(palette);
    // Keep only last 20 palettes
    if (this.paletteHistory.length > 20) {
      this.paletteHistory = this.paletteHistory.slice(0, 20);
    }
  };

  clearHistory = () => {
    this.paletteHistory = [];
  };

  addToFavorites = (palette: ColorPalette) => {
    if (!this.favoritePalettes.find((p) => p.id === palette.id)) {
      this.favoritePalettes.push(palette);
      this.saveFavorites();
    }
  };

  removeFromFavorites = (paletteId: string) => {
    this.favoritePalettes = this.favoritePalettes.filter(
      (p) => p.id !== paletteId
    );
    this.saveFavorites();
  };

  isFavorite = (paletteId: string): boolean => {
    return this.favoritePalettes.some((p) => p.id === paletteId);
  };

  private saveFavorites = () => {
    try {
      localStorage.setItem(
        'color-favorites',
        JSON.stringify(this.favoritePalettes)
      );
    } catch (error) {
      console.warn('Failed to save favorites:', error);
    }
  };

  private loadFavorites = () => {
    try {
      const saved = localStorage.getItem('color-favorites');
      if (saved) {
        this.favoritePalettes = JSON.parse(saved).map((p: ColorPalette) => ({
          ...p,
          createdAt: new Date(p.createdAt),
        }));
      }
    } catch (error) {
      console.warn('Failed to load favorites:', error);
    }
  };

  exportAsJson = () => {
    if (!this.currentPalette) {
      this.setError('Нет палитры для экспорта');
      return;
    }

    try {
      this.engine.exportAsJson(this.currentPalette);
    } catch (error) {
      console.log(error);
      this.setError('Ошибка экспорта в JSON');
    }
  };

  exportAsCss = () => {
    if (!this.currentPalette) {
      this.setError('Нет палитры для экспорта');
      return;
    }

    try {
      this.engine.exportAsCss(this.currentPalette);
    } catch (error) {
      console.log(error);
      this.setError('Ошибка экспорта в CSS');
    }
  };

  exportAsScss = () => {
    if (!this.currentPalette) {
      this.setError('Нет палитры для экспорта');
      return;
    }

    try {
      this.engine.exportAsScss(this.currentPalette);
    } catch (error) {
      console.log(error);
      this.setError('Ошибка экспорта в SCSS');
    }
  };

  exportAsAse = () => {
    if (!this.currentPalette) {
      this.setError('Нет палитры для экспорта');
      return;
    }

    try {
      this.engine.exportAsAse(this.currentPalette);
    } catch (error) {
      console.log(error);
      this.setError('Ошибка экспорта в ASE');
    }
  };

  exportAsSketch = () => {
    if (!this.currentPalette) {
      this.setError('Нет палитры для экспорта');
      return;
    }

    try {
      this.engine.exportAsSketch(this.currentPalette);
    } catch (error) {
      console.log(error);
      this.setError('Ошибка экспорта в Sketch');
    }
  };

  exportAsFigma = () => {
    if (!this.currentPalette) {
      this.setError('Нет палитры для экспорта');
      return;
    }

    try {
      this.engine.exportAsFigma(this.currentPalette);
    } catch (error) {
      console.log(error);
      this.setError('Ошибка экспорта в Figma');
    }
  };

  exportAsTailwind = () => {
    if (!this.currentPalette) {
      this.setError('Нет палитры для экспорта');
      return;
    }

    try {
      this.engine.exportAsTailwind(this.currentPalette);
    } catch (error) {
      console.log(error);
      this.setError('Ошибка экспорта в Tailwind');
    }
  };

  exportAsLess = () => {
    if (!this.currentPalette) {
      this.setError('Нет палитры для экспорта');
      return;
    }

    try {
      this.engine.exportAsLess(this.currentPalette);
    } catch (error) {
      console.log(error);
      this.setError('Ошибка экспорта в LESS');
    }
  };

  copyToClipboard = async (color: string) => {
    try {
      await navigator.clipboard.writeText(color);
    } catch (error) {
      console.log(error);
      this.setError('Ошибка копирования в буфер обмена');
    }
  };

  copyPaletteToClipboard = async () => {
    if (!this.currentPalette) {
      this.setError('Нет палитры для копирования');
      return;
    }

    try {
      const paletteText = this.currentPalette.colors.join(', ');
      await navigator.clipboard.writeText(paletteText);
    } catch (error) {
      console.log(error);
      this.setError('Ошибка копирования палитры');
    }
  };

  clearCurrentPalette = () => {
    this.setCurrentPalette(null);
    this.setError(null);
  };
}

export const colorStore = new ColorStore();
