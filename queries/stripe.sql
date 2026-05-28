-- ============================================================
-- LaunchPilot: Stripe Queries
-- Gets revenue signals after the launch date
-- ============================================================

-- 1. New subscriptions created after launch
SELECT
  id,
  status,
  created,
  current_period_start,
  current_period_end,
  plan__amount        AS plan_amount_cents,
  plan__currency      AS currency,
  plan__interval      AS billing_interval,
  customer
FROM stripe.subscriptions
WHERE created >= {{LAUNCH_TIMESTAMP_UNIX}}
ORDER BY created DESC
LIMIT 20;

-- 2. Successful charges post-launch (revenue signal)
SELECT
  id,
  amount,
  currency,
  status,
  created,
  description,
  customer
FROM stripe.charges
WHERE created >= {{LAUNCH_TIMESTAMP_UNIX}}
  AND status  = 'succeeded'
ORDER BY created DESC
LIMIT 20;

-- 3. Upgrade events (subscription quantity increases)
SELECT
  id,
  type,
  created,
  data
FROM stripe.events
WHERE created >= {{LAUNCH_TIMESTAMP_UNIX}}
  AND type    IN (
    'customer.subscription.created',
    'customer.subscription.updated',
    'invoice.payment_succeeded'
  )
ORDER BY created DESC
LIMIT 20;
