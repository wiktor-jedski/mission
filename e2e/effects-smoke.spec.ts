import { test, expect } from "@playwright/test";

test.describe("Phase 7 Effects Smoke", () => {
  test("Intro screen skip and settings toggle", async ({ page }) => {
    // Navigate to player home
    await page.goto("/");
    
    // Intro screen should be visible
    const introHeading = page.getByRole("heading", { name: "Rozdział 1" });
    await expect(introHeading).toBeVisible();

    // Skip intro
    await page.getByRole("button", { name: "Pomiń wstęp" }).click();

    // Verify intro disappears and we see login or home
    await expect(introHeading).not.toBeVisible();
    await expect(page.getByRole("heading", { name: "Misja: Poszukiwanie Skarbu" })).toBeVisible();

    // Effect settings should be present in player shell (e.g. after login, wait, home page has settings)
    const animToggle = page.getByLabel("Animacje");
    const soundToggle = page.getByLabel("Dźwięk");
    
    await expect(animToggle).toBeVisible();
    await expect(soundToggle).toBeVisible();

    // Toggle them to ensure they are interactive
    await soundToggle.uncheck();
    await expect(soundToggle).not.toBeChecked();

    // Wait for the 500ms fade-out timeout to save to localStorage
    await page.waitForTimeout(600);

    // Refresh and ensure state is saved
    await page.reload();
    await expect(page.getByLabel("Dźwięk")).not.toBeChecked();
    await expect(page.getByRole("heading", { name: "Rozdział 1" })).not.toBeVisible(); // Intro should remain skipped
  });

  test("Reduced motion sets animations off by default", async ({ page }) => {
    // Emulate reduced motion
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    
    // Wait for settings to load
    const animToggle = page.getByLabel("Animacje");
    await expect(animToggle).toBeVisible();

    // Should be off by default due to reduced motion
    await expect(animToggle).not.toBeChecked();
  });
});
