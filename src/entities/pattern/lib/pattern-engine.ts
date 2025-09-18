import { randomBetween } from '../../../shared/lib/utils';

export interface PatternPoint {
  x: number;
  y: number;
  originalX: number;
  originalY: number;
  color: string;
  size: number;
  originalSize: number;
  rotation: number;
  originalRotation: number;
}

export interface PatternConfig {
  type: 'geometric' | 'organic' | 'fractal' | 'spiral';
  complexity: number;
  colors: string[];
  density: number;
  animation: boolean;
  symmetry: boolean;
}

export class PatternEngine {
  private config: PatternConfig;
  private points: PatternPoint[] = [];
  private animationTime = 0;
  private canvasSize = { width: 0, height: 0 };
  private isGenerating = false;
  private lastGenerationTime = 0;
  private readonly MIN_GENERATION_INTERVAL = 16; // 60fps

  constructor(config: PatternConfig) {
    this.config = this.validateConfig(config);
    // Don't generate pattern here - wait for canvas size
  }

  updateConfig(config: Partial<PatternConfig>) {
    const validatedConfig = this.validateConfig({ ...this.config, ...config });
    this.config = validatedConfig;

    // Only generate pattern if canvas size is set
    if (this.canvasSize.width > 0 && this.canvasSize.height > 0) {
      this.generatePattern();
    }
  }

  setCanvasSize(width: number, height: number) {
    if (width <= 0 || height <= 0) {
      throw new Error('Canvas size must be positive');
    }

    this.canvasSize = { width, height };
    // Generate pattern when canvas size is set
    if (this.points.length === 0) {
      this.generatePattern();
    }
  }

  public generatePattern() {
    if (this.isGenerating) {
      return; // Prevent concurrent generation
    }

    const now = performance.now();
    if (now - this.lastGenerationTime < this.MIN_GENERATION_INTERVAL) {
      return; // Throttle generation
    }

    this.isGenerating = true;
    this.lastGenerationTime = now;

    try {
      this.points = [];
      this.animationTime = 0;

      switch (this.config.type) {
        case 'geometric':
          this.generateGeometricPattern();
          break;
        case 'organic':
          this.generateOrganicPattern();
          break;
        case 'fractal':
          this.generateFractalPattern();
          break;
        case 'spiral':
          this.generateSpiralPattern();
          break;
        default:
          throw new Error(`Unknown pattern type: ${this.config.type}`);
      }

      // Apply symmetry if enabled
      if (this.config.symmetry) {
        this.applySymmetry();
      }
    } catch (error) {
      console.error('Error generating pattern:', error);
      this.points = []; // Fallback to empty pattern
    } finally {
      this.isGenerating = false;
    }
  }

  private generateGeometricPattern() {
    const { complexity, colors, density } = this.config;
    const centerX = this.canvasSize.width / 2;
    const centerY = this.canvasSize.height / 2;
    const maxRadius =
      Math.min(this.canvasSize.width, this.canvasSize.height) / 2 - 20;

    for (let i = 0; i < density * 100; i++) {
      const angle = (i / density) * Math.PI * 2 * complexity;
      const radius = randomBetween(0, maxRadius);

      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      // Add geometric variations
      const geometricX = x + Math.sin(angle * complexity) * 10;
      const geometricY = y + Math.cos(angle * complexity) * 10;

      const size = randomBetween(2, 8);
      this.points.push({
        x: geometricX,
        y: geometricY,
        originalX: geometricX,
        originalY: geometricY,
        color: colors[Math.floor(Math.random() * colors.length)],
        size,
        originalSize: size,
        rotation: angle,
        originalRotation: angle,
      });
    }
  }

