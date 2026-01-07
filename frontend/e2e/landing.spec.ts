import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("loads and displays hero", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Sentinel")).toBeVisible();
    await expect(page.getByRole("link", { name: /launch app/i })).toBeVisible();
  });

  test("displays feature cards", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Transaction Simulator")).toBeVisible();
    await expect(page.getByText("Visual Debugger")).toBeVisible();
    await expect(page.getByText("Move Prover")).toBeVisible();
    await expect(page.getByText("Gas Profiler")).toBeVisible();
  });

  test("navigates to simulator", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("link", { name: /launch app/i })
      .first()
      .click();
    await expect(page).toHaveURL("/simulator");
  });
});
