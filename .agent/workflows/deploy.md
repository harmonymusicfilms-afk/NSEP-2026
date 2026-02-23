---
description: How to build, push to GitHub, and deploy to Vercel production
---

# Deploy Workflow

This workflow automates building, pushing to GitHub, and deploying to Vercel.

## Prerequisites
- Git remote `origin` is set to `https://github.com/harmonymusicfilms-afk/NSEP-2026.git`
- Vercel CLI is installed (`npx vercel`)
- You are on the `main` branch
- Production URL: https://nsep-2025.vercel.app

## Steps

// turbo-all

1. **Build the project** to check for errors:
```bash
npm run build
```
If build fails, fix the errors first before proceeding.

2. **Stage all changes**:
```bash
git add .
```

3. **Commit with a descriptive message**:
```bash
git commit -m "COMMIT_MESSAGE_HERE"
```
Replace `COMMIT_MESSAGE_HERE` with a short description of what changed.

4. **Push to GitHub** (NSEP-2026 repo):
```bash
git push origin main
```
Since Vercel is connected to this repo, this will trigger auto-deploy.

5. **If auto-deploy is NOT working**, manually deploy to Vercel Production:
```bash
npx vercel deploy --prod --yes
```

6. **Verify deployment** by checking the live URL:
- Production URL: https://nsep-2025.vercel.app

## Notes
- GitHub Repo: https://github.com/harmonymusicfilms-afk/NSEP-2026
- Vercel auto-deploys when GitHub `main` branch receives a push.
- Always run `npm run build` first to catch TypeScript/compile errors before pushing.
- PowerShell uses `;` instead of `&&` to chain commands.
- If Vercel auto-deploy is connected, step 5 is NOT needed — deploy happens automatically on push.
