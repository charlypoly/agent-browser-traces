import { tool } from 'ai';
import { z } from 'zod';
import type { BrowserSession } from '../browser/session';

const MAX_TEXT = 6_000;

async function snapshot(session: BrowserSession) {
  const page = await session.getPage();
  const text = (await page.locator('body').innerText()).slice(0, MAX_TEXT);
  return { url: page.url(), title: await page.title(), text };
}

export function createBrowserTools(session: BrowserSession) {
  return {
    browserOpen: tool({
      description: 'Open a URL in the browser and return the page text',
      inputSchema: z.object({ url: z.string().url() }),
      execute: async ({ url }) => {
        const page = await session.getPage();
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        return snapshot(session);
      },
    }),
    browserClick: tool({
      description: 'Click an element, identified by its visible text or a CSS selector',
      inputSchema: z.object({
        text: z.string().optional().describe('Visible text of the element to click'),
        selector: z.string().optional().describe('CSS selector, if text is ambiguous'),
      }),
      execute: async ({ text, selector }) => {
        const page = await session.getPage();
        const target = selector ? page.locator(selector) : page.getByText(text ?? '', { exact: false });
        await target.first().click();
        await page.waitForLoadState('domcontentloaded');
        return snapshot(session);
      },
    }),
    browserType: tool({
      description: 'Fill a form field, identified by its label, placeholder or a CSS selector',
      inputSchema: z.object({
        field: z.string().describe('Label, placeholder or CSS selector of the field'),
        value: z.string(),
        submit: z.boolean().optional().describe('Press Enter after typing'),
      }),
      execute: async ({ field, value, submit }) => {
        const page = await session.getPage();
        const byLabel = page.getByLabel(field).or(page.getByPlaceholder(field));
        const target = (await byLabel.count()) > 0 ? byLabel.first() : page.locator(field).first();
        await target.fill(value);
        if (submit) await target.press('Enter');
        return snapshot(session);
      },
    }),
    browserRead: tool({
      description: 'Return the current page URL, title and text',
      inputSchema: z.object({}),
      execute: async () => snapshot(session),
    }),
  };
}
