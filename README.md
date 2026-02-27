# OpenSEO

OpenSEO is an open source SEO tool for people getting started with SEO, or teams that want something simpler than SEMrush or Ahrefs without paying for another monthly SaaS subscription.

![OpenSEO demo (placeholder)](https://placehold.co/1200x675?text=OpenSEO+Demo+GIF+Coming+Soon)

## Why Use This

- Open source and self-hostable.
- No OpenSEO subscription.
- You own your deployment and data.
- Focused workflows instead of a giant, complex SEO suite.

## Main SEO Workflows

- Keyword research
  - Find topics worth targeting, estimate demand, and prioritize what to write next.
- Domain insights
  - Understand where your domain is gaining or losing visibility so you can focus on the pages that move revenue.
- Audits
  - Catch technical issues early so your site is easier for search engines to crawl and rank.

## Pricing / Costs

OpenSEO is totally free to use. It works by pulling SEO data from DataForSEO, which is a paid third-party service unaffiliated with OpenSEO.

There are two separate things:

1. OpenSEO app cost: **$0 subscription**.
2. DataForSEO API usage: pay-as-you-go based on requests.

As of February 26, 2026, DataForSEO’s public docs/pricing pages say:

- New accounts include **$1 free credit** to test the API.
- The minimum top-up/payment is **$50**.

That means you can try OpenSEO for free with the starter credit, then decide if/when to top up.

For OpenSEO-specific, per-workflow request estimates, see the internal [SEO API Cost Reference](#seo-api-cost-reference).

For current endpoint pricing and cost calculators, check:

- [DataForSEO Pricing](https://dataforseo.com/pricing)
- [DataForSEO API Documentation](https://docs.dataforseo.com/v3/)

## DataForSEO API Key Setup

OpenSEO expects `DATAFORSEO_API_KEY` as a Basic Auth value.

1. Go to [DataForSEO API Access](https://app.dataforseo.com/api-access).
2. Request API credentials by email (`API key by email` or `API password by email`).
3. Use your DataForSEO login + API password, then base64 encode `login:password`:

```sh
printf '%s' 'YOUR_LOGIN:YOUR_PASSWORD' | base64
```

Set that output as `DATAFORSEO_API_KEY` in your environment/secrets.

Note: even though the env var is named `DATAFORSEO_API_KEY`, this app sends it as HTTP Basic auth, so the value should be the base64 form of `login:password`.

## Local Development

### Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io/)
- A Cloudflare account
- Every App gateway set up (see [Every App](https://github.com/every-app/every-app))
- A DataForSEO account/API credentials

### Run Locally (Quick Test)

1. Copy env template:

```sh
cp .env.example .env.local
```

2. Install and run:

```sh
pnpm install
pnpm dev
```

App runs on `http://localhost:3001` by default (or `PORT` from `.env.local`).

Running locally is the fastest way to test core flows. In the future, local mode will not include some Cloudflare-backed capabilities (for example cron-based rank tracking and infrastructure-powered performance improvements for heavier audits).

### Shared Dev Server Workflow (for coding agents)

```sh
# terminal 1: start once and keep running
pnpm dev:agents
```

- `pnpm dev:agents` mirrors output to `.logs/dev-server.log` (gitignored).
- The log file is overwritten on each run.
- If you need a different port, set `PORT` in `.env.local` and restart.

### Database Commands

Generate migration:

```sh
pnpm run db:generate
```

Migrate local DB:

```sh
pnpm run db:migrate:local
```

## Self Hosting (Deploy on Cloudflare)

OpenSEO is built on [Every App](https://github.com/every-app/every-app), a platform for easily self-hosting open source apps in your own Cloudflare account.

### Prerequisites

1. Install [Node.js](https://nodejs.org/) (includes `npx`).
2. Create a Cloudflare account: [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)
3. Authenticate Wrangler:

```sh
npx wrangler login
```

4. Deploy the Every App Gateway (one-time per account):

```sh
npx everyapp gateway deploy
```

Follow the link returned by that command to create your gateway account.

### Deploy OpenSEO

```sh
git clone https://github.com/bensenescu/super-seo.git
cd super-seo
npx everyapp app deploy
```

After deploy, set your DataForSEO secret:

```sh
npx wrangler secret put DATAFORSEO_API_KEY
```

When prompted, paste the base64 value of `login:password` (using your DataForSEO login + API password).

## Roadmap

Top priorities right now:

- Rank tracking
- AI content workflows

If something important is missing, please join the Discord and request it. We prioritize community demand first.
Discord: [Join the OpenSEO community](https://discord.gg/c9uGs3cFXr)

## Contributing

Contributions are very welcome.

- Open an issue for bugs, UX friction, or feature requests.
- Open a PR if you want to implement a feature directly.
- Community-driven improvements are prioritized, and high-quality PRs are encouraged.

If you want to contribute but are unsure where to start, open an issue and describe what you want to build.

## SEO API Cost Reference

Use this section to estimate DataForSEO spend per request type. OpenSEO itself remains free; these are API usage costs only.

### Pricing sources

- DataForSEO Labs pricing: https://dataforseo.com/pricing/dataforseo-labs/dataforseo-google-api
- Google PageSpeed Insights API docs: https://developers.google.com/speed/docs/insights/v5/get-started

### 1) Site audit

- No paid API calls in the current implementation.

### 2) Keyword research (`related` mode)

- Current billed cost pattern (from account usage logs):
  - `0.02 + (0.0001 x returned_keywords)` USD
- Default app setting: `150` results per search (`$0.035` each).
- Available result tiers:
  - 150 results = `$0.035`
  - 300 results = `$0.05`
  - 500 results = `$0.07`

### 3) Domain overview

- Standard domain overview request (with top 200 ranked keywords): `$0.0401` per domain.
- General formula if needed:
  - `0.0201 + (0.0001 x ranked_keywords_returned)` USD

### Planning examples

- 100 keyword research requests at the default 150 results: `$3.50`
- 100 keyword research requests at 500 results each: `$7.00`
- 100 domain overviews (200 ranked keywords each): `$4.01`
