# Cloudflare Deployment

The app is configured for Cloudflare Workers static assets through `wrangler.jsonc`.

Cloudflare's dashboard Git builder may occasionally get stuck at `Initializing build environment`. To avoid depending on that builder, deployment is handled by GitHub Actions after CI passes.

## GitHub Secrets

Add these repository secrets in GitHub:

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
```

The API token should be allowed to deploy the `pixies-soundscope` Worker.

## Workflow

On every push to `main`:

1. `CI` runs lint, build, tests, and dependency audit.
2. `Deploy to Cloudflare` runs only if CI succeeds.
3. The deploy workflow builds the Vite app and runs:

```bash
npm run deploy
```

That command uses Wrangler to upload `dist` as Worker static assets.

## Cloudflare Settings

The Worker should have the route:

```text
pixies.ofeklabs.dev
```

The repo contains:

```text
wrangler.jsonc
```

with:

```json
{
  "name": "pixies-soundscope",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "single-page-application"
  }
}
```

Once GitHub Actions deployment is active, the Cloudflare dashboard Git build integration is optional. If it keeps hanging at `Initializing build environment`, disconnect the Worker build integration and let GitHub Actions deploy instead.

## Manual Fallback

If needed, deploy from a local terminal:

```bash
npm run build
npm run deploy
```
