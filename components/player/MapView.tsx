"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { PL_DICTIONARY } from "@/lib/player/copy-dictionary";
import type { MapProgressSnapshot } from "@/lib/domain/types";
import { useEffectsPreferences } from "@/lib/player/preferences";

type MapViewProps = {
  map: MapProgressSnapshot;
};

export function MapView({ map }: MapViewProps) {
  const { preferences, loaded } = useEffectsPreferences();
  const [prevCount, setPrevCount] = useState(map.revealedFragmentCount);
  const [animState, setAnimState] = useState<"idle" | "playing" | "completed">("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio lazily to avoid SSR issues
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("/obelisk-reveal.mp3");
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;

    if (map.revealedFragmentCount > prevCount) {
      if (preferences.animationsEnabled) {
        setAnimState("playing");
        
        if (preferences.soundEnabled && audioRef.current) {
          audioRef.current.currentTime = 0;
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch((e) => {
              // Autoplay or missing audio fallback - log silently and continue
              console.warn("Audio play blocked or failed", e);
            });
          }
        }

        const timer = setTimeout(() => {
          setAnimState("completed");
          setPrevCount(map.revealedFragmentCount);
        }, 2000); // 2 second reveal animation
        
        return () => clearTimeout(timer);
      } else {
        // Fallback: No animation
        setAnimState("completed");
        setPrevCount(map.revealedFragmentCount);
      }
    } else if (map.revealedFragmentCount < prevCount) {
      // In case admin manually hides a fragment
      setPrevCount(map.revealedFragmentCount);
    }
  }, [map.revealedFragmentCount, prevCount, preferences, loaded]);

  const totalFragments = map.requiredApprovalCount || 16;
  const fragments = Array.from({ length: totalFragments }, (_, i) => i + 1);

  // The number we show as 'statically' revealed depends on animation state
  const isRevealing = animState === "playing" && preferences.animationsEnabled;
  const canShowPrize = map.isFinalUnlocked && !isRevealing;
  const isComplete = canShowPrize;
  
  return (
    <main className={`page-shell ${isComplete && preferences.animationsEnabled ? "map-complete-effect" : ""}`}>
      <nav className="inline-nav" aria-label="Nawigacja gracza">
        <Link href="/">{PL_DICTIONARY.nav.start}</Link>
        <Link href="/submissions">{PL_DICTIONARY.nav.submissions}</Link>
        <a href="/logout">{PL_DICTIONARY.nav.logout}</a>
      </nav>
      
      <h1>{PL_DICTIONARY.map.title}</h1>
      
      <div className="panel-rugged" style={{ marginBottom: "2rem", textAlign: "center" }}>
        <p className="eyebrow">{PL_DICTIONARY.map.progressLabel}</p>
        <p role="status" style={{ fontSize: "2rem", color: "var(--text-gold)", fontWeight: "bold", margin: "0.5rem 0" }}>
          {animState === "playing" ? prevCount : map.revealedFragmentCount} / {totalFragments}
        </p>
        <div style={{ width: "100%", backgroundColor: "var(--bg-well)", height: "8px", borderRadius: "4px", overflow: "hidden" }}>
          <div 
            style={{ 
              width: `${((animState === "playing" ? prevCount : map.revealedFragmentCount) / totalFragments) * 100}%`, 
              backgroundColor: "var(--border-glow)", 
              height: "100%", 
              transition: "width 0.4s ease" 
            }} 
          />
        </div>
      </div>

      <div className="map-grid-container">
        {fragments.map((num) => {
          const staticallyRevealed = num <= prevCount;
          const isNewlyRevealed = num > prevCount && num <= map.revealedFragmentCount;
          
          let tileClass = "locked";
          if (staticallyRevealed) tileClass = "revealed";
          if (isNewlyRevealed) {
             tileClass = animState === "playing" && preferences.animationsEnabled 
               ? "revealed animating-reveal" 
               : "revealed";
          }

          return (
            <div 
              key={num} 
              className={`map-rune-tile ${tileClass}`}
              title={staticallyRevealed || isNewlyRevealed ? `Fragment ${num} odkryty` : `Fragment ${num} zablokowany`}
            >
              {staticallyRevealed || isNewlyRevealed ? (
                <>
                  <span className="check-badge">✓</span>
                  <span className="tile-number">{num}</span>
                </>
              ) : (
                <>
                  <span className="rune-symbol">᚛</span>
                  <span className="tile-number" style={{ fontSize: "0.8rem", opacity: 0.5 }}>{num}</span>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "2rem" }}>
        {canShowPrize ? (
          <section aria-labelledby="final-prize-heading" className="panel-rugged final-prize-panel" style={{ border: "2px solid var(--border-glow)" }}>
            <h2 id="final-prize-heading" style={{ color: "var(--text-gold)" }}>
              {PL_DICTIONARY.map.finalPrizeHeading}
            </h2>
            <p>Gratulacje! Odkryliście pełną mapę i odnaleźliście legendarny skarb!</p>
            <a href="/final-prize-photo.jpg" target="_blank" rel="noopener noreferrer" className="btn-tactile">
              {PL_DICTIONARY.map.openPrizeButton}
            </a>
          </section>
        ) : (
          <div className="panel-rugged" style={{ opacity: 0.85 }}>
            <p style={{ margin: 0, fontStyle: "italic", textAlign: "center", color: "var(--text-muted)" }}>
              {PL_DICTIONARY.map.lockedMessage}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
