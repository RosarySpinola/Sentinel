import { test, expect } from "@playwright/test";

test.describe("Debugger", () => {
  test("displays debugger page", async ({ page }) => {
    await page.goto("/debugger");
    await expect(page.getByText("Visual Debugger")).toBeVisible();
  });

  test("shows load demo button when no session", async ({ page }) => {
    await page.goto("/debugger");
    await expect(
      page.getByRole("button", { name: /load demo session/i })
    ).toBeVisible();
  });

  test("loads demo session", async ({ page }) => {
    await page.goto("/debugger");
    await page.getByRole("button", { name: /load demo session/i }).click();
    // After loading demo, step controls should be visible
    await expect(page.getByText(/step/i)).toBeVisible();
  });
});
