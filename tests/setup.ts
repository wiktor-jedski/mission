import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

if (typeof window !== "undefined" && window.HTMLMediaElement) {
  window.HTMLMediaElement.prototype.play = vi.fn().mockReturnValue(Promise.resolve());
  window.HTMLMediaElement.prototype.pause = vi.fn();
}
