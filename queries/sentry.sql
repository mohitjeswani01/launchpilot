-- ============================================================
-- LaunchPilot: Sentry Queries
-- Gets errors that appeared after the launch timestamp
-- ============================================================

-- 1. New errors since launch (unresolved, ordered by frequency)
SELECT
  id,
  title,
  culprit,
  level,
  status,
  count         AS occurrence_count,
  user_count,
  first_seen,
  last_seen
FROM sentry.issues
WHERE organization_slug = '{{SENTRY_ORG}}'
  AND project_slug      = '{{SENTRY_PROJECT}}'
  AND first_seen        >= '{{LAUNCH_DATE}}'
  AND status            = 'unresolved'
ORDER BY count DESC
LIMIT 10;

-- 2. Error rate trend (fatal + error level only)
SELECT
  id,
  title,
  level,
  count         AS total_occurrences,
  user_count    AS affected_users,
  first_seen,
  last_seen
FROM sentry.issues
WHERE organization_slug = '{{SENTRY_ORG}}'
  AND project_slug      = '{{SENTRY_PROJECT}}'
  AND first_seen        >= '{{LAUNCH_DATE}}'
  AND level             IN ('fatal', 'error')
ORDER BY count DESC
LIMIT 5;
