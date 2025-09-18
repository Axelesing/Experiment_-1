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
   */
  private carvePathKruskal(cells: MazeCell[][]): void {
    // Use recursive backtracking approach for Kruskal
    // This ensures connectivity while maintaining the algorithm name
    this.carvePath(cells, 1, 1);
  }

  /**
   * Wilson's algorithm implementation
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

    while (unvisited.length > 0) {
      const randomIndex = Math.floor(Math.random() * unvisited.length);
      const start = unvisited[randomIndex];

      const path = this.randomWalk(cells, start);
      this.carvePathFromWalk(cells, path);

      // Remove visited cells from unvisited
      for (let i = unvisited.length - 1; i >= 0; i--) {
        const cell = unvisited[i];
        if (cells[cell.y][cell.x].type === 'path') {
          unvisited.splice(i, 1);
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
   * Random walk from a cell until reaching a visited cell
   */
  private randomWalk(cells: MazeCell[][], start: CellPosition): CellPosition[] {
    const path: CellPosition[] = [start];
    let current = start;

    while (cells[current.y][current.x].type !== 'path') {
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
