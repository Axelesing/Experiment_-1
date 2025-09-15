export interface AsciiConfig {
  width: number;
  height: number;
  characters: string;
  invert: boolean;
  contrast: number;
  brightness: number;
  fontFamily: string;
  fontSize: number;
}

export class AsciiEngine {
  private config: AsciiConfig = {
    width: 80,
    height: 40,
    characters: '@%#*+=-:. ',
    invert: false,
    contrast: 1.0,
    brightness: 0.0,
    fontFamily: 'Courier New',
    fontSize: 12,
  };

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  setConfig(config: Partial<AsciiConfig>) {
    this.config = { ...this.config, ...config };
  }

  getConfig(): AsciiConfig {
    return { ...this.config };
  }

  async convertImageToAscii(imageFile: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const ascii = this.processImage(img);
          resolve(ascii);
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(imageFile);
    });
  }

  private processImage(img: HTMLImageElement): string {
    const { width, height, characters, invert, contrast, brightness } =
      this.config;

    // Set canvas size
    this.canvas.width = width;
    this.canvas.height = height;

    // Draw image to canvas
    this.ctx.drawImage(img, 0, 0, width, height);

    // Get image data
    const imageData = this.ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    let ascii = '';

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];

        // Convert to grayscale
        let gray = 0.299 * r + 0.587 * g + 0.114 * b;

        // Apply brightness
        gray += brightness * 255;

        // Apply contrast
        gray = (gray - 128) * contrast + 128;

        // Clamp values
        gray = Math.max(0, Math.min(255, gray));

        // Invert if needed
        if (invert) {
          gray = 255 - gray;
        }

        // Map to character
        const charIndex = Math.floor((gray / 255) * (characters.length - 1));
        ascii += characters[charIndex];
      }
      ascii += '\n';
    }

    return ascii;
  }

  generateRandomAscii(width: number = 80, height: number = 40): string {
    const characters = this.config.characters;
    let ascii = '';

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const charIndex = Math.floor(Math.random() * characters.length);
        ascii += characters[charIndex];
      }
      ascii += '\n';
    }

    return ascii;
  }

  generatePatternAscii(
    width: number = 80,
    height: number = 40,
    pattern: string = 'mandelbrot'
  ): string {
    const characters = this.config.characters;
    let ascii = '';

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let value = 0;

        switch (pattern) {
          case 'mandelbrot':
            value = this.mandelbrot((x / width) * 4 - 2, (y / height) * 4 - 2);
            break;
          case 'sine':
            value = (Math.sin(x * 0.1) + Math.sin(y * 0.1)) / 2;
            break;
          case 'spiral': {
            const centerX = width / 2;
            const centerY = height / 2;
            const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
            const angle = Math.atan2(y - centerY, x - centerX);
            value = Math.sin(distance * 0.2 + angle * 3) / 2 + 0.5;
            break;
          }
          case 'waves':
            value = (Math.sin(x * 0.1) * Math.cos(y * 0.1)) / 2 + 0.5;
            break;
          default:
            value = Math.random();
        }

        const charIndex = Math.floor(value * (characters.length - 1));
        ascii += characters[charIndex];
      }
      ascii += '\n';
    }

    return ascii;
  }

  private mandelbrot(cx: number, cy: number, maxIter: number = 50): number {
    let x = 0;
    let y = 0;
    let iter = 0;

    while (x * x + y * y <= 4 && iter < maxIter) {
      const xtemp = x * x - y * y + cx;
      y = 2 * x * y + cy;
      x = xtemp;
      iter++;
    }

    return iter / maxIter;
  }

  exportAsText(ascii: string, filename: string = 'ascii-art.txt'): void {
    const blob = new Blob([ascii], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  exportAsHtml(ascii: string, filename: string = 'ascii-art.html'): void {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>ASCII Art</title>
    <style>
        body {
            background: #000;
            color: #0f0;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1;
            margin: 0;
            padding: 20px;
            white-space: pre;
        }
    </style>
</head>
<body>
${ascii}
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}
