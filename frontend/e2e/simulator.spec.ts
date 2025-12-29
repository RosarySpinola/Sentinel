import { test, expect } from "@playwright/test";

test.describe("Simulator", () => {
  test("displays simulation form", async ({ page }) => {
    await page.goto("/simulator");
    await expect(page.getByText("Transaction Simulator")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /simulate/i })
    ).toBeVisible();
  });

  test("shows network selector", async ({ page }) => {
    await page.goto("/simulator");
    // Check that network selection exists
    await expect(page.getByText(/network/i)).toBeVisible();
  });

  test("displays result area", async ({ page }) => {
    await page.goto("/simulator");
    // Results area should be present
    await expect(page.getByText(/simulation result/i)).toBeVisible();
  });
});
