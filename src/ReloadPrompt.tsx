import { useState, useEffect } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferredPromptRef: BeforeInstallPromptEvent | null = null;

window.addEventListener("beforeinstallprompt", (e: Event) => {
  e.preventDefault();
  deferredPromptRef = e as BeforeInstallPromptEvent;
});

function ReloadPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(deferredPromptRef);
  const [installDismissed, setInstallDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => {
    const nav = window.navigator as { standalone?: boolean };
    return (
      nav.standalone || window.matchMedia("(display-mode: standalone)").matches
    );
  });

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log("SW Registered: " + r);
    },
    onRegisterError(error) {
      console.log("SW registration error", error);
    },
  });

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      deferredPromptRef = e as BeforeInstallPromptEvent;
      setDeferredPrompt(deferredPromptRef);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    const prompt = deferredPrompt || deferredPromptRef;
    if (!prompt) return;
    prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
    deferredPromptRef = null;
  };

  const closeInstall = () => {
    setInstallDismissed(true);
  };

  const closeToast = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  const showInstallBanner =
    (deferredPrompt || deferredPromptRef) && !isInstalled && !installDismissed;
  const showToast = needRefresh;

  return (
    <div className="p-0 m-0 w-0 h-0">
      {showInstallBanner && (
        <div className="fixed right-0 bottom-0 m-4 p-4 border border-black/20 rounded z-[9999] text-left min-w-[280px] shadow-md bg-white">
          <div className="text-base font-semibold mb-1">
            Install PRO-CG
          </div>
          <div className="text-sm text-gray-600 mb-3">
            Install this app on your desktop for a faster, offline-ready
            experience.
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleInstall}
              className="border-0 outline-none rounded px-4 py-1.5 cursor-pointer bg-[#646cff] text-white font-medium"
            >
              Download App
            </button>
            <Button
              variant="outline"
              onClick={closeInstall}
            >
              Not now
            </Button>
          </div>
        </div>
      )}
      {showToast && (
        <div className="fixed right-0 bottom-0 m-4 p-3 border border-black/20 rounded z-[9999] text-left shadow-md bg-white">
          <div className="mb-2">
            {offlineReady ? (
              <span>App ready to work offline</span>
            ) : (
              <span>New content available, click reload to update.</span>
            )}
          </div>
          {needRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateServiceWorker(true)}
              className="mr-1"
            >
              Reload
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={closeToast}
          >
            Close
          </Button>
        </div>
      )}
    </div>
  );
}

export default ReloadPrompt;
