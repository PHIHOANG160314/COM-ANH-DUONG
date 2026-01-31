# Cơm Ánh Dương - Restaurant POS System

[![CI/CD Pipeline](https://github.com/PHIHOANG160314/COM-ANH-DUONG/actions/workflows/ci.yml/badge.svg)](https://github.com/PHIHOANG160314/COM-ANH-DUONG/actions/workflows/ci.yml)

## 📋 Overview

Modern restaurant Point of Sale (POS) system for Cơm Ánh Dương. Built with React + TypeScript + Material-UI, featuring offline-first capabilities with PWA support.

**Live Site:** [comanhduong.com](https://comanhduong.com)

## ✨ Features

- 🍱 **Digital Menu** - AI-generated food images, category filtering
- 🛒 **Order Management** - Add to cart, order tracking, real-time updates
- 📱 **PWA Support** - Works offline, installable as mobile app
- 🎨 **Material Design 3** - Modern, responsive UI
- 🔐 **Authentication** - Supabase Auth integration
- 🌐 **Demo Mode** - Fallback demo data when database not configured

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- (Optional) Supabase account for database features

### Installation

```bash
# Clone repository
git clone https://github.com/PHIHOANG160314/COM-ANH-DUONG.git
cd COM-ANH-DUONG

# Install dependencies
cd react-app
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## 🔧 Environment Setup

### Demo Mode (No Database)

The app works out-of-the-box with demo data. No configuration needed!

### Production Mode (with Supabase)

Create `.env` file in `react-app/` directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Get credentials:**
1. Create project at [supabase.com](https://supabase.com)
2. Copy URL and anon key from Settings → API
3. Run database migrations from `/sql` folder

## 📁 Project Structure

```
react-app/
├── src/
│   ├── app/              # App shell, providers, routing
│   ├── features/         # Feature modules (menu, orders, auth)
│   ├── shared/           # Shared components, utils, types
│   │   ├── ui/           # Reusable UI components
│   │   ├── api/          # API clients (Supabase)
│   │   └── utils/        # Utilities (Debug, etc.)
│   └── main.tsx          # App entry point
├── public/
│   └── images/menu/      # AI-generated menu images
└── sql/                  # Database migrations
```

## 🛠️ Available Scripts

```bash
npm run dev          # Development server (port 5173)
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd react-app
vercel --prod
```

### Manual Build

```bash
cd react-app
npm run build
# Deploy 'dist/' folder to your hosting
```

**Environment variables** must be configured in your hosting platform dashboard.

## 📊 Database Schema

Tables:
- `products` - Menu items with images, prices, categories
- `categories` - Menu categories (Cơm Phần, Phở, Bánh Mì, etc.)
- `orders` - Customer orders
- `order_items` - Order line items
- `profiles` - User profiles with roles

See `/sql` folder for complete schema.

## 🔐 Authentication & Roles

Roles:
- `admin` - Full access, manage products/categories
- `staff` - Process orders, view menu
- `customer` - View menu, place orders

## 🎨 Design System

- **Framework:** Material-UI (MUI) v6
- **Theme:** Material Design 3
- **Icons:** Material Icons
- **Fonts:** Roboto

## 🐛 Troubleshooting

**Build errors:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

**PWA not working:**
- Check HTTPS is enabled (required for service workers)
- Clear browser cache and service workers
- Rebuild: `npm run build`

**Database connection issues:**
- Verify `.env` file has correct Supabase credentials
- Check Supabase project is not paused
- App will fallback to demo mode if database unreachable

## 📝 License

MIT License - See LICENSE file for details

## 👤 Author

**PHIHOANG160314**

## 🆘 Support

For issues or questions:
- GitHub Issues: [Create an issue](https://github.com/PHIHOANG160314/COM-ANH-DUONG/issues)
- Email: [Contact developer]

---

**Ready for Production** ✅
- All tests passing
- Build optimized
- PWA enabled
- Demo mode functional
- Production deployment configured
