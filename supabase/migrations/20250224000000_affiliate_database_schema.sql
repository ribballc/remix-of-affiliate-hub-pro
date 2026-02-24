-- =============================================================================
-- Affiliate database schema for 1M+ scale
-- Supabase: enums, tables, indexes, RLS
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- -----------------------------------------------------------------------------
-- ENUMS
-- -----------------------------------------------------------------------------
CREATE TYPE platform_type AS ENUM ('tiktok', 'instagram', 'youtube', 'email_only');

CREATE TYPE gmv_tier_type AS ENUM ('none', 'under_5k', '5k_25k', '25k_100k', '100k_plus');

CREATE TYPE segment_member_added_by AS ENUM ('manual', 'auto');

CREATE TYPE client_affiliate_status AS ENUM (
  'discovered',
  'invited',
  'responded',
  'sampling',
  'active',
  'top_performer',
  'churned'
);

CREATE TYPE outreach_campaign_status AS ENUM ('draft', 'active', 'paused', 'complete');

-- -----------------------------------------------------------------------------
-- CLIENTS (required for FKs and RLS; link auth.users to client_id)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);

-- -----------------------------------------------------------------------------
-- AFFILIATES (shared; all clients can read)
-- -----------------------------------------------------------------------------
CREATE TABLE affiliates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  handle text NOT NULL,
  full_name text,
  platform platform_type NOT NULL,
  follower_count bigint NOT NULL DEFAULT 0,
  following_count bigint NOT NULL DEFAULT 0,
  avg_views bigint,
  engagement_rate numeric(6, 4),
  gmv_tier gmv_tier_type NOT NULL DEFAULT 'none',
  niche text[] NOT NULL DEFAULT '{}',
  bio text,
  profile_url text,
  avatar_url text,
  email text,
  country text,
  language text,
  verified boolean NOT NULL DEFAULT false,
  last_active timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT affiliates_handle_platform_unique UNIQUE (handle, platform)
);

CREATE INDEX idx_affiliates_platform ON affiliates(platform);
CREATE INDEX idx_affiliates_follower_count ON affiliates(follower_count);
CREATE INDEX idx_affiliates_engagement_rate ON affiliates(engagement_rate);
CREATE INDEX idx_affiliates_gmv_tier ON affiliates(gmv_tier);
CREATE INDEX idx_affiliates_last_active ON affiliates(last_active);
CREATE INDEX idx_affiliates_created_at ON affiliates(created_at);
CREATE INDEX idx_affiliates_niche ON affiliates USING GIN (niche);
CREATE INDEX idx_affiliates_handle_trgm ON affiliates USING gin (handle gin_trgm_ops);
CREATE INDEX idx_affiliates_full_name_trgm ON affiliates USING gin (full_name gin_trgm_ops);

COMMENT ON TABLE affiliates IS 'Shared affiliate database; all clients can search/read.';

-- -----------------------------------------------------------------------------
-- AFFILIATE_SEGMENTS (per-client)
-- -----------------------------------------------------------------------------
CREATE TABLE affiliate_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  filter_rules jsonb NOT NULL DEFAULT '{}',
  affiliate_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_affiliate_segments_client_id ON affiliate_segments(client_id);
CREATE INDEX idx_affiliate_segments_created_at ON affiliate_segments(created_at);

COMMENT ON COLUMN affiliate_segments.filter_rules IS 'Filter criteria: niche, follower range, platform, etc.';

-- -----------------------------------------------------------------------------
-- AFFILIATE_SEGMENT_MEMBERS (per-segment)
-- -----------------------------------------------------------------------------
CREATE TABLE affiliate_segment_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  segment_id uuid NOT NULL REFERENCES affiliate_segments(id) ON DELETE CASCADE,
  affiliate_id uuid NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  added_at timestamptz NOT NULL DEFAULT now(),
  added_by segment_member_added_by NOT NULL DEFAULT 'manual',
  UNIQUE (segment_id, affiliate_id)
);

CREATE INDEX idx_affiliate_segment_members_segment_id ON affiliate_segment_members(segment_id);
CREATE INDEX idx_affiliate_segment_members_affiliate_id ON affiliate_segment_members(affiliate_id);

-- -----------------------------------------------------------------------------
-- CLIENT_AFFILIATES (per-client relationship + status & GMV)
-- -----------------------------------------------------------------------------
CREATE TABLE client_affiliates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  affiliate_id uuid NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  status client_affiliate_status NOT NULL DEFAULT 'discovered',
  gmv_generated numeric(14, 2) NOT NULL DEFAULT 0,
  commission_rate numeric(5, 2),
  notes text,
  last_contact timestamptz,
  outreach_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, affiliate_id)
);

CREATE INDEX idx_client_affiliates_client_id ON client_affiliates(client_id);
CREATE INDEX idx_client_affiliates_affiliate_id ON client_affiliates(affiliate_id);
CREATE INDEX idx_client_affiliates_status ON client_affiliates(client_id, status);
CREATE INDEX idx_client_affiliates_gmv ON client_affiliates(client_id, gmv_generated DESC);

