import { useState, useCallback, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Card, Button, ErrorBoundary } from '../../shared/ui';
import { mazeStore } from '../../shared/stores';
import { MazeConfig } from '../../shared/types';
import { MazeCanvas } from './components/MazeCanvas';
import { MazeControls } from './components/MazeControls';

/**
 * MazeGenerator component for generating and displaying mazes
 *
 * Features:
 * - Multiple generation algorithms
 * - Interactive controls
 * - History navigation
 * - Error handling
 * - Responsive design
 *
 * @returns {JSX.Element} Rendered maze generator
 */
export const MazeGenerator = observer(() => {
  // Use grouped functionality from store
  const mazeData = mazeStore.mazeData;
  const animation = mazeStore.animation;
  const pathfinding = mazeStore.pathfinding;
  const history = mazeStore.historyData;
  const actions = mazeStore.actions;
  const canvasData = mazeStore.canvasData;

  const [showControls, setShowControls] = useState(false);

  /**
   * Handle maze generation
   */
  const handleGenerateMaze = useCallback(async () => {
    const result = await actions.generateMaze();
    if (!result.success) {
      actions.setError(result.error || 'Failed to generate maze');
    }
  }, [actions]);

  /**
   * Handle animated maze generation
   */
  const handleGenerateAnimated = useCallback(async () => {
    const result = await actions.generateMazeWithAnimation();
    if (!result.success) {
      actions.setError(result.error || 'Failed to generate maze');
    }
  }, [actions]);

  /**
   * Handle maze solving
   */
  const handleSolveMaze = useCallback(async () => {
    const result = await actions.solveMaze();
    if (!result.success) {
      actions.setError(result.error || 'Failed to solve maze');
    }
  }, [actions]);

  /**
   * Handle animated maze solving
   */
  const handleSolveMazeAnimated = useCallback(async () => {
    const result = await actions.solveMazeWithAnimation();
    if (!result.success) {
      actions.setError(result.error || 'Failed to solve maze');
    }
  }, [actions]);

  /**
   * Handle configuration changes
   */
  const handleConfigChange = useCallback(
    (newConfig: Partial<MazeConfig>) => {
      const result = actions.updateConfig(newConfig);
      if (!result.success) {
        actions.setError(result.error || 'Invalid configuration');
      }
    },
    [actions]
  );

  /**
   * Handle navigation to previous maze
   */
  const handlePrevious = useCallback(() => {
    const result = actions.goToPrevious();
    if (!result.success) {
      actions.setError(result.error || 'No previous maze');
    }
  }, [actions]);

  /**
   * Handle navigation to next maze
   */
  const handleNext = useCallback(() => {
    const result = actions.goToNext();
    if (!result.success) {
      actions.setError(result.error || 'No next maze');
    }
  }, [actions]);

  /**
   * Handle clearing current maze
   */
  const handleClear = useCallback(() => {
    actions.clearMaze();
    actions.setError(null);
  }, [actions]);

  /**
   * Handle clearing history
   */
  const handleClearHistory = useCallback(() => {
    actions.clearHistory();
    actions.setError(null);
  }, [actions]);

  // Auto-generate maze on mount
  useEffect(() => {
    if (!mazeData.maze && !mazeData.isLoading) {
      handleGenerateMaze();
    }
  }, [mazeData.maze, mazeData.isLoading, handleGenerateMaze]);

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('MazeGenerator error:', error, errorInfo);
        actions.setError(`Произошла ошибка: ${error.message}`);
      }}
    >
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            Генератор лабиринтов
          </h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowControls(!showControls)}
            className="text-white border-white/20 hover:bg-white/10"
            aria-label={
              showControls ? 'Hide maze settings' : 'Show maze settings'
            }
          >
            {showControls ? 'Скрыть настройки' : 'Показать настройки'}
          </Button>
        </div>

        {mazeData.error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-300 text-sm">{mazeData.error}</p>
          </div>
        )}

        {showControls && (
          <MazeControls
            config={mazeData.config}
            onConfigChange={handleConfigChange}
            onGenerate={handleGenerateMaze}
            onGenerateAnimated={handleGenerateAnimated}
            onClear={handleClear}
            onClearHistory={handleClearHistory}
            isLoading={mazeData.isLoading}
            isAnimating={animation.isAnimating}
            animationSpeed={animation.animationSpeed}
            onSetAnimationSpeed={animation.setAnimationSpeed}
            onStopAnimation={animation.stopAnimation}
            isPathfinding={pathfinding.isPathfinding}
            pathfindingAlgorithm={pathfinding.pathfindingAlgorithm}
            onSetPathfindingAlgorithm={pathfinding.setPathfindingAlgorithm}
            onSolveMaze={handleSolveMaze}
            onSolveMazeAnimated={handleSolveMazeAnimated}
            onStopPathfinding={pathfinding.stopPathfinding}
            onClearPathfinding={pathfinding.clearPathfinding}
            hasHistory={history.hasHistory}
            canGoPrevious={history.canGoPrevious}
            canGoNext={history.canGoNext}
            onPrevious={handlePrevious}
            onNext={handleNext}
          />
        )}

        <div className="mt-6">
          {canvasData.maze ? (
            <div className="maze-container" style={{ touchAction: 'none' }}>
              <MazeCanvas
                maze={canvasData.maze}
                config={canvasData.config}
                currentStep={canvasData.currentStep}
                isAnimating={canvasData.isAnimating}
                currentPathfindingStep={canvasData.currentPathfindingStep}
                isPathfinding={canvasData.isPathfinding}
                pathfindingResult={canvasData.pathfindingResult}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-96 bg-gray-800/50 rounded-lg border border-gray-700/50">
              {mazeData.isLoading ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                  <p className="text-white/70">Генерация лабиринта...</p>
                </div>
              ) : (
                <p className="text-white/70">
                  Нажмите &quot;Сгенерировать&quot; для создания лабиринта
                </p>
              )}
            </div>
          )}
        </div>

        {canvasData.maze && (
          <div className="mt-4 flex items-center justify-between text-sm text-white/60">
            <div>
              Размер: {canvasData.maze.width} × {canvasData.maze.height} |
              Алгоритм: {canvasData.config.algorithm} | История:{' '}
              {history.history.length} лабиринтов
              {pathfinding.pathfindingResult && (
                <span className="ml-4">
                  | Решение:{' '}
                  {pathfinding.pathfindingResult.found
                    ? `${pathfinding.pathfindingResult.path.length} шагов (${pathfinding.pathfindingResult.algorithm})`
                    : 'Не найдено'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevious}
                disabled={!history.canGoPrevious}
                className="text-white/60 hover:text-white disabled:opacity-50"
                aria-label="Go to previous maze"
              >
                ← Предыдущий
              </Button>
              <span className="text-white/40">|</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNext}
                disabled={!history.canGoNext}
                className="text-white/60 hover:text-white disabled:opacity-50"
                aria-label="Go to next maze"
              >
                Следующий →
              </Button>
            </div>
          </div>
        )}
      </Card>
    </ErrorBoundary>
  );
});
