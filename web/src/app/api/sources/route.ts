import { NextResponse } from 'next/server';
import { checkSourceHealth } from '@/lib/coral';
import { SourceHealthResponse } from '@/lib/types';

// Light test queries per source
const SOURCE_TESTS = [
  {
    name: 'github',
    label: 'GitHub',
    query: "SELECT name FROM github.user_repos LIMIT 1",
    envKey: 'GITHUB_TOKEN',
  },
  {
    name: 'sentry',
    label: 'Sentry',
    query: `SELECT id FROM sentry.issues WHERE organization_slug = '${process.env.SENTRY_ORG}' AND project_slug = '${process.env.SENTRY_PROJECT}' LIMIT 1`,
    envKey: 'SENTRY_AUTH_TOKEN',
  },
  {
    name: 'posthog',
    label: 'PostHog',
    query: "SELECT id FROM posthog.organizations LIMIT 1",
    envKey: 'POSTHOG_API_KEY',
  },
  {
    name: 'stripe',
    label: 'Stripe',
    query: "SELECT id FROM stripe.account LIMIT 1",
    envKey: 'STRIPE_API_KEY',
  },
  {
    name: 'beehiiv',
    label: 'Beehiiv ⭐',
    query: `SELECT id FROM beehiiv.publications LIMIT 1`,
    envKey: 'BEEHIIV_API_KEY',
  },
  {
    name: 'dub',
    label: 'Dub ⭐',
    query: "SELECT id FROM dub.links LIMIT 1",
    envKey: 'DUB_API_KEY',
  },
];

export async function GET(): Promise<NextResponse<SourceHealthResponse>> {
  const results = await Promise.allSettled(
    SOURCE_TESTS.map(async (s) => {
      const configured = !!process.env[s.envKey];
      if (!configured) {
        return { name: s.name, label: s.label, status: 'unconfigured' as const, configured: false };
      }
      const health = await checkSourceHealth(s.name, s.query);
      return {
        name: s.name,
        label: s.label,
        status: health.healthy ? ('live' as const) : ('error' as const),
        configured,
      };
    })
  );

  const sources = results.map((r, i) =>
    r.status === 'fulfilled'
      ? r.value
      : {
          name: SOURCE_TESTS[i].name,
          label: SOURCE_TESTS[i].label,
          status: 'error' as const,
          configured: false,
        }
  );

  return NextResponse.json({ sources });
}
