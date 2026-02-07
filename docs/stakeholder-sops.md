# Stakeholder Standard Operating Procedures (SOPs)

## Overview

This document outlines the standard operating procedures for all stakeholder roles in the Cơm Ánh Dương restaurant POS system.

---

## 1. Customer Flow

### Customer Journey (COD Focus)

**COD (Cash on Delivery) - Recommended Path:**

1. **Browse menu** → Add items to cart
2. **View cart** → Proceed to checkout (`/checkout`)
3. **Fill delivery info** (auto-fill if logged in)
   - Full name
   - Phone number
   - Delivery address
   - Optional notes
4. **Select COD** (default, highlighted with "Phổ biến" badge)
   - Payment method is pre-selected as Cash on Delivery
   - Clear visual prominence with green border and 💵 emoji
5. **Click "Đặt hàng"**
6. **Receive order confirmation** at `/order-success`
   - View order number (e.g., #abc12345)
   - See estimated delivery time (30-45 phút)
   - Check COD amount to prepare
   - Access contact buttons (Call/WhatsApp/Zalo)
7. **Prepare cash** for delivery
   - Amount clearly displayed on success page
8. **Receive order** + **Pay on delivery**

### Browse Menu
1. Navigate to homepage (`/`)
2. View featured menu items and daily specials
3. Click "Thực đơn" (Menu) icon in header
4. **Check Status**: Verify restaurant is "Open" (Green light) in header (10:00-22:00)
5. **Trust Check**: View Trust Badges (VSATTP, Fresh) on homepage for reassurance
6. Browse categories and products
7. **Support**: Use floating Zalo Chat button if help is needed
8. View product details (name, price, image, description)

### Place Order
1. Select product from menu
2. Click "Thêm vào giỏ" (Add to Cart)
3. Adjust quantity if needed
4. Continue browsing or proceed to checkout
5. Click cart icon (with badge showing item count)

### Checkout & Payment
1. Review cart items at `/checkout`
2. Verify order details and total amount
3. Enter delivery information if applicable
4. Choose payment method (cash, bank transfer, etc.)
5. Confirm order
6. Redirected to `/checkout/result` for payment confirmation
7. View order success at `/order-success`

### Profile Management (Authenticated Users)
1. Login via `/login`
2. Access profile via person icon in header
3. View order history
4. Update personal information
5. Manage saved addresses

---

## 2. Admin Flow

### Login & Dashboard
1. Navigate to `/login`
2. Enter admin credentials
3. Redirected to `/admin` (Dashboard)
4. View key metrics:
   - Revenue today
   - Orders today
   - Revenue chart
   - Order statistics

### Manage Products
1. Click "Sản phẩm" (Products) in sidebar
2. Navigate to `/admin/products`
3. View product list with search/filter
4. Add new product:
   - Enter name, price, description
   - Upload product image
   - Set category
   - Set availability status
5. Edit existing product
6. Delete/archive product

### Manage Daily Menu
1. Click "Thực đơn ngày" (Daily Menu) in sidebar
2. Navigate to `/admin/menu`
3. Configure today's special menu
4. Set featured products
5. Enable/disable menu items
6. Save changes

### Manage Orders
1. Click "Đơn hàng" (Orders) in sidebar
2. Navigate to `/admin/orders`
3. View order list with filters:
   - Status (pending, preparing, ready, delivered)
   - Date range
   - Customer info
4. Update order status
5. View order details
6. Process refunds if needed

### Analytics & Reports
1. Click "Báo cáo" (Analytics) in sidebar
2. Navigate to `/admin/analytics`
3. View comprehensive reports:
   - Revenue trends
   - Popular products
   - Order statistics
   - Customer insights
4. Export reports (PDF, Excel)
5. Filter by date range

### System Settings
1. Click "Cài đặt" (Settings) in sidebar
2. Navigate to `/admin/settings`
3. Configure:
   - Restaurant information
   - Operating hours
   - Notification preferences
   - Email alerts
   - Auto-backup settings
4. Save configuration

### Logout
1. Click avatar in top-right corner
2. Select "Đăng xuất" (Logout)
3. Redirected to login page

---

## 3. Kitchen Flow (Kitchen Display System - KDS)

### Access KDS
1. Login with staff/kitchen credentials
2. Navigate to `/kitchen`
3. View kitchen display interface

### Receive Orders
1. Monitor incoming orders in real-time
2. New orders highlighted in queue
3. View order details:
   - Order number
   - Items with quantities
   - Special requests/notes
   - Order time

### Prepare Orders
1. Accept order to start preparation
2. Mark items as "preparing"
3. Update order status:
   - `pending` → `preparing` → `ready`
4. Follow recipe specifications
5. Check quality before marking ready

### Complete Orders
1. Verify all items prepared correctly
2. Mark order as "ready"
3. Notify delivery/pickup
4. Clear from active queue
5. Move to completed orders list

### Priority Management
1. View orders sorted by:
   - Order time (FIFO - First In, First Out)
   - Priority flag
   - Delivery time
2. Handle urgent orders first
3. Manage multiple orders simultaneously

---

## 4. Delivery Flow (Shipper Management)

### Access Delivery Dashboard
1. Login with shipper credentials
2. Navigate to `/delivery`
3. View available deliveries

### Receive Assignment
1. View assigned deliveries in queue
2. Check delivery details:
   - Customer name and address
   - Order items
   - Contact phone
   - Delivery instructions
3. Accept delivery assignment

### Pickup Order
1. Navigate to restaurant location
2. Verify order number with kitchen
3. Check all items included
4. Mark as "picked up"
5. Update status in app

### Deliver Order
1. Navigate to customer address using map
2. Contact customer if needed
3. Deliver order to customer
4. Collect payment if COD (Cash on Delivery)
5. Mark as "delivered" in app
6. Upload proof of delivery (photo/signature)

### Return to Base
1. Complete delivery
2. Update availability status
3. Ready for next assignment
4. View delivery history and earnings

### Issue Management
1. Report delivery issues:
   - Customer not available
   - Wrong address
   - Order rejection
2. Contact support/admin
3. Follow escalation procedure
4. Document incident

---

## 5. Staff/POS Flow (Point of Sale)

### Access Mobile POS
1. Login with staff credentials
2. Navigate to `/pos`
3. View POS interface

### Take Order
1. Browse menu categories
2. Select products for customer
3. Add to cart
4. Apply discounts if applicable
5. Confirm order details with customer

### Process Payment
1. Calculate total amount
2. Select payment method
3. Process transaction
4. Generate receipt
5. Provide order number to customer

### Order Management
1. View active orders
2. Update order status
3. Handle modifications/cancellations
4. Track order fulfillment

---

## 6. Security & Permissions

### Role Hierarchy
```
Admin
├── Full system access
├── All CRUD operations
├── Reports and analytics
└── System configuration

Staff
├── POS access
├── Kitchen display access
├── Order management
└── Limited reports

Shipper
├── Delivery dashboard
├── Order pickup/delivery
└── Delivery history

Customer
├── Browse menu
├── Place orders
├── View order history
└── Profile management
```

### Authentication Rules
- All protected routes require valid session
- Role-based access control enforced
- Admin can access all routes
- Staff can access POS and Kitchen
- Shipper can only access Delivery
- Session timeout: 24 hours
- Password requirements: min 8 characters

---

## 7. Emergency Procedures

### System Downtime
1. Use backup POS (manual receipts)
2. Record orders manually
3. Contact IT support
4. Enter orders when system restored

### Payment Issues
1. Accept alternative payment
2. Document transaction
3. Process manually later
4. Inform customer of delay

### Order Issues
1. Contact customer immediately
2. Offer resolution (refund/replacement)
3. Document incident
4. Escalate to admin if needed

---

## 8. Best Practices

### For All Roles
- Keep credentials secure
- Logout when finished
- Report technical issues promptly
- Verify information before submitting
- Maintain professional communication

### Data Accuracy
- Double-check order details
- Verify customer information
- Confirm payment amounts
- Update statuses promptly

### Customer Service
- Be courteous and professional
- Respond to inquiries quickly
- Handle complaints with care
- Ensure order accuracy
- Maintain food quality standards

---

## Contact & Support

- **Technical Support**: IT Department
- **Admin Contact**: Restaurant Manager
- **Emergency**: Restaurant Phone Number
- **System Issues**: Report via admin panel

---

*Last Updated: 2026-01-31*
*Version: 1.0*
