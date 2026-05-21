"use client";

import { useState, useEffect } from "react";

export type EffectsPreferences = {
  animationsEnabled: boolean;
  soundEnabled: boolean;
  introSkipped: boolean;
};

const STORAGE_KEY = "mission_effects_prefs";

export function getStoredPreferences(): Partial<EffectsPreferences> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null) {
      return {
        animationsEnabled: typeof parsed.animationsEnabled === "boolean" ? parsed.animationsEnabled : undefined,
        soundEnabled: typeof parsed.soundEnabled === "boolean" ? parsed.soundEnabled : undefined,
        introSkipped: typeof parsed.introSkipped === "boolean" ? parsed.introSkipped : undefined,
      };
    }
  } catch (e) {
    // Storage unavailable or malformed
  }
  return {};
}

export function savePreferences(prefs: Partial<EffectsPreferences>) {
  if (typeof window === "undefined") return;
  try {
    const existing = getStoredPreferences();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, ...prefs }));
  } catch (e) {
    // Fail safely if storage is unavailable
  }
}

export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", listener);
    } else {
      mediaQuery.addListener(listener); // fallback for older browsers
    }
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", listener);
      } else {
        mediaQuery.removeListener(listener);
      }
    };
  }, []);

  return reducedMotion;
}

export function useEffectsPreferences() {
  const reducedMotion = useReducedMotion();
  const [preferences, setPreferences] = useState<EffectsPreferences>({
    animationsEnabled: !reducedMotion,
    soundEnabled: true,
    introSkipped: false,
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = getStoredPreferences();
    setPreferences((prev) => ({
      animationsEnabled: stored.animationsEnabled ?? !reducedMotion,
      soundEnabled: stored.soundEnabled ?? true,
      introSkipped: stored.introSkipped ?? false,
    }));
    setLoaded(true);
  }, [reducedMotion]);

  const updatePreference = (updates: Partial<EffectsPreferences>) => {
    savePreferences(updates);
    setPreferences((prev) => ({ ...prev, ...updates }));
  };

  return {
    preferences,
    loaded,
    updatePreference,
  };
}
