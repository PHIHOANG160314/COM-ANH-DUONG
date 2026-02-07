# GitHub Actions Auto-Deploy Setup

This repository is configured to automatically deploy to Vercel on every push to the `main` branch.

## Required GitHub Secrets

You need to add the following secrets to your GitHub repository:

### 1. Get Vercel Token

1. Go to https://vercel.com/account/tokens
2. Click "Create Token"
3. Give it a name (e.g., "GitHub Actions")
4. Copy the token

### 2. Get Vercel Project IDs

Run these commands in your local project:

```bash
cd react-app
npm i -g vercel
vercel login
vercel link
```

This will create a `.vercel/project.json` file with your project details.

### 3. Add Secrets to GitHub

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these three secrets:

| Secret Name | Value | Where to Find |
|------------|-------|---------------|
| `VERCEL_TOKEN` | Your Vercel token | Step 1 above |
| `VERCEL_ORG_ID` | Your org ID | `.vercel/project.json` → `orgId` |
| `VERCEL_PROJECT_ID` | Your project ID | `.vercel/project.json` → `projectId` |

### 4. Environment Variables

Don't forget to add your environment variables to Vercel dashboard:

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   - `VITE_SUPABASE_URL` (from your Supabase project)
   - `VITE_SUPABASE_ANON_KEY` (from your Supabase project)

## How It Works

1. You push code to `main` branch
2. GitHub Actions automatically:
   - Checks out the code
   - Installs Node.js 18
   - Installs npm dependencies
   - Builds the project (`npm run build`)
   - Deploys to Vercel production
3. Vercel deployment URL will be in the Actions log

## Manual Deploy (Optional)

If you need to deploy manually:

```bash
cd react-app
vercel --prod
```

## Workflow File

The workflow is defined in `.github/workflows/deploy.yml`. It runs on every push to `main`.

---

**Status**: Once secrets are added, auto-deploy will work on the next push to main.
