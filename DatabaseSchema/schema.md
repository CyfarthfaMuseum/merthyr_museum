## Table `admin_invitations`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `email` | `text` |  |
| `role` | `admin_role` |  |
| `token` | `text` |  Unique |
| `invited_by` | `uuid` |  Nullable |
| `expires_at` | `timestamptz` |  |
| `accepted_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `admin_users`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `email` | `text` |  Unique |
| `first_name` | `text` |  Nullable |
| `last_name` | `text` |  Nullable |
| `role` | `admin_role` |  |
| `status` | `admin_user_status` |  |
| `last_login_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `artefact_translations`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `artefact_content_item_id` | `uuid` | Primary |
| `language_code` | `text` | Primary |
| `notes` | `text` |  Nullable |

## Table `artefacts`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `content_item_id` | `uuid` | Primary |
| `maker` | `text` |  Nullable |
| `origin_place` | `text` |  Nullable |
| `date_created_label` | `text` |  Nullable |
| `material` | `text` |  Nullable |
| `dimensions` | `text` |  Nullable |
| `collection_holder` | `text` |  Nullable |
| `catalogue_reference` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `audit_log`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `admin_user_id` | `uuid` |  Nullable |
| `entity_type` | `text` |  |
| `entity_id` | `uuid` |  |
| `action` | `text` |  |
| `changes` | `jsonb` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `biographies`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `content_item_id` | `uuid` | Primary |
| `person_name` | `text` |  |
| `birth_year` | `int4` |  Nullable |
| `death_year` | `int4` |  Nullable |
| `birth_place` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `biography_translations`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `biography_content_item_id` | `uuid` | Primary |
| `language_code` | `text` | Primary |
| `occupation` | `text` |  Nullable |
| `biography_text` | `text` |  Nullable |

## Table `book_theme_books`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `book_theme_id` | `uuid` | Primary |
| `book_content_item_id` | `uuid` | Primary |
| `sort_order` | `int4` |  |
| `created_at` | `timestamptz` |  |

## Table `book_theme_paintings`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `book_theme_id` | `uuid` | Primary |
| `painting_content_item_id` | `uuid` | Primary |
| `sort_order` | `int4` |  |
| `created_at` | `timestamptz` |  |

## Table `book_theme_translations`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `book_theme_id` | `uuid` | Primary |
| `language_code` | `text` | Primary |
| `title` | `text` |  |
| `summary` | `text` |  Nullable |
| `body` | `text` |  Nullable |

## Table `book_themes`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `slug` | `text` |  Unique |
| `content_status_id` | `int2` |  |
| `created_by` | `uuid` |  Nullable |
| `updated_by` | `uuid` |  Nullable |
| `published_by` | `uuid` |  Nullable |
| `published_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `book_translations`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `book_content_item_id` | `uuid` | Primary |
| `language_code` | `text` | Primary |
| `author` | `text` |  Nullable |
| `excerpt` | `text` |  Nullable |

## Table `books`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `content_item_id` | `uuid` | Primary |
| `publication_year` | `int4` |  Nullable |
| `isbn` | `text` |  Nullable |
| `publisher` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `content_item_translations`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `content_item_id` | `uuid` | Primary |
| `language_code` | `text` | Primary |
| `title` | `text` |  |
| `summary` | `text` |  Nullable |
| `body` | `text` |  Nullable |
| `custom_period_label` | `text` |  Nullable |
| `seo_title` | `text` |  Nullable |
| `seo_description` | `text` |  Nullable |

## Table `content_items`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `content_type_id` | `int2` |  |
| `content_status_id` | `int2` |  |
| `slug` | `text` |  Unique |
| `featured` | `bool` |  |
| `start_date_year` | `int4` |  Nullable |
| `start_date_month` | `int4` |  Nullable |
| `start_date_day` | `int4` |  Nullable |
| `start_date_era` | `era_designation` |  Nullable |
| `end_date_year` | `int4` |  Nullable |
| `end_date_month` | `int4` |  Nullable |
| `end_date_day` | `int4` |  Nullable |
| `end_date_era` | `era_designation` |  Nullable |
| `historical_period_id` | `uuid` |  Nullable |
| `historical_era_id` | `uuid` |  Nullable |
| `created_by` | `uuid` |  Nullable |
| `updated_by` | `uuid` |  Nullable |
| `published_by` | `uuid` |  Nullable |
| `published_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `content_locations`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `content_item_id` | `uuid` | Primary |
| `location_id` | `uuid` | Primary |
| `relationship_type` | `content_location_relationship` |  |
| `sort_order` | `int4` |  |
| `created_at` | `timestamptz` |  |

## Table `content_media`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `content_item_id` | `uuid` |  |
| `media_asset_id` | `uuid` |  |
| `role` | `content_media_role` |  |
| `sort_order` | `int4` |  |
| `is_primary` | `bool` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `content_status_translations`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `content_status_id` | `int2` | Primary |
| `language_code` | `text` | Primary |
| `label` | `text` |  |

## Table `content_statuses`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int2` | Primary |
| `code` | `text` |  Unique |
| `is_public` | `bool` |  |
| `sort_order` | `int4` |  |
| `created_at` | `timestamptz` |  |

