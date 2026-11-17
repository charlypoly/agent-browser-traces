import { randomUUID } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sparticuz from '@sparticuz/chromium';
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright-core';

const TRACE_DIR = process.env.TRACE_DIR ?? (process.env.VERCEL ? '/tmp/traces' : '.traces');

/**
 * One browser per agent run, with a Playwright trace recorded for the whole run.
 * On Vercel we use @sparticuz/chromium; locally Playwright's own Chromium
 * (`npx playwright install chromium`) or CHROME_PATH.
 */
export class BrowserSession {
  readonly runId = randomUUID();
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;

  async getPage(): Promise<Page> {
    if (this.page) return this.page;
    const onServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
    this.browser = await chromium.launch({
      headless: true,
      executablePath: onServerless
        ? await sparticuz.executablePath()
        : process.env.CHROME_PATH || undefined,
      args: onServerless ? sparticuz.args : [],
    });
    this.context = await this.browser.newContext({ viewport: { width: 1280, height: 800 } });
    await this.context.tracing.start({ screenshots: true, snapshots: true, sources: false });
    this.page = await this.context.newPage();
    this.page.setDefaultTimeout(15_000);
    return this.page;
  }

  async close() {
    if (this.context) {
      await mkdir(TRACE_DIR, { recursive: true });
      const file = path.join(TRACE_DIR, `${this.runId}.zip`);
      await this.context.tracing.stop({ path: file }).catch(() => {});
      console.log(`[browser] trace saved: ${file}`);
    }
    await this.browser?.close().catch(() => {});
    this.browser = null;
    this.context = null;
    this.page = null;
  }
}
