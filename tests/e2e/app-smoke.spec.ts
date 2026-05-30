import { expect, test, type Page } from "@playwright/test";

async function startStudentSession(page: Page) {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();

  await expect(page.locator("#student-id")).toBeVisible();
  await page.locator("#student-id").fill("2026123456");
  await page.locator(".primary-button").click();
  await expect(page.locator(".task-choice")).toBeVisible();
}

async function openCheckout(page: Page) {
  await startStudentSession(page);
  await page.locator(".checkout-task").click();
  await expect(page.locator(".device-picker")).toBeVisible();
  await page.locator(".device-card-active").click();
  await expect(page.getByRole("heading", { name: "Laptop checkout" })).toBeVisible();
}

test.describe("student entry flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();
  });

  test("starts at student number login and opens task launcher", async ({ page }) => {
    await expect(page.locator("#student-id")).toBeVisible();

    await page.locator("#student-id").fill("2026123456");
    await page.locator(".primary-button").click();

    await expect(page.locator(".task-choice")).toBeVisible();
    await expect(page.getByText("2026123456")).toBeVisible();
    await expect(page.locator(".checkout-task")).toBeVisible();
    await expect(page.locator(".return-task")).toBeVisible();
    await expect(page.locator(".task-image")).toHaveCount(0);

    await page.locator(".checkout-task").click();
    await expect(page.locator(".device-picker")).toBeVisible();
    await expect(page.locator(".device-back-button")).toBeVisible();
    await expect(page.locator(".device-card-active")).toBeVisible();

    await page.screenshot({
      path: "tests/results/device-picker-back.png",
      fullPage: true,
    });

    await page.locator(".device-back-button").click();
    await expect(page.locator(".task-choice")).toBeVisible();

    await page.screenshot({
      path: "tests/results/student-session-home.png",
      fullPage: true,
    });
  });

  test("shows validation for invalid student number", async ({ page }) => {
    await page.locator("#student-id").fill("abc");
    await page.locator(".primary-button").click();

    await expect(page.locator("#student-id-error")).toBeVisible();
  });
});

test.describe("checkout flow", () => {
  test("checks a laptop and completes mock checkout", async ({ page }) => {
    await openCheckout(page);

    await expect(page.locator(".checkout-panel").getByText("2026123456")).toBeVisible();

    await page.locator("#checkout-laptop-id").fill("LIB-203");
    await page.getByRole("button", { name: "Check status" }).click();
    await expect(page.getByText("This laptop is available. You can complete checkout.")).toBeVisible();

    await page.getByRole("button", { name: "Complete checkout" }).click();
    await expect(page.getByText(/is now checked out to student 2026123456/)).toBeVisible();

    await page.screenshot({
      path: "tests/results/checkout-success.png",
      fullPage: true,
    });
  });

  test("shows unavailable laptop guidance", async ({ page }) => {
    await openCheckout(page);

    await page.locator("#checkout-laptop-id").fill("LIB-101");
    await page.getByRole("button", { name: "Check status" }).click();

    await expect(page.getByText("This laptop is already checked out.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Complete checkout" })).toBeDisabled();
  });
});
