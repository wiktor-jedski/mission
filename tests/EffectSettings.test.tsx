import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { EffectSettings } from "../components/player/EffectSettings";
import * as preferencesMod from "../lib/player/preferences";

describe("EffectSettings", () => {
  const updatePreferenceMock = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    updatePreferenceMock.mockClear();
  });

  it("returns null if not loaded", () => {
    vi.spyOn(preferencesMod, "useEffectsPreferences").mockReturnValue({
      preferences: { animationsEnabled: true, soundEnabled: true, introSkipped: false },
      loaded: false,
      updatePreference: updatePreferenceMock,
    });
    
    const { container } = render(<EffectSettings />);
    expect(container.firstChild).toBeNull();
  });

  it("renders checkboxes based on preferences state", () => {
    vi.spyOn(preferencesMod, "useEffectsPreferences").mockReturnValue({
      preferences: { animationsEnabled: false, soundEnabled: true, introSkipped: false },
      loaded: true,
      updatePreference: updatePreferenceMock,
    });
    
    render(<EffectSettings />);
    const animCheckbox = screen.getByLabelText("Animacje") as HTMLInputElement;
    const soundCheckbox = screen.getByLabelText("Dźwięk") as HTMLInputElement;

    expect(animCheckbox.checked).toBe(false);
    expect(soundCheckbox.checked).toBe(true);
  });

  it("calls updatePreference on toggle", () => {
    vi.spyOn(preferencesMod, "useEffectsPreferences").mockReturnValue({
      preferences: { animationsEnabled: false, soundEnabled: true, introSkipped: false },
      loaded: true,
      updatePreference: updatePreferenceMock,
    });
    
    render(<EffectSettings />);
    const animCheckbox = screen.getByLabelText("Animacje");
    fireEvent.click(animCheckbox);
    expect(updatePreferenceMock).toHaveBeenCalledWith({ animationsEnabled: true });

    const soundCheckbox = screen.getByLabelText("Dźwięk");
    fireEvent.click(soundCheckbox);
    expect(updatePreferenceMock).toHaveBeenCalledWith({ soundEnabled: false });
  });
});
