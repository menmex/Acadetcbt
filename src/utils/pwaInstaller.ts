/**
 * PWA & Mobile App Suite Utility
 * Manages Service Worker lifecycle, installation prompts across Android, iOS, and Desktop browsers.
 */

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

class PwaInstallerService {
  private deferredPrompt: InstallPromptEvent | null = null;
  private isStandalone: boolean = false;
  private listeners: Set<() => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.checkStandaloneMode();
      this.initInstallPromptListener();
      this.registerServiceWorker();
    }
  }

  private checkStandaloneMode() {
    const isStandaloneDisplay = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    const isDocumentReferrerPwa = document.referrer.includes('android-app://');
    this.isStandalone = isStandaloneDisplay || isIOSStandalone || isDocumentReferrerPwa;
  }

  private initInstallPromptListener() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as InstallPromptEvent;
      this.notifyListeners();
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.isStandalone = true;
      this.notifyListeners();
      console.log('[PWA Suite] Acadet CBT MASTER successfully installed as mobile app!');
    });
  }

  public registerServiceWorker() {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('[PWA Suite] Service Worker registered with scope:', reg.scope);
          })
          .catch((err) => {
            console.warn('[PWA Suite] Service Worker registration failed:', err);
          });
      });
    }
  }

  public canInstallDirectly(): boolean {
    return !!this.deferredPrompt;
  }

  public isInstalled(): boolean {
    return this.isStandalone;
  }

  public async triggerInstall(): Promise<'accepted' | 'dismissed' | 'unsupported'> {
    if (!this.deferredPrompt) {
      return 'unsupported';
    }
    try {
      await this.deferredPrompt.prompt();
      const choice = await this.deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        this.deferredPrompt = null;
        this.isStandalone = true;
        this.notifyListeners();
      }
      return choice.outcome;
    } catch (err) {
      console.error('[PWA Suite] Install prompt failed:', err);
      return 'unsupported';
    }
  }

  public getPlatformInfo(): {
    isIOS: boolean;
    isAndroid: boolean;
    isMobile: boolean;
    browserName: string;
  } {
    if (typeof window === 'undefined') {
      return { isIOS: false, isAndroid: false, isMobile: false, browserName: 'Unknown' };
    }

    const ua = navigator.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    const isAndroid = /Android/.test(ua);
    const isMobile = isIOS || isAndroid || /Mobi|Tablet|iPad|iPhone/.test(ua);

    let browserName = 'Browser';
    if (/SamsungBrowser/i.test(ua)) browserName = 'Samsung Internet';
    else if (/EdgA|EdgiOS|Edge/i.test(ua)) browserName = 'Microsoft Edge';
    else if (/OPR|Opera/i.test(ua)) browserName = 'Opera';
    else if (/Chrome|CriOS/i.test(ua)) browserName = 'Google Chrome';
    else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browserName = 'Apple Safari';
    else if (/Firefox|FxiOS/i.test(ua)) browserName = 'Mozilla Firefox';

    return { isIOS, isAndroid, isMobile, browserName };
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((fn) => fn());
  }
}

export const pwaService = new PwaInstallerService();
