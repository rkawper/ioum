import React, { useState } from 'react';
import {
  Apple,
  CheckCircle,
  Code,
  Download,
  Laptop,
  Monitor,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'android' | 'windows' | 'macos' | 'build';

export const DownloadAppModal: React.FC<DownloadAppModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, platform, promptInstall } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (platform === 'android') return 'android';
    if (platform === 'windows') return 'windows';
    if (platform === 'macos') return 'macos';
    return 'android';
  });
  const [installSuccess, setInstallSuccess] = useState(false);

  const handle1ClickInstall = async () => {
    const success = await promptInstall();
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Download & Install IOUM"
      subtitle="Install IOUM as a standalone offline application on your device"
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* If installable right now in browser */}
        {isInstallable && !isInstalled && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-200 dark:border-indigo-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  1-Click Instant Install Available
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Your browser supports direct installation of IOUM right now.
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={handle1ClickInstall}
              icon={<Download className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              Install Now
            </Button>
          </div>
        )}

        {isInstalled && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 font-medium">
            <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>IOUM is already installed as a standalone application on this system!</span>
          </div>
        )}

        {installSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 font-medium">
            <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>Installation complete! You can now launch IOUM from your apps.</span>
          </div>
        )}

        {/* Platform Selection Tabs */}
        <div>
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('android')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'android'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden sm:inline">Android</span>
              <span className="sm:hidden">Android</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('windows')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'windows'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5 text-blue-500" />
              <span className="hidden sm:inline">Windows</span>
              <span className="sm:hidden">Windows</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('macos')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'macos'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Apple className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
              <span className="hidden sm:inline">macOS</span>
              <span className="sm:hidden">Mac</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('build')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'build'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">Native Build</span>
              <span className="sm:hidden">Build</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          {activeTab === 'android' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <Smartphone className="w-4 h-4 text-emerald-500" />
                <span>How to Install on Android Devices</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                You can install IOUM directly onto your Android smartphone or tablet as a native app with full offline support:
              </p>
              <ol className="text-xs text-slate-700 dark:text-slate-300 space-y-2 list-decimal list-inside pl-1 leading-relaxed">
                <li>
                  Open IOUM in <strong>Google Chrome</strong>, <strong>Samsung Internet</strong>, or <strong>Brave</strong>.
                </li>
                <li>
                  Tap the three dots menu icon <strong className="font-mono">(⋮)</strong> in the top right corner.
                </li>
                <li>
                  Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                </li>
                <li>
                  Confirm <strong>"Install"</strong>. The IOUM icon will appear directly in your App Drawer and Home screen!
                </li>
              </ol>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60 text-[11px] text-emerald-800 dark:text-emerald-300">
                ✨ <strong>Zero App Store required:</strong> The app opens in its own full-screen window with no URL bar, works completely offline, and saves all data locally on your phone.
              </div>
            </div>
          )}

          {activeTab === 'windows' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <Monitor className="w-4 h-4 text-blue-500" />
                <span>How to Install on Windows 10 &amp; 11</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Install IOUM on your Windows PC as a desktop application with Start Menu and Taskbar integration:
              </p>
              <ol className="text-xs text-slate-700 dark:text-slate-300 space-y-2 list-decimal list-inside pl-1 leading-relaxed">
                <li>
                  Open this page in <strong>Microsoft Edge</strong> or <strong>Google Chrome</strong>.
                </li>
                <li>
                  In the address bar, click the <strong>"Install App"</strong> icon (or click the three dots menu).
                </li>
                <li>
                  Click <strong>"Install IOUM"</strong> in the prompt.
                </li>
                <li>
                  IOUM will immediately open in its own dedicated desktop window. You can pin it to your <strong>Taskbar</strong> and find it in your <strong>Windows Start Menu</strong>.
                </li>
              </ol>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800/60 text-[11px] text-blue-800 dark:text-blue-300">
                💡 <strong>Desktop Experience:</strong> Runs fast, launches instantly from your desktop shortcut, and works 100% offline with zero internet required.
              </div>
            </div>
          )}

          {activeTab === 'macos' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <Apple className="w-4 h-4 text-slate-800 dark:text-slate-200" />
                <span>How to Install on macOS</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Run IOUM as a standalone macOS desktop application in your Dock:
              </p>
              <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="font-semibold text-slate-900 dark:text-white mb-1">
                    Option 1: Safari (macOS Sonoma / Sequoia)
                  </div>
                  <p className="leading-relaxed text-slate-600 dark:text-slate-400">
                    Open in Safari, click <strong>File</strong> in the top menu bar, and choose <strong>"Add to Dock"</strong>. IOUM is added directly to your macOS Dock and Applications folder.
                  </p>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="font-semibold text-slate-900 dark:text-white mb-1">
                    Option 2: Chrome / Brave / Edge
                  </div>
                  <p className="leading-relaxed text-slate-600 dark:text-slate-400">
                    Click the <strong>Install</strong> icon in the right side of the address bar, or click Menu → <strong>"Save and Share"</strong> → <strong>"Install IOUM"</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'build' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <Laptop className="w-4 h-4 text-indigo-500" />
                <span>Standalone Native Binary Packaging (Capacitor &amp; Electron)</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                For developers or advanced users who want standalone native binaries (<code className="font-mono text-indigo-600 dark:text-indigo-400">.apk</code>, <code className="font-mono text-indigo-600 dark:text-indigo-400">.exe</code>, <code className="font-mono text-indigo-600 dark:text-indigo-400">.dmg</code>), this repository includes packaging recipes:
              </p>
              <div className="p-3 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono space-y-2 overflow-x-auto">
                <div className="text-slate-400"># 1. Build the production web bundle</div>
                <div>npm run build</div>
                <div className="text-slate-400 mt-2"># 2. To bundle for Android APK (via Capacitor):</div>
                <div>npx @capacitor/cli add android &amp;&amp; npx cap open android</div>
                <div className="text-slate-400 mt-2"># 3. To bundle for Windows (.exe) / macOS (.dmg):</div>
                <div>npx electron-builder --win --mac</div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Because IOUM is 100% client-side with no remote server dependency, packaged binaries run fully offline with zero setup.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Detected OS: <span className="font-semibold uppercase text-slate-700 dark:text-slate-300">{platform}</span>
          </div>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
