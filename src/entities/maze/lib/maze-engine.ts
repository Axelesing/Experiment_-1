import { MazeConfig } from '../../../shared/types';

/**
 * Cell types in the maze
 * @typedef {'wall' | 'path' | 'start' | 'end'} CellType
 */
export type CellType = 'wall' | 'path' | 'start' | 'end';

/**
 * Direction for maze generation
 * @typedef {'north' | 'south' | 'east' | 'west'} Direction
 */
export type Direction = 'north' | 'south' | 'east' | 'west';

/**
 * Cell coordinates in the maze grid
 * @interface CellPosition
 */
export interface CellPosition {
  /** X coordinate (column) */
  x: number;
  /** Y coordinate (row) */
  y: number;
}

/**
 * Wall configuration for a maze cell
 * @interface CellWalls
 */
export interface CellWalls {
  /** North wall exists */
  north: boolean;
  /** South wall exists */
  south: boolean;
  /** East wall exists */
  east: boolean;
  /** West wall exists */
  west: boolean;
}

/**
 * Maze cell structure
 * @interface MazeCell
 */
export interface MazeCell {
  /** Type of the cell */
  type: CellType;
  /** Whether the cell has been visited during generation */
  visited: boolean;
  /** Wall configuration */
  walls: CellWalls;
}

/**
 * Generated maze structure
 * @interface Maze
 */
export interface Maze {
  /** 2D array of maze cells */
  cells: MazeCell[][];
  /** Width of the maze in cells */
  width: number;
  /** Height of the maze in cells */
  height: number;
  /** Starting position */
  start: CellPosition;
  /** Ending position */
  end: CellPosition;
}

/**
 * Step in maze generation process
 * @interface GenerationStep
 */
export interface GenerationStep {
  /** Type of step */
  type: 'visit' | 'carve' | 'complete';
  /** Cell position */
  position: CellPosition;
  /** Direction of wall removal (for carve steps) */
  direction?: Direction;
  /** Current maze state */
  maze: Maze;
}

/**
 * Path finding algorithm type
 */
export type PathfindingAlgorithm = 'bfs' | 'dfs' | 'astar';

/**
 * Path finding result
 * @interface PathfindingResult
 */
export interface PathfindingResult {
  /** Found path from start to end */
  path: CellPosition[];
  /** All visited cells during search */
  visited: CellPosition[];
  /** Whether a path was found */
  found: boolean;
  /** Algorithm used */
  algorithm: PathfindingAlgorithm;
  /** Number of steps taken */
  steps: number;
}

/**
 * Step in path finding process
 * @interface PathfindingStep
 */
export interface PathfindingStep {
  /** Type of step */
  type: 'visit' | 'path' | 'complete';
  /** Cell position */
  position: CellPosition;
  /** Current path */
  path: CellPosition[];
  /** All visited cells */
  visited: CellPosition[];
  /** Whether path was found */
  found: boolean;
}

/**
 * Maze generation engine supporting multiple algorithms
 *
 * This class provides methods to generate mazes using different algorithms:
 * - Recursive backtracking
 * - Prim's algorithm
 * - Kruskal's algorithm
 * - Wilson's algorithm
 *
 * @class MazeEngine
 */
export class MazeEngine {
  /** Maze generation configuration */
  private readonly config: MazeConfig;

  /**
   * Creates a new maze engine instance
   * @param config - Configuration for maze generation
   * @throws {Error} If configuration is invalid
   */
  constructor(config: MazeConfig) {
    this.config = { ...config };
  }

  /**
   * Generate maze using recursive backtracking algorithm
   *
   * This algorithm creates mazes with long, winding passages by:
   * 1. Starting at a random cell
   * 2. Randomly choosing an unvisited neighbor
   * 3. Removing the wall between them
   * 4. Recursively continuing from the new cell
   * 5. Backtracking when no unvisited neighbors exist
   *
   * @returns {Maze} Generated maze with start and end points
   * @throws {Error} If maze generation fails
   */
  generateRecursive(): Maze {
    const cells = this.initializeCells();
    const start = { x: 1, y: 1 };
    const end = { x: this.config.width - 2, y: this.config.height - 2 };

    this.carvePath(cells, start.x, start.y);

    // Set start and end points
    cells[start.y][start.x].type = 'start';
    cells[end.y][end.x].type = 'end';

    return {
      cells,
      width: this.config.width,
      height: this.config.height,
      start,
      end,
    };
  }

  /**
   * Generate maze using Prim's algorithm
   *
   * This algorithm creates mazes with more uniform path distribution by:
   * 1. Starting with a single cell
   * 2. Adding all walls of that cell to a list
   * 3. Randomly selecting a wall from the list
   * 4. If the wall separates a visited and unvisited cell, connect them
   * 5. Add the new cell's walls to the list
   * 6. Repeat until all cells are visited
   *
   * @returns {Maze} Generated maze with start and end points
   * @throws {Error} If maze generation fails
   */
  generatePrim(): Maze {
    const cells = this.initializeCells();
    const start = { x: 1, y: 1 };
    const end = { x: this.config.width - 2, y: this.config.height - 2 };

    this.carvePathPrim(cells, start.x, start.y);

    // Set start and end points
    cells[start.y][start.x].type = 'start';
    cells[end.y][end.x].type = 'end';

    return {
      cells,
      width: this.config.width,
      height: this.config.height,
      start,
      end,
    };
  }

