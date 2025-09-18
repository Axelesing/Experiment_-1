import { memo, useCallback } from 'react';
import { Button, Slider } from '../../../shared/ui';
import { MazeConfig } from '../../../shared/types';

/**
 * Props for the MazeControls component
 * @interface MazeControlsProps
 */
interface MazeControlsProps {
  /** Current maze configuration */
  config: MazeConfig;
  /** Callback for configuration changes */
  onConfigChange: (config: Partial<MazeConfig>) => void;
  /** Callback for maze generation */
  onGenerate: () => void;
  /** Callback for clearing current maze */
  onClear: () => void;
  /** Callback for clearing history */
  onClearHistory: () => void;
  /** Loading state */
  isLoading: boolean;
  /** Whether history exists */
  hasHistory: boolean;
  /** Whether can go to previous maze */
  canGoPrevious: boolean;
  /** Whether can go to next maze */
  canGoNext: boolean;
  /** Callback for going to previous maze */
  onPrevious: () => void;
  /** Callback for going to next maze */
  onNext: () => void;
}

/**
 * Preset maze sizes for quick selection
 * @constant PRESET_SIZES
 */
const PRESET_SIZES = [
  { label: '11×11', width: 11, height: 11 },
  { label: '21×21', width: 21, height: 21 },
  { label: '31×31', width: 31, height: 31 },
  { label: '41×41', width: 41, height: 41 },
] as const;

/**
 * MazeControls component for configuring maze generation
 *
 * Features:
 * - Algorithm selection
 * - Size configuration
 * - Visual parameters
 * - History navigation
 * - Preset sizes
 *
 * @param props - Component props
 * @returns {JSX.Element} Rendered controls
 */
const MazeControlsComponent = ({
  config,
  onConfigChange,
  onGenerate,
  onClear,
  onClearHistory,
  isLoading,
  hasHistory,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
}: MazeControlsProps) => {
  /**
   * Handle algorithm selection change
   */
  const handleAlgorithmChange = useCallback(
    (algorithm: MazeConfig['algorithm']) => {
      onConfigChange({ algorithm });
    },
    [onConfigChange]
  );

  /**
   * Handle width change
   */
  const handleWidthChange = useCallback(
    (width: number) => {
      onConfigChange({ width });
    },
    [onConfigChange]
  );

  /**
   * Handle height change
   */
  const handleHeightChange = useCallback(
    (height: number) => {
      onConfigChange({ height });
    },
    [onConfigChange]
  );

  /**
   * Handle cell size change
   */
  const handleCellSizeChange = useCallback(
    (cellSize: number) => {
      onConfigChange({ cellSize });
    },
    [onConfigChange]
  );

  /**
   * Handle wall thickness change
   */
  const handleWallThicknessChange = useCallback(
    (wallThickness: number) => {
      onConfigChange({ wallThickness });
    },
    [onConfigChange]
  );

  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Algorithm Selection */}
        <div>
          <label
            htmlFor="algorithm-select"
            className="block text-sm font-medium text-white mb-2"
          >
            Алгоритм генерации
          </label>
          <select
            id="algorithm-select"
            value={config.algorithm}
            onChange={(e) =>
              handleAlgorithmChange(e.target.value as MazeConfig['algorithm'])
            }
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
            aria-label="Select maze generation algorithm"
          >
            <option value="recursive">Рекурсивный возврат</option>
            <option value="prim">Алгоритм Прима</option>
            <option value="kruskal">Алгоритм Краскала</option>
            <option value="wilson">Алгоритм Уилсона</option>
          </select>
        </div>

        {/* Width Control */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Ширина: {config.width}
          </label>
          <Slider
            label="Ширина"
            min={5}
            max={51}
            step={2}
            value={config.width}
            onChange={handleWidthChange}
            disabled={isLoading}
            className="w-full"
          />
        </div>

        {/* Height Control */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Высота: {config.height}
          </label>
          <Slider
            label="Высота"
            min={5}
            max={51}
            step={2}
            value={config.height}
            onChange={handleHeightChange}
            disabled={isLoading}
            className="w-full"
          />
        </div>

        {/* Cell Size Control */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Размер ячейки: {config.cellSize}px
          </label>
          <Slider
            label="Размер ячейки"
            min={5}
            max={50}
            step={1}
            value={config.cellSize}
            onChange={handleCellSizeChange}
            disabled={isLoading}
            className="w-full"
          />
        </div>

        {/* Wall Thickness Control */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Толщина стен: {config.wallThickness}px
          </label>
          <Slider
            label="Толщина стен"
            min={1}
            max={10}
            step={1}
            value={config.wallThickness}
            onChange={handleWallThicknessChange}
            disabled={isLoading}
            className="w-full"
          />
        </div>

        {/* Preset Sizes */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Быстрые размеры
          </label>
          <div className="flex gap-2 flex-wrap">
            {PRESET_SIZES.map(({ label, width, height }) => (
              <Button
                key={label}
                variant="ghost"
                size="sm"
                onClick={() => onConfigChange({ width, height })}
                disabled={isLoading}
                className="text-white border-white/20 hover:bg-white/10"
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          onClick={onGenerate}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLoading ? 'Генерация...' : 'Сгенерировать'}
        </Button>

        <Button
          variant="ghost"
          onClick={onPrevious}
          disabled={!canGoPrevious || isLoading}
          className="text-white border-white/20 hover:bg-white/10"
        >
          ← Предыдущий
        </Button>

        <Button
          variant="ghost"
          onClick={onNext}
          disabled={!canGoNext || isLoading}
          className="text-white border-white/20 hover:bg-white/10"
        >
          Следующий →
        </Button>

        <Button
          variant="ghost"
          onClick={onClear}
          disabled={isLoading}
          className="text-white border-white/20 hover:bg-white/10"
        >
          Очистить
        </Button>

        {hasHistory && (
          <Button
            variant="ghost"
            onClick={onClearHistory}
            disabled={isLoading}
            className="text-white border-white/20 hover:bg-white/10"
          >
            Очистить историю
          </Button>
        )}
      </div>

      {/* Algorithm Descriptions */}
      <div className="mt-4 p-3 bg-gray-700/30 rounded-lg">
        <h4 className="text-sm font-medium text-white mb-2">
          Описание алгоритмов:
        </h4>
        <div className="text-xs text-white/70 space-y-1">
          <p>
            <strong>Рекурсивный возврат:</strong> Классический алгоритм, создает
            лабиринты с длинными коридорами
          </p>
          <p>
            <strong>Алгоритм Прима:</strong> Создает лабиринты с более
            равномерным распределением путей
          </p>
          <p>
            <strong>Алгоритм Краскала:</strong> Генерирует лабиринты с
            множественными путями
          </p>
          <p>
            <strong>Алгоритм Уилсона:</strong> Создает лабиринты с естественным,
            органичным видом
          </p>
        </div>
      </div>
    </div>
  );
};

MazeControlsComponent.displayName = 'MazeControls';

export const MazeControls = memo(MazeControlsComponent);
