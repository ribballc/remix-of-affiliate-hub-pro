# Supabase – Affiliate database

## Schema overview

- **affiliates** – Shared 1M+ affiliate table; all clients can `SELECT`. Writes via `service_role` (e.g. ingestion jobs).
- **clients** – Tenant table; `user_id` links to `auth.users` for RLS.
- **affiliate_segments** – Per-client segments with `filter_rules` (jsonb) and cached `affiliate_count`.
- **affiliate_segment_members** – Many-to-many segment ↔ affiliate; `added_by`: `manual` | `auto`.
- **client_affiliates** – Per-client relationship: status, GMV, commission, notes, outreach count.
- **outreach_campaigns** – Per-client campaigns; optional `segment_id`; `sequence_steps` (jsonb).

## RLS

- **affiliates**: `SELECT` for all `authenticated` users; `INSERT`/`UPDATE` only for `service_role`.
- **affiliate_segments**, **affiliate_segment_members**, **client_affiliates**, **outreach_campaigns**: rows are visible/writable only when `client_id = current_client_id()`, where `current_client_id()` returns `clients.id` for the row with `user_id = auth.uid()`.

Ensure each logged-in user has exactly one `clients` row with `user_id = auth.uid()` (e.g. create it in a sign-up trigger or app logic).

## Running migrations

```bash
npx supabase db push
# or
npx supabase migration up
```

## Indexes (1M+ scale)

Indexes are added for: FKs, `affiliates` (platform, follower_count, engagement_rate, gmv_tier, niche GIN, trigram on handle/full_name), and common filter/sort columns on segment and campaign tables.
