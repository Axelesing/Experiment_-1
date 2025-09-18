import { MazeStore } from '../MazeStore';
import { MazeEngine } from '../../../entities/maze/lib';

// Mock the maze engine
jest.mock('../../../entities/maze/lib', () => ({
  MazeEngine: jest.fn(),
}));

describe('MazeStore', () => {
  let store: MazeStore;
  let mockEngine: {
    generate: jest.Mock;
    hasValidPath: jest.Mock;
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock engine instance
    mockEngine = {
      generate: jest.fn(),
      hasValidPath: jest.fn(),
    };

    // Setup default mock return values
    mockEngine.generate.mockReturnValue({
      cells: Array(11)
        .fill(null)
        .map(() =>
          Array(11)
            .fill(null)
            .map(() => ({
              type: 'path',
              visited: true,
              walls: { north: false, south: false, east: false, west: false },
            }))
        ),
      width: 11,
      height: 11,
      start: { x: 1, y: 1 },
      end: { x: 9, y: 9 },
    });

    mockEngine.hasValidPath.mockReturnValue(true);

    // Mock the constructor to return our mock engine
    (MazeEngine as jest.MockedClass<typeof MazeEngine>).mockImplementation(
      () => mockEngine as unknown as MazeEngine
    );

    // Create new store instance for each test
    store = new MazeStore();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      expect(store.config).toEqual({
        width: 21,
        height: 21,
        algorithm: 'recursive',
        cellSize: 20,
        wallThickness: 2,
      });
      expect(store.maze).toBeNull();
      expect(store.isLoading).toBe(false);
      expect(store.error).toBeNull();
      expect(store.history).toEqual([]);
      expect(store.historyIndex).toBe(-1);
    });
  });

  describe('updateConfig', () => {
    it('should update configuration successfully', () => {
      const updateResult = store.updateConfig({
        width: 15,
        height: 15,
      });

      expect(updateResult.success).toBe(true);
      expect(store.config.width).toBe(15);
      expect(store.config.height).toBe(15);
      expect(store.error).toBeNull();
    });

    it('should validate width constraints', () => {
      const updateResult = store.updateConfig({ width: 3 });
      expect(updateResult.success).toBe(false);
      expect(updateResult.error).toBe('Width must be between 5 and 101');

      const updateResult2 = store.updateConfig({ width: 103 });
      expect(updateResult2.success).toBe(false);
      expect(updateResult2.error).toBe('Width must be between 5 and 101');
    });

    it('should validate height constraints', () => {
      const updateResult = store.updateConfig({ height: 3 });
      expect(updateResult.success).toBe(false);
      expect(updateResult.error).toBe('Height must be between 5 and 101');

      const updateResult2 = store.updateConfig({ height: 103 });
      expect(updateResult2.success).toBe(false);
      expect(updateResult2.error).toBe('Height must be between 5 and 101');
    });

    it('should ensure odd dimensions', () => {
      store.updateConfig({ width: 10, height: 10 });

      expect(store.config.width).toBe(11); // Made odd
      expect(store.config.height).toBe(11); // Made odd
    });

    it('should validate cell size constraints', () => {
      const updateResult = store.updateConfig({ cellSize: 3 });
      expect(updateResult.success).toBe(false);
      expect(updateResult.error).toBe('Cell size must be between 5 and 50');

      const updateResult2 = store.updateConfig({ cellSize: 55 });
      expect(updateResult2.success).toBe(false);
      expect(updateResult2.error).toBe('Cell size must be between 5 and 50');
    });

    it('should validate wall thickness constraints', () => {
      const updateResult = store.updateConfig({ wallThickness: 0 });
      expect(updateResult.success).toBe(false);
      expect(updateResult.error).toBe(
        'Wall thickness must be between 1 and 10'
      );

      const updateResult2 = store.updateConfig({ wallThickness: 15 });
      expect(updateResult2.success).toBe(false);
      expect(updateResult2.error).toBe(
        'Wall thickness must be between 1 and 10'
      );
    });
  });

  describe('generateMaze', () => {
    it('should generate maze successfully', async () => {
      const generateResult = await store.generateMaze();

      expect(generateResult.success).toBe(true);
      expect(generateResult.data).toBeDefined();
      expect(store.maze).toBeDefined();
      expect(store.isLoading).toBe(false);
      expect(store.error).toBeNull();
      expect(store.history).toHaveLength(1);
      expect(store.historyIndex).toBe(0);
    });

    it('should handle generation errors', async () => {
      // Mock engine to throw error
      mockEngine.generate.mockImplementationOnce(() => {
        throw new Error('Generation failed');
      });

      const generateResult = await store.generateMaze();
      expect(generateResult.success).toBe(false);
      expect(generateResult.error).toBe('Generation failed');
      expect(store.isLoading).toBe(false);
      expect(store.error).toBe('Generation failed');
    });
  });

  describe('history navigation', () => {
    beforeEach(async () => {
      // Generate multiple mazes for history testing
      await store.generateMaze();
      await store.generateMaze();
      await store.generateMaze();
    });

    it('should navigate to previous maze', () => {
      // We should be at index 2 (third maze), so going back should work
      const navigateResult = store.goToPrevious();
      expect(navigateResult.success).toBe(true);
      expect(store.historyIndex).toBe(1);
      expect(store.maze).toBeDefined();
    });

    it('should navigate to next maze', () => {
      // First go back
      store.goToPrevious();

      // Then go forward
      const navigateResult = store.goToNext();
      expect(navigateResult.success).toBe(true);
      expect(store.historyIndex).toBe(2);
    });

    it('should handle navigation boundaries', () => {
      // Go to the beginning
      store.goToPrevious();
      store.goToPrevious();

      // Try to go before first maze
      const navigateResult = store.goToPrevious();
      expect(navigateResult.success).toBe(false);
      expect(navigateResult.error).toBe('No previous maze in history');

      // Go to the end
      store.goToNext();
      store.goToNext();

      // Try to go after last maze
      const navigateResult2 = store.goToNext();
      expect(navigateResult2.success).toBe(false);
      expect(navigateResult2.error).toBe('No next maze in history');
    });
  });

  describe('clear operations', () => {
    it('should clear current maze', async () => {
      // First generate a maze
      await store.generateMaze();

      // Then clear it
      store.clearMaze();

      expect(store.maze).toBeNull();
      expect(store.error).toBeNull();
    });

    it('should clear history', async () => {
      // Generate some mazes
      await store.generateMaze();
      await store.generateMaze();

      // Clear history
      store.clearHistory();

      expect(store.history).toEqual([]);
      expect(store.historyIndex).toBe(-1);
      expect(store.maze).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should set and clear errors', () => {
      store.setError('Test error');
      expect(store.error).toBe('Test error');

      store.setError(null);
      expect(store.error).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset store to initial state', () => {
      // Modify state
      store.updateConfig({ width: 15 });
      store.setError('Test error');

      // Reset
      store.reset();

      expect(store.config.width).toBe(21); // Back to default
      expect(store.error).toBeNull();
      expect(store.maze).toBeNull();
      expect(store.history).toEqual([]);
    });
  });

  describe('edge cases and additional functionality', () => {
    it('should handle algorithm changes', () => {
      const updateResult = store.updateConfig({ algorithm: 'prim' });
      expect(updateResult.success).toBe(true);
      expect(store.config.algorithm).toBe('prim');
    });

    it('should handle cell size and wall thickness updates', () => {
      const updateResult = store.updateConfig({
        cellSize: 25,
        wallThickness: 3,
      });
      expect(updateResult.success).toBe(true);
      expect(store.config.cellSize).toBe(25);
      expect(store.config.wallThickness).toBe(3);
    });

    it('should maintain history when generating new mazes', async () => {
      // Generate first maze
      await store.generateMaze();
      expect(store.history).toHaveLength(1);
      expect(store.historyIndex).toBe(0);

      // Generate second maze
      await store.generateMaze();
      expect(store.history).toHaveLength(2);
      expect(store.historyIndex).toBe(1);

      // Navigate back
      store.goToPrevious();
      expect(store.historyIndex).toBe(0);

      // Generate new maze (should truncate history)
      await store.generateMaze();
      expect(store.history).toHaveLength(2); // Previous + new
      expect(store.historyIndex).toBe(1);
    });

    it('should handle multiple configuration updates', () => {
      store.updateConfig({ width: 15 });
      store.updateConfig({ height: 17 });
      store.updateConfig({ algorithm: 'prim' });

      expect(store.config.width).toBe(15);
      expect(store.config.height).toBe(17);
      expect(store.config.algorithm).toBe('prim');
    });

    it('should handle concurrent operations gracefully', async () => {
      // Start multiple generation operations
      const promises = [
        store.generateMaze(),
        store.generateMaze(),
        store.generateMaze(),
      ];

      const results = await Promise.all(promises);

      // All should succeed
      results.forEach((result) => {
        expect(result.success).toBe(true);
      });

      // History should contain all mazes
      expect(store.history).toHaveLength(3);
    });

    it('should handle invalid algorithm gracefully', () => {
      const updateResult = store.updateConfig({
        algorithm: 'invalid' as unknown as 'recursive',
      });
      expect(updateResult.success).toBe(true);
      // Should fall back to default algorithm
    });

    it('should preserve maze when updating config', async () => {
      // Generate a maze
      await store.generateMaze();
      const originalMaze = store.maze;

      // Update config
      store.updateConfig({ cellSize: 30 });

      // Maze should still be there
      expect(store.maze).toBe(originalMaze);
    });

    it('should handle empty history navigation', () => {
      // Try to navigate with empty history
      const prevResult = store.goToPrevious();
      const nextResult = store.goToNext();

      expect(prevResult.success).toBe(false);
      expect(nextResult.success).toBe(false);
      expect(prevResult.error).toBe('No previous maze in history');
      expect(nextResult.error).toBe('No next maze in history');
    });
  });
});
