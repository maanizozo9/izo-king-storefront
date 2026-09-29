# Pinterest Marketing — setup

## 1. Create a Pinterest app
1. Go to https://developers.pinterest.com/
2. Create an app / trial access as required by Pinterest.
3. Set redirect URI exactly:
   `https://izo-king-studio.vercel.app/api/oauth/pinterest/callback`
4. Note **App ID** (client id) and **App secret**.

## 2. Vercel Environment Variables
In the Vercel project for `izo-king-studio`:

| Variable | Required | Notes |
|----------|----------|--------|
| `PINTEREST_CLIENT_ID` | yes | App ID |
| `PINTEREST_CLIENT_SECRET` | yes | App secret |
| `PINTEREST_REDIRECT_URI` | optional | Defaults to production callback URL |
| `SITE_URL` | recommended | `https://izo-king-studio.vercel.app` |
| `TOKEN_ENCRYPTION_KEY` | recommended | Long random string to encrypt tokens in cookies |
| `MARKETING_MODE` | yes for live | `test` (default) or `production` |

Redeploy after saving env vars.

## 3. Connect from the site
1. Open https://izo-king-studio.vercel.app/marketing-studio
2. Tab **Integrations** → **Connect Pinterest**
3. Approve scopes: boards + pins write
4. Pick a board, generate a draft, Approve
5. Only when `MARKETING_MODE=production` will **Publish to Pinterest** call the live API

## 4. Safety
- Tokens are stored in an **HttpOnly** cookie (encrypted), never in client JS source.
- Test mode never creates real pins.
- Pins need a public **https** image URL (product image from catalogue or site).
