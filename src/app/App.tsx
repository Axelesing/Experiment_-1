import { Suspense, lazy } from 'react';

import { observer } from 'mobx-react-lite';

import { ParticleDrawer } from '@/features/ParticleDrawer';

// Lazy load other features for better performance
const PatternGenerator = lazy(() =>
  import('@/features/PatternGenerator').then((m) => ({
    default: m.PatternGenerator,
  }))
);
const AsciiArtGenerator = lazy(() =>
  import('@/features/AsciiArtGenerator').then((m) => ({
    default: m.AsciiArtGenerator,
  }))
);
const ColorPaletteGenerator = lazy(() =>
  import('@/features/ColorPaletteGenerator').then((m) => ({
    default: m.ColorPaletteGenerator,
  }))
);
const FractalViewer = lazy(() =>
  import('@/features/FractalViewer').then((m) => ({ default: m.FractalViewer }))
);
const SoundVisualizer = lazy(() =>
  import('@/features/SoundVisualizer').then((m) => ({
    default: m.SoundVisualizer,
  }))
);
const MazeGenerator = lazy(() =>
  import('@/features/MazeGenerator').then((m) => ({ default: m.MazeGenerator }))
);
const TypographyPlayground = lazy(() =>
  import('@/features/TypographyPlayground').then((m) => ({
    default: m.TypographyPlayground,
  }))
);

import { appStore } from '@/shared/stores';
import type { Tab } from '@/shared/types';
import { TabNavigation } from '@/widgets/TabNavigation';

const tabs: Tab[] = [
  {
    id: 'particles',
    title: 'Частицы',
    icon: 'Sparkles',
    description: 'Интерактивная рисовалка частиц',
  },
  {
    id: 'patterns',
    title: 'Узоры',
    icon: 'Shapes',
    description: 'Генератор случайных узоров',
  },
  {
    id: 'ascii',
    title: 'ASCII Арт',
    icon: 'Type',
    description: 'Генератор ASCII искусства',
  },
  {
    id: 'colors',
    title: 'Палитры',
    icon: 'Palette',
    description: 'Генератор цветовых палитр',
  },
  {
    id: 'fractals',
    title: 'Фракталы',
    icon: 'TreePine',
    description: 'Просмотрщик фракталов',
  },
  {
    id: 'sound',
    title: 'Звук',
    icon: 'Volume2',
    description: 'Визуализатор звука',
  },
  {
    id: 'maze',
    title: 'Лабиринт',
    icon: 'Map',
    description: 'Генератор лабиринтов',
  },
  {
    id: 'typography',
    title: 'Типографика',
    icon: 'AlignLeft',
    description: 'Эксперименты с типографикой',
  },
];

export const App = observer(() => {
  const renderActiveComponent = () => {
    const LoadingFallback = () => (
      <div className="card flex items-center justify-center h-96">
        <div className="text-white/70">Загрузка...</div>
      </div>
    );

    switch (appStore.activeTab) {
      case 'particles':
        return <ParticleDrawer />;
      case 'patterns':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <PatternGenerator />
          </Suspense>
        );
      case 'ascii':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <AsciiArtGenerator />
          </Suspense>
        );
      case 'colors':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <ColorPaletteGenerator />
          </Suspense>
        );
      case 'fractals':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <FractalViewer />
          </Suspense>
        );
      case 'sound':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <SoundVisualizer />
          </Suspense>
        );
      case 'maze':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <MazeGenerator />
          </Suspense>
        );
      case 'typography':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <TypographyPlayground />
          </Suspense>
        );
      default:
        return <ParticleDrawer />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="text-center py-8 px-4">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 animate-fade-in">
          Vibe
        </h1>
        <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto animate-slide-up">
          Интерактивная коллекция креативных мини-приложений для экспериментов
        </p>
      </header>

      <TabNavigation
        tabs={tabs}
        activeTab={appStore.activeTab}
        onTabChange={appStore.setActiveTab}
      />

      <main className="flex-1 px-4 pb-8">
        <div className="max-w-6xl mx-auto">{renderActiveComponent()}</div>
      </main>
    </div>
  );
});
