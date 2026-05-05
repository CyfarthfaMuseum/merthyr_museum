---
name: database-schema
description: Use this skill whenever working with the application database, writing SQL, migrations, Supabase queries, ORM models, seed data, API handlers, admin CMS data access, or debugging database-related code.
---

# Database Schema Source of Truth

The canonical database schema for this app lives at:

```text
DatabaseSchema/schema.md
```

Always treat that file as the source of truth for database structure.

Do not infer, invent, rename, or simplify database tables, columns, enums, constraints, or relationships without first checking `DatabaseSchema/schema.md`.

## When to use this skill

Use this skill for any task involving:

- SQL queries
- Supabase queries
- database migrations
- seed data
- TypeScript database types
- API routes that read or write database records
- CMS create/edit/list/detail pages
- admin user or invitation flows
- media, locations, tags, QR codes, stories, biographies, books, paintings, artefacts, or content relationships
- debugging database errors
- schema-aware validation
- joins across content, translation, lookup, or media tables

## Required workflow

Before writing or changing database-related code:

1. Open and read `DatabaseSchema/schema.md`.
2. Identify the exact tables, columns, primary keys, foreign keys, enum-like fields, defaults, and constraints relevant to the task.
3. Use the names exactly as defined in the schema.
4. Prefer schema-confirmed joins over guessed joins.
5. Preserve the database’s content model:
   - `content_items` is the shared parent table for core content.
   - Type-specific tables use `content_item_id` as their primary key.
   - Translations are stored in separate `*_translations` tables.
   - Languages are keyed by `languages.code`.
   - Many-to-many relationships use join tables.
   - Media relationships use `content_media` and `media_assets`.
6. If the requested change conflicts with the schema, explain the conflict before proposing code.
7. If a needed table or column does not exist in `DatabaseSchema/schema.md`, do not pretend it exists. Either:
   - adapt the solution to the existing schema, or
   - propose a migration that explicitly adds the missing structure.

## Important schema patterns

### Content inheritance pattern

Most public content is represented by a row in `content_items`, then extended by a type-specific table.

Examples:

- `biographies.content_item_id -> content_items.id`
- `stories.content_item_id -> content_items.id`
- `books.content_item_id -> content_items.id`
- `paintings.content_item_id -> content_items.id`
- `artefacts.content_item_id -> content_items.id`

When creating a type-specific content item, usually create:

1. a `content_items` row
2. a type-specific row
3. one or more translation rows

Do not create a biography, story, book, painting, or artefact without its parent `content_items` row.

### Translation pattern

Localized text is stored in translation tables keyed by the parent entity and `language_code`.

Examples:

- `content_item_translations`
- `biography_translations`
- `story_translations`
- `book_translations`
- `painting_translations`
- `artefact_translations`
- `location_translations`
- `tag_translations`
- `historical_period_translations`
- `historical_era_translations`
- `map_region_translations`
- `media_asset_translations`

Always join translations using:

```sql
..._translations.language_code = languages.code
```

When querying user-facing content, include the appropriate translation table rather than assuming text fields live directly on the base table.

### Lookup/status/type pattern

The schema uses lookup tables for statuses, types, and taxonomy-like values.

Examples:

- `content_statuses`
- `content_types`
- `story_types`
- `languages`

When filtering by content type or status, prefer joining against the lookup table by `code` instead of hardcoding numeric IDs.

Example:

```sql
select ci.*
from content_items ci
join content_types ct on ct.id = ci.content_type_id
join content_statuses cs on cs.id = ci.content_status_id
where ct.code = 'story'
  and cs.code = 'published';
```

### Media pattern

Media assets are stored in `media_assets`.

Content-to-media relationships are stored in `content_media`.

Use `content_media` for:

- role
- sort order
- primary media
- relationship between a content item and a media asset

Do not add media columns directly to `content_items` unless a migration explicitly introduces them.

### Location pattern

Locations live in `locations`.

Content-to-location relationships live in `content_locations`.

Locations may belong to a `map_regions` row through `locations.region_id`.

