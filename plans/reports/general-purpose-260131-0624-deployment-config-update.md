# Deployment Configuration Update Report

**Date:** 260131
**Author:** general-purpose
**Task:** Update deployment configuration for Vercel with payment integration

## Summary
I have updated the deployment documentation and configuration to support the newly integrated VNPay and MoMo payment gateways.

## Changes
1.  **Updated `DEPLOYMENT.md`**:
    - Added a "Payment Configuration" section.
    - Detailed Supabase Edge Functions deployment (`create-payment`, `handle-webhook`, `reconcile-transactions`).
    - Listed required Supabase secrets (`VNPAY_TMN_CODE`, `MOMO_PARTNER_CODE`, etc.).
    - Documented Webhook/IPN configuration.

2.  **Created `PAYMENT_DEPLOYMENT.md`**:
    - A specific, actionable checklist for deploying payment features.
    - Covers Pre-deployment, Edge Functions setup, Env Vars, Webhooks, and Testing.

3.  **Updated `.env.production.example`**:
    - Added `VITE_PAYMENT_SANDBOX_MODE`.
    - Clarified that secrets go to Supabase, not Vercel env vars.

4.  **Updated `package.json`**:
    - Added `deploy` script: `npm run build && vercel --prod`.
    - Added `deploy:functions` script to deploy all 3 payment functions at once.

5.  **Updated `README.md`**:
    - Highlighted Payment Integration features (VNPay, MoMo).
    - Linked to deployment docs.

## Verification
- Ran `npm run build` successfully.
- Verified file paths and content consistency.

## Next Steps
- User needs to set up actual Supabase secrets using the provided checklist.
- User needs to deploy to Vercel and Supabase.
