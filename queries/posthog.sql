-- ============================================================
-- LaunchPilot: PostHog Queries
-- Gets user adoption + feature flag exposure post-launch
-- ============================================================

-- 1. Active feature flags (find the one matching our launch)
SELECT
  id,
  name,
  key,
  active,
  created_at,
  rollout_percentage
FROM posthog.feature_flags
WHERE project_id = '{{POSTHOG_PROJECT_ID}}'
  AND active     = true
ORDER BY created_at DESC
LIMIT 10;

-- 2. Projects list (needed to get project_id)
SELECT
  id,
  name,
  created_at
FROM posthog.projects
LIMIT 10;
