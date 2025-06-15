import { Page } from "playwright";

export const waitForNetworkIdle = async (page?: Page, timeout = 30000) => {
  if (!page) return;

  try {
    await page.waitForLoadState("networkidle", { timeout });
  } catch (_error) {
    await page.waitForTimeout(timeout);
  }
};
