import { PatternConfig } from '@/entities/pattern/lib';
import { PatternStore } from '../PatternStore';

describe('PatternStore', () => {
  let store: PatternStore;

  beforeEach(() => {
    store = new PatternStore();
  });

  describe('initial state', () => {
    it('should have default values', () => {
      expect(store.patternType).toBe('geometric');
      expect(store.patternComplexity).toBe(5);
      expect(store.patternColors).toEqual([
        '#ff6b6b',
        '#4ecdc4',
        '#45b7d1',
        '#96ceb4',
        '#feca57',
      ]);
      expect(store.patternDensity).toBe(1);
      expect(store.patternAnimation).toBe(false);
      expect(store.patternSymmetry).toBe(false);
      expect(store.animationSpeed).toBe(1);
      expect(store.showSettings).toBe(false);
      expect(store.isGenerating).toBe(false);
    });

    it('should create currentPattern computed property', () => {
      const pattern = store.currentPattern;

      expect(pattern.type).toBe('geometric');
      expect(pattern.complexity).toBe(5);
      expect(pattern.colors).toEqual([
        '#ff6b6b',
        '#4ecdc4',
        '#45b7d1',
        '#96ceb4',
        '#feca57',
      ]);
      expect(pattern.density).toBe(1);
      expect(pattern.animation).toBe(false);
      expect(pattern.symmetry).toBe(false);
    });
  });

  describe('setPatternType', () => {
    it('should update pattern type', () => {
      store.setPatternType('organic');
      expect(store.patternType).toBe('organic');
    });

    it('should accept all valid types', () => {
      const types: PatternConfig['type'][] = [
        'geometric',
        'organic',
        'fractal',
        'spiral',
      ];

      types.forEach((type) => {
        store.setPatternType(type);
        expect(store.patternType).toBe(type);
      });
    });
  });

  describe('setComplexity', () => {
    it('should update complexity', () => {
      store.setComplexity(8);
      expect(store.patternComplexity).toBe(8);
    });

    it('should handle edge values', () => {
      store.setComplexity(1);
      expect(store.patternComplexity).toBe(1);

      store.setComplexity(10);
      expect(store.patternComplexity).toBe(10);
    });
  });

  describe('setColors', () => {
    it('should update colors', () => {
      const newColors = ['#ff0000', '#00ff00'];
      store.setColors(newColors);
      expect(store.patternColors).toEqual(newColors);
    });

    it('should handle empty array', () => {
      store.setColors([]);
      expect(store.patternColors).toEqual([]);
    });
  });

  describe('setDensity', () => {
    it('should update density', () => {
      store.setDensity(2.5);
      expect(store.patternDensity).toBe(2.5);
    });

    it('should handle decimal values', () => {
      store.setDensity(0.5);
      expect(store.patternDensity).toBe(0.5);
    });
  });

  describe('setAnimation', () => {
    it('should update animation state', () => {
      store.setAnimation(true);
      expect(store.patternAnimation).toBe(true);

      store.setAnimation(false);
      expect(store.patternAnimation).toBe(false);
    });
  });

  describe('setSymmetry', () => {
    it('should update symmetry state', () => {
      store.setSymmetry(true);
      expect(store.patternSymmetry).toBe(true);

      store.setSymmetry(false);
      expect(store.patternSymmetry).toBe(false);
    });
  });

  describe('setAnimationSpeed', () => {
    it('should update animation speed', () => {
      store.setAnimationSpeed(2.5);
      expect(store.animationSpeed).toBe(2.5);
    });

    it('should handle edge values', () => {
      store.setAnimationSpeed(0.1);
      expect(store.animationSpeed).toBe(0.1);

      store.setAnimationSpeed(5);
      expect(store.animationSpeed).toBe(5);
    });
  });

  describe('color management', () => {
    describe('updateColor', () => {
      it('should update color at specific index', () => {
        store.updateColor(0, '#ff0000');
        expect(store.patternColors[0]).toBe('#ff0000');
      });

      it('should not affect other colors', () => {
        const originalColors = [...store.patternColors];
        store.updateColor(1, '#ff0000');

        expect(store.patternColors[0]).toBe(originalColors[0]);
        expect(store.patternColors[2]).toBe(originalColors[2]);
      });
    });

    describe('addColor', () => {
      it('should add new color', () => {
        const originalLength = store.patternColors.length;
        store.addColor();

        expect(store.patternColors.length).toBe(originalLength + 1);
        expect(store.patternColors[store.patternColors.length - 1]).toBe(
          '#ffffff'
        );
      });
    });

    describe('removeColor', () => {
      it('should remove color at specific index', () => {
        const originalLength = store.patternColors.length;
        store.removeColor(0);

        expect(store.patternColors.length).toBe(originalLength - 1);
      });

      it('should not remove color if only one remains', () => {
        store.setColors(['#ff0000']);
        store.removeColor(0);

        expect(store.patternColors.length).toBe(1);
        expect(store.patternColors[0]).toBe('#ff0000');
      });
    });
  });

  describe('toggleSettings', () => {
    it('should toggle settings visibility', () => {
      expect(store.showSettings).toBe(false);

      store.toggleSettings();
      expect(store.showSettings).toBe(true);

      store.toggleSettings();
      expect(store.showSettings).toBe(false);
    });
  });

  describe('generateRandomPattern', () => {
    it('should generate random pattern with valid values', () => {
      store.generateRandomPattern();

      expect(['geometric', 'organic', 'fractal', 'spiral']).toContain(
        store.patternType
      );
      expect(store.patternComplexity).toBeGreaterThanOrEqual(1);
      expect(store.patternComplexity).toBeLessThanOrEqual(10);
      expect(store.patternDensity).toBeGreaterThanOrEqual(0.5);
      expect(store.patternDensity).toBeLessThanOrEqual(2.5);
      expect(typeof store.patternAnimation).toBe('boolean');
      expect(typeof store.patternSymmetry).toBe('boolean');
    });

    it('should generate valid colors', () => {
      store.generateRandomPattern();

      expect(Array.isArray(store.patternColors)).toBe(true);
      expect(store.patternColors.length).toBeGreaterThan(0);
      store.patternColors.forEach((color) => {
        expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });
  });

  describe('canvas operations', () => {
    it('should set canvas size', () => {
      expect(() => {
        store.setCanvasSize(800, 600);
      }).not.toThrow();
    });

    it('should update animation', () => {
      expect(() => {
        store.updateAnimation(100);
      }).not.toThrow();
    });

    it('should render pattern', () => {
      const mockCtx = {
        save: jest.fn(),
        restore: jest.fn(),
        fillStyle: '',
        beginPath: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
        translate: jest.fn(),
        rotate: jest.fn(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      expect(() => {
        store.renderPattern(mockCtx);
      }).not.toThrow();
    });

    it('should get point count', () => {
      const count = store.getPointCount();
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('computed properties', () => {
    it('should update currentPattern when properties change', () => {
      store.setPatternType('organic');
      store.setComplexity(8);
      store.setAnimation(true);

      const pattern = store.currentPattern;
      expect(pattern.type).toBe('organic');
      expect(pattern.complexity).toBe(8);
      expect(pattern.animation).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle invalid color updates gracefully', () => {
      const originalColors = [...store.patternColors];

      // Try to update color at invalid index
      store.updateColor(-1, '#ff0000');
      store.updateColor(999, '#ff0000');

      expect(store.patternColors).toEqual(originalColors);
    });

    it('should handle empty color array in updateColor', () => {
      store.setColors([]);

      expect(() => {
        store.updateColor(0, '#ff0000');
      }).not.toThrow();
    });
  });
});