  /**
   * Generate maze using Kruskal's algorithm
   *
   * This algorithm creates mazes with multiple paths by:
   * 1. Treating each cell as a separate tree
   * 2. Creating a list of all possible walls
   * 3. Randomly selecting walls and removing them if they connect different trees
   * 4. Continuing until all cells are in the same tree
   *
   * @returns {Maze} Generated maze with start and end points
   * @throws {Error} If maze generation fails
   */
  generateKruskal(): Maze {
    const cells = this.initializeCells();
    const start = { x: 1, y: 1 };
    const end = { x: this.config.width - 2, y: this.config.height - 2 };

    this.carvePathKruskal(cells);

    // Ensure start and end are connected to the maze
    this.ensureStartEndConnected(cells, start, end);

    // Set start and end points (after ensuring connectivity)
    cells[start.y][start.x].type = 'start';
    cells[end.y][end.x].type = 'end';

    return {
      cells,
      width: this.config.width,
      height: this.config.height,
      start,
      end,
    };
  }

  /**
   * Generate maze using Wilson's algorithm
   *
   * This algorithm creates mazes with natural, organic appearance by:
   * 1. Starting with a single visited cell
   * 2. Randomly walking from an unvisited cell until reaching a visited cell
   * 3. Carving the path from the walk
   * 4. Marking all cells in the path as visited
   * 5. Repeating until all cells are visited
   *
   * @returns {Maze} Generated maze with start and end points
   * @throws {Error} If maze generation fails
   */
  generateWilson(): Maze {
    const cells = this.initializeCells();
    const start = { x: 1, y: 1 };
    const end = { x: this.config.width - 2, y: this.config.height - 2 };

    this.carvePathWilson(cells, start.x, start.y);

    // Ensure start and end are connected to the maze
    this.ensureStartEndConnected(cells, start, end);

    // Set start and end points (after ensuring connectivity)
    cells[start.y][start.x].type = 'start';
    cells[end.y][end.x].type = 'end';

    return {
      cells,
      width: this.config.width,
      height: this.config.height,
      start,
      end,
    };
  }

  /**
   * Generate maze based on selected algorithm
   *
   * @returns {Maze} Generated maze using the configured algorithm
   * @throws {Error} If maze generation fails
   */
  generate(): Maze {
    switch (this.config.algorithm) {
      case 'recursive':
        return this.generateRecursive();
      case 'prim':
        return this.generatePrim();
      case 'kruskal':
        return this.generateKruskal();
      case 'wilson':
        return this.generateWilson();
      default:
        return this.generateRecursive();
    }
  }

  /**
   * Generate maze step by step for animation
   *
   * @returns {Generator<GenerationStep>} Generator yielding generation steps
   */
  *generateStepByStep(): Generator<GenerationStep> {
    const cells = this.initializeCells();
    const start = { x: 1, y: 1 };
    const end = { x: this.config.width - 2, y: this.config.height - 2 };

    const maze: Maze = {
      cells,
      width: this.config.width,
      height: this.config.height,
      start,
      end,
    };

    switch (this.config.algorithm) {
      case 'recursive':
        yield* this.generateRecursiveStepByStep(maze);
        break;
      case 'prim':
        yield* this.generatePrimStepByStep(maze);
        break;
      case 'kruskal':
        yield* this.generateKruskalStepByStep(maze);
        break;
      case 'wilson':
        yield* this.generateWilsonStepByStep(maze);
        break;
      default:
        yield* this.generateRecursiveStepByStep(maze);
    }

    // Set start and end points
    cells[start.y][start.x].type = 'start';
    cells[end.y][end.x].type = 'end';

    yield {
      type: 'complete',
      position: end,
      maze: {
        ...maze,
        cells: [...cells],
      },
    };
  }

  /**
   * Initialize maze cells with walls
   *
   * Creates a 2D array of cells, all initially set as walls with all walls present
   *
   * @returns {MazeCell[][]} 2D array of initialized cells
   * @private
   */
  private initializeCells(): MazeCell[][] {
    const cells: MazeCell[][] = [];

    for (let y = 0; y < this.config.height; y++) {
      cells[y] = [];
      for (let x = 0; x < this.config.width; x++) {
        cells[y][x] = {
          type: 'wall',
          visited: false,
          walls: {
            north: true,
            south: true,
            east: true,
            west: true,
          },
        };
      }
    }

    return cells;
  }

  /**
   * Reset visited flags for all cells
   *
   * @param cells - 2D array of maze cells to reset
   * @private
   */
  private resetVisitedFlags(cells: MazeCell[][]): void {
    for (let y = 0; y < this.config.height; y++) {
      for (let x = 0; x < this.config.width; x++) {
        cells[y][x].visited = false;
      }
    }
  }

  /**
   * Recursive backtracking algorithm implementation
   *
   * @param cells - 2D array of maze cells
   * @param x - Current X coordinate
   * @param y - Current Y coordinate
   * @private
   */
  private carvePath(cells: MazeCell[][], x: number, y: number): void {
    cells[y][x].visited = true;
    cells[y][x].type = 'path';

    const directions: Direction[] = ['north', 'south', 'east', 'west'];
    this.shuffleArray(directions);

    for (const direction of directions) {
      const next = this.getNextPosition(x, y, direction);

      // Check if next cell is valid and unvisited
      if (this.isValidCell(next.x, next.y) && !cells[next.y][next.x].visited) {
        // Remove wall between current and next cell
        this.removeWall(cells, x, y, direction);
        // Recursively carve from next cell
        this.carvePath(cells, next.x, next.y);
      }
    }
  }

  /**
   * Prim's algorithm implementation
   */
  private carvePathPrim(
    cells: MazeCell[][],
    startX: number,
    startY: number
  ): void {
    const walls: Array<{ x: number; y: number; direction: Direction }> = [];

    // Mark start cell as path
    cells[startY][startX].type = 'path';
    cells[startY][startX].visited = true;

    // Add walls around start cell
    this.addWalls(walls, startX, startY);

    while (walls.length > 0) {
      const randomIndex = Math.floor(Math.random() * walls.length);
      const wall = walls[randomIndex];
      walls.splice(randomIndex, 1);

      const next = this.getNextPosition(wall.x, wall.y, wall.direction);

      // If next cell is a wall (unvisited), connect it
      if (
        this.isValidCell(next.x, next.y) &&
        cells[next.y][next.x].type === 'wall'
      ) {
        // Mark both cells as path
        cells[wall.y][wall.x].type = 'path';
        cells[wall.y][wall.x].visited = true;
        cells[next.y][next.x].type = 'path';
        cells[next.y][next.x].visited = true;

        // Remove wall between them
        this.removeWall(cells, wall.x, wall.y, wall.direction);

        // Add walls around the new cell
        this.addWalls(walls, next.x, next.y);
      }
    }
  }

