export interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
  algorithm: string;
  createdAt: Date;
}

export interface ColorConfig {
  algorithm:
    | 'monochromatic'
    | 'analogous'
    | 'complementary'
    | 'triadic'
    | 'tetradic'
    | 'random'
    | 'harmony'
    | 'gradient';
  baseColor: string;
  count: number;
  saturation: number;
  lightness: number;
  variation: number;
}

export class ColorEngine {
  private config: ColorConfig = {
    algorithm: 'harmony',
    baseColor: '#ff6b6b',
    count: 5,
    saturation: 70,
    lightness: 50,
    variation: 20,
  };

  setConfig(config: Partial<ColorConfig>) {
    this.config = { ...this.config, ...config };
  }

  getConfig(): ColorConfig {
    return { ...this.config };
  }

  generatePalette(): ColorPalette {
    const colors = this.generateColors();
    return {
      id: this.generateId(),
      name: this.generatePaletteName(),
      colors,
      algorithm: this.config.algorithm,
      createdAt: new Date(),
    };
  }

  private generateColors(): string[] {
    switch (this.config.algorithm) {
      case 'monochromatic':
        return this.generateMonochromatic();
      case 'analogous':
        return this.generateAnalogous();
      case 'complementary':
        return this.generateComplementary();
      case 'triadic':
        return this.generateTriadic();
      case 'tetradic':
        return this.generateTetradic();
      case 'random':
        return this.generateRandom();
      case 'harmony':
        return this.generateHarmony();
      case 'gradient':
        return this.generateGradient();
      default:
        return this.generateHarmony();
    }
  }

  private generateMonochromatic(): string[] {
    const baseHsl = this.hexToHsl(this.config.baseColor);
    const colors: string[] = [];

    for (let i = 0; i < this.config.count; i++) {
      const lightness = Math.max(
        10,
        Math.min(
          90,
          baseHsl.l + (i - this.config.count / 2) * this.config.variation
        )
      );
      const color = this.hslToHex(baseHsl.h, baseHsl.s, lightness);
      colors.push(color);
    }

    return colors;
  }

  private generateAnalogous(): string[] {
    const baseHsl = this.hexToHsl(this.config.baseColor);
    const colors: string[] = [];

    for (let i = 0; i < this.config.count; i++) {
      const hue = (baseHsl.h + (i - this.config.count / 2) * 30) % 360;
      const saturation = Math.max(
        20,
        Math.min(100, this.config.saturation + (Math.random() - 0.5) * 20)
      );
      const lightness = Math.max(
        10,
        Math.min(
          90,
          this.config.lightness + (Math.random() - 0.5) * this.config.variation
        )
      );
      const color = this.hslToHex(hue, saturation, lightness);
      colors.push(color);
    }

    return colors;
  }

  private generateComplementary(): string[] {
    const baseHsl = this.hexToHsl(this.config.baseColor);
    const colors: string[] = [];

    // Base color
    const baseSaturation = Math.max(
      20,
      Math.min(100, this.config.saturation + (Math.random() - 0.5) * 20)
    );
    const baseLightness = Math.max(
      10,
      Math.min(
        90,
        this.config.lightness + (Math.random() - 0.5) * this.config.variation
      )
    );
    colors.push(this.hslToHex(baseHsl.h, baseSaturation, baseLightness));

    // Complementary color
    const complementaryHue = (baseHsl.h + 180) % 360;
    colors.push(this.hslToHex(complementaryHue, baseSaturation, baseLightness));

    // Generate additional colors
    for (let i = 2; i < this.config.count; i++) {
      const hue = (baseHsl.h + (i - 1) * 60) % 360;
      const saturation = Math.max(
        20,
        Math.min(100, this.config.saturation + (Math.random() - 0.5) * 20)
      );
      const lightness = Math.max(
        10,
        Math.min(
          90,
          this.config.lightness + (Math.random() - 0.5) * this.config.variation
        )
      );
      const color = this.hslToHex(hue, saturation, lightness);
      colors.push(color);
    }

    return colors;
  }

  private generateTriadic(): string[] {
    const baseHsl = this.hexToHsl(this.config.baseColor);
    const colors: string[] = [];

    for (let i = 0; i < this.config.count; i++) {
      const hue = (baseHsl.h + i * 120) % 360;
      const saturation = Math.max(
        20,
        Math.min(100, this.config.saturation + (Math.random() - 0.5) * 20)
      );
      const lightness = Math.max(
        10,
        Math.min(
          90,
          this.config.lightness + (Math.random() - 0.5) * this.config.variation
        )
      );
      const color = this.hslToHex(hue, saturation, lightness);
      colors.push(color);
    }

    return colors;
  }

