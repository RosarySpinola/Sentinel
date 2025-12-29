import { test, expect } from "@playwright/test";

test.describe("Prover", () => {
  test("displays prover page", async ({ page }) => {
    await page.goto("/prover");
    await expect(page.getByText("Move Prover")).toBeVisible();
  });

  test("shows code textarea", async ({ page }) => {
    await page.goto("/prover");
    // Check for textarea with Move code
    await expect(page.locator("textarea")).toBeVisible();
  });

  test("has run prover button", async ({ page }) => {
    await page.goto("/prover");
    await expect(
      page.getByRole("button", { name: /run prover/i })
    ).toBeVisible();
  });
});