## Table `content_tags`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `content_item_id` | `uuid` | Primary |
| `tag_id` | `uuid` | Primary |
| `created_at` | `timestamptz` |  |

## Table `content_type_translations`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `content_type_id` | `int2` | Primary |
| `language_code` | `text` | Primary |
| `label` | `text` |  |

## Table `content_types`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int2` | Primary |
| `code` | `text` |  Unique |
| `sort_order` | `int4` |  |
| `created_at` | `timestamptz` |  |

## Table `historical_era_translations`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `historical_era_id` | `uuid` | Primary |
| `language_code` | `text` | Primary |
| `name` | `text` |  |
| `summary` | `text` |  Nullable |

## Table `historical_eras`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `slug` | `text` |  Unique |
| `sort_order` | `int4` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `historical_period_translations`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `historical_period_id` | `uuid` | Primary |
| `language_code` | `text` | Primary |
| `name` | `text` |  |
| `summary` | `text` |  Nullable |

## Table `historical_periods`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `slug` | `text` |  Unique |
| `start_year` | `int4` |  Nullable |
| `end_year` | `int4` |  Nullable |
| `sort_order` | `int4` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `languages`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `code` | `text` | Primary |
| `name` | `text` |  |
| `native_name` | `text` |  |
| `is_active` | `bool` |  |
| `is_default` | `bool` |  Unique |
| `sort_order` | `int4` |  |
| `created_at` | `timestamptz` |  |

## Table `location_translations`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `location_id` | `uuid` | Primary |
| `language_code` | `text` | Primary |
| `title` | `text` |  |
| `description` | `text` |  Nullable |

## Table `locations`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `region_id` | `uuid` |  Nullable |
| `slug` | `text` |  Unique |
| `address_line_1` | `text` |  Nullable |
| `address_line_2` | `text` |  Nullable |
| `town` | `text` |  Nullable |
| `postcode` | `text` |  Nullable |
| `latitude` | `numeric` |  |
| `longitude` | `numeric` |  |
| `location_type` | `location_type` |  |
| `is_published` | `bool` |  |
| `created_by` | `uuid` |  Nullable |
| `updated_by` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `map_region_translations`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `map_region_id` | `uuid` | Primary |
| `language_code` | `text` | Primary |
| `name` | `text` |  |
| `summary` | `text` |  Nullable |

## Table `map_regions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `slug` | `text` |  Unique |
| `map_shape_geojson` | `jsonb` |  Nullable |
| `centroid_lat` | `numeric` |  Nullable |
| `centroid_lng` | `numeric` |  Nullable |
| `sort_order` | `int4` |  |
| `is_active` | `bool` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `media_asset_translations`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `media_asset_id` | `uuid` | Primary |
| `language_code` | `text` | Primary |
| `alt_text` | `text` |  Nullable |
| `caption` | `text` |  Nullable |

## Table `media_assets`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `storage_path` | `text` |  |
| `file_name` | `text` |  |
| `mime_type` | `text` |  |
| `file_size_bytes` | `int8` |  Nullable |
| `width` | `int4` |  Nullable |
| `height` | `int4` |  Nullable |
| `duration_seconds` | `int4` |  Nullable |
| `credit` | `text` |  Nullable |
| `uploaded_by` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `painting_translations`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `painting_content_item_id` | `uuid` | Primary |
| `language_code` | `text` | Primary |
| `detail_notes` | `text` |  Nullable |

## Table `paintings`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `content_item_id` | `uuid` | Primary |
| `artist_name` | `text` |  Nullable |
| `year_created` | `int4` |  Nullable |
| `medium` | `text` |  Nullable |
| `dimensions` | `text` |  Nullable |
| `current_collection` | `text` |  Nullable |
| `image_credit` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `qr_codes`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `content_item_id` | `uuid` |  |
| `target_url` | `text` |  |
| `image_media_asset_id` | `uuid` |  Nullable |
| `generated_at` | `timestamptz` |  |
| `generated_by` | `uuid` |  Nullable |
| `is_active` | `bool` |  |
| `created_at` | `timestamptz` |  |

## Table `related_content`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `parent_content_item_id` | `uuid` | Primary |
| `child_content_item_id` | `uuid` | Primary |
| `relationship_type` | `related_content_relationship` |  |
| `sort_order` | `int4` |  |
| `created_at` | `timestamptz` |  |

## Table `stories`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `content_item_id` | `uuid` | Primary |
| `story_type_id` | `int2` |  |
| `related_person_name` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `story_translations`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `story_content_item_id` | `uuid` | Primary |
| `language_code` | `text` | Primary |
| `event_details` | `text` |  Nullable |

## Table `story_type_translations`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `story_type_id` | `int2` | Primary |
| `language_code` | `text` | Primary |
| `label` | `text` |  |

## Table `story_types`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int2` | Primary |
| `code` | `text` |  Unique |
| `sort_order` | `int4` |  |
| `created_at` | `timestamptz` |  |

## Table `tag_translations`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `tag_id` | `uuid` | Primary |
| `language_code` | `text` | Primary |
| `name` | `text` |  |

## Table `tags`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `slug` | `text` |  Unique |
| `tag_type` | `tag_type` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

