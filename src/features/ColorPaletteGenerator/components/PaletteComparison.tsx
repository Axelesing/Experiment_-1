import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { GitCompare, Plus, X, Eye, EyeOff } from 'lucide-react';

import { Button } from '../../../shared/ui';
import type { ColorPalette } from '../../../entities/color/lib';

export interface PaletteComparisonProps {
  currentPalette: ColorPalette;
  paletteHistory: ColorPalette[];
  onSelectPalette: (palette: ColorPalette) => void;
  className?: string;
}

/**
 * Component for comparing multiple color palettes
 */
export const PaletteComparison = observer<PaletteComparisonProps>(
  ({ currentPalette, paletteHistory, className = '' }) => {
    const [selectedPalettes, setSelectedPalettes] = useState<ColorPalette[]>([
      currentPalette,
    ]);
    const [showComparison, setShowComparison] = useState(false);

    const handleAddPalette = (palette: ColorPalette) => {
      if (!selectedPalettes.find((p) => p.id === palette.id)) {
        setSelectedPalettes([...selectedPalettes, palette]);
      }
    };

    const handleRemovePalette = (paletteId: string) => {
      setSelectedPalettes(selectedPalettes.filter((p) => p.id !== paletteId));
    };

    const handleClearAll = () => {
      setSelectedPalettes([]);
    };

    const handleAddCurrent = () => {
      if (
        currentPalette &&
        !selectedPalettes.find((p) => p.id === currentPalette.id)
      ) {
        setSelectedPalettes([...selectedPalettes, currentPalette]);
      }
    };

    // Calculate similarity between two palettes
    const calculateSimilarity = (
      palette1: ColorPalette,
      palette2: ColorPalette
    ): number => {
      let totalSimilarity = 0;
      let comparisons = 0;

      palette1.colors.forEach((color1) => {
        palette2.colors.forEach((color2) => {
          const similarity = calculateColorSimilarity(color1, color2);
          totalSimilarity += similarity;
          comparisons++;
        });
      });

      return comparisons > 0 ? totalSimilarity / comparisons : 0;
    };

    // Calculate similarity between two colors
    const calculateColorSimilarity = (
      color1: string,
      color2: string
    ): number => {
      const rgb1 = hexToRgb(color1);
      const rgb2 = hexToRgb(color2);

      const distance = Math.sqrt(
        Math.pow(rgb1.r - rgb2.r, 2) +
          Math.pow(rgb1.g - rgb2.g, 2) +
          Math.pow(rgb1.b - rgb2.b, 2)
      );

      // Convert distance to similarity percentage (0-100)
      const maxDistance = Math.sqrt(3 * Math.pow(255, 2));
      return Math.max(0, 100 - (distance / maxDistance) * 100);
    };

    // Convert hex to RGB
    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return { r, g, b };
    };

    // Get similarity color based on percentage
    const getSimilarityColor = (similarity: number): string => {
      if (similarity >= 80) return 'text-green-400';
      if (similarity >= 60) return 'text-yellow-400';
      if (similarity >= 40) return 'text-orange-400';
      return 'text-red-400';
    };

    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <GitCompare className="w-5 h-5" />
            Сравнение палитр
          </h3>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowComparison(!showComparison)}
              leftIcon={
                showComparison ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )
              }
            >
              {showComparison ? 'Скрыть' : 'Показать'} сравнение
            </Button>

            {selectedPalettes.length > 0 && (
              <Button variant="secondary" size="sm" onClick={handleClearAll}>
                Очистить все
              </Button>
            )}
          </div>
        </div>

        {/* Selected Palettes */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-white font-medium">
              Выбранные палитры ({selectedPalettes.length})
            </h4>
            {currentPalette &&
              !selectedPalettes.find((p) => p.id === currentPalette.id) && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleAddCurrent}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Добавить текущую
                </Button>
              )}
          </div>

          {selectedPalettes.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              <GitCompare className="w-12 h-12 mx-auto mb-3 text-white/30" />
              <p>Выберите палитры для сравнения</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedPalettes.map((palette) => (
                <div
                  key={palette.id}
                  className="glass rounded-lg p-4 border border-white/20"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-white font-medium text-sm">
                      {palette.name}
                    </h5>
                    <button
                      onClick={() => handleRemovePalette(palette.id)}
                      className="text-white/40 hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex gap-1 mb-3">
                    {palette.colors.map((color, index) => (
                      <div
                        key={index}
                        className="flex-1 h-8 rounded border border-white/20"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>

                  <p className="text-white/60 text-xs">
                    {palette.algorithm} • {palette.colors.length} цветов
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comparison Results */}
        {showComparison && selectedPalettes.length > 1 && (
          <div className="glass rounded-lg p-4 border border-white/20">
            <h4 className="text-white font-medium mb-4">
              Результаты сравнения
            </h4>

            <div className="space-y-4">
              {selectedPalettes.map((palette1, index1) => (
                <div key={palette1.id}>
                  {selectedPalettes.slice(index1 + 1).map((palette2) => {
                    const similarity = calculateSimilarity(palette1, palette2);
                    return (
                      <div
                        key={`${palette1.id}-${palette2.id}`}
                        className="flex items-center justify-between p-3 rounded border border-white/10"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1">
                            {palette1.colors.slice(0, 3).map((color, index) => (
                              <div
                                key={index}
                                className="w-6 h-6 rounded border border-white/20"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                          <span className="text-white/70 text-sm">
                            {palette1.name}
                          </span>
                          <span className="text-white/50">vs</span>
                          <span className="text-white/70 text-sm">
                            {palette2.name}
                          </span>
                          <div className="flex gap-1">
                            {palette2.colors.slice(0, 3).map((color, index) => (
                              <div
                                key={index}
                                className="w-6 h-6 rounded border border-white/20"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>

                        <div
                          className={`font-medium ${getSimilarityColor(similarity)}`}
                        >
                          {similarity.toFixed(1)}% похожи
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Palettes */}
        <div className="space-y-3">
          <h4 className="text-white font-medium">
            Доступные палитры ({paletteHistory.length})
          </h4>

          {paletteHistory.length === 0 ? (
            <div className="text-center py-4 text-white/60">
              <p>Нет доступных палитр для сравнения</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {paletteHistory.slice(0, 6).map((palette) => {
                const isSelected = selectedPalettes.find(
                  (p) => p.id === palette.id
                );
                return (
                  <div
                    key={palette.id}
                    className={`glass rounded-lg p-3 border cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-blue-400 bg-blue-400/10'
                        : 'border-white/20 hover:bg-white/10'
                    }`}
                    onClick={() => {
                      if (isSelected) {
                        handleRemovePalette(palette.id);
                      } else {
                        handleAddPalette(palette);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-white font-medium text-sm">
                        {palette.name}
                      </h5>
                      {isSelected ? (
                        <X className="w-4 h-4 text-blue-400" />
                      ) : (
                        <Plus className="w-4 h-4 text-white/40" />
                      )}
                    </div>

                    <div className="flex gap-1 mb-2">
                      {palette.colors.slice(0, 5).map((color, index) => (
                        <div
                          key={index}
                          className="flex-1 h-6 rounded border border-white/20"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>

                    <p className="text-white/60 text-xs">
                      {palette.algorithm} • {palette.colors.length} цветов
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }
);
