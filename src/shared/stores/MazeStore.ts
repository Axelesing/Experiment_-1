import { makeAutoObservable, runInAction } from 'mobx';
import { MazeConfig, StoreActionResult } from '../types';
import { MazeEngine, Maze } from '../../entities/maze/lib';

/**
 * Maze generation and management store
 *
 * This store handles:
 * - Maze configuration management
 * - Maze generation using different algorithms
 * - History navigation
 * - Error handling
 * - Loading states
 *
 * @class MazeStore
 */
export class MazeStore {
  /** Maze generation engine instance */
  private engine: MazeEngine;

  /** Current maze configuration */
  config: MazeConfig = {
    width: 21,
    height: 21,
    algorithm: 'recursive',
    cellSize: 20,
    wallThickness: 2,
  };

  /** Generated maze data */
  maze: Maze | null = null;

  /** Loading state for maze generation */
  isLoading = false;

  /** Error message for failed operations */
  error: string | null = null;

  /** Generation history for navigation */
  history: Maze[] = [];

  /** Current position in history */
  historyIndex = -1;

  /**
   * Creates a new maze store instance
   *
   * @constructor
   */
  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    this.engine = new MazeEngine(this.config);
  }

  /**
   * Update maze configuration with validation
   *
   * @param configUpdate - Partial configuration to update
   * @returns {StoreActionResult<MazeConfig>} Result with updated config or error
   */
  updateConfig(
    configUpdate: Partial<MazeConfig>
  ): StoreActionResult<MazeConfig> {
    try {
      const newConfig = { ...this.config, ...configUpdate };

      // Validate configuration
      if (newConfig.width < 5 || newConfig.width > 101) {
        return { success: false, error: 'Width must be between 5 and 101' };
      }

      if (newConfig.height < 5 || newConfig.height > 101) {
        return {
          success: false,
          error: 'Height must be between 5 and 101',
        };
      }

      if (newConfig.width % 2 === 0) {
        newConfig.width += 1; // Ensure odd width
      }

      if (newConfig.height % 2 === 0) {
        newConfig.height += 1; // Ensure odd height
      }

      if (newConfig.cellSize < 5 || newConfig.cellSize > 50) {
        return {
          success: false,
          error: 'Cell size must be between 5 and 50',
        };
      }

      if (newConfig.wallThickness < 1 || newConfig.wallThickness > 10) {
        return {
          success: false,
          error: 'Wall thickness must be between 1 and 10',
        };
      }

      runInAction(() => {
        this.config = newConfig;
        this.error = null;
        this.engine = new MazeEngine(newConfig);
      });

      return { success: true, data: newConfig };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      runInAction(() => {
        this.error = errorMessage;
      });
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Generate new maze using current configuration
   *
   * @returns {Promise<StoreActionResult<Maze>>} Result with generated maze or error
   */
  async generateMaze(): Promise<StoreActionResult<Maze>> {
    try {
      runInAction(() => {
        this.isLoading = true;
        this.error = null;
      });

      const maze = this.engine.generate();

      runInAction(() => {
        const newHistory = this.history.slice(0, this.historyIndex + 1);
        newHistory.push(maze);

        this.maze = maze;
        this.isLoading = false;
        this.history = newHistory;
        this.historyIndex = newHistory.length - 1;
        this.error = null;
      });

      return { success: true, data: maze };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to generate maze';
      runInAction(() => {
        this.isLoading = false;
        this.error = errorMessage;
      });
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Clear current maze and reset error state
   */
  clearMaze(): void {
    runInAction(() => {
      this.maze = null;
      this.error = null;
    });
  }

  /**
   * Set error message
   *
   * @param error - Error message to set (null to clear)
   */
  setError(error: string | null): void {
    runInAction(() => {
      this.error = error;
    });
  }

  /**
   * Navigate to previous maze in history
   *
   * @returns {StoreActionResult} Result indicating success or failure
   */
  goToPrevious(): StoreActionResult {
    if (this.historyIndex > 0) {
      const newIndex = this.historyIndex - 1;
      runInAction(() => {
        this.maze = this.history[newIndex];
        this.historyIndex = newIndex;
        this.error = null;
      });
      return { success: true };
    }

    return { success: false, error: 'No previous maze in history' };
  }

  /**
   * Navigate to next maze in history
   *
   * @returns {StoreActionResult} Result indicating success or failure
   */
  goToNext(): StoreActionResult {
    if (this.historyIndex < this.history.length - 1) {
      const newIndex = this.historyIndex + 1;
      runInAction(() => {
        this.maze = this.history[newIndex];
        this.historyIndex = newIndex;
        this.error = null;
      });
      return { success: true };
    }

    return { success: false, error: 'No next maze in history' };
  }

  /**
   * Clear generation history and reset to initial state
   */
  clearHistory(): void {
    runInAction(() => {
      this.history = [];
      this.historyIndex = -1;
      this.maze = null;
      this.error = null;
    });
  }

  /**
   * Reset store to initial state
   * Clears all data and resets configuration to defaults
   */
  reset(): void {
    runInAction(() => {
      this.config = {
        width: 21,
        height: 21,
        algorithm: 'recursive',
        cellSize: 20,
        wallThickness: 2,
      };
      this.maze = null;
      this.isLoading = false;
      this.error = null;
      this.history = [];
      this.historyIndex = -1;
      this.engine = new MazeEngine(this.config);
    });
  }
}

/**
 * Global maze store instance
 * @constant mazeStore
 */
export const mazeStore = new MazeStore();
