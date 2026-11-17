import chromium from '@sparticuz/chromium';
import { chromium as playwright, type Browser, type Page } from 'playwright-core';

/**
 * One browser per agent run. Launched lazily on the first browser tool call and
 * closed when the run ends. On Vercel we use the serverless Chromium build; locally
 * set CHROME_PATH to a Chrome/Chromium binary.
 */
export class BrowserSession {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async getPage(): Promise<Page> {
    if (this.page) return this.page;
    const onServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
    this.browser = await playwright.launch({
      headless: true,
      executablePath: onServerless ? await chromium.executablePath() : process.env.CHROME_PATH,
      args: onServerless ? chromium.args : [],
    });
    const context = await this.browser.newContext({ viewport: { width: 1280, height: 800 } });
    this.page = await context.newPage();
    this.page.setDefaultTimeout(15_000);
    return this.page;
  }

  async close() {
    await this.browser?.close().catch(() => {});
    this.browser = null;
    this.page = null;
  }
}
