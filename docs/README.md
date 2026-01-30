# Cơm Ánh Dương (React 19 Rebuild)

Modern food ordering and management system for Cơm Ánh Dương, rebuilt with React 19, TypeScript, and Vite.

## 🚀 Quick Start

```bash
# Clone repository
git clone <repository-url>

# Install dependencies
cd react-app
npm install

# Start development server
npm run dev
```

## 🛠 Technology Stack

- **Framework:** React 19, Vite
- **Language:** TypeScript 5.7+
- **Styling:** Tailwind CSS + Material UI 6
- **State Management:** Zustand + React Query (TanStack Query)
- **Forms:** React Hook Form + Zod
- **Backend/Database:** Supabase (Auth, Realtime, Database)
- **Testing:** Vitest + React Testing Library + Playwright

## ✨ Features Overview

| Module | Description |
|--------|-------------|
| **Customer Ordering** | Menu browsing, cart management, checkout integration |
| **Kitchen Display (KDS)** | Real-time order tracking, status updates, prep management |
| **Staff POS** | Mobile-first POS for staff, table management, quick order entry |
| **Shipper Delivery** | Delivery routing, order pickup/drop-off status, maps integration |
| **Admin Dashboard** | Sales reporting, menu management, staff accounts, system settings |

## 🏗 Development Setup

1. **Environment Variables**: Copy `.env.example` to `.env` and configure Supabase credentials.
2. **Database**: Ensure Supabase project is set up with schema from `docs/DATABASE_SCHEMA.md`.
3. **Icons**: PWA icons are located in `public/icons`.

## 📦 Deployment

The app is designed for static hosting (Vercel, Netlify, or similar).

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📱 PWA Support

Built with `vite-plugin-pwa` for offline capability and installability on mobile devices.
