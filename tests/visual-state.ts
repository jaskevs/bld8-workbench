import type { Page } from '@playwright/test';
/** Check the resting interface after fonts and finite entrance animations settle. */
export async function settleVisualState(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => {
    const finite = document.getAnimations().filter(animation => animation.effect?.getComputedTiming().iterations !== Infinity);
    await Promise.all(finite.map(animation => animation.finished.catch(() => {})));
  });
}
