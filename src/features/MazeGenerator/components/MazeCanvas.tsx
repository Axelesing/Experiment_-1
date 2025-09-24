import { useRef, useEffect, useState, useCallback, useMemo, memo } from 'react';
import {
  Maze,
  GenerationStep,
  PathfindingStep,
  PathfindingResult,
} from '../../../entities/maze/lib';
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
  /** Current generation step for animation */
  currentStep?: GenerationStep | null;
  /** Whether animation is active */
  isAnimating?: boolean;
  /** Current pathfinding step for animation */
  currentPathfindingStep?: PathfindingStep | null;
  /** Whether pathfinding is active */
  isPathfinding?: boolean;
  /** Pathfinding result to display */
  pathfindingResult?: PathfindingResult | null;
}

/**
 * Color mapping for different cell types and animation states
 * @constant CELL_COLORS
 */
const CELL_COLORS = {
  start: '#10b981',
  end: '#ef4444',
  path: '#374151',
  wall: '#111827',
  current: '#3b82f6',
  visited: '#6b7280',
  pathfinding: '#f59e0b',
  solution: '#8b5cf6',
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
const MazeCanvasComponent = ({
  maze,
  config,
  currentStep,
  isAnimating = false,
  currentPathfindingStep,
  isPathfinding = false,
  pathfindingResult,
}: MazeCanvasProps) => {
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

        // Draw cell background with animation support
        let cellColor: string = CELL_COLORS[cell.type];

        // Highlight current step during animation
        if (isAnimating && currentStep) {
          if (
            currentStep.type === 'visit' &&
            x === currentStep.position.x &&
            y === currentStep.position.y
          ) {
            cellColor = CELL_COLORS.current;
          } else if (
            currentStep.type === 'carve' &&
            ((x === currentStep.position.x && y === currentStep.position.y) ||
              (currentStep.direction &&
                x ===
                  currentStep.position.x +
                    (currentStep.direction === 'east'
                      ? 1
                      : currentStep.direction === 'west'
                        ? -1
                        : 0) &&
                y ===
                  currentStep.position.y +
                    (currentStep.direction === 'south'
                      ? 1
                      : currentStep.direction === 'north'
                        ? -1
                        : 0)))
          ) {
            cellColor = CELL_COLORS.current;
          }
        }

        // Highlight pathfinding visualization
        if (isPathfinding && currentPathfindingStep) {
          // Highlight visited cells
          if (
            currentPathfindingStep.visited.some(
              (pos) => pos.x === x && pos.y === y
            )
          ) {
            cellColor = CELL_COLORS.visited;
          }
          // Highlight current position
          if (
            x === currentPathfindingStep.position.x &&
            y === currentPathfindingStep.position.y
          ) {
            cellColor = CELL_COLORS.pathfinding;
          }
        }

        // Show final solution path
        if (pathfindingResult && pathfindingResult.found) {
          if (
            pathfindingResult.path.some((pos) => pos.x === x && pos.y === y)
          ) {
            cellColor = CELL_COLORS.solution;
          }
        }

        ctx.fillStyle = cellColor;
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
  }, [
    maze,
    offset,
    renderParams,
    currentStep,
    isAnimating,
    currentPathfindingStep,
    isPathfinding,
    pathfindingResult,
  ]);

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

  // Setup native event listeners for better control
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Add native wheel event listener for zooming
    const wheelHandler = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setScale((prev) => Math.max(0.1, Math.min(5, prev * delta)));
      return false;
    };

    // Use capture phase to intercept events before they reach other handlers
    canvas.addEventListener('wheel', wheelHandler, {
      passive: false,
      capture: true,
    });

    // Initial fit to screen
    fitToScreen();

    // Cleanup
    return () => {
      canvas.removeEventListener('wheel', wheelHandler, { capture: true });
    };
  }, [maze, fitToScreen]);

  useEffect(() => {
    drawMaze();
  }, [drawMaze]);

  // Setup container touch event listeners for mobile
  useEffect(() => {
    const container = document.querySelector('.maze-container');
    if (!container) return;

    const containerTouchHandler = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    };

    container.addEventListener('touchstart', containerTouchHandler, {
      passive: false,
      capture: true,
    });
    container.addEventListener('touchmove', containerTouchHandler, {
      passive: false,
      capture: true,
    });

    return () => {
      container.removeEventListener('touchstart', containerTouchHandler, {
        capture: true,
      });
      container.removeEventListener('touchmove', containerTouchHandler, {
        capture: true,
      });
    };
  }, []);

  return (
    <div className="relative overflow-hidden" style={{ touchAction: 'none' }}>
      <canvas
        ref={canvasRef}
        className="border border-gray-700/50 rounded-lg cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
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
