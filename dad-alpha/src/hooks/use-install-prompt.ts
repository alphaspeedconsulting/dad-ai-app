"use client";

import { useCallback, useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const visits = parseInt(localStorage.getItem("dad-alpha-visits") ?? "0");
    localStorage.setItem("dad-alpha-visits", String(visits + 1));

    const dismissed = localStorage.getItem("dad-alpha-install-dismissed");
    if (dismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      const evt = e as BeforeInstallPromptEvent;
      setDeferredPrompt(evt);
      if (visits >= 1) setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setIsInstallable(false);
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const dismissInstall = useCallback(() => {
    setIsInstallable(false);
    localStorage.setItem("dad-alpha-install-dismissed", "true");
  }, []);

  return { isInstallable, isInstalled, promptInstall, dismissInstall };
}