  /**
   * Kruskal's algorithm implementation
   *
   * Creates mazes with multiple paths by:
   * 1. Treating each cell as a separate tree
   * 2. Creating a list of all possible walls
   * 3. Randomly selecting walls and removing them if they connect different trees
   * 4. Continuing until all cells are in the same tree
   */
  private carvePathKruskal(cells: MazeCell[][]): void {
    // Create list of all possible walls (edges between cells)
    const walls: Array<{ x: number; y: number; direction: Direction }> = [];

    // Add all possible walls between adjacent cells
    for (let y = 0; y < this.config.height; y++) {
      for (let x = 0; x < this.config.width; x++) {
        // Only consider walls between path cells (odd coordinates)
        if (x % 2 === 1 && y % 2 === 1) {
          const directions: Direction[] = ['north', 'south', 'east', 'west'];
          for (const direction of directions) {
            const next = this.getNextPosition(x, y, direction);
            // Only add walls to adjacent path cells
            if (
              this.isValidCell(next.x, next.y) &&
              next.x % 2 === 1 &&
              next.y % 2 === 1
            ) {
              walls.push({ x, y, direction });
            }
          }
        }
      }
    }

    // Shuffle walls for random selection
    this.shuffleArray(walls);

    // Union-Find data structure for tracking connected components
    const cellToSet: number[] = [];
    const sets: number[][] = [];
    let setCount = 0;

    // Initialize each path cell as its own set
    for (let y = 1; y < this.config.height - 1; y += 2) {
      for (let x = 1; x < this.config.width - 1; x += 2) {
        const cellIndex = y * this.config.width + x;
        cellToSet[cellIndex] = setCount;
        sets[setCount] = [cellIndex];
        setCount++;
      }
    }

    // Process walls in random order
    for (const wall of walls) {
      const currentIndex = wall.y * this.config.width + wall.x;
      const next = this.getNextPosition(wall.x, wall.y, wall.direction);
      const nextIndex = next.y * this.config.width + next.x;

      const currentSet = this.findSet(sets, cellToSet[currentIndex]);
      const nextSet = this.findSet(sets, cellToSet[nextIndex]);

      // If cells are in different sets, connect them
      if (currentSet !== nextSet) {
        // Mark both cells as path
        cells[wall.y][wall.x].type = 'path';
        cells[wall.y][wall.x].visited = true;
        cells[next.y][next.x].type = 'path';
        cells[next.y][next.x].visited = true;

        // Remove wall between them
        this.removeWall(cells, wall.x, wall.y, wall.direction);

        // Union the sets
        this.unionSets(sets, currentSet, nextSet, cellToSet);

        // If all cells are connected, we can stop early
        if (sets[currentSet].length === setCount) {
          break;
        }
      }
    }
  }

  /**
   * Wilson's algorithm implementation
   *
   * Creates mazes with natural, organic appearance by:
   * 1. Starting with a single visited cell
   * 2. Randomly walking from an unvisited cell until reaching a visited cell
   * 3. Carving the path from the walk
   * 4. Marking all cells in the path as visited
   * 5. Repeating until all cells are visited
   */
  private carvePathWilson(
    cells: MazeCell[][],
    startX: number,
    startY: number
  ): void {
    // Mark start cell as visited
    cells[startY][startX].type = 'path';
    cells[startY][startX].visited = true;

    const unvisited: CellPosition[] = [];

    // Collect all unvisited cells (only odd coordinates for path cells)
    for (let y = 1; y < this.config.height - 1; y += 2) {
      for (let x = 1; x < this.config.width - 1; x += 2) {
        if (!(x === startX && y === startY)) {
          unvisited.push({ x, y });
        }
      }
    }

    let iterations = 0;
    const maxIterations = this.config.width * this.config.height * 10; // Prevent infinite loops

    while (unvisited.length > 0 && iterations < maxIterations) {
      iterations++;
      const randomIndex = Math.floor(Math.random() * unvisited.length);
      const start = unvisited[randomIndex];

      // Perform random walk until we hit a visited cell
      const path = this.randomWalkWilson(cells, start);

      // Carve the path and mark cells as visited
      this.carvePathFromWalk(cells, path);

      // Remove all cells in the path from unvisited
      const initialLength = unvisited.length;
      for (let i = unvisited.length - 1; i >= 0; i--) {
        const cell = unvisited[i];
        if (cells[cell.y][cell.x].type === 'path') {
          unvisited.splice(i, 1);
        }
      }

      // If no cells were removed, force remove the current cell to prevent infinite loop
      if (unvisited.length === initialLength) {
        const currentIndex = unvisited.findIndex(
          (cell) => cell.x === start.x && cell.y === start.y
        );
        if (currentIndex !== -1) {
          unvisited.splice(currentIndex, 1);
          cells[start.y][start.x].type = 'path';
          cells[start.y][start.x].visited = true;
        }
      }
    }
  }

  /**
   * Get next position based on direction
   *
   * @param x - Current X coordinate
   * @param y - Current Y coordinate
   * @param direction - Direction to move
   * @returns {CellPosition} Next position coordinates
   * @private
   */
  private getNextPosition(
    x: number,
    y: number,
    direction: Direction
  ): CellPosition {
    switch (direction) {
      case 'north':
        return { x, y: y - 1 };
      case 'south':
        return { x, y: y + 1 };
      case 'east':
        return { x: x + 1, y };
      case 'west':
        return { x: x - 1, y };
    }
  }

