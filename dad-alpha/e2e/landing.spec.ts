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

  test("Household Ops feature section is present", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/household ops/i).first()).toBeVisible();
  });

  test("Family Pro pricing tier includes household ops", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/household ops hub/i)).toBeVisible();
  });

  test("Google Calendar feature is mentioned", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/google calendar/i).first()).toBeVisible();
  });

  test("FAQ includes household ops question", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/what is household ops/i)).toBeVisible();
  });
});
