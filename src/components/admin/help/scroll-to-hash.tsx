"use client";

import { useEffect } from "react";

/**
 * Help pages stream in after the shell, so the browser's own jump to
 * `#section` can fire before the heading exists. Scroll once on mount.
 */
export function ScrollToHash() {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    const el = document.getElementById(id);
    el?.scrollIntoView({ block: "start" });
  }, []);
  return null;
}
