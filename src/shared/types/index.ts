export interface Tab {
  id: string;
  title: string;
  icon: string;
  description: string;
}

// Particle types are now in entities/particle/lib/particle-engine.ts

export interface PatternConfig {
  type: 'geometric' | 'organic' | 'fractal' | 'spiral';
  complexity: number;
  colors: string[];
  size: number;
}

export interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
  harmony:
    | 'monochromatic'
    | 'analogous'
    | 'complementary'
    | 'triadic'
    | 'tetradic';
}

export interface FractalConfig {
  type: 'mandelbrot' | 'julia' | 'sierpinski' | 'koch';
  iterations: number;
  zoom: number;
  offsetX: number;
  offsetY: number;
  colorScheme: string;
}

export interface MazeConfig {
  width: number;
  height: number;
  algorithm: 'recursive' | 'prim' | 'kruskal' | 'wilson';
  cellSize: number;
  wallThickness: number;
}

export interface TypographyConfig {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: number;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}
