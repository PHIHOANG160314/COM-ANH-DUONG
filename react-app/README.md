# Cơm Ánh Dương - Restaurant POS System

A complete O2O (Online-to-Offline) restaurant ordering platform built with React 19, TypeScript, Vite, and Supabase.

## 🚀 Features

### Customer Experience
-   📱 **Mobile-First Ordering** - Browse menu, customize items, and place orders
-   💵 **Multiple Payment Options:**
    - 💰 Cash on Delivery (COD) - Default, no setup required
    - 🏦 VNPay - Bank cards and QR code payments (optional)
    - 📲 MoMo E-Wallet - Mobile wallet payments (optional)
-   🔔 **Real-time Order Tracking** - Live status updates
-   📦 **Order History** - View past orders
-   📱 **PWA Support** - Install as mobile app

### Staff & Operations
-   🖥️ **Staff POS** - Tablet-friendly point-of-sale interface
-   👨‍🍳 **Kitchen Display System (KDS)** - Real-time order management for kitchen
-   🚚 **Shipper Portal** - Delivery tracking and management
-   📊 **Order Management** - Complete order lifecycle tracking

### Technical Features
-   ⚡ **React 19** with React Compiler (automatic memoization)
-   🎨 **Material UI v6** - Material Design 3 components
-   🗄️ **Supabase** - PostgreSQL database, authentication, realtime, Edge Functions
-   🔒 **Row Level Security (RLS)** - Secure data access
-   🌐 **PWA Ready** - Offline support, installable
-   🚀 **Vercel Deployment** - One-click deploy

## 📦 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account (free tier)
- Vercel account (free tier)

### 1. Clone Repository
```bash
git clone https://github.com/your-username/com-anh-duong-10x.git
cd com-anh-duong-10x/react-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment
```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## 📚 Documentation

- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Complete deployment guide
- **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Database structure and RLS policies
- **[PAYMENT_DEPLOYMENT.md](./PAYMENT_DEPLOYMENT.md)** - Payment gateway integration (optional)
- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Supabase configuration
- **[SEED_DATA.md](./SEED_DATA.md)** - Sample data for testing

## 🛠️ Tech Stack

**Frontend:**
- React 19 with TypeScript
- Vite 6 (Rolldown bundler)
- Material UI v6 (Material Design 3)
- TanStack Query v5 (server state)
- Zustand (client state)
- React Hook Form + Zod (forms)

**Backend:**
- Supabase (PostgreSQL + Auth + Realtime + Edge Functions)
- Row Level Security (RLS)
- Edge Functions for payments

**Deployment:**
- Vercel (frontend hosting)
- Supabase (backend services)

## 🎯 Use Cases

**For Customers:**
1. Browse menu with photos and descriptions
2. Add items to cart, customize orders
3. Choose delivery/takeaway/dine-in
4. Pay with COD (or VNPay/MoMo if configured)
5. Track order status in real-time

**For Restaurant Staff:**
1. View incoming orders in real-time
2. Manage order status (preparing → ready → completed)
3. Update menu availability
4. Process POS orders

**For Kitchen:**
1. View orders on Kitchen Display System
2. Mark items as prepared
3. Prioritize orders by time

**For Delivery:**
1. View assigned deliveries
2. Update delivery status
3. Track delivery completion

## 💳 Payment Integration

### COD (Cash on Delivery) - Default ✅
Enabled by default, no configuration needed. Customers pay when receiving order.

### VNPay / MoMo - Optional
For online payment integration, see [PAYMENT_DEPLOYMENT.md](./PAYMENT_DEPLOYMENT.md)

## 🚀 Deployment

See **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** for complete instructions.

**Quick Deploy:**
1. Create Supabase project
2. Run database migrations
3. Add environment variables to Vercel
4. Deploy from GitHub

## 📄 License

MIT License - feel free to use for your restaurant!

## 🙏 Acknowledgments

Built with modern web technologies and best practices for restaurant operations.

---

**Ready to deploy?** Follow [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) to get started!
