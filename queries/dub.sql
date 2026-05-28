-- ============================================================
-- LaunchPilot: Dub Queries (Community Source by @mohitjeswani01)
-- Gets link analytics for launch campaign links
-- ============================================================

-- 1. All links with click stats (find launch-related links)
SELECT
  id,
  domain,
  key,
  url,
  title,
  clicks,
  leads,
  sales,
  created_at
FROM dub.links
ORDER BY created_at DESC
LIMIT 20;

-- 2. Top performing links (by clicks)
SELECT
  id,
  key,
  url,
  title,
  clicks,
  leads,
  created_at
FROM dub.links
WHERE clicks > 0
ORDER BY clicks DESC
LIMIT 10;
