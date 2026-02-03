# Deployment Checklist

## Pre-Deployment Setup

### 1. Supabase Configuration
Update `.env` with real Supabase credentials:
```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Upload Menu Images
After configuring Supabase credentials:
```bash
npm run upload-images
```

This uploads product images from `public/images/specialties/` to Supabase Storage.

### 3. Build for Production
```bash
npm run build
```

### 4. Deploy
Deploy the `dist/` folder to your hosting platform (Vercel, Netlify, etc.)

## Post-Deployment
- Verify operating hours: 6:00 - 21:00
- Test COD payment flow
- Confirm Zalo chat widget works
- Verify all images load from Supabase Storage