  private generateTetradic(): string[] {
    const baseHsl = this.hexToHsl(this.config.baseColor);
    const colors: string[] = [];

    for (let i = 0; i < this.config.count; i++) {
      const hue = (baseHsl.h + i * 90) % 360;
      const saturation = Math.max(
        20,
        Math.min(100, this.config.saturation + (Math.random() - 0.5) * 20)
      );
      const lightness = Math.max(
        10,
        Math.min(
          90,
          this.config.lightness + (Math.random() - 0.5) * this.config.variation
        )
      );
      const color = this.hslToHex(hue, saturation, lightness);
      colors.push(color);
    }

    return colors;
  }

  private generateRandom(): string[] {
    const colors: string[] = [];

    for (let i = 0; i < this.config.count; i++) {
      const hue = Math.random() * 360;
      const saturation = Math.max(
        30,
        Math.min(100, this.config.saturation + (Math.random() - 0.5) * 40)
      );
      const lightness = Math.max(
        20,
        Math.min(80, this.config.lightness + (Math.random() - 0.5) * 40)
      );
      const color = this.hslToHex(hue, saturation, lightness);
      colors.push(color);
    }

    return colors;
  }

  private generateHarmony(): string[] {
    const baseHsl = this.hexToHsl(this.config.baseColor);
    const colors: string[] = [];

    // Golden ratio for harmonious color distribution
    const goldenRatio = 0.618;

    for (let i = 0; i < this.config.count; i++) {
      const hue = (baseHsl.h + i * goldenRatio * 360) % 360;
      const saturation = Math.max(
        20,
        Math.min(100, this.config.saturation + (Math.random() - 0.5) * 20)
      );
      const lightness = Math.max(
        10,
        Math.min(
          90,
          this.config.lightness + (Math.random() - 0.5) * this.config.variation
        )
      );
      const color = this.hslToHex(hue, saturation, lightness);
      colors.push(color);
    }

    return colors;
  }

  private generateGradient(): string[] {
    const baseHsl = this.hexToHsl(this.config.baseColor);
    const colors: string[] = [];

    for (let i = 0; i < this.config.count; i++) {
      const progress = i / (this.config.count - 1);
      const hue = (baseHsl.h + progress * 60) % 360;
      const saturation = Math.max(
        20,
        Math.min(100, this.config.saturation + (Math.random() - 0.5) * 20)
      );
      const lightness = Math.max(
        10,
        Math.min(
          90,
          this.config.lightness + (progress - 0.5) * this.config.variation
        )
      );
      const color = this.hslToHex(hue, saturation, lightness);
      colors.push(color);
    }

    return colors;
  }

  private hexToHsl(hex: string): { h: number; s: number; l: number } {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return {
      h: h * 360,
      s: s * 100,
      l: l * 100,
    };
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

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private generatePaletteName(): string {
    const adjectives = [
      'Vibrant',
      'Elegant',
      'Bold',
      'Soft',
      'Dynamic',
      'Harmonious',
      'Rich',
      'Subtle',
    ];
    const nouns = [
      'Palette',
      'Scheme',
      'Collection',
      'Harmony',
      'Blend',
      'Mix',
      'Set',
      'Range',
    ];

    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];

    return `${adjective} ${noun}`;
  }