  /**
   * Check if cell coordinates are valid
   */
  private isValidCell(x: number, y: number): boolean {
    return x >= 0 && x < this.config.width && y >= 0 && y < this.config.height;
  }

  /**
   * Remove wall between two cells
   */
  private removeWall(
    cells: MazeCell[][],
    x: number,
    y: number,
    direction: Direction
  ): void {
    const next = this.getNextPosition(x, y, direction);

    switch (direction) {
      case 'north':
        cells[y][x].walls.north = false;
        cells[next.y][next.x].walls.south = false;
        break;
      case 'south':
        cells[y][x].walls.south = false;
        cells[next.y][next.x].walls.north = false;
        break;
      case 'east':
        cells[y][x].walls.east = false;
        cells[next.y][next.x].walls.west = false;
        break;
      case 'west':
        cells[y][x].walls.west = false;
        cells[next.y][next.x].walls.east = false;
        break;
    }
  }

  /**
   * Add walls around a cell to the wall list
   */
  private addWalls(
    walls: Array<{ x: number; y: number; direction: Direction }>,
    x: number,
    y: number
  ): void {
    const directions: Direction[] = ['north', 'south', 'east', 'west'];

    for (const direction of directions) {
      const next = this.getNextPosition(x, y, direction);
      if (this.isValidCell(next.x, next.y)) {
        walls.push({ x, y, direction });
      }
    }
  }

  /**
   * Find the set containing a cell
   */
  private findSet(sets: number[][], cell: number): number {
    for (let i = 0; i < sets.length; i++) {
      if (sets[i] && sets[i].includes(cell)) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Union two sets
   */
  private unionSets(
    sets: number[][],
    set1: number,
    set2: number,
    cellToSet: number[]
  ): void {
    // Move all cells from set2 to set1
    for (const cell of sets[set2]) {
      cellToSet[cell] = set1;
    }
    sets[set1] = [...sets[set1], ...sets[set2]];
    sets[set2] = [];
  }

  /**
   * Random walk from a cell until reaching a visited cell (for Wilson's algorithm)
   */
  private randomWalkWilson(
    cells: MazeCell[][],
    start: CellPosition
  ): CellPosition[] {
    const path: CellPosition[] = [start];
    let current = start;
    let steps = 0;
    const maxSteps = this.config.width * this.config.height; // Prevent infinite loops

    // Keep walking until we hit a visited cell
    while (!cells[current.y][current.x].visited && steps < maxSteps) {
      steps++;
      const directions: Direction[] = ['north', 'south', 'east', 'west'];
      const validDirections = directions.filter((dir) => {
        const next = this.getNextPosition(current.x, current.y, dir);
        return (
          this.isValidCell(next.x, next.y) &&
          next.x % 2 === 1 &&
          next.y % 2 === 1
        ); // Only path cells
      });

      if (validDirections.length === 0) break;

      const randomDirection =
        validDirections[Math.floor(Math.random() * validDirections.length)];
      current = this.getNextPosition(current.x, current.y, randomDirection);
      path.push(current);
    }

    return path;
  }

  /**
   * Random walk from a cell until reaching a visited cell (legacy method)
   */
  private randomWalk(cells: MazeCell[][], start: CellPosition): CellPosition[] {
    const path: CellPosition[] = [start];
    let current = start;
    let steps = 0;
    const maxSteps = this.config.width * this.config.height; // Prevent infinite loops

    while (cells[current.y][current.x].type !== 'path' && steps < maxSteps) {
      steps++;
      const directions: Direction[] = ['north', 'south', 'east', 'west'];
      const validDirections = directions.filter((dir) => {
        const next = this.getNextPosition(current.x, current.y, dir);
        return this.isValidCell(next.x, next.y);
      });

      if (validDirections.length === 0) break;

      const randomDirection =
        validDirections[Math.floor(Math.random() * validDirections.length)];
      current = this.getNextPosition(current.x, current.y, randomDirection);
      path.push(current);
    }

    return path;
  }

  /**
   * Carve path from a random walk
   */
  private carvePathFromWalk(cells: MazeCell[][], path: CellPosition[]): void {
    for (let i = 0; i < path.length - 1; i++) {
      const current = path[i];
      const next = path[i + 1];

      cells[current.y][current.x].type = 'path';

      // Determine direction and remove wall
      if (next.x > current.x) {
        this.removeWall(cells, current.x, current.y, 'east');
      } else if (next.x < current.x) {
        this.removeWall(cells, current.x, current.y, 'west');
      } else if (next.y > current.y) {
        this.removeWall(cells, current.x, current.y, 'south');
      } else if (next.y < current.y) {
        this.removeWall(cells, current.x, current.y, 'north');
      }
    }
  }

  /**
   * Check if there's a valid path from start to end using BFS
   *
   * @param maze - Maze to validate
   * @returns {boolean} True if there's a valid path from start to end
   * @public
   */
  public hasValidPath(maze: Maze): boolean {
    const visited = new Set<string>();
    const queue: CellPosition[] = [maze.start];
    visited.add(`${maze.start.x},${maze.start.y}`);

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current.x === maze.end.x && current.y === maze.end.y) {
        return true;
      }

      const directions: Direction[] = ['north', 'south', 'east', 'west'];
      for (const direction of directions) {
        const next = this.getNextPosition(current.x, current.y, direction);
        const nextKey = `${next.x},${next.y}`;

        if (
          this.isValidCell(next.x, next.y) &&
          !visited.has(nextKey) &&
          this.canMove(maze.cells, current.x, current.y, direction)
        ) {
          visited.add(nextKey);
          queue.push(next);
        }
      }
    }

    return false;
  }

