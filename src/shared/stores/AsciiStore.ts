import { makeAutoObservable, runInAction } from 'mobx';

import { AsciiEngine, type AsciiConfig } from '@/entities/ascii/lib';

/**
 * ASCII Art generation and management store
 * Handles image conversion, pattern generation, and export functionality
 */
export class AsciiStore {
  private engine = new AsciiEngine();

  /** Settings panel visibility */
  showSettings = false;

  /** Current ASCII art content */
  currentAscii = '';

  /** Loading state for async operations */
  isLoading = false;

  /** Error message for failed operations */
  error: string | null = null;

  /** Selected pattern type for generation */
  selectedPattern = 'mandelbrot';

  /** Uploaded image file */
  uploadedImage: File | null = null;

  /** Preview URL for uploaded image */
  previewUrl: string | null = null;

  /** Observable configuration */
  config: AsciiConfig = {
    width: 80,
    height: 40,
    characters: '@%#*+=-:. ',
    invert: false,
    contrast: 1.0,
    brightness: 0.0,
    fontFamily: 'Courier New',
    fontSize: 12,
    quality: 'medium',
    colorize: false,
    animate: false,
  };

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    // Синхронизируем конфигурацию с engine
    this.engine.setConfig(this.config);
  }

  /**
   * Get ASCII configuration data grouped by functionality
   */
  get configData() {
    return {
      config: this.config,
      setConfig: this.setConfig,
    };
  }

  /**
   * Get UI state data grouped by functionality
   */
  get ui() {
    return {
      showSettings: this.showSettings,
      toggleSettings: this.toggleSettings,
      error: this.error,
      setError: this.setError,
      isLoading: this.isLoading,
      setLoading: this.setLoading,
    };
  }

  /**
   * Get ASCII content data grouped by functionality
   */
  get content() {
    return {
      currentAscii: this.currentAscii,
      hasContent: this.hasContent,
      hasImage: this.hasImage,
      uploadedImage: this.uploadedImage,
      previewUrl: this.previewUrl,
    };
  }

  /**
   * Get all actions grouped by functionality
   */
  get actions() {
    return {
      generateRandomAscii: this.generateRandomAscii,
      generatePatternAscii: this.generatePatternAscii,
      exportAsText: this.exportAsText,
      exportAsHtml: this.exportAsHtml,
      exportAsJson: this.exportAsJson,
      exportAsSvg: this.exportAsSvg,
      clearAscii: this.clearAscii,
      clearImage: this.clearImage,
      reset: this.reset,
      dispose: this.dispose,
    };
  }

  /**
   * Computed property to check if there's content to display
   */
  get hasContent(): boolean {
    return this.currentAscii.length > 0;
  }

  /**
   * Computed property to check if an image is uploaded
   */
  get hasImage(): boolean {
    return this.uploadedImage !== null && this.previewUrl !== null;
  }

  /**
   * Updates the ASCII configuration
   * @param config - Partial configuration to update
   */
  setConfig(config: Partial<AsciiConfig>): void {
    runInAction(() => {
      this.config = { ...this.config, ...config };
      this.engine.setConfig(this.config);

      // Если есть текущий ASCII арт и изменились параметры генерации,
      // перегенерируем его
      if (this.currentAscii && this.shouldRegenerate(config)) {
        this.regenerateCurrentAscii();
      }
    });
  }

  /**
   * Checks if ASCII art should be regenerated based on config changes
   */
  private shouldRegenerate(config: Partial<AsciiConfig>): boolean {
    const regenerationKeys: (keyof AsciiConfig)[] = [
      'width',
      'height',
      'characters',
      'invert',
      'contrast',
      'brightness',
      'quality',
    ];
    return regenerationKeys.some((key) => key in config);
  }

  /**
   * Regenerates current ASCII art with new settings
   */
  private regenerateCurrentAscii(): void {
    if (this.uploadedImage) {
      // Если есть загруженное изображение, конвертируем его заново
      this.convertImageToAscii();
    } else {
      // Если нет изображения, генерируем случайный ASCII
      this.generateRandomAscii();
    }
  }

  /**
   * Toggles the settings panel visibility
   */
  toggleSettings(): void {
    runInAction(() => {
      this.showSettings = !this.showSettings;
    });
  }

  /**
   * Sets the loading state
   * @param loading - Loading state
   */
  setLoading(loading: boolean): void {
    runInAction(() => {
      this.isLoading = loading;
    });
  }

  /**
   * Sets the error message
   * @param error - Error message or null to clear
   */
  setError(error: string | null): void {
    runInAction(() => {
      this.error = error;
    });
  }

  /**
   * Sets the current ASCII content
   * @param ascii - ASCII content
   */
  setCurrentAscii(ascii: string): void {
    runInAction(() => {
      this.currentAscii = ascii;
    });
  }

  /**
   * Sets the selected pattern type
   * @param pattern - Pattern type identifier
   */
  setSelectedPattern(pattern: string): void {
    runInAction(() => {
      this.selectedPattern = pattern;
    });
  }

  /**
   * Sets the uploaded image file and creates preview URL
   * @param file - Image file or null to clear
   */
  setUploadedImage(file: File | null): void {
    runInAction(() => {
      // Clean up previous URL
      if (this.previewUrl) {
        URL.revokeObjectURL(this.previewUrl);
      }

      this.uploadedImage = file;
      this.previewUrl = file ? URL.createObjectURL(file) : null;
    });
  }

  /**
   * Generates random ASCII art
   */
  generateRandomAscii(): void {
    this.setLoading(true);
    this.setError(null);

    try {
      const ascii = this.engine.generateRandomAscii(
        this.config.width,
        this.config.height
      );
      this.setCurrentAscii(ascii);
    } catch (error) {
      console.error('Error generating random ASCII:', error);
      this.setError('Ошибка генерации случайного ASCII арта');
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Generates ASCII art from selected pattern
   */
  generatePatternAscii(): void {
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
      console.error('Error generating pattern ASCII:', error);
      this.setError('Ошибка генерации ASCII арта по шаблону');
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Converts uploaded image to ASCII art
   */
  async convertImageToAscii(): Promise<void> {
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
      console.error('Error converting image to ASCII:', error);
      this.setError('Ошибка конвертации изображения в ASCII');
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Exports current ASCII art as text file
   */
  exportAsText(): void {
    if (!this.currentAscii) {
      this.setError('Нет ASCII арта для экспорта');
      return;
    }

    try {
      this.engine.exportAsText(this.currentAscii);
    } catch (error) {
      console.error('Error exporting as text:', error);
      this.setError('Ошибка экспорта в текстовый файл');
    }
  }

  /**
   * Exports current ASCII art as HTML file
   */
  exportAsHtml(): void {
    if (!this.currentAscii) {
      this.setError('Нет ASCII арта для экспорта');
      return;
    }

    try {
      this.engine.exportAsHtml(this.currentAscii);
    } catch (error) {
      console.error('Error exporting as HTML:', error);
      this.setError('Ошибка экспорта в HTML файл');
    }
  }

  /**
   * Exports current ASCII art as JSON file
   */
  exportAsJson(): void {
    if (!this.currentAscii) {
      this.setError('Нет ASCII арта для экспорта');
      return;
    }

    try {
      this.engine.exportAsJson(this.currentAscii);
    } catch (error) {
      console.error('Error exporting as JSON:', error);
      this.setError('Ошибка экспорта в JSON файл');
    }
  }

  /**
   * Exports current ASCII art as SVG file
   */
  exportAsSvg(): void {
    if (!this.currentAscii) {
      this.setError('Нет ASCII арта для экспорта');
      return;
    }

    try {
      this.engine.exportAsSvg(this.currentAscii);
    } catch (error) {
      console.error('Error exporting as SVG:', error);
      this.setError('Ошибка экспорта в SVG файл');
    }
  }

  /**
   * Clears the current ASCII content
   */
  clearAscii(): void {
    runInAction(() => {
      this.currentAscii = '';
      this.error = null;
    });
  }

  /**
   * Clears the uploaded image
   */
  clearImage(): void {
    this.setUploadedImage(null);
  }

  /**
   * Resets the store to initial state
   */
  reset(): void {
    runInAction(() => {
      this.showSettings = false;
      this.currentAscii = '';
      this.isLoading = false;
      this.error = null;
      this.selectedPattern = 'mandelbrot';
      this.uploadedImage = null;
      if (this.previewUrl) {
        URL.revokeObjectURL(this.previewUrl);
        this.previewUrl = null;
      }
    });
  }

  /**
   * Cleans up resources when store is disposed
   */
  dispose(): void {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }
  }
}

export const asciiStore = new AsciiStore();
