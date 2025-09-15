import { makeAutoObservable } from 'mobx';

export class AppStore {
  activeTab = 'particles';
  isPlaying = true;
  showSettings = false;

  constructor() {
    makeAutoObservable(this);
  }

  setActiveTab = (tabId: string) => {
    this.activeTab = tabId;
  };

  togglePlayPause = () => {
    this.isPlaying = !this.isPlaying;
  };

  toggleSettings = () => {
    this.showSettings = !this.showSettings;
  };
}

export const appStore = new AppStore();