  /**
   * Check if movement is possible between two cells
   */
  private canMove(
    cells: MazeCell[][],
    x: number,
    y: number,
    direction: Direction
  ): boolean {
    const cell = cells[y][x];

    switch (direction) {
      case 'north':
        return !cell.walls.north;
      case 'south':
        return !cell.walls.south;
      case 'east':
        return !cell.walls.east;
      case 'west':
        return !cell.walls.west;
      default:
        return false;
    }
  }

  /**
   * Ensure start and end points are connected to the maze
   */
  private ensureStartEndConnected(
    cells: MazeCell[][],
    start: CellPosition,
    end: CellPosition
  ): void {
    // Mark start and end as path cells
    cells[start.y][start.x].type = 'path';
    cells[end.y][end.x].type = 'path';

    // Connect start to nearest path cell
    const startNeighbors = this.getNeighbors(start.x, start.y);
    for (const neighbor of startNeighbors) {
      if (
        this.isValidCell(neighbor.x, neighbor.y) &&
        cells[neighbor.y][neighbor.x].type === 'path'
      ) {
        const direction = this.getDirection(start, neighbor);
        this.removeWall(cells, start.x, start.y, direction);
        break;
      }
    }

    // Connect end to nearest path cell
    const endNeighbors = this.getNeighbors(end.x, end.y);
    for (const neighbor of endNeighbors) {
      if (
        this.isValidCell(neighbor.x, neighbor.y) &&
        cells[neighbor.y][neighbor.x].type === 'path'
      ) {
        const direction = this.getDirection(end, neighbor);
        this.removeWall(cells, end.x, end.y, direction);
        break;
      }
    }

    // Force connection for end if not connected
    let endConnected = false;
    for (const neighbor of endNeighbors) {
      if (
        this.isValidCell(neighbor.x, neighbor.y) &&
        cells[neighbor.y][neighbor.x].type === 'path'
      ) {
        const direction = this.getDirection(end, neighbor);
        this.removeWall(cells, end.x, end.y, direction);
        endConnected = true;
        break;
      }
    }

    // If still not connected, connect to any neighboring cell
    if (!endConnected) {
      for (const neighbor of endNeighbors) {
        if (this.isValidCell(neighbor.x, neighbor.y)) {
          const direction = this.getDirection(end, neighbor);
          this.removeWall(cells, end.x, end.y, direction);
          break;
        }
      }
    }
  }

  /**
   * Get neighboring cells
   */
  private getNeighbors(x: number, y: number): CellPosition[] {
    return [
      { x: x - 1, y },
      { x: x + 1, y },
      { x, y: y - 1 },
      { x, y: y + 1 },
    ];
  }

  /**
   * Get direction from one cell to another
   */
  private getDirection(from: CellPosition, to: CellPosition): Direction {
    if (to.x > from.x) return 'east';
    if (to.x < from.x) return 'west';
    if (to.y > from.y) return 'south';
    return 'north';
  }

  /**
   * Recursive backtracking algorithm implementation (step by step)
   */
  private *generateRecursiveStepByStep(maze: Maze): Generator<GenerationStep> {
    yield* this.carvePathStepByStep(maze.cells, 1, 1, maze);
  }

  /**
   * Recursive backtracking algorithm implementation (step by step)
   */
  private *carvePathStepByStep(
    cells: MazeCell[][],
    x: number,
    y: number,
    maze: Maze
  ): Generator<GenerationStep> {
    cells[y][x].visited = true;
    cells[y][x].type = 'path';

    yield {
      type: 'visit',
      position: { x, y },
      maze: {
        ...maze,
        cells: cells.map((row) => [...row]),
      },
    };

    const directions: Direction[] = ['north', 'south', 'east', 'west'];
    this.shuffleArray(directions);

    for (const direction of directions) {
      const next = this.getNextPosition(x, y, direction);

      // Check if next cell is valid and unvisited
      if (this.isValidCell(next.x, next.y) && !cells[next.y][next.x].visited) {
        // Remove wall between current and next cell
        this.removeWall(cells, x, y, direction);

        yield {
          type: 'carve',
          position: { x, y },
          direction,
          maze: {
            ...maze,
            cells: cells.map((row) => [...row]),
          },
        };

        // Recursively carve from next cell
        yield* this.carvePathStepByStep(cells, next.x, next.y, maze);
      }
    }
  }

  /**
   * Prim's algorithm implementation (step by step)
   */
  private *generatePrimStepByStep(maze: Maze): Generator<GenerationStep> {
    const cells = maze.cells;
    const walls: Array<{ x: number; y: number; direction: Direction }> = [];

    // Mark start cell as path
    cells[1][1].type = 'path';
    cells[1][1].visited = true;

    yield {
      type: 'visit',
      position: { x: 1, y: 1 },
      maze: {
        ...maze,
        cells: cells.map((row) => [...row]),
      },
    };

    // Add walls around start cell
    this.addWalls(walls, 1, 1);

    while (walls.length > 0) {
      const randomIndex = Math.floor(Math.random() * walls.length);
      const wall = walls[randomIndex];
      walls.splice(randomIndex, 1);

      const next = this.getNextPosition(wall.x, wall.y, wall.direction);

      // If next cell is a wall (unvisited), connect it
      if (
        this.isValidCell(next.x, next.y) &&
        cells[next.y][next.x].type === 'wall'
      ) {
        // Mark both cells as path
        cells[wall.y][wall.x].type = 'path';
        cells[wall.y][wall.x].visited = true;
        cells[next.y][next.x].type = 'path';
        cells[next.y][next.x].visited = true;

        // Remove wall between them
        this.removeWall(cells, wall.x, wall.y, wall.direction);

        yield {
          type: 'carve',
          position: { x: wall.x, y: wall.y },
          direction: wall.direction,
          maze: {
            ...maze,
            cells: cells.map((row) => [...row]),
          },
        };

        // Add walls around the new cell
        this.addWalls(walls, next.x, next.y);
      }
    }
  }

