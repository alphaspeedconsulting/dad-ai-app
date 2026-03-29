"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Redirect /household → /household-ops
 * The canonical route is /household-ops; this page exists solely to catch
 * old links, bookmarks, and any deep-links that use the shorter path.
 */
export default function HouseholdRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/household-ops");
  }, [router]);

  return null;
}
