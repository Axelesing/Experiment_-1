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

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  /**
   * Gets the current ASCII configuration
   */
  get config(): AsciiConfig {
    return this.engine.getConfig();
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
      this.engine.setConfig(config);
    });
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
