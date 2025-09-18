import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Palette, Search, Star } from 'lucide-react';

import { Button } from '../../../shared/ui';
import {
  paletteTemplates,
  getTemplatesByCategory,
  searchTemplates,
  type PaletteTemplate,
} from '../../../entities/color/lib/palette-templates';

export interface PaletteTemplatesProps {
  onSelectTemplate: (template: PaletteTemplate) => void;
  className?: string;
}

/**
 * Component for selecting from predefined color palette templates
 */
export const PaletteTemplates = observer<PaletteTemplatesProps>(
  ({ onSelectTemplate, className = '' }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<
      PaletteTemplate['category'] | 'all'
    >('all');
    const [showFavorites, setShowFavorites] = useState(false);

    const categories: Array<{
      value: PaletteTemplate['category'] | 'all';
      label: string;
    }> = [
      { value: 'all', label: 'Все' },
      { value: 'material', label: 'Material Design' },
      { value: 'flat', label: 'Flat Design' },
      { value: 'gradient', label: 'Градиенты' },
      { value: 'monochrome', label: 'Монохром' },
      { value: 'vibrant', label: 'Яркие' },
      { value: 'pastel', label: 'Пастель' },
    ];

    // Filter templates based on search and category
    const filteredTemplates = React.useMemo(() => {
      let templates = paletteTemplates;

      // Filter by category
      if (selectedCategory !== 'all') {
        templates = getTemplatesByCategory(selectedCategory);
      }

      // Filter by search query
      if (searchQuery.trim()) {
        templates = searchTemplates(searchQuery);
      }

      // Filter by favorites (if implemented)
      if (showFavorites) {
        // This would need to be implemented with a favorites system
        // templates = templates.filter(template => isFavorite(template.id));
      }

      return templates;
    }, [searchQuery, selectedCategory, showFavorites]);

    const handleTemplateSelect = (template: PaletteTemplate) => {
      onSelectTemplate(template);
    };

    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Готовые шаблоны
          </h3>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
            <input
              type="text"
              placeholder="Поиск шаблонов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={
                  selectedCategory === category.value ? 'primary' : 'secondary'
                }
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
              >
                {category.label}
              </Button>
            ))}
          </div>

          {/* Favorites Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={showFavorites ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setShowFavorites(!showFavorites)}
              leftIcon={<Star className="w-4 h-4" />}
            >
              Избранные
            </Button>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="glass rounded-lg p-4 border border-white/20 cursor-pointer hover:bg-white/10 transition-colors group"
              onClick={() => handleTemplateSelect(template)}
            >
              {/* Template Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-white font-medium text-sm group-hover:text-blue-400 transition-colors">
                    {template.name}
                  </h4>
                  <p className="text-white/60 text-xs mt-1">
                    {template.description}
                  </p>
                </div>
                <button
                  className="text-white/40 hover:text-yellow-400 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle favorite toggle
                  }}
                >
                  <Star className="w-4 h-4" />
                </button>
              </div>

              {/* Color Swatches */}
              <div className="flex gap-1 mb-3">
                {template.colors.map((color, index) => (
                  <div
                    key={index}
                    className="flex-1 h-8 rounded border border-white/20"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {template.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-white/10 text-white/60 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
                {template.tags.length > 3 && (
                  <span className="px-2 py-1 bg-white/10 text-white/60 text-xs rounded">
                    +{template.tags.length - 3}
                  </span>
                )}
              </div>

              {/* Use Template Button */}
              <Button
                variant="secondary"
                size="sm"
                className="w-full mt-3 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  handleTemplateSelect(template);
                }}
              >
                Использовать
              </Button>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-8">
            <Palette className="w-12 h-12 text-white/30 mx-auto mb-3" />
            <p className="text-white/60">
              {searchQuery.trim()
                ? `Не найдено шаблонов по запросу "${searchQuery}"`
                : 'Нет шаблонов в выбранной категории'}
            </p>
          </div>
        )}

        {/* Template Count */}
        <div className="text-center text-white/50 text-sm">
          Показано {filteredTemplates.length} из {paletteTemplates.length}{' '}
          шаблонов
        </div>
      </div>
    );
  }
);
