import { tool } from 'ai';
import { z } from 'zod';

export const tools = {
  getCurrentTime: tool({
    description: 'Get the current date and time in a given IANA time zone',
    inputSchema: z.object({
      timeZone: z.string().describe('IANA time zone, e.g. Europe/Paris'),
    }),
    execute: async ({ timeZone }) => ({
      timeZone,
      now: new Date().toLocaleString('en-US', { timeZone }),
    }),
  }),
  calculate: tool({
    description: 'Evaluate a basic arithmetic expression (+, -, *, /, parentheses)',
    inputSchema: z.object({
      expression: z.string().describe('Arithmetic expression, e.g. (12 * 4) / 3'),
    }),
    execute: async ({ expression }) => {
      if (!/^[\d\s+\-*/().]+$/.test(expression)) {
        return { error: 'Unsupported characters in expression' };
      }
      const value = Function(`"use strict"; return (${expression});`)();
      return { expression, value };
    },
  }),
};
