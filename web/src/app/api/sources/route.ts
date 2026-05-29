import { NextResponse } from 'next/server';
import { SourceHealthResponse } from '@/lib/types';

// Force dynamic so Next.js never statically pre-renders this route
export const dynamic = 'force-dynamic';

/**
 * Returns the health status for each data source.
 *
 * "live"         — the API key / token is configured in the environment.
 * "unconfigured" — the key is missing; the source cannot be queried.
 *
 * NOTE: Coral is a local binary and is not available in serverless
 * environments (Vercel). The health status here reflects whether the
 * credentials are present, not whether a Coral query succeeded.
 */
export async function GET(): Promise<NextResponse<SourceHealthResponse>> {
  const SOURCES = [
    { name: 'github',  label: 'GitHub',     envKey: 'GITHUB_TOKEN'  },
    { name: 'sentry',  label: 'Sentry',     envKey: 'SENTRY_TOKEN'  },
    { name: 'posthog', label: 'PostHog',    envKey: 'POSTHOG_API_KEY' },
    { name: 'stripe',  label: 'Stripe',     envKey: 'STRIPE_API_KEY' },
    { name: 'beehiiv', label: 'Beehiiv ⭐', envKey: 'BEEHIIV_API_KEY' },
    { name: 'dub',     label: 'Dub ⭐',     envKey: 'DUB_API_KEY'   },
  ];

  const sources = SOURCES.map((s) => {
    const configured = !!process.env[s.envKey];
    return {
      name:       s.name,
      label:      s.label,
      status:     (configured ? 'live' : 'unconfigured') as 'live' | 'unconfigured',
      configured,
    };
  });

  return NextResponse.json({ sources });
}
