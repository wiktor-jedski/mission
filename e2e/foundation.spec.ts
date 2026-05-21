import { expect, test } from "@playwright/test";

test("loads the foundation page", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { level: 1, name: "Mission Treasure Hunt" })
  ).toBeVisible();
  await expect(page.getByText("Foundation app shell is ready.")).toBeVisible();
});
