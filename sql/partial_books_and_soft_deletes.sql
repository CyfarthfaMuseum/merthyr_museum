-- Find "partial" books: content_items of type 'book' that are missing required companion rows
-- or have incomplete translation metadata.
WITH book_type AS (
  SELECT id
  FROM content_types
  WHERE code = 'book'
  LIMIT 1
),
book_items AS (
  SELECT ci.id,
         ci.slug,
         ci.created_at,
         ci.updated_at
  FROM content_items ci
  JOIN book_type bt ON bt.id = ci.content_type_id
),
en_book_translation AS (
  SELECT
    cit.content_item_id,
    NULLIF(BTRIM(cit.title), '') AS title,
    NULLIF(BTRIM(cit.summary), '') AS summary
  FROM content_item_translations cit
  WHERE cit.language_code = 'en'
),
en_book_detail_translation AS (
  SELECT
    bt.book_content_item_id,
    NULLIF(BTRIM(bt.author), '') AS author,
    NULLIF(BTRIM(bt.excerpt), '') AS excerpt
  FROM book_translations bt
  WHERE bt.language_code = 'en'
)
SELECT
  bi.id AS content_item_id,
  bi.slug,
  ebt.title,
  ebt.summary,
  ebdt.author,
  ebdt.excerpt,
  (b.content_item_id IS NULL) AS missing_books_row,
  (ebt.content_item_id IS NULL) AS missing_content_translation,
  (ebdt.book_content_item_id IS NULL) AS missing_book_translation,
  (ebt.title IS NULL) AS missing_title,
  (ebdt.author IS NULL) AS missing_author,
  (COALESCE(ebt.summary, ebdt.excerpt) IS NULL) AS missing_summary,
  bi.created_at,
  bi.updated_at
FROM book_items bi
LEFT JOIN books b ON b.content_item_id = bi.id
LEFT JOIN en_book_translation ebt ON ebt.content_item_id = bi.id
LEFT JOIN en_book_detail_translation ebdt ON ebdt.book_content_item_id = bi.id
WHERE
  b.content_item_id IS NULL
  OR ebt.content_item_id IS NULL
  OR ebdt.book_content_item_id IS NULL
  OR ebt.title IS NULL
  OR ebdt.author IS NULL
  OR COALESCE(ebt.summary, ebdt.excerpt) IS NULL
ORDER BY bi.updated_at DESC NULLS LAST, bi.created_at DESC NULLS LAST;


-- Add soft-delete columns to all user tables in the current database (idempotent).
-- Run in a transaction if your migration tooling does not already do this.
DO $$
DECLARE
  t RECORD;
BEGIN
  FOR t IN
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
  LOOP
    EXECUTE format(
      'ALTER TABLE %I.%I ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ',
      t.schemaname,
      t.tablename
    );

    EXECUTE format(
      'ALTER TABLE %I.%I ADD COLUMN IF NOT EXISTS deleted_by UUID',
      t.schemaname,
      t.tablename
    );
  END LOOP;
END $$;
