-- ============================================================
-- LaunchPilot: GitHub Queries
-- Gets PR details + CI run status for a given repo & timeframe
-- ============================================================

-- 1. Find the PR that shipped the feature (by date range or keyword)
SELECT
  number,
  title,
  user__login       AS author,
  merged_at,
  head__ref         AS branch,
  base__ref         AS target_branch,
  additions,
  deletions,
  changed_files
FROM github.pulls
WHERE owner = '{{GITHUB_OWNER}}'
  AND repo  = '{{GITHUB_REPO}}'
  AND state = 'closed'
  AND merged_at >= '{{LAUNCH_DATE}}'
ORDER BY merged_at DESC
LIMIT 5;

-- 2. CI/CD health for those commits post-launch
SELECT
  status,
  conclusion,
  name              AS workflow_name,
  created_at,
  updated_at
FROM github.repo_action_runs
WHERE owner = '{{GITHUB_OWNER}}'
  AND repo  = '{{GITHUB_REPO}}'
ORDER BY created_at DESC
LIMIT 20;

-- 3. Issues opened after launch (possible bug reports)
SELECT
  number,
  title,
  state,
  user__login       AS reporter,
  created_at,
  labels
FROM github.issues
WHERE owner = '{{GITHUB_OWNER}}'
  AND repo  = '{{GITHUB_REPO}}'
  AND created_at >= '{{LAUNCH_DATE}}'
ORDER BY created_at DESC
LIMIT 10;
