import React, { useState, useEffect } from 'react';
import {
  Download,
  Smartphone,
  CheckCircle2,
  Sparkles,
  Share2,
  PlusSquare,
  ArrowLeft,
  X,
  Zap,
  WifiOff,
  ShieldCheck,
  Laptop,
  Check,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import brandLogo from '../assets/images/exact_acadet_cbt_logo_1786225425882.jpg';
import { pwaService } from '../utils/pwaInstaller';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const [platformInfo, setPlatformInfo] = useState(pwaService.getPlatformInfo());
  const [canInstall, setCanInstall] = useState(pwaService.canInstallDirectly());
  const [isInstalled, setIsInstalled] = useState(pwaService.isInstalled());
  const [installSuccess, setInstallSuccess] = useState(false);
  const [activeInstructionTab, setActiveInstructionTab] = useState<'android' | 'ios' | 'desktop'>(() => {
    const info = pwaService.getPlatformInfo();
    if (info.isIOS) return 'ios';
    if (info.isAndroid) return 'android';
    return 'android';
  });

  useEffect(() => {
    const unsubscribe = pwaService.subscribe(() => {
      setCanInstall(pwaService.canInstallDirectly());
      setIsInstalled(pwaService.isInstalled());
      setPlatformInfo(pwaService.getPlatformInfo());
    });
    return unsubscribe;
  }, []);

  if (!isOpen) return null;

  const handleTriggerInstall = async () => {
    const result = await pwaService.triggerInstall();
    if (result === 'accepted') {
      setInstallSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2500);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
      id="install-app-modal-overlay"
    >
      <div
        className="bg-slate-900 border border-indigo-500/40 max-w-lg w-full rounded-3xl p-5 sm:p-7 shadow-2xl relative text-left flex flex-col space-y-4 max-h-[90vh] my-auto overflow-hidden"
        id="install-app-modal-content"
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-bold border border-slate-700 cursor-pointer shadow-sm"
            id="install-modal-back-btn"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-indigo-400" />
            <span className="text-xs sm:text-sm font-extrabold text-white tracking-tight uppercase">
              Mobile Suite App
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-bold border border-slate-700 cursor-pointer shadow-sm"
            id="install-modal-close-btn"
            title="Close"
          >
            <span>Close</span>
            <X className="w-4 h-4 text-rose-400" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="overflow-y-auto space-y-4 pr-1 custom-scrollbar">
          
          {/* Hero App Badge Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-950 border border-indigo-500/30 flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-500 p-0.5 shadow-lg shadow-indigo-500/30 shrink-0 overflow-hidden">
              <img
                src={brandLogo}
                alt="Acadet CBT Master"
                className="w-full h-full object-cover rounded-2xl"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-white truncate">
                  Acadet CBT MASTER
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Mobile App
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Official University & Pre-JAMB CBT Simulator Suite
              </p>
              <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                <span className="flex items-center gap-1 text-indigo-300">
                  <Zap className="w-3 h-3 text-indigo-400" /> Fast PWA
                </span>
                <span className="flex items-center gap-1 text-emerald-300">
                  <WifiOff className="w-3 h-3 text-emerald-400" /> Offline Ready
                </span>
                <span className="flex items-center gap-1 text-amber-300">
                  <ShieldCheck className="w-3 h-3 text-amber-400" /> Free Install
                </span>
              </div>
            </div>
          </div>

          {/* Success State */}
          {installSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-center space-y-1">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto animate-bounce" />
              <p className="text-sm font-bold text-white">App Downloaded & Installed Successfully!</p>
              <p className="text-xs text-emerald-300">
                You can now launch Acadet CBT MASTER directly from your mobile home screen anytime.
              </p>
            </div>
          )}

          {/* Direct Install Button (If supported by browser) */}
          {canInstall && !installSuccess && !isInstalled && (
            <button
              onClick={handleTriggerInstall}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-blue-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2.5 transition-all transform active:scale-98 cursor-pointer"
              id="direct-install-pwa-btn"
            >
              <Download className="w-5 h-5 animate-bounce" />
              <span>Install & Download App on {platformInfo.isMobile ? 'Mobile' : 'Device'}</span>
            </button>
          )}

          {/* Already Installed State */}
          {isInstalled && (
            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-indigo-500/40 text-center space-y-1">
              <div className="inline-flex p-2 rounded-full bg-emerald-500/20 text-emerald-400 mb-1">
                <Check className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-white">App is Installed on This Device</p>
              <p className="text-[11px] text-slate-400">
                Running in high-speed Standalone Mobile Suite mode.
              </p>
            </div>
          )}

          {/* Instructions Tabs for iOS, Android, and Desktop */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">
                How to Download on Any Browser:
              </span>
              <span className="text-[10px] text-indigo-400 font-medium">
                Detected: {platformInfo.browserName}
              </span>
            </div>

            {/* Platform Selector Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveInstructionTab('android')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  activeInstructionTab === 'android'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Android</span>
              </button>
              <button
                onClick={() => setActiveInstructionTab('ios')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  activeInstructionTab === 'ios'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>iPhone / iPad</span>
              </button>
              <button
                onClick={() => setActiveInstructionTab('desktop')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  activeInstructionTab === 'desktop'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>PC / Laptop</span>
              </button>
            </div>

            {/* Android Guide */}
            {activeInstructionTab === 'android' && (
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-indigo-500/40">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-white">Open Browser Menu</p>
                    <p className="text-slate-400 text-[11px]">
                      In Chrome, Samsung Internet, Edge, or Opera, tap the <strong>three dots (⋮)</strong> at the top or bottom right corner.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-indigo-500/40">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-white">Select "Install App" or "Add to Home Screen"</p>
                    <p className="text-slate-400 text-[11px]">
                      Tap <span className="text-indigo-300 font-semibold">"Install app"</span> or <span className="text-indigo-300 font-semibold">"Add to Home screen"</span> in the menu list.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-indigo-500/40">
                    3
                  </div>
                  <div>
                    <p className="font-bold text-white">Confirm Installation</p>
                    <p className="text-slate-400 text-[11px]">
                      Tap <strong>"Install"</strong>. The Acadet CBT MASTER icon will instantly appear on your mobile home screen and app drawer!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* iOS Safari Guide */}
            {activeInstructionTab === 'ios' && (
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-indigo-500/40">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-white flex items-center gap-1.5">
                      Tap the Share Button <Share2 className="w-3.5 h-3.5 text-indigo-400 inline" />
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      At the bottom of Safari on your iPhone (or top on iPad), tap the square <strong>Share icon with the up arrow [↑]</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-indigo-500/40">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-white flex items-center gap-1.5">
                      Select "Add to Home Screen" <PlusSquare className="w-3.5 h-3.5 text-emerald-400 inline" />
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      Scroll down through the share options and tap <strong>"Add to Home Screen"</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-indigo-500/40">
                    3
                  </div>
                  <div>
                    <p className="font-bold text-white">Tap "Add"</p>
                    <p className="text-slate-400 text-[11px]">
                      Tap <strong>"Add"</strong> at the top right. The app will launch in a distraction-free, full-screen mobile suite mode.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Desktop Guide */}
            {activeInstructionTab === 'desktop' && (
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-indigo-500/40">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-white">Look for the Install Icon in URL Address Bar</p>
                    <p className="text-slate-400 text-[11px]">
                      In Google Chrome or Microsoft Edge, click the <strong>computer/install icon (⊕ or ⬇)</strong> on the right side of the address bar.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-indigo-500/40">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-white">Click "Install"</p>
                    <p className="text-slate-400 text-[11px]">
                      The CBT simulator will open in its own standalone desktop window and create desktop & start menu shortcuts.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Key Advantages Checklist */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-2">
            <h4 className="text-xs font-extrabold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Mobile Suite Advantages
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Zero mobile data for cached practice</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Full-screen realistic CBT exam simulation</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>1-Tap launch from your home screen</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Supports all Android, iPhone & PCs</span>
              </div>
            </div>
          </div>

          {/* Action Close / Done Button */}
          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-all cursor-pointer"
            >
              Got It / Return to App
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
