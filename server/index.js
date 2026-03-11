/**
 * TikTok Shop Partner API proxy server.
 * Keeps app secret server-side; frontend calls /api/tiktok/* which this handles.
 * Run: node server/index.js (or npm run server)
 */
import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const APP_KEY = process.env.TIKTOK_SHOP_APP_KEY;
const APP_SECRET = process.env.TIKTOK_SHOP_APP_SECRET;
const API_BASE = process.env.TIKTOK_SHOP_API_BASE || "https://partner-api.tiktokshop.com";

function requireTiktokConfig(req, res, next) {
  if (!APP_KEY || !APP_SECRET) {
    return res.status(503).json({
      error: "TikTok Shop API not configured",
      message: "Set TIKTOK_SHOP_APP_KEY and TIKTOK_SHOP_APP_SECRET in .env",
    });
  }
  next();
}

/** Get access token - tries TikTok Shop auth first, then Open API. */
async function getAccessToken() {
  const shopBody = new URLSearchParams({
    app_key: APP_KEY,
    app_secret: APP_SECRET,
    grant_type: "client_credentials",
  });

  let res = await fetch("https://auth.tiktok-shop.com/api/v2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: shopBody.toString(),
  });

  let data = await res.json().catch(() => ({}));
  let token = data.access_token ?? data.data?.access_token;

  if (!token) {
    const openBody = new URLSearchParams({
      client_key: APP_KEY,
      client_secret: APP_SECRET,
      grant_type: "client_credentials",
    });
    res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: openBody.toString(),
    });
    data = await res.json().catch(() => ({}));
    token = data.data?.access_token ?? data.access_token;
  }

  if (!res.ok) {
    const msg = data.message ?? data.error_description ?? data.error?.message ?? res.statusText;
    throw new Error(`TikTok token failed: ${msg}`);
  }
  if (!token) throw new Error("TikTok token response missing access_token");
  return token;
}

/** GET /api/tiktok/token - for debugging (returns ok + expires_in, not the token in body for security). */
app.get("/api/tiktok/token", requireTiktokConfig, async (req, res) => {
  try {
    const token = await getAccessToken();
    res.json({ ok: true, expires_in: 7200 });
  } catch (e) {
    res.status(502).json({ ok: false, error: e.message });
  }
});

/** GET /api/tiktok/creators - fetch creators from TikTok Shop API and normalize for our UI. */
app.get("/api/tiktok/creators", requireTiktokConfig, async (req, res) => {
  try {
    const token = await getAccessToken();
    const path = process.env.TIKTOK_SHOP_CREATOR_PATH || "/open_api/202309/affiliate/creator/list";
    const url = `${API_BASE}${path}`;

    const apiRes = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await apiRes.json().catch(() => ({}));

    if (!apiRes.ok) {
      const msg = data.message || data.error?.message || apiRes.statusText;
      return res.status(apiRes.status >= 400 ? apiRes.status : 502).json({
        error: "TikTok API request failed",
        message: msg,
        hint: "Check TIKTOK_SHOP_API_BASE and TIKTOK_SHOP_CREATOR_PATH in .env against Partner Center docs.",
      });
    }

    const list = data.data?.creators ?? data.creators ?? data.data ?? (Array.isArray(data) ? data : []);
    const creators = Array.isArray(list) ? list : [];

    const normalized = creators.map((c, i) => ({
      id: c.creator_id ?? c.id ?? c.open_id ?? `tiktok-${i}`,
      handle: c.username ?? c.unique_id ?? c.handle ?? `@creator_${i}`,
      full_name: c.display_name ?? c.nickname ?? c.full_name ?? null,
      platform: "tiktok",
      follower_count: c.follower_count ?? c.followers ?? 0,
      engagement_rate: c.engagement_rate ?? 0,
      avg_views: c.avg_views ?? c.average_views ?? 0,
      gmv_tier: mapGmvTier(c.gmv_tier ?? c.gmv_tier_30d),
      niche: Array.isArray(c.niche) ? c.niche : c.niche ? [c.niche] : [],
      avatar_url: c.avatar_url ?? c.avatar ?? null,
      profile_url: c.profile_url ?? (c.username ? `https://tiktok.com/@${c.username}` : null),
      last_active: c.last_active ?? c.updated_at ?? null,
      post_fulfill_rate: c.post_fulfill_rate ?? c.fulfill_rate ?? null,
      gmv_30d: c.gmv_30d ?? c.gmv_last_30_days ?? null,
    }));

    res.json({ creators: normalized, total: normalized.length });
  } catch (e) {
    res.status(500).json({ error: "TikTok creators fetch failed", message: e.message });
  }
});

function mapGmvTier(v) {
  if (v == null || v === "") return "none";
  const s = String(v).toLowerCase();
  if (s.includes("100k") || s.includes("100k_plus")) return "100k_plus";
  if (s.includes("25k") || s.includes("25k_100k")) return "25k_100k";
  if (s.includes("5k_25k") || s.includes("5k")) return "5k_25k";
  if (s.includes("under_5k") || s.includes("under")) return "under_5k";
  return "none";
}

const PORT = process.env.TIKTOK_API_PORT || 3001;
app.listen(PORT, () => {
  console.log(`TikTok API proxy running at http://localhost:${PORT}`);
  if (!APP_KEY || !APP_SECRET) console.warn("TikTok credentials missing in .env - /api/tiktok/* will return 503.");
});