  /**
   * Kruskal's algorithm implementation (step by step)
   */
  private *generateKruskalStepByStep(maze: Maze): Generator<GenerationStep> {
    const cells = maze.cells;
    // Create list of all possible walls (edges between cells)
    const walls: Array<{ x: number; y: number; direction: Direction }> = [];

    // Add all possible walls between adjacent cells
    for (let y = 0; y < this.config.height; y++) {
      for (let x = 0; x < this.config.width; x++) {
        // Only consider walls between path cells (odd coordinates)
        if (x % 2 === 1 && y % 2 === 1) {
          const directions: Direction[] = ['north', 'south', 'east', 'west'];
          for (const direction of directions) {
            const next = this.getNextPosition(x, y, direction);
            // Only add walls to adjacent path cells
            if (
              this.isValidCell(next.x, next.y) &&
              next.x % 2 === 1 &&
              next.y % 2 === 1
            ) {
              walls.push({ x, y, direction });
            }
          }
        }
      }
    }

    // Shuffle walls for random selection
    this.shuffleArray(walls);

    // Union-Find data structure for tracking connected components
    const cellToSet: number[] = [];
    const sets: number[][] = [];
    let setCount = 0;

    // Initialize each path cell as its own set
    for (let y = 1; y < this.config.height - 1; y += 2) {
      for (let x = 1; x < this.config.width - 1; x += 2) {
        const cellIndex = y * this.config.width + x;
        cellToSet[cellIndex] = setCount;
        sets[setCount] = [cellIndex];
        setCount++;
      }
    }

    // Process walls in random order
    for (const wall of walls) {
      const currentIndex = wall.y * this.config.width + wall.x;
      const next = this.getNextPosition(wall.x, wall.y, wall.direction);
      const nextIndex = next.y * this.config.width + next.x;

      const currentSet = this.findSet(sets, cellToSet[currentIndex]);
      const nextSet = this.findSet(sets, cellToSet[nextIndex]);

      // If cells are in different sets, connect them
      if (currentSet !== nextSet) {
        // Mark both cells as path
        cells[wall.y][wall.x].type = 'path';
        cells[wall.y][wall.x].visited = true;
        cells[next.y][next.x].type = 'path';
        cells[next.y][next.x].visited = true;

        // Remove wall between them
        this.removeWall(cells, wall.x, wall.y, wall.direction);

        yield {
          type: 'carve',
          position: { x: wall.x, y: wall.y },
          direction: wall.direction,
          maze: {
            ...maze,
            cells: cells.map((row) => [...row]),
          },
        };

        // Union the sets
        this.unionSets(sets, currentSet, nextSet, cellToSet);

        // If all cells are connected, we can stop early
        if (sets[currentSet].length === setCount) {
          break;
        }
      }
    }
  }

  /**
   * Wilson's algorithm implementation (step by step)
   */
  private *generateWilsonStepByStep(maze: Maze): Generator<GenerationStep> {
    const cells = maze.cells;
    // Mark start cell as visited
    cells[1][1].type = 'path';
    cells[1][1].visited = true;

    yield {
      type: 'visit',
      position: { x: 1, y: 1 },
      maze: {
        ...maze,
        cells: cells.map((row) => [...row]),
      },
    };

    const unvisited: CellPosition[] = [];

    // Collect all unvisited cells (only odd coordinates for path cells)
    for (let y = 1; y < this.config.height - 1; y += 2) {
      for (let x = 1; x < this.config.width - 1; x += 2) {
        if (!(x === 1 && y === 1)) {
          unvisited.push({ x, y });
        }
      }
    }

    let iterations = 0;
    const maxIterations = this.config.width * this.config.height * 2; // Prevent infinite loops

    while (unvisited.length > 0 && iterations < maxIterations) {
      iterations++;
      const randomIndex = Math.floor(Math.random() * unvisited.length);
      const start = unvisited[randomIndex];

      // Perform random walk until we hit a visited cell
      const path = this.randomWalkWilson(cells, start);

      // Carve the path and mark cells as visited
      for (let i = 0; i < path.length - 1; i++) {
        const current = path[i];
        const next = path[i + 1];

        cells[current.y][current.x].type = 'path';
        cells[current.y][current.x].visited = true;

        // Determine direction and remove wall
        let direction: Direction;
        if (next.x > current.x) {
          direction = 'east';
        } else if (next.x < current.x) {
          direction = 'west';
        } else if (next.y > current.y) {
          direction = 'south';
        } else {
          direction = 'north';
        }

        this.removeWall(cells, current.x, current.y, direction);

        yield {
          type: 'carve',
          position: { x: current.x, y: current.y },
          direction,
          maze: {
            ...maze,
            cells: cells.map((row) => [...row]),
          },
        };
      }

      // Remove all cells in the path from unvisited
      const initialLength = unvisited.length;
      for (let i = unvisited.length - 1; i >= 0; i--) {
        const cell = unvisited[i];
        if (cells[cell.y][cell.x].type === 'path') {
          unvisited.splice(i, 1);
        }
      }

      // If no cells were removed, break to prevent infinite loop
      if (unvisited.length === initialLength) {
        break;
      }
    }
  }

  /**
   * Find path from start to end using specified algorithm
   *
   * @param maze - Maze to solve
   * @param algorithm - Pathfinding algorithm to use
   * @returns {PathfindingResult} Result of pathfinding
   */
  public findPath(
    maze: Maze,
    algorithm: PathfindingAlgorithm = 'astar'
  ): PathfindingResult {
    switch (algorithm) {
      case 'bfs':
        return this.findPathBFS(maze);
      case 'dfs':
        return this.findPathDFS(maze);
      case 'astar':
        return this.findPathAStar(maze);
      default:
        return this.findPathAStar(maze);
    }
  }

