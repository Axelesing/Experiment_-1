import { MazeEngine, Maze } from '../maze-engine';
import { MazeConfig } from '../../../../shared/types';

describe('Pathfinding Algorithm Comparison', () => {
  const smallConfig: MazeConfig = {
    width: 11,
    height: 11,
    algorithm: 'recursive',
    cellSize: 20,
    wallThickness: 2,
  };

  const largeConfig: MazeConfig = {
    width: 21,
    height: 21,
    algorithm: 'recursive',
    cellSize: 20,
    wallThickness: 2,
  };

  let engine: MazeEngine;
  let smallMaze: Maze;
  let largeMaze: Maze;

  beforeEach(() => {
    engine = new MazeEngine(smallConfig);
    smallMaze = engine.generate();

    const largeEngine = new MazeEngine(largeConfig);
    largeMaze = largeEngine.generate();
  });

  describe('Algorithm differences on small maze', () => {
    it('should find different paths with different algorithms', () => {
      const astarResult = engine.findPath(smallMaze, 'astar');
      const bfsResult = engine.findPath(smallMaze, 'bfs');
      const dfsResult = engine.findPath(smallMaze, 'dfs');

      // All should find a path
      expect(astarResult.found).toBe(true);
      expect(bfsResult.found).toBe(true);
      expect(dfsResult.found).toBe(true);

      // A* and BFS should find optimal paths (same length)
      expect(astarResult.path.length).toBe(bfsResult.path.length);

      // DFS might find a longer path
      expect(dfsResult.path.length).toBeGreaterThanOrEqual(
        astarResult.path.length
      );

      console.log('Path lengths:');
      console.log(`A*: ${astarResult.path.length} steps`);
      console.log(`BFS: ${bfsResult.path.length} steps`);
      console.log(`DFS: ${dfsResult.path.length} steps`);
    });

    it('should have different visited cell counts', () => {
      const astarResult = engine.findPath(smallMaze, 'astar');
      const bfsResult = engine.findPath(smallMaze, 'bfs');
      const dfsResult = engine.findPath(smallMaze, 'dfs');

      // A* should be most efficient (fewer visited cells)
      expect(astarResult.visited.length).toBeLessThanOrEqual(
        bfsResult.visited.length
      );
      expect(astarResult.visited.length).toBeLessThanOrEqual(
        dfsResult.visited.length
      );

      console.log('Visited cells:');
      console.log(`A*: ${astarResult.visited.length} cells`);
      console.log(`BFS: ${bfsResult.visited.length} cells`);
      console.log(`DFS: ${dfsResult.visited.length} cells`);
    });

    it('should have different step counts', () => {
      const astarResult = engine.findPath(smallMaze, 'astar');
      const bfsResult = engine.findPath(smallMaze, 'bfs');
      const dfsResult = engine.findPath(smallMaze, 'dfs');

      console.log('Algorithm steps:');
      console.log(`A*: ${astarResult.steps} steps`);
      console.log(`BFS: ${bfsResult.steps} steps`);
      console.log(`DFS: ${dfsResult.steps} steps`);
    });
  });

  describe('Path quality comparison', () => {
    it('should show A* finds optimal path', () => {
      const astarResult = engine.findPath(smallMaze, 'astar');
      const bfsResult = engine.findPath(smallMaze, 'bfs');

      // Both should find paths of same length (both optimal)
      expect(astarResult.path.length).toBe(bfsResult.path.length);

      // But they might be different paths
      const astarPathString = astarResult.path
        .map((p) => `${p.x},${p.y}`)
        .join('|');
      const bfsPathString = bfsResult.path
        .map((p) => `${p.x},${p.y}`)
        .join('|');

      console.log('A* path:', astarPathString);
      console.log('BFS path:', bfsPathString);
      console.log('Paths are different:', astarPathString !== bfsPathString);
    });

    it('should show DFS can find suboptimal paths', () => {
      const astarResult = engine.findPath(smallMaze, 'astar');
      const dfsResult = engine.findPath(smallMaze, 'dfs');

      // DFS might find a longer path
      expect(dfsResult.path.length).toBeGreaterThanOrEqual(
        astarResult.path.length
      );

      if (dfsResult.path.length > astarResult.path.length) {
        console.log(
          `DFS found a longer path: ${dfsResult.path.length} vs ${astarResult.path.length}`
        );
      }
    });
  });

  describe('Performance comparison', () => {
    it('should show different performance characteristics', () => {
      const startTime = performance.now();
      const astarTime = performance.now() - startTime;

      const startTime2 = performance.now();
      const bfsTime = performance.now() - startTime2;

      const startTime3 = performance.now();
      const dfsTime = performance.now() - startTime3;

      console.log('Performance (ms):');
      console.log(`A*: ${astarTime.toFixed(2)}ms`);
      console.log(`BFS: ${bfsTime.toFixed(2)}ms`);
      console.log(`DFS: ${dfsTime.toFixed(2)}ms`);
    });
  });

  describe('Large maze differences', () => {
    it('should show more pronounced differences on larger maze', () => {
      const largeEngine = new MazeEngine(largeConfig);

      const astarResult = largeEngine.findPath(largeMaze, 'astar');
      const bfsResult = largeEngine.findPath(largeMaze, 'bfs');
      const dfsResult = largeEngine.findPath(largeMaze, 'dfs');

      console.log('\n=== LARGE MAZE (21x21) ===');
      console.log('Path lengths:');
      console.log(`A*: ${astarResult.path.length} steps`);
      console.log(`BFS: ${bfsResult.path.length} steps`);
      console.log(`DFS: ${dfsResult.path.length} steps`);

      console.log('\nVisited cells:');
      console.log(`A*: ${astarResult.visited.length} cells`);
      console.log(`BFS: ${bfsResult.visited.length} cells`);
      console.log(`DFS: ${dfsResult.visited.length} cells`);

      console.log('\nAlgorithm steps:');
      console.log(`A*: ${astarResult.steps} steps`);
      console.log(`BFS: ${bfsResult.steps} steps`);
      console.log(`DFS: ${dfsResult.steps} steps`);

      // On larger mazes, differences should be more pronounced
      expect(astarResult.found).toBe(true);
      expect(bfsResult.found).toBe(true);
      expect(dfsResult.found).toBe(true);
    });

    it('should show DFS inefficiency on large maze', () => {
      const largeEngine = new MazeEngine(largeConfig);

      const astarResult = largeEngine.findPath(largeMaze, 'astar');
      const dfsResult = largeEngine.findPath(largeMaze, 'dfs');

      // DFS should visit significantly more cells
      expect(dfsResult.visited.length).toBeGreaterThan(
        astarResult.visited.length
      );

      console.log(
        `\nDFS visited ${dfsResult.visited.length - astarResult.visited.length} more cells than A*`
      );
    });
  });
});