  private generateOrganicPattern() {
    const { complexity, colors, density } = this.config;

    for (let i = 0; i < density * 150; i++) {
      // Use Perlin-like noise simulation
      const x = randomBetween(0, this.canvasSize.width);
      const y = randomBetween(0, this.canvasSize.height);

      // Organic flow simulation
      const flowX = Math.sin(x * 0.01 * complexity) * 20;
      const flowY = Math.cos(y * 0.01 * complexity) * 20;

      const organicX = x + flowX;
      const organicY = y + flowY;

      // Check if point is within bounds
      if (
        organicX >= 0 &&
        organicX <= this.canvasSize.width &&
        organicY >= 0 &&
        organicY <= this.canvasSize.height
      ) {
        const size = randomBetween(1, 6);
        const rotation = randomBetween(0, Math.PI * 2);
        this.points.push({
          x: organicX,
          y: organicY,
          originalX: organicX,
          originalY: organicY,
          color: colors[Math.floor(Math.random() * colors.length)],
          size,
          originalSize: size,
          rotation,
          originalRotation: rotation,
        });
      }
    }
  }

  private generateFractalPattern() {
    const { complexity, colors, density } = this.config;
    const centerX = this.canvasSize.width / 2;
    const centerY = this.canvasSize.height / 2;

    // Generate fractal-like recursive pattern
    this.generateFractalBranch(
      centerX,
      centerY,
      Math.min(this.canvasSize.width, this.canvasSize.height) / 4,
      0,
      complexity,
      colors,
      density
    );
  }

  private generateFractalBranch(
    x: number,
    y: number,
    length: number,
    angle: number,
    complexity: number,
    colors: string[],
    density: number
  ) {
    if (length < 2 || this.points.length > density * 200) return;

    const endX = x + Math.cos(angle) * length;
    const endY = y + Math.sin(angle) * length;

    // Add points along the branch
    const steps = Math.floor(length / 4);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const pointX = x + (endX - x) * t;
      const pointY = y + (endY - y) * t;

      const size = randomBetween(1, 4);
      this.points.push({
        x: pointX,
        y: pointY,
        originalX: pointX,
        originalY: pointY,
        color: colors[Math.floor(Math.random() * colors.length)],
        size,
        originalSize: size,
        rotation: angle,
        originalRotation: angle,
      });
    }

