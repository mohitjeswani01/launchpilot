-- ============================================================
-- LaunchPilot: Beehiiv Queries (Community Source by @mohitjeswani01)
-- Gets newsletter campaign performance around launch
-- ============================================================

-- 1. Recent posts and their performance stats
SELECT
  id,
  slug,
  subject_line,
  status,
  publish_generation,
  displayed_date
FROM beehiiv.posts
WHERE publication_id = '{{BEEHIIV_PUBLICATION_ID}}'
ORDER BY displayed_date DESC
LIMIT 10;

-- 2. Publication overview (subscriber count, growth)
SELECT
  id,
  name,
  slug,
  created,
  stats
FROM beehiiv.publications
LIMIT 5;
