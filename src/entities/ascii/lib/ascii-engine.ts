export interface AsciiConfig {
  width: number;
  height: number;
  characters: string;
  invert: boolean;
  contrast: number;
  brightness: number;
  fontFamily: string;
  fontSize: number;
  quality?: 'low' | 'medium' | 'high';
  colorize?: boolean;
  animate?: boolean;
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
    quality: 'medium',
    colorize: false,
    animate: false,
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
    const { width, height, characters, invert, contrast, brightness, quality } =
      this.config;

    // Adjust canvas size based on quality
    const scaleFactor =
      quality === 'high' ? 1 : quality === 'medium' ? 0.8 : 0.6;
    const canvasWidth = Math.floor(width * scaleFactor);
    const canvasHeight = Math.floor(height * scaleFactor);

    // Set canvas size
    this.canvas.width = canvasWidth;
    this.canvas.height = canvasHeight;

    // Enable image smoothing for better quality
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';

    // Draw image to canvas
    this.ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

    // Get image data
    const imageData = this.ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    const data = imageData.data;

    let ascii = '';

    for (let y = 0; y < canvasHeight; y++) {
      for (let x = 0; x < canvasWidth; x++) {
        const index = (y * canvasWidth + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];

        // Convert to grayscale with improved algorithm
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

        // Map to character with better distribution
        const normalizedGray = gray / 255;
        const charIndex = Math.floor(normalizedGray * (characters.length - 1));
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
          case 'julia':
            value = this.julia((x / width) * 4 - 2, (y / height) * 4 - 2);
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
          case 'sierpinski':
            value = this.sierpinski(x, y, width, height);
            break;
          case 'dragon':
            value = this.dragonCurve(x, y, width, height);
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

  private julia(cx: number, cy: number, maxIter: number = 50): number {
    const real = -0.7;
    const imag = 0.27015;
    let x = cx;
    let y = cy;
    let iter = 0;

    while (x * x + y * y <= 4 && iter < maxIter) {
      const xtemp = x * x - y * y + real;
      y = 2 * x * y + imag;
      x = xtemp;
      iter++;
    }

    return iter / maxIter;
  }

  private sierpinski(
    x: number,
    y: number,
    width: number,
    height: number
  ): number {
    const size = Math.min(width, height);
    const iterations = 6;

    for (let i = 0; i < iterations; i++) {
      const subSize = size / Math.pow(2, i);
      const subX = x % subSize;
      const subY = y % subSize;

      if (subX < subSize / 2 && subY < subSize / 2) {
        return 0;
      }
    }

    return 1;
  }

  private dragonCurve(
    x: number,
    y: number,
    width: number,
    height: number
  ): number {
    const centerX = width / 2;
    const centerY = height / 2;
    const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
    const angle = Math.atan2(y - centerY, x - centerX);

    // Simplified dragon curve approximation
    const dragonValue = Math.sin(distance * 0.3) * Math.cos(angle * 4);
    return (dragonValue + 1) / 2;
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
    const { fontFamily, fontSize, colorize } = this.config;
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
            font-family: '${fontFamily}', monospace;
            font-size: ${fontSize}px;
            line-height: 1;
            margin: 0;
            padding: 20px;
            white-space: pre;
            ${colorize ? 'background: linear-gradient(45deg, #1a1a2e, #16213e);' : ''}
        }
        ${
          colorize
            ? `
        .ascii-art {
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }`
            : ''
        }
    </style>
</head>
<body>
${colorize ? `<div class="ascii-art">${ascii}</div>` : ascii}
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

  exportAsJson(ascii: string, filename: string = 'ascii-art.json'): void {
    const data = {
      content: ascii,
      config: this.config,
      timestamp: new Date().toISOString(),
      metadata: {
        lines: ascii.split('\n').length,
        characters: ascii.length,
        width: this.config.width,
        height: this.config.height,
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  exportAsSvg(ascii: string, filename: string = 'ascii-art.svg'): void {
    const lines = ascii.split('\n');
    const { fontFamily, fontSize } = this.config;
    const lineHeight = fontSize * 1.2;
    const charWidth = fontSize * 0.6;

    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${this.config.width * charWidth}" height="${lines.length * lineHeight}">
  <style>
    .ascii-text {
      font-family: '${fontFamily}', monospace;
      font-size: ${fontSize}px;
      fill: #0f0;
    }
  </style>
  <rect width="100%" height="100%" fill="#000"/>
  ${lines
    .map(
      (line, y) =>
        `<text x="0" y="${(y + 1) * lineHeight}" class="ascii-text">${line}</text>`
    )
    .join('\n  ')}
</svg>`;

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}
