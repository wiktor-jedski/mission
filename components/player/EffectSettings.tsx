"use client";

import { useEffectsPreferences } from "@/lib/player/preferences";
import { PL_DICTIONARY } from "@/lib/player/copy-dictionary";

export function EffectSettings() {
  const { preferences, loaded, updatePreference } = useEffectsPreferences();

  if (!loaded) return null;

  return (
    <div className="effect-settings" style={{
      display: "flex",
      gap: "1rem",
      padding: "0.5rem",
      justifyContent: "center",
      background: "var(--bg-well, rgba(0,0,0,0.2))",
      borderRadius: "4px",
      marginTop: "1rem"
    }}>
      <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
        <input 
          type="checkbox" 
          checked={preferences.animationsEnabled}
          onChange={(e) => updatePreference({ animationsEnabled: e.target.checked })}
          style={{ width: "16px", height: "16px", cursor: "pointer" }}
        />
        <span style={{ fontSize: "0.9rem", color: "var(--text-muted, #ccc)" }}>{PL_DICTIONARY.settings.animationToggle}</span>
      </label>
      
      <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
        <input 
          type="checkbox" 
          checked={preferences.soundEnabled}
          onChange={(e) => updatePreference({ soundEnabled: e.target.checked })}
          style={{ width: "16px", height: "16px", cursor: "pointer" }}
        />
        <span style={{ fontSize: "0.9rem", color: "var(--text-muted, #ccc)" }}>{PL_DICTIONARY.settings.soundToggle}</span>
      </label>
    </div>
  );
}
