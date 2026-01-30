# Deployment Guide for Cơm Ánh Dương

This guide provides instructions for deploying the Cơm Ánh Dương React application to Vercel.

## Prerequisites

1.  **Vercel Account:** Create an account at [vercel.com](https://vercel.com).
2.  **GitHub Repository:** Ensure your code is pushed to a GitHub repository.
3.  **Supabase Project:** You need a Supabase project for the backend.

## Environment Variables

The following environment variables are required for the application to function correctly. **ALL** variables used in the React app must start with `VITE_`.

| Variable | Description |
| :--- | :--- |
| `VITE_SUPABASE_URL` | The URL of your Supabase project (e.g., `https://xyz.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | The anonymous public key for your Supabase project |
| `VITE_APP_NAME` | (Optional) Application name, defaults to "Cơm Ánh Dương" |
| `VITE_ENABLE_ANALYTICS` | (Optional) Set to `true` to enable analytics (if configured) |

## Deploying to Vercel

### Option 1: Vercel Dashboard (Recommended)

1.  Log in to the Vercel Dashboard.
2.  Click **"Add New..."** -> **"Project"**.
3.  Import your GitHub repository `com-anh-duong-10x`.
4.  In the **Configure Project** step:
    *   **Framework Preset:** Select `Vite`.
    *   **Root Directory:** Select `react-app` (since the app is in a subdirectory).
    *   **Build Command:** `npm run build` (should be auto-detected).
    *   **Output Directory:** `dist` (should be auto-detected).
    *   **Install Command:** `npm install` (should be auto-detected).
5.  **Environment Variables:**
    *   Expand the **Environment Variables** section.
    *   Add `VITE_SUPABASE_URL` and your value.
    *   Add `VITE_SUPABASE_ANON_KEY` and your value.
6.  Click **"Deploy"**.

### Option 2: Vercel CLI

1.  Install Vercel CLI: `npm i -g vercel`
2.  Run `vercel login`
3.  Navigate to the `react-app` directory: `cd react-app`
4.  Run `vercel` to deploy a preview.
5.  Run `vercel --prod` to deploy to production.

## Post-Deployment Checklist

- [ ] **Verify SPA Routing:** Refresh the page on a route like `/login` or `/menu`. It should not 404.
- [ ] **Check PWA:** Open the app on a mobile device or inspect the Application tab in DevTools. The service worker should register.
- [ ] **Test Database Connection:** Verify that menu items load and you can log in (if applicable).
- [ ] **Security Headers:** Check Network tab to ensure headers like `X-Frame-Options` and `X-Content-Type-Options` are present.

## Custom Domain (Optional)

1.  Go to your Project Settings in Vercel.
2.  Select **Domains**.
3.  Add your custom domain (e.g., `app.comanhduong.com`).
4.  Follow the DNS configuration instructions provided by Vercel.

## Troubleshooting

*   **404 on Refresh:** Ensure `vercel.json` contains the `rewrites` rule mapping `/(.*)` to `/index.html`.
*   **Env Vars Missing:** Double-check that all env vars start with `VITE_` and are added in Vercel Project Settings. Re-deploy after changing env vars.
*   **Build Errors:** Run `npm run build` locally to debug. Ensure all dependencies are in `package.json`.

## CI/CD

A GitHub Actions workflow is available in `.github/workflows/deploy.yml` (if configured) to automatically deploy changes pushed to the `main` branch.
