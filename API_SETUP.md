# IZO-KING API setup (daily insights)

## 1) Create an API key (choose one)

### Option A — xAI (Grok) recommended
1. Open https://console.x.ai/
2. Create an API key
3. Copy it (starts with `xai-...`)

### Option B — OpenAI
1. Open https://platform.openai.com/api-keys
2. Create a key

## 2) Add keys in Vercel
Project: **izo-king-storefront** → Settings → Environment Variables

| Name | Value | Environments |
|------|--------|--------------|
| `XAI_API_KEY` | your xAI key | Production |
| or `OPENAI_API_KEY` | your OpenAI key | Production |
| `CRON_SECRET` | random long string | Production |
| `GITHUB_TOKEN` | GitHub PAT with `repo` scope (optional, auto-publish) | Production |

## 3) Cron
Configured in `vercel.json`:
- Path: `/api/daily-insight`
- Schedule: `0 8 * * *` (08:00 UTC daily)

## 4) Test manually
```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://izo-king-studio.vercel.app/api/daily-insight
```

Without keys the endpoint returns 503 with a clear hint.
