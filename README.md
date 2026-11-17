# Task Agent

A chat agent built with Next.js (App Router) and the Vercel AI SDK. The agent runs
server-side in `src/app/api/chat/route.ts` and can call tools defined in
`src/lib/tools/`.

## Getting started

```bash
npm install
cp .env.example .env.local   # add your AI Gateway key
npm run dev
```

Open http://localhost:3000.

## Project layout

- `src/lib/agent.ts`: model, system prompt and agent loop (`streamText` with tools)
- `src/lib/tools/`: tools the agent can call (`browser.ts`: open, click, type, read)
- `src/lib/browser/session.ts`: headless Chromium per agent run (`@sparticuz/chromium` on Vercel, Playwright's Chromium locally), with a Playwright trace per run
- `src/app/api/chat/route.ts`: streaming chat endpoint
- `src/app/page.tsx`: chat UI (`useChat`)

## Deploy

The app is deployed on Vercel. Push to `main` to deploy; set `AI_GATEWAY_API_KEY`
(or use the Vercel AI Gateway OIDC token) in the project settings.

## Debugging browser runs

Every agent run records a Playwright trace (actions, DOM snapshots, screenshots).
Locally traces are written to `.traces/<runId>.zip`; on Vercel to `/tmp/traces`.
The run id is logged as `[browser] trace saved: ...`.

```bash
npx playwright show-trace .traces/<runId>.zip
```
