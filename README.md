# Blog Project

This is a blog project built with TypeScript and React. It uses Cloudflare Workers for deployment and Tailwind CSS for styling.

## Installation

```txt
npm install
npm run dev
```

## Deployment

```txt
npm run deploy
```

## Type Generation

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```txt
npm run cf-typegen
```

Pass the `CloudflareBindings` as generics when instantiation `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>()
```
