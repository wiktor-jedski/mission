import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { IntroOverlay } from "../components/player/IntroOverlay";
import * as preferencesMod from "../lib/player/preferences";

describe("IntroOverlay", () => {
  const updatePreferenceMock = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    updatePreferenceMock.mockClear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null if not loaded or if intro skipped", () => {
    vi.spyOn(preferencesMod, "useEffectsPreferences").mockReturnValue({
      preferences: { animationsEnabled: true, soundEnabled: true, introSkipped: true },
      loaded: true,
      updatePreference: updatePreferenceMock,
    });
    
    const { container } = render(<IntroOverlay />);
    expect(container.firstChild).toBeNull();
  });

  it("renders intro when forced visible even if previously skipped", () => {
    vi.spyOn(preferencesMod, "useEffectsPreferences").mockReturnValue({
      preferences: { animationsEnabled: true, soundEnabled: true, introSkipped: true },
      loaded: true,
      updatePreference: updatePreferenceMock,
    });

    render(<IntroOverlay forceVisible />);
    expect(screen.getByText("Władca Blantów: Drużyna Ciśnienia")).toBeDefined();
  });

  it("dismisses forced visible intro after continue", () => {
    vi.spyOn(preferencesMod, "useEffectsPreferences").mockReturnValue({
      preferences: { animationsEnabled: false, soundEnabled: true, introSkipped: true },
      loaded: true,
      updatePreference: updatePreferenceMock,
    });

    render(<IntroOverlay forceVisible />);
    fireEvent.click(screen.getByText("Rozpocznij misję"));

    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(screen.queryByText("Rozpocznij misję")).toBeNull();
  });

  it("renders intro when not skipped", () => {
    vi.spyOn(preferencesMod, "useEffectsPreferences").mockReturnValue({
      preferences: { animationsEnabled: true, soundEnabled: true, introSkipped: false },
      loaded: true,
      updatePreference: updatePreferenceMock,
    });
    
    render(<IntroOverlay />);
    expect(screen.getByText("Władca Blantów: Drużyna Ciśnienia")).toBeDefined();
    expect(screen.getByText(/W Krainie Gastro, gdzie czerwone ślepia/)).toBeDefined();
    expect(screen.getByText("Rozpocznij misję")).toBeDefined();
    expect(screen.queryByText("Pomiń wstęp")).toBeNull();
  });

  it("triggers fade out and updates preferences on continue", () => {
    vi.spyOn(preferencesMod, "useEffectsPreferences").mockReturnValue({
      preferences: { animationsEnabled: true, soundEnabled: true, introSkipped: false },
      loaded: true,
      updatePreference: updatePreferenceMock,
    });
    
    const { container } = render(<IntroOverlay />);
    const continueBtn = screen.getByText("Rozpocznij misję");
    
    fireEvent.click(continueBtn);
    
    // With animations enabled, it should set fade out, wait 500ms
    expect(updatePreferenceMock).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(updatePreferenceMock).toHaveBeenCalledWith({ introSkipped: true });
  });

  it("triggers update immediately when animations disabled", () => {
    vi.spyOn(preferencesMod, "useEffectsPreferences").mockReturnValue({
      preferences: { animationsEnabled: false, soundEnabled: true, introSkipped: false },
      loaded: true,
      updatePreference: updatePreferenceMock,
    });
    
    render(<IntroOverlay />);
    const continueBtn = screen.getByText("Rozpocznij misję");
    
    fireEvent.click(continueBtn);
    
    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(updatePreferenceMock).toHaveBeenCalledWith({ introSkipped: true });
  });
});
