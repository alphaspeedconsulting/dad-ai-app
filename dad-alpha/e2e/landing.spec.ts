import { expect, test } from "@playwright/test";

test.describe("marketing landing", () => {
  test("primary CTA navigates to signup login", async ({ page }) => {
    await page.goto("/");
    await page.locator('a[href="/login?mode=signup"]').first().click();
    await expect(page).toHaveURL(/\/login\?mode=signup/);
  });

  test("meet your team section is present", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /meet your team/i })).toBeVisible();
  });
});
