import { BottomNav } from "@/components/shared/BottomNav";
import { CelebrationOverlay } from "@/components/shared/CelebrationOverlay";
import { MemoryHydrator } from "@/components/shared/MemoryHydrator";
import { OfflineBanner } from "@/components/shared/OfflineBanner";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { InstallBanner } from "@/components/shared/InstallBanner";
import { QuickCapture } from "@/components/shared/QuickCapture";
import { SyncStatus } from "@/components/shared/SyncStatus";
import { UpdateBanner } from "@/components/shared/UpdateBanner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <MemoryHydrator />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-on-primary focus:text-alphaai-sm focus:font-semibold"
      >
        Skip to content
      </a>
      <InstallBanner />
      <OfflineBanner />
      <div className="alpha-dad min-h-screen bg-background">
        {children}
      </div>
      <SyncStatus />
      <UpdateBanner />
      <CelebrationOverlay />
      <QuickCapture />
      <BottomNav />
    </ErrorBoundary>
  );
}
