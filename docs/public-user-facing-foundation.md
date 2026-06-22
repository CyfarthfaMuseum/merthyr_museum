# Public User-Facing Foundation

## Added

- Public routes at the site root, with Welsh content available through `?lang=cy`.
- Public map skeleton at `/map`.
- Stable public detail routes for paintings, books, stories, artefacts, and biographies.
- Separate public read helpers under `lib/public`.
- Shared public detail view model and reusable detail template under `components/public`.
- Admin CMS routes moved under `/admin`, with legacy redirects for the old top-level admin URLs.

## Data Boundaries

- Public reads use the existing anon/server Supabase client, not the service-role admin client.
- Public content is filtered through `content_statuses.is_public`.
- Detail pages do not require a `content_locations` row. Location data is optional context.

## Recommended Next Steps

- Confirm RLS policies allow anonymous reads for the public tables that are meant to be visible.
- Replace the map placeholder with Leaflet or the chosen exhibition map renderer.
- Add a proper zoom library such as `react-zoom-pan-pinch` behind the existing gallery boundary.
- Add public list/search pages once the exhibition navigation model is final.
- Replace `?lang=cy` with a final public language-routing strategy if the exhibition needs language-specific canonical URLs.