    // Recursive branches
    const branchCount = Math.min(complexity, 4);
    for (let i = 0; i < branchCount; i++) {
      const branchAngle = angle + randomBetween(-Math.PI / 3, Math.PI / 3);
      const branchLength = length * randomBetween(0.4, 0.8);
      this.generateFractalBranch(
        endX,
        endY,
        branchLength,
        branchAngle,
        complexity - 1,
        colors,
        density
      );
    }
  }

  private generateSpiralPattern() {
    const { complexity, colors, density } = this.config;
    const centerX = this.canvasSize.width / 2;
    const centerY = this.canvasSize.height / 2;
    const maxRadius =
      Math.min(this.canvasSize.width, this.canvasSize.height) / 2 - 20;

    for (let i = 0; i < density * 300; i++) {
      const t = i / (density * 300);
      const angle = t * Math.PI * 4 * complexity;
      const radius = t * maxRadius;

      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      // Add spiral variations
      const spiralX = x + Math.sin(angle * 2) * 5;
      const spiralY = y + Math.cos(angle * 2) * 5;

      if (
        spiralX >= 0 &&
        spiralX <= this.canvasSize.width &&
        spiralY >= 0 &&
        spiralY <= this.canvasSize.height
      ) {
        const size = randomBetween(1, 5);
        this.points.push({
          x: spiralX,
          y: spiralY,
          originalX: spiralX,
          originalY: spiralY,
          color: colors[Math.floor(Math.random() * colors.length)],
          size,
          originalSize: size,
          rotation: angle,
          originalRotation: angle,
        });
      }
    }
  }

  private applySymmetry() {
    const centerX = this.canvasSize.width / 2;
    const centerY = this.canvasSize.height / 2;
    const originalPoints = [...this.points];

    // Add 8-fold rotational symmetry
    for (let i = 0; i < 7; i++) {
      const angle = (Math.PI * 2 * (i + 1)) / 8;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      originalPoints.forEach((point) => {
        // Translate to origin
        const x = point.originalX - centerX;
        const y = point.originalY - centerY;

        // Rotate
        const rotatedX = x * cos - y * sin;
        const rotatedY = x * sin + y * cos;

        // Translate back
        const newX = rotatedX + centerX;
        const newY = rotatedY + centerY;

        // Check bounds
        if (
          newX >= 0 &&
          newX <= this.canvasSize.width &&
          newY >= 0 &&
          newY <= this.canvasSize.height
        ) {
          this.points.push({
            x: newX,
            y: newY,
            originalX: newX,
            originalY: newY,
            color: point.color,
            size: point.size,
            originalSize: point.originalSize,
            rotation: point.rotation + angle,
            originalRotation: point.originalRotation + angle,
          });
        }
      });
    }
  }

  updateAnimation(deltaTime: number, animationSpeed: number = 1) {
    if (!this.config.animation) return;

    this.animationTime += deltaTime * animationSpeed;

    // Animate points
    this.points.forEach((point, index) => {
      const wave = Math.sin(this.animationTime * 0.02 + index * 0.1);
      const wave2 = Math.cos(this.animationTime * 0.015 + index * 0.05);

      // Animate rotation
      point.rotation = point.originalRotation + wave * 2;

      // Animate size with pulsing effect
      point.size = Math.max(0.5, point.originalSize + wave * 1.2 + wave2 * 0.5);

      // Animate position slightly
      point.x =
        point.originalX + Math.sin(this.animationTime * 0.01 + index * 0.2) * 3;
      point.y =
        point.originalY + Math.cos(this.animationTime * 0.01 + index * 0.2) * 3;
    });
  }

  getPoints(): PatternPoint[] {
    return this.points;
  }

  getPointCount(): number {
    return this.points.length;
  }

  clear() {
    this.points = [];
  }

  render(ctx: CanvasRenderingContext2D) {
    const points = this.getPoints();

    // Group points by color for better performance
    const colorGroups = new Map<string, PatternPoint[]>();

    points.forEach((point) => {
      if (!colorGroups.has(point.color)) {
        colorGroups.set(point.color, []);
      }
      colorGroups.get(point.color)?.push(point);
    });

    colorGroups.forEach((group, color) => {
      ctx.save();
      ctx.fillStyle = color;

      group.forEach((point) => {
        ctx.save();
        ctx.translate(point.x, point.y);
        ctx.rotate(point.rotation);

        ctx.beginPath();
        ctx.arc(0, 0, point.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      ctx.restore();
    });
  }

  /**
   * Validates pattern configuration and returns sanitized config
   */
  private validateConfig(config: PatternConfig): PatternConfig {
    const validTypes: PatternConfig['type'][] = [
      'geometric',
      'organic',
      'fractal',
      'spiral',
    ];

    return {
      type: validTypes.includes(config.type) ? config.type : 'geometric',
      complexity: Math.max(1, Math.min(10, Math.round(config.complexity))),
      colors:
        Array.isArray(config.colors) && config.colors.length > 0
          ? config.colors.filter(
              (color) =>
                typeof color === 'string' && /^#[0-9a-fA-F]{6}$/.test(color)
            )
          : ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'],
      density: Math.max(0.1, Math.min(5, config.density)),
      animation: Boolean(config.animation),
      symmetry: Boolean(config.symmetry),
    };
  }

  /**
   * Gets current configuration
   */
  getConfig(): PatternConfig {
    return { ...this.config };
  }

  /**
   * Checks if pattern is currently being generated
   */
  isGeneratingPattern(): boolean {
    return this.isGenerating;
  }

  /**
   * Gets canvas size
   */
  getCanvasSize(): { width: number; height: number } {
    return { ...this.canvasSize };
  }
}
