import { useRef, useEffect, useState, useCallback, useMemo, memo } from 'react';
import { Maze } from '../../../entities/maze/lib';
import { MazeConfig } from '../../../shared/types';

/**
 * Props for the MazeCanvas component
 * @interface MazeCanvasProps
 */
interface MazeCanvasProps {
  /** Generated maze data to render */
  maze: Maze;
  /** Configuration for rendering the maze */
  config: MazeConfig;
}

/**
 * Color mapping for different cell types
 * @constant CELL_COLORS
 */
const CELL_COLORS = {
  start: '#10b981',
  end: '#ef4444',
  path: '#374151',
  wall: '#111827',
} as const;

/**
 * MazeCanvas component for rendering mazes with interactive controls
 *
 * Features:
 * - Interactive pan and zoom
 * - Canvas-based rendering for performance
 * - Responsive design
 * - Accessibility support
 *
 * @param props - Component props
 * @returns {JSX.Element} Rendered maze canvas
 */
const MazeCanvasComponent = ({ maze, config }: MazeCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  /**
   * Memoized rendering parameters for performance optimization
   */
  const renderParams = useMemo(
    () => ({
      cellSize: config.cellSize * scale,
      wallThickness: config.wallThickness * scale,
    }),
    [config.cellSize, config.wallThickness, scale]
  );

  /**
   * Draw the maze on the canvas
   * Optimized to minimize redraws and improve performance
   */
  const drawMaze = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set background
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const { cellSize, wallThickness } = renderParams;

    // Оптимизация: рисуем стены одним проходом
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = wallThickness;
    ctx.beginPath();

    // Draw maze
    for (let y = 0; y < maze.height; y++) {
      for (let x = 0; x < maze.width; x++) {
        const cell = maze.cells[y][x];
        const cellX = x * cellSize + offset.x;
        const cellY = y * cellSize + offset.y;

        // Draw cell background
        ctx.fillStyle = CELL_COLORS[cell.type];
        ctx.fillRect(cellX, cellY, cellSize, cellSize);

        // Draw walls
        if (cell.walls.north) {
          ctx.moveTo(cellX, cellY);
          ctx.lineTo(cellX + cellSize, cellY);
        }
        if (cell.walls.south) {
          ctx.moveTo(cellX, cellY + cellSize);
          ctx.lineTo(cellX + cellSize, cellY + cellSize);
        }
        if (cell.walls.east) {
          ctx.moveTo(cellX + cellSize, cellY);
          ctx.lineTo(cellX + cellSize, cellY + cellSize);
        }
        if (cell.walls.west) {
          ctx.moveTo(cellX, cellY);
          ctx.lineTo(cellX, cellY + cellSize);
        }
      }
    }

    ctx.stroke();
  }, [maze, offset, renderParams]);

  /**
   * Handle mouse down event for dragging
   */
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      setIsDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    },
    [offset]
  );

  /**
   * Handle mouse move event for dragging
   */
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDragging) return;
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  /**
   * Handle mouse up event to stop dragging
   */
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  /**
   * Handle wheel event for zooming
   */
  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale((prev) => Math.max(0.1, Math.min(5, prev * delta)));
  }, []);

  /**
   * Reset view to default position and scale
   */
  const resetView = useCallback(() => {
    setOffset({ x: 0, y: 0 });
    setScale(1);
  }, []);

  /**
   * Fit maze to screen size
   */
  const fitToScreen = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const mazeWidth = maze.width * config.cellSize;
    const mazeHeight = maze.height * config.cellSize;

    const scaleX = canvasWidth / mazeWidth;
    const scaleY = canvasHeight / mazeHeight;
    const newScale = Math.min(scaleX, scaleY) * 0.9;

    setScale(newScale);
    setOffset({
      x: (canvasWidth - mazeWidth * newScale) / 2,
      y: (canvasHeight - mazeHeight * newScale) / 2,
    });
  }, [maze, config]);

  // Оптимизация: объединяем эффекты
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Initial fit to screen
    fitToScreen();
  }, [maze, fitToScreen]);

  useEffect(() => {
    drawMaze();
  }, [drawMaze]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="border border-gray-700/50 rounded-lg cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ touchAction: 'none' }}
        role="img"
        aria-label={`Maze with ${maze.width} by ${maze.height} cells, generated using ${config.algorithm} algorithm`}
        tabIndex={0}
      />

      <div className="absolute top-2 right-2 flex gap-2">
        <button
          onClick={resetView}
          className="px-3 py-1 bg-gray-800/80 hover:bg-gray-700/80 text-white text-sm rounded border border-gray-600/50"
          aria-label="Reset view to default position and scale"
        >
          Сброс
        </button>
        <button
          onClick={fitToScreen}
          className="px-3 py-1 bg-gray-800/80 hover:bg-gray-700/80 text-white text-sm rounded border border-gray-600/50"
          aria-label="Fit maze to screen size"
        >
          По размеру
        </button>
      </div>

      <div className="absolute bottom-2 left-2 text-xs text-white/60 bg-gray-800/80 px-2 py-1 rounded">
        Масштаб: {Math.round(scale * 100)}% | Перетаскивание для перемещения |
        Колесо мыши для масштабирования
      </div>
    </div>
  );
};

MazeCanvasComponent.displayName = 'MazeCanvas';

export const MazeCanvas = memo(MazeCanvasComponent);
