-- Public read policies for content_media / media_assets / media_asset_translations.
--
-- The map sidebar and map API route use the anon-key Supabase client
-- (lib/public/map.ts -> createPublicClient), which is subject to RLS.
-- 20260622000000_public_read_rls.sql enabled RLS on the public content tables
-- but never granted anon SELECT on the media tables, so content_media /
-- media_assets queries from the anon client silently return zero rows —
-- images never reach the map pull-out sidebar even though they render fine
-- in the CMS and on the full detail pages (which use the service/server client).

-- ─── content_media ─────────────────────────────────────────────────────────────
alter table content_media enable row level security;

create policy "anon: read content_media"
  on content_media
  for select
  to anon
  using (true);

-- ─── media_assets ──────────────────────────────────────────────────────────────
alter table media_assets enable row level security;

create policy "anon: read media_assets"
  on media_assets
  for select
  to anon
  using (true);

-- ─── media_asset_translations ───────────────────────────────────────────────────
alter table media_asset_translations enable row level security;

create policy "anon: read media_asset_translations"
  on media_asset_translations
  for select
  to anon
  using (true);
