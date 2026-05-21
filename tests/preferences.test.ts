// @vitest-environment jsdom
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { useEffectsPreferences, getStoredPreferences, savePreferences, useReducedMotion } from "../lib/player/preferences";

describe("preferences.ts", () => {
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    mockStorage = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key) => mockStorage[key] || null),
        setItem: vi.fn((key, value) => { mockStorage[key] = value; }),
        clear: vi.fn(() => { mockStorage = {}; }),
      },
      writable: true
    });
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("handles getStoredPreferences when storage is empty", () => {
    expect(getStoredPreferences()).toEqual({});
  });

  it("handles getStoredPreferences with malformed data", () => {
    window.localStorage.setItem("mission_effects_prefs", "{invalid}");
    expect(getStoredPreferences()).toEqual({});
  });

  it("handles getStoredPreferences with valid JSON but missing/wrong typed properties", () => {
    window.localStorage.setItem("mission_effects_prefs", JSON.stringify({
      animationsEnabled: "yes",
      soundEnabled: 1,
      introSkipped: null
    }));
    expect(getStoredPreferences()).toEqual({
      animationsEnabled: undefined,
      soundEnabled: undefined,
      introSkipped: undefined,
    });
  });

  it("handles getStoredPreferences when window is undefined", () => {
    const originalWindow = global.window;
    // @ts-ignore
    delete global.window;
    expect(getStoredPreferences()).toEqual({});
    global.window = originalWindow;
  });

  it("handles getStoredPreferences when storage throws", () => {
    const getItemSpy = vi.spyOn(window.localStorage, "getItem").mockImplementation(() => { throw new Error(); });
    expect(getStoredPreferences()).toEqual({});
    getItemSpy.mockRestore();
  });

  it("handles savePreferences when storage throws", () => {
    const setItemSpy = vi.spyOn(window.localStorage, "setItem").mockImplementation(() => { throw new Error(); });
    expect(() => savePreferences({ introSkipped: true })).not.toThrow();
    setItemSpy.mockRestore();
  });

  it("handles savePreferences when window is undefined", () => {
    const originalWindow = global.window;
    // @ts-ignore
    delete global.window;
    expect(() => savePreferences({ introSkipped: true })).not.toThrow();
    global.window = originalWindow;
  });

  it("gets and saves preferences correctly", () => {
    savePreferences({ animationsEnabled: false, soundEnabled: false, introSkipped: true });
    expect(getStoredPreferences()).toEqual({
      animationsEnabled: false,
      soundEnabled: false,
      introSkipped: true,
    });
  });

  it("useReducedMotion detects prefers-reduced-motion: reduce", () => {
    let changeHandler: any;
    const addEventListenerMock = vi.fn((event, handler) => { changeHandler = handler; });
    const removeEventListenerMock = vi.fn();
    
    vi.stubGlobal("matchMedia", vi.fn().mockImplementation((query) => ({
      matches: query.includes("reduce"),
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
    })));

    const { result, unmount } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);

    act(() => {
      changeHandler({ matches: false });
    });
    expect(result.current).toBe(false);

    unmount();
    expect(removeEventListenerMock).toHaveBeenCalled();
  });

  it("useReducedMotion falls back to addListener for older browsers", () => {
    let changeHandler: any;
    const addListenerMock = vi.fn((handler) => { changeHandler = handler; });
    const removeListenerMock = vi.fn();
    
    vi.stubGlobal("matchMedia", vi.fn().mockImplementation((query) => ({
      matches: false,
      addListener: addListenerMock,
      removeListener: removeListenerMock,
    })));

    const { result, unmount } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);

    act(() => {
      changeHandler({ matches: true });
    });
    expect(result.current).toBe(true);

    unmount();
    expect(removeListenerMock).toHaveBeenCalled();
  });

  it("useEffectsPreferences initializes with defaults correctly without reduced motion", () => {
    vi.stubGlobal("matchMedia", vi.fn().mockImplementation(() => ({
      matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn(),
    })));

    const { result } = renderHook(() => useEffectsPreferences());
    expect(result.current.preferences).toEqual({
      animationsEnabled: true,
      soundEnabled: true,
      introSkipped: false,
    });
    expect(result.current.loaded).toBe(true);
  });

  it("useEffectsPreferences initializes with defaults correctly with reduced motion", () => {
    vi.stubGlobal("matchMedia", vi.fn().mockImplementation(() => ({
      matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn(),
    })));

    const { result } = renderHook(() => useEffectsPreferences());
    expect(result.current.preferences).toEqual({
      animationsEnabled: false,
      soundEnabled: true,
      introSkipped: false,
    });
  });

  it("useEffectsPreferences loads from storage", () => {
    vi.stubGlobal("matchMedia", vi.fn().mockImplementation(() => ({
      matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn(),
    })));
    savePreferences({ animationsEnabled: false, introSkipped: true });

    const { result } = renderHook(() => useEffectsPreferences());
    expect(result.current.preferences).toEqual({
      animationsEnabled: false,
      soundEnabled: true,
      introSkipped: true,
    });
  });

  it("useEffectsPreferences updates preference and saves", () => {
    vi.stubGlobal("matchMedia", vi.fn().mockImplementation(() => ({
      matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn(),
    })));

    const { result } = renderHook(() => useEffectsPreferences());
    act(() => {
      result.current.updatePreference({ soundEnabled: false });
    });

    expect(result.current.preferences.soundEnabled).toBe(false);
    expect(getStoredPreferences().soundEnabled).toBe(false);
  });
});
