"use client";

import { useEffect, useState } from "react";
import { useEffectsPreferences } from "@/lib/player/preferences";
import { PL_DICTIONARY } from "@/lib/player/copy-dictionary";

type IntroOverlayProps = {
  forceVisible?: boolean;
};

export function IntroOverlay({ forceVisible = false }: IntroOverlayProps) {
  const { preferences, loaded, updatePreference } = useEffectsPreferences();
  const [mounted, setMounted] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!loaded || !mounted) return null;
  
  if (dismissed || (preferences.introSkipped && !forceVisible)) return null;

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      updatePreference({ introSkipped: true });
      setDismissed(true);
    }, preferences.animationsEnabled ? 500 : 0);
  };

  return (
    <div 
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "var(--bg-obsidian, #120f0d)",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        textAlign: "center",
        opacity: isFadingOut ? 0 : 1,
        transition: preferences.animationsEnabled ? "opacity 0.5s ease" : "none"
      }}
    >
      <h1 style={{ color: "var(--text-gold, #c5a059)", marginBottom: "2rem", fontSize: "2.5rem" }}>
        {PL_DICTIONARY.intro.title}
      </h1>
      
      <p style={{ maxWidth: "600px", lineHeight: 1.6, marginBottom: "3rem", fontSize: "1.2rem", whiteSpace: "pre-line" }}>
        {PL_DICTIONARY.intro.message}
      </p>

      <div style={{ display: "flex", gap: "1rem", flexDirection: "column", alignItems: "center" }}>
        <button 
          onClick={handleSkip} 
          className="btn-tactile"
          style={{ minWidth: "200px" }}
        >
          {PL_DICTIONARY.intro.continueButton}
        </button>
      </div>
    </div>
  );
}
