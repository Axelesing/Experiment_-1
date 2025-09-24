import { makeAutoObservable, runInAction } from 'mobx';
import { MazeConfig, StoreActionResult } from '../types';
import {
  MazeEngine,
  Maze,
  GenerationStep,
  PathfindingAlgorithm,
  PathfindingResult,
  PathfindingStep,
} from '../../entities/maze/lib';

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

  /** Animation state */
  isAnimating = false;

  /** Animation speed (steps per second) */
  animationSpeed = 10;

  /** Current generation step */
  currentStep: GenerationStep | null = null;

  /** Pathfinding state */
  isPathfinding = false;

  /** Current pathfinding step */
  currentPathfindingStep: PathfindingStep | null = null;

  /** Current pathfinding result */
  pathfindingResult: PathfindingResult | null = null;

  /** Selected pathfinding algorithm */
  pathfindingAlgorithm: PathfindingAlgorithm = 'astar';

  /** Abort controller for canceling animations */
  private animationAbortController: AbortController | null = null;

  /** Abort controller for canceling pathfinding */
  private pathfindingAbortController: AbortController | null = null;

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
    // Cancel any running animations
    if (this.animationAbortController) {
      this.animationAbortController.abort();
    }
    if (this.pathfindingAbortController) {
      this.pathfindingAbortController.abort();
    }

    try {
      runInAction(() => {
        this.isLoading = true;
        this.isAnimating = false;
        this.isPathfinding = false;
        this.currentStep = null;
        this.currentPathfindingStep = null;
        this.animationAbortController = null;
        this.pathfindingAbortController = null;
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
    // Cancel any running animations
    if (this.animationAbortController) {
      this.animationAbortController.abort();
    }
    if (this.pathfindingAbortController) {
      this.pathfindingAbortController.abort();
    }

    runInAction(() => {
      this.maze = null;
      this.isAnimating = false;
      this.isPathfinding = false;
      this.currentStep = null;
      this.currentPathfindingStep = null;
      this.pathfindingResult = null;
      this.animationAbortController = null;
      this.pathfindingAbortController = null;
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
      // Cancel any running animations
      if (this.animationAbortController) {
        this.animationAbortController.abort();
      }
      if (this.pathfindingAbortController) {
        this.pathfindingAbortController.abort();
      }

      const newIndex = this.historyIndex - 1;
      runInAction(() => {
        this.maze = this.history[newIndex];
        this.historyIndex = newIndex;
        this.isAnimating = false;
        this.isPathfinding = false;
        this.currentStep = null;
        this.currentPathfindingStep = null;
        this.pathfindingResult = null;
        this.animationAbortController = null;
        this.pathfindingAbortController = null;
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
      // Cancel any running animations
      if (this.animationAbortController) {
        this.animationAbortController.abort();
      }
      if (this.pathfindingAbortController) {
        this.pathfindingAbortController.abort();
      }

      const newIndex = this.historyIndex + 1;
      runInAction(() => {
        this.maze = this.history[newIndex];
        this.historyIndex = newIndex;
        this.isAnimating = false;
        this.isPathfinding = false;
        this.currentStep = null;
        this.currentPathfindingStep = null;
        this.pathfindingResult = null;
        this.animationAbortController = null;
        this.pathfindingAbortController = null;
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
    // Cancel any running animations
    if (this.animationAbortController) {
      this.animationAbortController.abort();
    }
    if (this.pathfindingAbortController) {
      this.pathfindingAbortController.abort();
    }

    runInAction(() => {
      this.history = [];
      this.historyIndex = -1;
      this.maze = null;
      this.isAnimating = false;
      this.isPathfinding = false;
      this.currentStep = null;
      this.currentPathfindingStep = null;
      this.pathfindingResult = null;
      this.animationAbortController = null;
      this.pathfindingAbortController = null;
      this.error = null;
    });
  }

  /**
   * Generate maze with animation
   *
   * @returns {Promise<StoreActionResult<Maze>>} Result with generated maze or error
   */
  async generateMazeWithAnimation(): Promise<StoreActionResult<Maze>> {
    // Cancel any existing animation
    if (this.animationAbortController) {
      this.animationAbortController.abort();
    }

    // Create new abort controller
    this.animationAbortController = new AbortController();
    const { signal } = this.animationAbortController;

    try {
      runInAction(() => {
        this.isLoading = true;
        this.isAnimating = true;
        this.isPathfinding = false;
        this.currentPathfindingStep = null;
        this.pathfindingAbortController = null;
        this.error = null;
      });

      const generator = this.engine.generateStepByStep();
      let finalMaze: Maze | null = null;

      for (const step of generator) {
        // Check if animation was cancelled
        if (signal.aborted) {
          throw new Error('Animation cancelled');
        }

        runInAction(() => {
          this.currentStep = step;
          this.maze = step.maze;
        });

        // Wait for animation frame with cancellation support
        await new Promise((resolve, reject) => {
          const timeoutId = setTimeout(resolve, 1000 / this.animationSpeed);

          // Listen for abort signal
          signal.addEventListener('abort', () => {
            clearTimeout(timeoutId);
            reject(new Error('Animation cancelled'));
          });
        });

        if (step.type === 'complete') {
          finalMaze = step.maze;
        }
      }

      runInAction(() => {
        if (finalMaze) {
          const newHistory = this.history.slice(0, this.historyIndex + 1);
          newHistory.push(finalMaze);

          this.maze = finalMaze;
          this.history = newHistory;
          this.historyIndex = newHistory.length - 1;
        }
        this.isLoading = false;
        this.isAnimating = false;
        this.currentStep = null;
        this.animationAbortController = null;
        this.error = null;
      });

      return { success: true, data: finalMaze! };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to generate maze';
      runInAction(() => {
        this.isLoading = false;
        this.isAnimating = false;
        this.currentStep = null;
        this.animationAbortController = null;
        this.error = errorMessage;
      });
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Set animation speed
   *
   * @param speed - Animation speed in steps per second
   */
  setAnimationSpeed(speed: number): void {
    runInAction(() => {
      this.animationSpeed = Math.max(1, Math.min(100, speed));
    });
  }

  /**
   * Stop animation
   */
  stopAnimation(): void {
    if (this.animationAbortController) {
      this.animationAbortController.abort();
    }

    runInAction(() => {
      this.isAnimating = false;
      this.isLoading = false;
      this.currentStep = null;
      this.animationAbortController = null;
    });
  }

  /**
   * Solve maze using specified algorithm
   *
   * @param algorithm - Pathfinding algorithm to use
   * @returns {Promise<StoreActionResult<PathfindingResult>>} Result of pathfinding
   */
  async solveMaze(
    algorithm: PathfindingAlgorithm = this.pathfindingAlgorithm
  ): Promise<StoreActionResult<PathfindingResult>> {
    if (!this.maze) {
      return { success: false, error: 'No maze to solve' };
    }

    // Cancel any running animations
    if (this.animationAbortController) {
      this.animationAbortController.abort();
    }
    if (this.pathfindingAbortController) {
      this.pathfindingAbortController.abort();
    }

    try {
      runInAction(() => {
        this.isPathfinding = true;
        this.isAnimating = false;
        this.currentStep = null;
        this.currentPathfindingStep = null;
        this.animationAbortController = null;
        this.pathfindingAbortController = null;
        this.error = null;
      });

      const result = this.engine.findPath(this.maze, algorithm);

      runInAction(() => {
        this.pathfindingResult = result;
        this.isPathfinding = false;
        this.error = null;
      });

      return { success: true, data: result };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to solve maze';
      runInAction(() => {
        this.isPathfinding = false;
        this.error = errorMessage;
      });
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Solve maze with animation
   *
   * @param algorithm - Pathfinding algorithm to use
   * @returns {Promise<StoreActionResult<PathfindingResult>>} Result of pathfinding
   */
  async solveMazeWithAnimation(
    algorithm: PathfindingAlgorithm = this.pathfindingAlgorithm
  ): Promise<StoreActionResult<PathfindingResult>> {
    if (!this.maze) {
      return { success: false, error: 'No maze to solve' };
    }

    // Cancel any existing pathfinding animation
    if (this.pathfindingAbortController) {
      this.pathfindingAbortController.abort();
    }

    // Create new abort controller
    this.pathfindingAbortController = new AbortController();
    const { signal } = this.pathfindingAbortController;

    try {
      runInAction(() => {
        this.isPathfinding = true;
        this.isAnimating = false;
        this.currentStep = null;
        this.animationAbortController = null;
        this.error = null;
      });

      const generator = this.engine.findPathStepByStep(this.maze, algorithm);
      let finalResult: PathfindingResult | null = null;

      for (const step of generator) {
        // Check if pathfinding was cancelled
        if (signal.aborted) {
          throw new Error('Pathfinding cancelled');
        }

        runInAction(() => {
          this.currentPathfindingStep = step;
        });

        // Wait for animation frame with cancellation support
        await new Promise((resolve, reject) => {
          const timeoutId = setTimeout(resolve, 1000 / this.animationSpeed);

          // Listen for abort signal
          signal.addEventListener('abort', () => {
            clearTimeout(timeoutId);
            reject(new Error('Pathfinding cancelled'));
          });
        });

        if (step.type === 'complete') {
          finalResult = {
            path: step.path,
            visited: step.visited,
            found: step.found,
            algorithm,
            steps: step.visited.length,
          };
        }
      }

      runInAction(() => {
        this.pathfindingResult = finalResult;
        this.isPathfinding = false;
        this.currentPathfindingStep = null;
        this.pathfindingAbortController = null;
        this.error = null;
      });

      return { success: true, data: finalResult! };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to solve maze';
      runInAction(() => {
        this.isPathfinding = false;
        this.currentPathfindingStep = null;
        this.pathfindingAbortController = null;
        this.error = errorMessage;
      });
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Set pathfinding algorithm
   *
   * @param algorithm - Pathfinding algorithm to use
   */
  setPathfindingAlgorithm(algorithm: PathfindingAlgorithm): void {
    runInAction(() => {
      this.pathfindingAlgorithm = algorithm;
    });
  }

  /**
   * Clear pathfinding result
   */
  clearPathfinding(): void {
    runInAction(() => {
      this.pathfindingResult = null;
      this.currentPathfindingStep = null;
      this.isPathfinding = false;
    });
  }

  /**
   * Stop pathfinding
   */
  stopPathfinding(): void {
    if (this.pathfindingAbortController) {
      this.pathfindingAbortController.abort();
    }

    runInAction(() => {
      this.isPathfinding = false;
      this.currentPathfindingStep = null;
      this.pathfindingAbortController = null;
    });
  }

  /**
   * Reset store to initial state
   * Clears all data and resets configuration to defaults
   */
  reset(): void {
    // Cancel any running animations
    if (this.animationAbortController) {
      this.animationAbortController.abort();
    }
    if (this.pathfindingAbortController) {
      this.pathfindingAbortController.abort();
    }

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
      this.isAnimating = false;
      this.currentStep = null;
      this.isPathfinding = false;
      this.currentPathfindingStep = null;
      this.pathfindingResult = null;
      this.pathfindingAlgorithm = 'astar';
      this.animationAbortController = null;
      this.pathfindingAbortController = null;
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