  /**
   * Find path step by step for animation
   *
   * @param maze - Maze to solve
   * @param algorithm - Pathfinding algorithm to use
   * @returns {Generator<PathfindingStep>} Generator yielding pathfinding steps
   */
  public *findPathStepByStep(
    maze: Maze,
    algorithm: PathfindingAlgorithm = 'astar'
  ): Generator<PathfindingStep> {
    switch (algorithm) {
      case 'bfs':
        yield* this.findPathBFSStepByStep(maze);
        break;
      case 'dfs':
        yield* this.findPathDFSStepByStep(maze);
        break;
      case 'astar':
        yield* this.findPathAStarStepByStep(maze);
        break;
      default:
        yield* this.findPathAStarStepByStep(maze);
    }
  }

  /**
   * Breadth-First Search pathfinding
   */
  private findPathBFS(maze: Maze): PathfindingResult {
    const visited = new Set<string>();
    const queue: Array<{ position: CellPosition; path: CellPosition[] }> = [
      { position: maze.start, path: [maze.start] },
    ];
    visited.add(`${maze.start.x},${maze.start.y}`);

    let steps = 0;

    while (queue.length > 0) {
      const { position, path } = queue.shift()!;
      steps++;

      if (position.x === maze.end.x && position.y === maze.end.y) {
        return {
          path,
          visited: Array.from(visited).map((key) => {
            const [x, y] = key.split(',').map(Number);
            return { x, y };
          }),
          found: true,
          algorithm: 'bfs',
          steps,
        };
      }

      const directions: Direction[] = ['north', 'south', 'east', 'west'];
      for (const direction of directions) {
        const next = this.getNextPosition(position.x, position.y, direction);
        const nextKey = `${next.x},${next.y}`;

        if (
          this.isValidCell(next.x, next.y) &&
          !visited.has(nextKey) &&
          this.canMove(maze.cells, position.x, position.y, direction)
        ) {
          visited.add(nextKey);
          queue.push({ position: next, path: [...path, next] });
        }
      }
    }

    return {
      path: [],
      visited: Array.from(visited).map((key) => {
        const [x, y] = key.split(',').map(Number);
        return { x, y };
      }),
      found: false,
      algorithm: 'bfs',
      steps,
    };
  }

  /**
   * Depth-First Search pathfinding
   */
  private findPathDFS(maze: Maze): PathfindingResult {
    const visited = new Set<string>();
    const stack: Array<{ position: CellPosition; path: CellPosition[] }> = [
      { position: maze.start, path: [maze.start] },
    ];
    visited.add(`${maze.start.x},${maze.start.y}`);

    let steps = 0;

    while (stack.length > 0) {
      const { position, path } = stack.pop()!;
      steps++;

      if (position.x === maze.end.x && position.y === maze.end.y) {
        return {
          path,
          visited: Array.from(visited).map((key) => {
            const [x, y] = key.split(',').map(Number);
            return { x, y };
          }),
          found: true,
          algorithm: 'dfs',
          steps,
        };
      }

      const directions: Direction[] = ['north', 'south', 'east', 'west'];
      for (const direction of directions) {
        const next = this.getNextPosition(position.x, position.y, direction);
        const nextKey = `${next.x},${next.y}`;

        if (
          this.isValidCell(next.x, next.y) &&
          !visited.has(nextKey) &&
          this.canMove(maze.cells, position.x, position.y, direction)
        ) {
          visited.add(nextKey);
          stack.push({ position: next, path: [...path, next] });
        }
      }
    }

    return {
      path: [],
      visited: Array.from(visited).map((key) => {
        const [x, y] = key.split(',').map(Number);
        return { x, y };
      }),
      found: false,
      algorithm: 'dfs',
      steps,
    };
  }

