import { reaction } from 'mobx';

import { AppStore } from '../AppStore';

describe('AppStore', () => {
  let store: AppStore;

  beforeEach(() => {
    store = new AppStore();
  });

  describe('initial state', () => {
    it('should have correct initial values', () => {
      expect(store.activeTab).toBe('particles');
      expect(store.isPlaying).toBe(true);
      expect(store.showSettings).toBe(false);
    });
  });

  describe('setActiveTab', () => {
    it('should update active tab', () => {
      store.setActiveTab('ascii');
      expect(store.activeTab).toBe('ascii');
    });

    it('should handle multiple tab changes', () => {
      store.setActiveTab('colors');
      expect(store.activeTab).toBe('colors');

      store.setActiveTab('fractals');
      expect(store.activeTab).toBe('fractals');
    });
  });

  describe('togglePlayPause', () => {
    it('should toggle play state from true to false', () => {
      expect(store.isPlaying).toBe(true);
      store.togglePlayPause();
      expect(store.isPlaying).toBe(false);
    });

    it('should toggle play state from false to true', () => {
      store.togglePlayPause(); // false
      store.togglePlayPause(); // true
      expect(store.isPlaying).toBe(true);
    });
  });

  describe('toggleSettings', () => {
    it('should toggle settings visibility from false to true', () => {
      expect(store.showSettings).toBe(false);
      store.toggleSettings();
      expect(store.showSettings).toBe(true);
    });

    it('should toggle settings visibility from true to false', () => {
      store.toggleSettings(); // true
      store.toggleSettings(); // false
      expect(store.showSettings).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all values to initial state', () => {
      // Change all values
      store.setActiveTab('colors');
      store.togglePlayPause();
      store.toggleSettings();

      // Verify changes
      expect(store.activeTab).toBe('colors');
      expect(store.isPlaying).toBe(false);
      expect(store.showSettings).toBe(true);

      // Reset
      store.reset();

      // Verify reset
      expect(store.activeTab).toBe('particles');
      expect(store.isPlaying).toBe(true);
      expect(store.showSettings).toBe(false);
    });
  });

  describe('MobX reactivity', () => {
    it('should be observable', () => {
      let observedValue: string | undefined;

      // Create a reaction to observe changes using MobX reaction
      const dispose = reaction(
        () => store.activeTab,
        (newValue) => {
          observedValue = newValue;
        },
        { fireImmediately: true } // Fire immediately to get initial value
      );

      // Initial value should be set by fireImmediately
      expect(observedValue).toBe('particles');

      // Change value
      store.setActiveTab('ascii');
      expect(observedValue).toBe('ascii');

      // Cleanup
      dispose();
    });
  });
});
