-- Public read policies for the Her:Stories public map and content pages.
--
-- The anon role is used by the Next.js server component via the Supabase anon key.
-- All filtering of unpublished / draft content is enforced at the application layer
-- (getPublicMapLocations, getPublicContentSummaries), so table-level policies only
-- need to grant SELECT access. Mutations remain blocked for anon.

-- ─── locations ────────────────────────────────────────────────────────────────
alter table locations enable row level security;

create policy "anon: read published locations"
  on locations
  for select
  to anon
  using (is_published = true);

-- ─── location_translations ────────────────────────────────────────────────────
alter table location_translations enable row level security;

create policy "anon: read location translations"
  on location_translations
  for select
  to anon
  using (true);

-- ─── content_locations ────────────────────────────────────────────────────────
alter table content_locations enable row level security;

create policy "anon: read content_locations"
  on content_locations
  for select
  to anon
  using (true);

-- ─── content_items ────────────────────────────────────────────────────────────
alter table content_items enable row level security;

create policy "anon: read content items"
  on content_items
  for select
  to anon
  using (true);

-- ─── content_item_translations ────────────────────────────────────────────────
alter table content_item_translations enable row level security;

create policy "anon: read content item translations"
  on content_item_translations
  for select
  to anon
  using (true);

-- ─── content_statuses ─────────────────────────────────────────────────────────
alter table content_statuses enable row level security;

create policy "anon: read content statuses"
  on content_statuses
  for select
  to anon
  using (true);

-- ─── content_types ────────────────────────────────────────────────────────────
alter table content_types enable row level security;

create policy "anon: read content types"
  on content_types
  for select
  to anon
  using (true);