  exportAsJson(
    palette: ColorPalette,
    filename: string = 'color-palette.json'
  ): void {
    const data = {
      name: palette.name,
      colors: palette.colors,
      algorithm: palette.algorithm,
      createdAt: palette.createdAt.toISOString(),
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

  exportAsCss(
    palette: ColorPalette,
    filename: string = 'color-palette.css'
  ): void {
    const css = `/* ${palette.name} - Generated Color Palette */
:root {
${palette.colors.map((color, index) => `  --color-${index + 1}: ${color};`).join('\n')}
}

/* Usage examples */
.palette-color-1 { color: var(--color-1); }
.palette-color-2 { color: var(--color-2); }
.palette-color-3 { color: var(--color-3); }
.palette-color-4 { color: var(--color-4); }
.palette-color-5 { color: var(--color-5); }
`;

    const blob = new Blob([css], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  exportAsScss(
    palette: ColorPalette,
    filename: string = 'color-palette.scss'
  ): void {
    const scss = `// ${palette.name} - Generated Color Palette
$palette: (
${palette.colors.map((color, index) => `  ${index + 1}: ${color}`).join(',\n')}
);

// Usage examples
@each $index, $color in $palette {
  .palette-color-#{$index} {
    color: $color;
  }
}
`;

    const blob = new Blob([scss], { type: 'text/scss' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  exportAsAse(
    palette: ColorPalette,
    filename: string = 'color-palette.ase'
  ): void {
    // Adobe Swatch Exchange (ASE) format
    // This is a simplified implementation
    const aseData = this.generateAseData(palette);
    const blob = new Blob([aseData], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  exportAsSketch(
    palette: ColorPalette,
    filename: string = 'color-palette.sketchpalette'
  ): void {
    // Sketch palette format
    const sketchData = {
      compatibleVersion: '2.0',
      pluginVersion: '2.0',
      colors: palette.colors.map((color) => ({
        red: parseInt(color.slice(1, 3), 16) / 255,
        green: parseInt(color.slice(3, 5), 16) / 255,
        blue: parseInt(color.slice(5, 7), 16) / 255,
        alpha: 1,
      })),
      gradients: [],
      images: [],
    };

    const blob = new Blob([JSON.stringify(sketchData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  exportAsFigma(
    palette: ColorPalette,
    filename: string = 'color-palette.figma.json'
  ): void {
    // Figma plugin format
    const figmaData = {
      name: palette.name,
      description: `Generated color palette: ${palette.name}`,
      colors: palette.colors.map((color, index) => ({
        name: `Color ${index + 1}`,
        value: color,
        type: 'SOLID',
      })),
      version: '1.0.0',
      created: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(figmaData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  exportAsTailwind(
    palette: ColorPalette,
    filename: string = 'color-palette.js'
  ): void {
    // Tailwind CSS config format
    const tailwindConfig = `// ${palette.name} - Tailwind CSS Color Palette
      module.exports = {
        theme: {
          extend: {
            colors: {
              palette: {
                ${palette.colors.map((color, index) => `${index + 1}: '${color}'`).join(',\n')}
              }
            }
          }
        }
      }`;

    const blob = new Blob([tailwindConfig], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  exportAsLess(
    palette: ColorPalette,
    filename: string = 'color-palette.less'
  ): void {
    // LESS variables format
    const lessContent = `// ${palette.name} - Generated Color Palette
@palette-1: ${palette.colors[0]};
@palette-2: ${palette.colors[1]};
@palette-3: ${palette.colors[2]};
@palette-4: ${palette.colors[3]};
@palette-5: ${palette.colors[4]};

// Usage examples
.primary { color: @palette-1; }
.secondary { color: @palette-2; }
.accent { color: @palette-3; }`;

    const blob = new Blob([lessContent], { type: 'text/less' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  private generateAseData(palette: ColorPalette): ArrayBuffer {
    // Simplified ASE format implementation
    const buffer = new ArrayBuffer(1024);
    const view = new DataView(buffer);
    let offset = 0;

    // ASE file header
    view.setUint32(offset, 0x41534546, false); // "ASEF"
    offset += 4;
    view.setUint32(offset, 0x00010000, false); // Version
    offset += 4;
    view.setUint32(offset, palette.colors.length, false); // Number of blocks
    offset += 4;

    // Color blocks
    palette.colors.forEach((color) => {
      // Block type (0x0001 = color)
      view.setUint16(offset, 0x0001, false);
      offset += 2;

      // Block length
      const nameLength = 4; // "Color"
      const colorDataLength = 10; // RGB + name
      view.setUint32(offset, nameLength + colorDataLength, false);
      offset += 4;

      // Color name length
      view.setUint16(offset, nameLength, false);
      offset += 2;

      // Color name
      const nameBytes = new TextEncoder().encode('Color');
      for (let i = 0; i < nameLength; i++) {
        view.setUint16(offset, nameBytes[i], false);
        offset += 2;
      }

      // Color model (RGB = 0x52474220)
      view.setUint32(offset, 0x52474220, false);
      offset += 4;

      // RGB values
      const r = parseInt(color.slice(1, 3), 16) / 255;
      const g = parseInt(color.slice(3, 5), 16) / 255;
      const b = parseInt(color.slice(5, 7), 16) / 255;

      view.setFloat32(offset, r, false);
      offset += 4;
      view.setFloat32(offset, g, false);
      offset += 4;
      view.setFloat32(offset, b, false);
      offset += 4;
    });

    return buffer.slice(0, offset);
  }
}
