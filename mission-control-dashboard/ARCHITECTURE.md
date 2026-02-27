# Mantaga Deployment Architecture

## Current Setup (as of 2026-02-26)

### Vercel
- **Project:** mantaga
- **URL:** https://mantaga.vercel.app

### Convex
- **Deployment:** greedy-opossum-906
- **URL:** https://greedy-opossum-906.convex.cloud
- **Contains:** All business data (LPO, SKU, stock, customers, etc.)

## Important Rules

1. **NEVER run `npx convex deploy` without first checking `convex.json`**
2. **Always verify CONVEX_DEPLOYMENT before deploying**
3. **Vercel and Convex must point to the SAME deployment**
4. **If unsure, check Vercel env vars: `npx vercel env ls`**

## Before Deploying to Convex

1. Check current deployment in convex.json
2. Verify Vercel points to the same one
3. Only then deploy

## Local Development

Add to `.env.local`:
```
NEXT_PUBLIC_CONVEX_URL=https://greedy-opossum-906.convex.cloud
```

## Troubleshooting

If Convex deploys to wrong project:
1. Check `npx vercel env ls` for current URL
2. Update convex.json with correct deployment
3. Or set CONVEX_DEPLOYMENT env var before deploy
