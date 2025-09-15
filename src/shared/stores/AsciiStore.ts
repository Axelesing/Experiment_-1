import { makeAutoObservable } from 'mobx';

import { AsciiEngine, type AsciiConfig } from '@/entities/ascii/lib';

export class AsciiStore {
  private engine = new AsciiEngine();

  showSettings = false;
  currentAscii = '';
  isLoading = false;
  error: string | null = null;
  selectedPattern = 'mandelbrot';
  uploadedImage: File | null = null;
  previewUrl: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  get config(): AsciiConfig {
    return this.engine.getConfig();
  }

  setConfig = (config: Partial<AsciiConfig>) => {
    this.engine.setConfig(config);
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

  setCurrentAscii = (ascii: string) => {
    this.currentAscii = ascii;
  };

  setSelectedPattern = (pattern: string) => {
    this.selectedPattern = pattern;
  };

  setUploadedImage = (file: File | null) => {
    this.uploadedImage = file;
    if (file) {
      this.previewUrl = URL.createObjectURL(file);
    } else {
      if (this.previewUrl) {
        URL.revokeObjectURL(this.previewUrl);
      }
      this.previewUrl = null;
    }
  };

  generateRandomAscii = () => {
    this.setLoading(true);
    this.setError(null);

    try {
      const ascii = this.engine.generateRandomAscii(
        this.config.width,
        this.config.height
      );
      this.setCurrentAscii(ascii);
    } catch (error) {
      console.error(error);
      this.setError('Ошибка генерации случайного ASCII арта');
    } finally {
      this.setLoading(false);
    }
  };

  generatePatternAscii = () => {
    this.setLoading(true);
    this.setError(null);

    try {
      const ascii = this.engine.generatePatternAscii(
        this.config.width,
        this.config.height,
        this.selectedPattern
      );
      this.setCurrentAscii(ascii);
    } catch (error) {
      console.error(error);
      this.setError('Ошибка генерации ASCII арта по шаблону');
    } finally {
      this.setLoading(false);
    }
  };

  convertImageToAscii = async () => {
    if (!this.uploadedImage) {
      this.setError('Сначала загрузите изображение');
      return;
    }

    this.setLoading(true);
    this.setError(null);

    try {
      const ascii = await this.engine.convertImageToAscii(this.uploadedImage);
      this.setCurrentAscii(ascii);
    } catch (error) {
      console.error(error);
      this.setError('Ошибка конвертации изображения в ASCII');
    } finally {
      this.setLoading(false);
    }
  };

  exportAsText = () => {
    if (!this.currentAscii) {
      this.setError('Нет ASCII арта для экспорта');
      return;
    }

    try {
      this.engine.exportAsText(this.currentAscii);
    } catch (error) {
      console.error(error);
      this.setError('Ошибка экспорта в текстовый файл');
    }
  };

  exportAsHtml = () => {
    if (!this.currentAscii) {
      this.setError('Нет ASCII арта для экспорта');
      return;
    }

    try {
      this.engine.exportAsHtml(this.currentAscii);
    } catch (error) {
      console.error(error);
      this.setError('Ошибка экспорта в HTML файл');
    }
  };

  clearAscii = () => {
    this.setCurrentAscii('');
    this.setError(null);
  };

  clearImage = () => {
    this.setUploadedImage(null);
  };

  dispose = () => {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }
  };
}

export const asciiStore = new AsciiStore();
