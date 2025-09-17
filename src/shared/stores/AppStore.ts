import { makeAutoObservable, runInAction } from 'mobx';

/**
 * Global application state store
 * Manages navigation, playback state, and global settings
 */
export class AppStore {
  /** Currently active tab identifier */
  activeTab = 'particles';

  /** Global playback state for animations */
  isPlaying = true;

  /** Global settings panel visibility */
  showSettings = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  /**
   * Sets the active tab
   * @param tabId - The tab identifier to activate
   */
  setActiveTab(tabId: string): void {
    runInAction(() => {
      this.activeTab = tabId;
    });
  }

  /**
   * Toggles the global playback state
   */
  togglePlayPause(): void {
    runInAction(() => {
      this.isPlaying = !this.isPlaying;
    });
  }

  /**
   * Toggles the global settings panel visibility
   */
  toggleSettings(): void {
    runInAction(() => {
      this.showSettings = !this.showSettings;
    });
  }

  /**
   * Resets the store to initial state
   */
  reset(): void {
    runInAction(() => {
      this.activeTab = 'particles';
      this.isPlaying = true;
      this.showSettings = false;
    });
  }
}

export const appStore = new AppStore();
