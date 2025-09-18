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
  const {
    config,
    maze,
    isLoading,
    error,
    history,
    historyIndex,
    updateConfig,
    generateMaze,
    clearMaze,
    setError,
    goToPrevious,
    goToNext,
    clearHistory,
  } = mazeStore;

  const [showControls, setShowControls] = useState(false);

  /**
   * Handle maze generation
   */
  const handleGenerateMaze = useCallback(async () => {
    const result = await generateMaze();
    if (!result.success) {
      setError(result.error || 'Failed to generate maze');
    }
  }, [generateMaze, setError]);

  /**
   * Handle configuration changes
   */
  const handleConfigChange = useCallback(
    (newConfig: Partial<MazeConfig>) => {
      const result = updateConfig(newConfig);
      if (!result.success) {
        setError(result.error || 'Invalid configuration');
      }
    },
    [updateConfig, setError]
  );

  /**
   * Handle navigation to previous maze
   */
  const handlePrevious = useCallback(() => {
    const result = goToPrevious();
    if (!result.success) {
      setError(result.error || 'No previous maze');
    }
  }, [goToPrevious, setError]);

  /**
   * Handle navigation to next maze
   */
  const handleNext = useCallback(() => {
    const result = goToNext();
    if (!result.success) {
      setError(result.error || 'No next maze');
    }
  }, [goToNext, setError]);

  /**
   * Handle clearing current maze
   */
  const handleClear = useCallback(() => {
    clearMaze();
    setError(null);
  }, [clearMaze, setError]);

  /**
   * Handle clearing history
   */
  const handleClearHistory = useCallback(() => {
    clearHistory();
    setError(null);
  }, [clearHistory, setError]);

  // Auto-generate maze on mount
  useEffect(() => {
    if (!maze && !isLoading) {
      handleGenerateMaze();
    }
  }, [maze, isLoading, handleGenerateMaze]);

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('MazeGenerator error:', error, errorInfo);
        setError(`Произошла ошибка: ${error.message}`);
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

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {showControls && (
          <MazeControls
            config={config}
            onConfigChange={handleConfigChange}
            onGenerate={handleGenerateMaze}
            onClear={handleClear}
            onClearHistory={handleClearHistory}
            isLoading={isLoading}
            hasHistory={history.length > 0}
            canGoPrevious={historyIndex > 0}
            canGoNext={historyIndex < history.length - 1}
            onPrevious={handlePrevious}
            onNext={handleNext}
          />
        )}

        <div className="mt-6">
          {maze ? (
            <MazeCanvas maze={maze} config={config} />
          ) : (
            <div className="flex items-center justify-center h-96 bg-gray-800/50 rounded-lg border border-gray-700/50">
              {isLoading ? (
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

        {maze && (
          <div className="mt-4 flex items-center justify-between text-sm text-white/60">
            <div>
              Размер: {maze.width} × {maze.height} | Алгоритм:{' '}
              {config.algorithm} | История: {history.length} лабиринтов
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevious}
                disabled={historyIndex <= 0}
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
                disabled={historyIndex >= history.length - 1}
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