  /**
   * A* pathfinding with Manhattan distance heuristic
   */
  private findPathAStar(maze: Maze): PathfindingResult {
    const visited = new Set<string>();
    const openSet: Array<{
      position: CellPosition;
      path: CellPosition[];
      g: number;
      h: number;
      f: number;
    }> = [
      {
        position: maze.start,
        path: [maze.start],
        g: 0,
        h: this.manhattanDistance(maze.start, maze.end),
        f: this.manhattanDistance(maze.start, maze.end),
      },
    ];
    visited.add(`${maze.start.x},${maze.start.y}`);

    let steps = 0;

    while (openSet.length > 0) {
      // Find node with lowest f score
      let currentIndex = 0;
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].f < openSet[currentIndex].f) {
          currentIndex = i;
        }
      }

      const current = openSet.splice(currentIndex, 1)[0];
      steps++;

      if (
        current.position.x === maze.end.x &&
        current.position.y === maze.end.y
      ) {
        return {
          path: current.path,
          visited: Array.from(visited).map((key) => {
            const [x, y] = key.split(',').map(Number);
            return { x, y };
          }),
          found: true,
          algorithm: 'astar',
          steps,
        };
      }

      const directions: Direction[] = ['north', 'south', 'east', 'west'];
      for (const direction of directions) {
        const next = this.getNextPosition(
          current.position.x,
          current.position.y,
          direction
        );
        const nextKey = `${next.x},${next.y}`;

        if (
          this.isValidCell(next.x, next.y) &&
          !visited.has(nextKey) &&
          this.canMove(
            maze.cells,
            current.position.x,
            current.position.y,
            direction
          )
        ) {
          visited.add(nextKey);
          const g = current.g + 1;
          const h = this.manhattanDistance(next, maze.end);
          const f = g + h;

          openSet.push({
            position: next,
            path: [...current.path, next],
            g,
            h,
            f,
          });
        }
      }
    }

    return {
      path: [],
      visited: Array.from(visited).map((key) => {
        const [x, y] = key.split(',').map(Number);
        return { x, y };
      }),
      found: false,
      algorithm: 'astar',
      steps,
    };
  }

  /**
   * Calculate Manhattan distance between two positions
   */
  private manhattanDistance(a: CellPosition, b: CellPosition): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  /**
   * BFS pathfinding step by step
   */
  private *findPathBFSStepByStep(maze: Maze): Generator<PathfindingStep> {
    const visited = new Set<string>();
    const queue: Array<{ position: CellPosition; path: CellPosition[] }> = [
      { position: maze.start, path: [maze.start] },
    ];
    visited.add(`${maze.start.x},${maze.start.y}`);

    while (queue.length > 0) {
      const { position, path } = queue.shift()!;

      yield {
        type: 'visit',
        position,
        path,
        visited: Array.from(visited).map((key) => {
          const [x, y] = key.split(',').map(Number);
          return { x, y };
        }),
        found: false,
      };

      if (position.x === maze.end.x && position.y === maze.end.y) {
        yield {
          type: 'complete',
          position,
          path,
          visited: Array.from(visited).map((key) => {
            const [x, y] = key.split(',').map(Number);
            return { x, y };
          }),
          found: true,
        };
        return;
      }

      const directions: Direction[] = ['north', 'south', 'east', 'west'];
      for (const direction of directions) {
        const next = this.getNextPosition(position.x, position.y, direction);
        const nextKey = `${next.x},${next.y}`;

        if (
          this.isValidCell(next.x, next.y) &&
          !visited.has(nextKey) &&
          this.canMove(maze.cells, position.x, position.y, direction)
        ) {
          visited.add(nextKey);
          queue.push({ position: next, path: [...path, next] });
        }
      }
    }

    yield {
      type: 'complete',
      position: maze.end,
      path: [],
      visited: Array.from(visited).map((key) => {
        const [x, y] = key.split(',').map(Number);
        return { x, y };
      }),
      found: false,
    };
  }

  /**
   * DFS pathfinding step by step
   */
  private *findPathDFSStepByStep(maze: Maze): Generator<PathfindingStep> {
    const visited = new Set<string>();
    const stack: Array<{ position: CellPosition; path: CellPosition[] }> = [
      { position: maze.start, path: [maze.start] },
    ];
    visited.add(`${maze.start.x},${maze.start.y}`);

    while (stack.length > 0) {
      const { position, path } = stack.pop()!;

      yield {
        type: 'visit',
        position,
        path,
        visited: Array.from(visited).map((key) => {
          const [x, y] = key.split(',').map(Number);
          return { x, y };
        }),
        found: false,
      };

      if (position.x === maze.end.x && position.y === maze.end.y) {
        yield {
          type: 'complete',
          position,
          path,
          visited: Array.from(visited).map((key) => {
            const [x, y] = key.split(',').map(Number);
            return { x, y };
          }),
          found: true,
        };
        return;
      }

      const directions: Direction[] = ['north', 'south', 'east', 'west'];
      for (const direction of directions) {
        const next = this.getNextPosition(position.x, position.y, direction);
        const nextKey = `${next.x},${next.y}`;

        if (
          this.isValidCell(next.x, next.y) &&
          !visited.has(nextKey) &&
          this.canMove(maze.cells, position.x, position.y, direction)
        ) {
          visited.add(nextKey);
          stack.push({ position: next, path: [...path, next] });
        }
      }
    }

    yield {
      type: 'complete',
      position: maze.end,
      path: [],
      visited: Array.from(visited).map((key) => {
        const [x, y] = key.split(',').map(Number);
        return { x, y };
      }),
      found: false,
    };
  }

  /**
   * A* pathfinding step by step
   */
  private *findPathAStarStepByStep(maze: Maze): Generator<PathfindingStep> {
    const visited = new Set<string>();
    const openSet: Array<{
      position: CellPosition;
      path: CellPosition[];
      g: number;
      h: number;
      f: number;
    }> = [
      {
        position: maze.start,
        path: [maze.start],
        g: 0,
        h: this.manhattanDistance(maze.start, maze.end),
        f: this.manhattanDistance(maze.start, maze.end),
      },
    ];
    visited.add(`${maze.start.x},${maze.start.y}`);

    while (openSet.length > 0) {
      // Find node with lowest f score
      let currentIndex = 0;
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].f < openSet[currentIndex].f) {
          currentIndex = i;
        }
      }

      const current = openSet.splice(currentIndex, 1)[0];

      yield {
        type: 'visit',
        position: current.position,
        path: current.path,
        visited: Array.from(visited).map((key) => {
          const [x, y] = key.split(',').map(Number);
          return { x, y };
        }),
        found: false,
      };

      if (
        current.position.x === maze.end.x &&
        current.position.y === maze.end.y
      ) {
        yield {
          type: 'complete',
          position: current.position,
          path: current.path,
          visited: Array.from(visited).map((key) => {
            const [x, y] = key.split(',').map(Number);
            return { x, y };
          }),
          found: true,
        };
        return;
      }

      const directions: Direction[] = ['north', 'south', 'east', 'west'];
      for (const direction of directions) {
        const next = this.getNextPosition(
          current.position.x,
          current.position.y,
          direction
        );
        const nextKey = `${next.x},${next.y}`;

        if (
          this.isValidCell(next.x, next.y) &&
          !visited.has(nextKey) &&
          this.canMove(
            maze.cells,
            current.position.x,
            current.position.y,
            direction
          )
        ) {
          visited.add(nextKey);
          const g = current.g + 1;
          const h = this.manhattanDistance(next, maze.end);
          const f = g + h;

          openSet.push({
            position: next,
            path: [...current.path, next],
            g,
            h,
            f,
          });
        }
      }
    }

    yield {
      type: 'complete',
      position: maze.end,
      path: [],
      visited: Array.from(visited).map((key) => {
        const [x, y] = key.split(',').map(Number);
        return { x, y };
      }),
      found: false,
    };
  }

  /**
   * Shuffle array using Fisher-Yates algorithm
   *
   * @param array - Array to shuffle
   * @private
   */
  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}