-- -----------------------------------------------------------------------------
-- OUTREACH_CAMPAIGNS (per-client)
-- -----------------------------------------------------------------------------
CREATE TABLE outreach_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  segment_id uuid REFERENCES affiliate_segments(id) ON DELETE SET NULL,
  name text NOT NULL,
  status outreach_campaign_status NOT NULL DEFAULT 'draft',
  sequence_steps jsonb NOT NULL DEFAULT '[]',
  emails_sent int NOT NULL DEFAULT 0,
  dms_sent int NOT NULL DEFAULT 0,
  replies int NOT NULL DEFAULT 0,
  conversions int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_outreach_campaigns_client_id ON outreach_campaigns(client_id);
CREATE INDEX idx_outreach_campaigns_segment_id ON outreach_campaigns(segment_id);
CREATE INDEX idx_outreach_campaigns_status ON outreach_campaigns(client_id, status);

COMMENT ON COLUMN outreach_campaigns.sequence_steps IS 'Array of steps: email/DM templates, delays, etc.';

-- -----------------------------------------------------------------------------
-- TRIGGER: updated_at
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER affiliates_updated_at
  BEFORE UPDATE ON affiliates
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER affiliate_segments_updated_at
  BEFORE UPDATE ON affiliate_segments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER client_affiliates_updated_at
  BEFORE UPDATE ON client_affiliates
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER outreach_campaigns_updated_at
  BEFORE UPDATE ON outreach_campaigns
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- -----------------------------------------------------------------------------
-- RLS: Helper to resolve current user's client_id (requires clients.user_id)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION current_client_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM clients WHERE user_id = auth.uid() LIMIT 1;
$$;

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- -----------------------------------------------------------------------------
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_segment_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_campaigns ENABLE ROW LEVEL SECURITY;

-- Clients: users can read/update their own client row
CREATE POLICY "clients_select_own"
  ON clients FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "clients_update_own"
  ON clients FOR UPDATE
  USING (user_id = auth.uid());

-- Affiliates: all authenticated users can read (shared search); restrict write to service role
CREATE POLICY "affiliates_select_all"
  ON affiliates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "affiliates_insert_service"
  ON affiliates FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "affiliates_update_service"
  ON affiliates FOR UPDATE
  TO service_role
  USING (true);

-- Affiliate segments: client sees only their own
CREATE POLICY "affiliate_segments_select_own"
  ON affiliate_segments FOR SELECT
  USING (client_id = current_client_id());

CREATE POLICY "affiliate_segments_insert_own"
  ON affiliate_segments FOR INSERT
  WITH CHECK (client_id = current_client_id());

CREATE POLICY "affiliate_segments_update_own"
  ON affiliate_segments FOR UPDATE
  USING (client_id = current_client_id());

CREATE POLICY "affiliate_segments_delete_own"
  ON affiliate_segments FOR DELETE
  USING (client_id = current_client_id());

-- Segment members: client sees only members of their segments
CREATE POLICY "affiliate_segment_members_select_own"
  ON affiliate_segment_members FOR SELECT
  USING (
    segment_id IN (
      SELECT id FROM affiliate_segments WHERE client_id = current_client_id()
    )
  );

CREATE POLICY "affiliate_segment_members_insert_own"
  ON affiliate_segment_members FOR INSERT
  WITH CHECK (
    segment_id IN (
      SELECT id FROM affiliate_segments WHERE client_id = current_client_id()
    )
  );

CREATE POLICY "affiliate_segment_members_update_own"
  ON affiliate_segment_members FOR UPDATE
  USING (
    segment_id IN (
      SELECT id FROM affiliate_segments WHERE client_id = current_client_id()
    )
  );

CREATE POLICY "affiliate_segment_members_delete_own"
  ON affiliate_segment_members FOR DELETE
  USING (
    segment_id IN (
      SELECT id FROM affiliate_segments WHERE client_id = current_client_id()
    )
  );

-- Client affiliates: client sees only their own
CREATE POLICY "client_affiliates_select_own"
  ON client_affiliates FOR SELECT
  USING (client_id = current_client_id());

CREATE POLICY "client_affiliates_insert_own"
  ON client_affiliates FOR INSERT
  WITH CHECK (client_id = current_client_id());

CREATE POLICY "client_affiliates_update_own"
  ON client_affiliates FOR UPDATE
  USING (client_id = current_client_id());

CREATE POLICY "client_affiliates_delete_own"
  ON client_affiliates FOR DELETE
  USING (client_id = current_client_id());

-- Outreach campaigns: client sees only their own
CREATE POLICY "outreach_campaigns_select_own"
  ON outreach_campaigns FOR SELECT
  USING (client_id = current_client_id());

CREATE POLICY "outreach_campaigns_insert_own"
  ON outreach_campaigns FOR INSERT
  WITH CHECK (client_id = current_client_id());

CREATE POLICY "outreach_campaigns_update_own"
  ON outreach_campaigns FOR UPDATE
  USING (client_id = current_client_id());

CREATE POLICY "outreach_campaigns_delete_own"
  ON outreach_campaigns FOR DELETE
  USING (client_id = current_client_id());
