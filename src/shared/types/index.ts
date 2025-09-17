/**
 * Navigation tab configuration
 */
export interface Tab {
  /** Unique tab identifier */
  id: string;
  /** Display title */
  title: string;
  /** Icon name from Lucide React */
  icon: string;
  /** Description for accessibility */
  description: string;
}

/**
 * Pattern generation configuration
 */
export interface PatternConfig {
  /** Pattern type */
  type: 'geometric' | 'organic' | 'fractal' | 'spiral';
  /** Complexity level (1-10) */
  complexity: number;
  /** Color palette */
  colors: string[];
  /** Pattern size multiplier */
  size: number;
  /** Pattern density */
  density?: number;
  /** Enable animation */
  animation?: boolean;
  /** Enable symmetry */
  symmetry?: boolean;
}

/**
 * Color palette configuration
 */
export interface ColorPalette {
  /** Unique palette identifier */
  id: string;
  /** Palette name */
  name: string;
  /** Array of hex colors */
  colors: string[];
  /** Color harmony type */
  harmony:
    | 'monochromatic'
    | 'analogous'
    | 'complementary'
    | 'triadic'
    | 'tetradic';
  /** Creation timestamp */
  createdAt?: Date;
}

/**
 * Fractal rendering configuration
 */
export interface FractalConfig {
  /** Fractal type */
  type: 'mandelbrot' | 'julia' | 'sierpinski' | 'koch';
  /** Iteration count for rendering */
  iterations: number;
  /** Zoom level */
  zoom: number;
  /** X offset */
  offsetX: number;
  /** Y offset */
  offsetY: number;
  /** Color scheme identifier */
  colorScheme: string;
}

/**
 * Maze generation configuration
 */
export interface MazeConfig {
  /** Maze width in cells */
  width: number;
  /** Maze height in cells */
  height: number;
  /** Generation algorithm */
  algorithm: 'recursive' | 'prim' | 'kruskal' | 'wilson';
  /** Cell size in pixels */
  cellSize: number;
  /** Wall thickness in pixels */
  wallThickness: number;
}

/**
 * Typography configuration
 */
export interface TypographyConfig {
  /** Font family */
  fontFamily: string;
  /** Font size in pixels */
  fontSize: number;
  /** Font weight */
  fontWeight: number;
  /** Line height multiplier */
  lineHeight: number;
  /** Letter spacing in pixels */
  letterSpacing: number;
  /** Text alignment */
  textAlign: 'left' | 'center' | 'right' | 'justify';
  /** Text transformation */
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

/**
 * Common UI component props
 */
export interface BaseComponentProps {
  /** Additional CSS classes */
  className?: string;
  /** Children elements */
  children?: React.ReactNode;
}

/**
 * Store action result type
 */
export type StoreActionResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};
