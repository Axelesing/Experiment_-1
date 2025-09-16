import {
  Sparkles,
  Shapes,
  Type,
  Palette,
  TreePine,
  Volume2,
  Map,
  AlignLeft,
} from 'lucide-react';

import type { Tab } from '@/shared/types';

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const iconMap = {
  Sparkles,
  Shapes,
  Type,
  Palette,
  TreePine,
  Volume2,
  Map,
  AlignLeft,
};

export const TabNavigation = ({
  tabs,
  activeTab,
  onTabChange,
}: TabNavigationProps) => {
  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
  };

  const handleKeyDown = (event: React.KeyboardEvent, tabId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onTabChange(tabId);
    }
  };

  return (
    <nav
      className="w-full max-w-6xl mx-auto px-4 py-6"
      role="tablist"
      aria-label="Навигация по разделам"
    >
      <div className="flex flex-wrap gap-2 justify-center">
        {tabs.map((tab) => {
          const IconComponent = iconMap[tab.icon as keyof typeof iconMap];
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, tab.id)}
              className={`
                group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                ${
                  isActive
                    ? 'glass text-white shadow-lg scale-105'
                    : 'glass-dark text-gray-300 hover:text-white hover:scale-105'
                }
              `}
              title={tab.description}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              aria-label={`${tab.title}: ${tab.description}`}
            >
              <IconComponent
                className={`w-5 h-5 transition-transform duration-300 ${
                  isActive ? 'animate-pulse' : 'group-hover:rotate-12'
                }`}
                aria-hidden="true"
              />
              <span className="font-medium text-sm hidden sm:block">
                {tab.title}
              </span>

              {/* Active indicator */}
              {isActive && (
                <div
                  className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white rounded-full animate-fade-in"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
