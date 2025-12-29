import { test, expect } from "@playwright/test";

test.describe("Gas Profiler", () => {
  test("displays gas profiler page", async ({ page }) => {
    await page.goto("/gas");
    await expect(page.getByText("Gas Profiler")).toBeVisible();
  });

  test("shows load demo button when no profile", async ({ page }) => {
    await page.goto("/gas");
    await expect(
      page.getByRole("button", { name: /load demo profile/i })
    ).toBeVisible();
  });

  test("loads demo profile", async ({ page }) => {
    await page.goto("/gas");
    await page.getByRole("button", { name: /load demo profile/i }).click();
    // After loading, should see gas overview
    await expect(page.getByText(/total gas/i)).toBeVisible();
  });
});
