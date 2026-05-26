import { expect, test } from "@playwright/test";

test.describe("Kanban board", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("loads with five columns and dummy data", async ({ page }) => {
    await expect(page.getByTestId("kanban-board")).toBeVisible();
    await expect(page.getByTestId("column-col-1")).toBeVisible();
    await expect(page.getByTestId("column-col-5")).toBeVisible();
    await expect(page.getByTestId("card-card-1")).toBeVisible();
    await expect(page.getByText("Research competitors")).toBeVisible();
  });

  test("renames a column", async ({ page }) => {
    const column = page.getByTestId("column-col-1");
    await column.getByTestId("column-title-button").click();
    const input = column.getByTestId("column-title-input");
    await input.fill("Sprint Backlog");
    await input.press("Enter");
    await expect(column.getByRole("heading", { name: "Sprint Backlog" })).toBeVisible();
  });

  test("adds a card to a column", async ({ page }) => {
    const column = page.getByTestId("column-col-1");
    await column.getByTestId("add-card-toggle").click();
    await column.getByTestId("add-card-title").fill("E2E Task");
    await column.getByTestId("add-card-details").fill("Created by Playwright");
    await column.getByTestId("add-card-submit").click();

    await expect(column.getByText("E2E Task")).toBeVisible();
    await expect(column.getByText("Created by Playwright")).toBeVisible();
  });

  test("deletes a card", async ({ page }) => {
    const card = page.getByTestId("card-card-1");
    await expect(card).toBeVisible();
    await page.getByTestId("delete-card-card-1").click();
    await expect(page.getByTestId("card-card-1")).not.toBeVisible();
  });

  test("drags a card to another column", async ({ page }) => {
    const handle = page.getByTestId("card-card-1");
    const destColumn = page.getByTestId("column-cards-col-2");

    await handle.hover();
    await page.mouse.down();
    const destBox = await destColumn.boundingBox();
    if (!destBox) throw new Error("Destination column not found");
    await page.mouse.move(destBox.x + destBox.width / 2, destBox.y + 80, {
      steps: 15,
    });
    await page.mouse.up();

    await expect(page.getByTestId("column-col-2").getByTestId("card-card-1")).toBeVisible();
    await expect(page.getByTestId("column-col-1").getByTestId("card-card-1")).not.toBeVisible();
  });

  test("reorders a card within a column", async ({ page }) => {
    const column = page.getByTestId("column-col-1");
    const firstHandle = page.getByTestId("card-card-1");
    const secondCard = column.getByTestId("card-card-2");

    await firstHandle.hover();
    await page.mouse.down();
    const targetBox = await secondCard.boundingBox();
    if (!targetBox) throw new Error("Target card not found");
    await page.mouse.move(
      targetBox.x + targetBox.width / 2,
      targetBox.y + targetBox.height - 4,
      { steps: 15 },
    );
    await page.mouse.up();

    const titles = await column.locator("[data-testid^='card-card-'] h3").allTextContents();
    expect(titles[0]).toBe("Draft project brief");
    expect(titles[1]).toBe("Research competitors");
  });
});
