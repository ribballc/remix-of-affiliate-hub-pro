# TikTok Shop API Proxy

Keeps your **App Secret** server-side. The frontend calls `/api/tiktok/*`; Vite proxies these to this server.

## Run

```bash
# From project root
npm run server
```

Runs at `http://localhost:3001`. Start the Vite dev server as usual (`npm run dev`); requests to `http://localhost:8080/api/tiktok/*` are proxied to this server.

## Env

Copy `.env.example` to `.env` and set:

- `TIKTOK_SHOP_APP_KEY` – from [TikTok Shop Partner Center](https://partner.tiktokshop.com) → Apps & Services
- `TIKTOK_SHOP_APP_SECRET` – same (never commit; rotate if exposed)

Optional:

- `TIKTOK_SHOP_API_BASE` – override API base URL (default: `https://partner-api.tiktokshop.com`)
- `TIKTOK_SHOP_CREATOR_PATH` – path for creator/list (default: `/open_api/202309/affiliate/creator/list`). Update from [Partner Center docs](https://partner.tiktokshop.com/docv2/page/get-open-collaboration-creator-content-detail-202508) if your endpoint differs.
- `TIKTOK_API_PORT` – default `3001`

## Endpoints

- `GET /api/tiktok/token` – check token (returns `{ ok, expires_in }`)
- `GET /api/tiktok/creators` – fetch creators and return normalized list for the Creator Feed UI