Localized location text lives in `location_translations`.

### Relationships and taxonomy

Use the existing join tables:

- `related_content`
- `content_tags`
- `content_locations`
- `content_media`
- `book_theme_books`
- `book_theme_paintings`

Do not model these as arrays or JSON columns unless explicitly requested and backed by a migration.

## Query style rules

When writing SQL:

- Use exact table and column names from `DatabaseSchema/schema.md`.
- Use explicit joins.
- Use table aliases only when they improve clarity.
- Include `language_code` filters for translated content.
- Include status filters for public-facing queries.
- Include `sort_order` where the schema provides it.
- Avoid `select *` in production-facing code.
- Respect nullable fields.
- Respect default values defined in the schema.
- Respect primary keys and composite primary keys.
- Do not assume cascading deletes unless shown in the schema.

## Supabase query rules

When writing Supabase client code:

- Match relation names to the actual tables.
- Use the schema’s foreign key relationships.
- Prefer explicit selected columns.
- Include nested translations where needed.
- Filter lookup tables by `code` when appropriate.
- Do not assume generated TypeScript types include fields not present in the schema.

Example shape:

```ts
const { data, error } = await supabase
  .from("content_items")
  .select(`
    id,
    slug,
    featured,
    published_at,
    content_item_translations (
      language_code,
      title,
      summary,
      body
    ),
    content_types (
      code
    ),
    content_statuses (
      code,
      is_public
    )
  `)
  .eq("content_item_translations.language_code", languageCode)
  .eq("content_statuses.code", "published");
```

Adjust relationship syntax if the generated Supabase relationship names differ, but do not change database table or column names.

## Migration rules

When writing migrations:

1. Compare the requested change against `DatabaseSchema/schema.md`.
2. Only add schema changes that are truly required.
3. Preserve existing naming conventions.
4. Use `public.` schema qualification where appropriate.
5. Add foreign keys for relational data.
6. Add translation tables for localized text.
7. Add `created_at` and `updated_at` columns where the existing schema pattern suggests them.
8. Avoid destructive migrations unless explicitly requested.
9. Include rollback notes or a down migration when the project convention supports it.

## Seed data rules

When writing seed data:

- Insert lookup rows before dependent rows.
- Insert `languages` before translation rows.
- Insert `content_types` and `content_statuses` before `content_items`.
- Insert `content_items` before type-specific content rows.
- Insert type-specific rows before type-specific translations.
- Use stable slugs.
- Do not hardcode UUIDs unless the task requires reproducible IDs.
- Prefer lookup queries for foreign keys instead of assuming numeric IDs.

## Validation rules

When writing validation schemas or forms:

- Required fields should match `NOT NULL` fields in `DatabaseSchema/schema.md`.
- Nullable fields should be optional or nullable in application validation.
- Enforce date month/day ranges where defined.
- Respect unique constraints, especially slugs and emails.
- Validate foreign key fields against their referenced tables.
- Keep translated fields separate from base entity fields.

## Admin/CMS rules

When working on CMS screens:

- The base content editor should map to `content_items`.
- Shared translated fields should map to `content_item_translations`.
- Content-type-specific panels should map to their type-specific table.
- Type-specific translated fields should map to their type-specific translation table.
- Media pickers should write to `content_media`.
- Tags should write to `content_tags`.
- Locations should write to `content_locations`.
- Related content should write to `related_content`.

## Error handling

If a database request fails because of a missing table, column, relationship, enum, or constraint:

1. Re-check `DatabaseSchema/schema.md`.
2. Identify whether the code or the schema is wrong.
3. If the code is wrong, fix the code to match the schema.
4. If the schema is missing something the app needs, propose a migration.
5. Do not silently rename schema objects in application code.

## Response expectations

When answering database-related tasks:

- Mention which schema tables are involved.
- Explain any important joins.
- Call out assumptions.
- Call out any missing schema support.
- Prefer code that can be copied directly into the app.
- Keep the solution aligned with `DatabaseSchema/schema.md`.
