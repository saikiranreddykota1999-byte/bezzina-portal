# Deployment Documentation Template

Generate for every production release.

```markdown
# Deployment Guide — [Release/Feature]

**Version:** [x.y.z]
**Date:** [YYYY-MM-DD]
**Environment:** Production

## Prerequisites

- [ ] Vercel project configured
- [ ] Supabase project linked
- [ ] Stripe keys set (live mode)
- [ ] Environment variables documented
- [ ] Database migrations reviewed

## Environment Variables

| Variable | Scope | Description | Required |
|----------|-------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client | Supabase project URL | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Admin operations | Yes |
| `STRIPE_SECRET_KEY` | Server only | Payment processing | Yes |

> Never commit `.env` files. Never expose server-only keys to the client.

## Deployment Steps

1. Run CI pipeline (GitHub Actions)
2. Apply database migrations (`supabase db push` or migration script)
3. Deploy to Vercel preview → smoke test
4. Promote to production
5. Run health checks
6. Verify monitoring and logging

## Docker (if applicable)

```bash
docker build -t [image-name] .
docker run -p 3000:3000 --env-file .env.production [image-name]
```

## CI/CD Pipeline

- [ ] Lint and type-check pass
- [ ] Unit and integration tests pass
- [ ] Security scan pass
- [ ] Build succeeds

## Health Checks

- [ ] `GET /api/health` returns 200
- [ ] Database connectivity verified
- [ ] Supabase auth functional
- [ ] Stripe webhook endpoint reachable

## Monitoring & Logging

- [ ] Error tracking configured
- [ ] Performance monitoring active
- [ ] Log aggregation in place
- [ ] Alerts configured for downtime and error spikes

## Backups

- [ ] Supabase automated backups enabled
- [ ] Backup restore procedure documented

## Rollback Procedure

1. Revert Vercel deployment to previous stable release
2. Roll back database migration if needed (document reverse migration)
3. Verify health checks
4. Notify stakeholders

## Post-Deploy Verification

- [ ] Critical user flows tested in production
- [ ] No secrets exposed in client bundle
- [ ] Lighthouse scores meet targets
```
