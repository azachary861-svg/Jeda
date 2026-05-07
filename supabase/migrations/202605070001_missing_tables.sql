-- Missing tables: trip_media, media_purchases, reward_points
-- Generated: 2026-05-07
-- Purpose: Support driver photo uploads, digital photo sales, and reward program

-- ─────────────────────────────────────────
-- TRIP MEDIA (Foto & Video dari Driver)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trip_media (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id        UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  driver_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  media_type        TEXT NOT NULL,                    -- 'photo' | 'video'
  storage_path      TEXT NOT NULL,                   -- Supabase Storage path
  public_url        TEXT NOT NULL,                   -- Signed/public URL
  thumbnail_url     TEXT,                            -- For video preview
  caption           TEXT,
  latitude          DECIMAL(10,8),
  longitude         DECIMAL(11,8),
  is_public         BOOLEAN DEFAULT true,            -- Tampil di Real Trip Maps
  is_for_sale       BOOLEAN DEFAULT false,           -- Bisa dibeli klien
  price             BIGINT,                          -- Harga jika dijual (IDR)
  file_size         BIGINT,                          -- Bytes
  duration_sec      INTEGER,                         -- Untuk video saja
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────
-- MEDIA PURCHASES (Digital Photo Sales)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS media_purchases (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  booking_id        UUID REFERENCES bookings(id) ON DELETE SET NULL,
  media_ids         UUID[] NOT NULL,                 -- Array of trip_media.id
  total_price       BIGINT NOT NULL,                 -- IDR
  payment_id        TEXT,                            -- Midtrans/Stripe transaction ID
  status            TEXT DEFAULT 'pending',          -- pending | paid | delivered | expired
  download_url      TEXT,
  download_expires_at TIMESTAMPTZ,                   -- Link expiration (7 days usually)
  downloaded_at     TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────
-- REWARD POINTS (Loyalty Program)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reward_points (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  points            INTEGER NOT NULL,                -- Positive (earned) or negative (redeemed)
  type              TEXT NOT NULL,                   -- 'earned' | 'redeemed' | 'expired'
  source            TEXT,                            -- 'booking' | 'review' | 'referral' | 'redemption'
  booking_id        UUID REFERENCES bookings(id) ON DELETE SET NULL,
  description       TEXT,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_trip_media_booking_id ON trip_media(booking_id);
CREATE INDEX IF NOT EXISTS idx_trip_media_driver_id ON trip_media(driver_id);
CREATE INDEX IF NOT EXISTS idx_trip_media_is_public ON trip_media(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_trip_media_is_for_sale ON trip_media(is_for_sale) WHERE is_for_sale = true;
CREATE INDEX IF NOT EXISTS idx_trip_media_created_at ON trip_media(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_media_purchases_client_id ON media_purchases(client_id);
CREATE INDEX IF NOT EXISTS idx_media_purchases_booking_id ON media_purchases(booking_id);
CREATE INDEX IF NOT EXISTS idx_media_purchases_status ON media_purchases(status);
CREATE INDEX IF NOT EXISTS idx_media_purchases_created_at ON media_purchases(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reward_points_client_id ON reward_points(client_id);
CREATE INDEX IF NOT EXISTS idx_reward_points_type ON reward_points(type);
CREATE INDEX IF NOT EXISTS idx_reward_points_source ON reward_points(source);

-- ─────────────────────────────────────────
-- RLS (Row Level Security)
-- ─────────────────────────────────────────
ALTER TABLE trip_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_points ENABLE ROW LEVEL SECURITY;

-- Trip Media: Public photos visible to all, own photos manageable by driver, admin can see all
DROP POLICY IF EXISTS "trip_media public read published" ON trip_media;
CREATE POLICY "trip_media public read published"
ON trip_media FOR SELECT
USING (is_public = true);

DROP POLICY IF EXISTS "trip_media driver create own" ON trip_media;
CREATE POLICY "trip_media driver create own"
ON trip_media FOR INSERT
WITH CHECK (driver_id = auth.uid());

DROP POLICY IF EXISTS "trip_media driver read own" ON trip_media;
CREATE POLICY "trip_media driver read own"
ON trip_media FOR SELECT
USING (driver_id = auth.uid());

DROP POLICY IF EXISTS "trip_media driver update own" ON trip_media;
CREATE POLICY "trip_media driver update own"
ON trip_media FOR UPDATE
USING (driver_id = auth.uid())
WITH CHECK (driver_id = auth.uid());

DROP POLICY IF EXISTS "trip_media admin manage" ON trip_media;
CREATE POLICY "trip_media admin manage"
ON trip_media FOR ALL
USING (
  public.current_profile_role() IN ('super_admin', 'regional_admin')
)
WITH CHECK (
  public.current_profile_role() IN ('super_admin', 'regional_admin')
);

-- Media Purchases: Clients see own purchases, admin can see all
DROP POLICY IF EXISTS "media_purchases client read own" ON media_purchases;
CREATE POLICY "media_purchases client read own"
ON media_purchases FOR SELECT
USING (client_id = auth.uid());

DROP POLICY IF EXISTS "media_purchases client create own" ON media_purchases;
CREATE POLICY "media_purchases client create own"
ON media_purchases FOR INSERT
WITH CHECK (client_id = auth.uid());

DROP POLICY IF EXISTS "media_purchases admin manage" ON media_purchases;
CREATE POLICY "media_purchases admin manage"
ON media_purchases FOR ALL
USING (
  public.current_profile_role() IN ('super_admin', 'regional_admin')
)
WITH CHECK (
  public.current_profile_role() IN ('super_admin', 'regional_admin')
);

-- Reward Points: Clients see own points, admin can see all
DROP POLICY IF EXISTS "reward_points client read own" ON reward_points;
CREATE POLICY "reward_points client read own"
ON reward_points FOR SELECT
USING (client_id = auth.uid());

DROP POLICY IF EXISTS "reward_points admin manage" ON reward_points;
CREATE POLICY "reward_points admin manage"
ON reward_points FOR ALL
USING (
  public.current_profile_role() IN ('super_admin', 'regional_admin')
)
WITH CHECK (
  public.current_profile_role() IN ('super_admin', 'regional_admin')
);

-- ─────────────────────────────────────────
-- TRIGGERS
-- ─────────────────────────────────────────
DROP TRIGGER IF EXISTS update_trip_media_updated_at ON trip_media;
CREATE TRIGGER update_trip_media_updated_at
BEFORE UPDATE ON trip_media
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_media_purchases_updated_at ON media_purchases;
CREATE TRIGGER update_media_purchases_updated_at
BEFORE UPDATE ON media_purchases
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────
-- FUNCTIONS
-- ─────────────────────────────────────────

-- Calculate total reward points for client
CREATE OR REPLACE FUNCTION get_client_total_reward_points(p_client_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(SUM(points), 0)::INTEGER
  FROM reward_points
  WHERE client_id = p_client_id
    AND type != 'expired';
$$;

-- Award points to client (for booking, review, referral)
CREATE OR REPLACE FUNCTION award_reward_points(
  p_client_id UUID,
  p_points INTEGER,
  p_source TEXT,
  p_booking_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_point_id UUID;
BEGIN
  INSERT INTO reward_points (client_id, points, type, source, booking_id, description)
  VALUES (p_client_id, p_points, 'earned', p_source, p_booking_id, p_description)
  RETURNING id INTO v_point_id;
  RETURN v_point_id;
END;
$$;

-- Helper: Get trip media count for booking
CREATE OR REPLACE FUNCTION get_trip_media_count(p_booking_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*)::INTEGER
  FROM trip_media
  WHERE booking_id = p_booking_id;
$$;

-- Helper: Get public media URLs for real-trip-maps
CREATE OR REPLACE FUNCTION get_public_trip_media(p_booking_id UUID)
RETURNS TABLE(
  id UUID,
  media_type TEXT,
  public_url TEXT,
  thumbnail_url TEXT,
  caption TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
AS $$
  SELECT id, media_type, public_url, thumbnail_url, caption, created_at
  FROM trip_media
  WHERE booking_id = p_booking_id
    AND is_public = true
  ORDER BY created_at DESC;
$$;
