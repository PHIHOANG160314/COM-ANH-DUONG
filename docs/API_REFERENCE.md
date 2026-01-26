# API Reference
**Generated:** 2026-01-23
**Source:** `js/api-service.js`

## APIService

The `APIService` object is the unified entry point for all data operations, handling online/offline synchronization automatically.

### Initialization
- `init()`: Initializes listeners and syncs offline queue.

### Menu API (`APIService.menu`)
- `getAll()`: Returns all active menu items.
- `getCategories()`: Returns menu categories.
- `getCombos()`: Returns active combos.

### Orders API (`APIService.orders`)
- `create(orderData)`: Creates a new order. Queues if offline.
- `getAll(status)`: Get orders, optionally filtered by status.
- `updateStatus(orderId, status)`: Updates order status. Queues if offline.
- `subscribe(callback)`: Realtime subscription for all orders.
- `subscribeById(orderId, callback)`: Realtime subscription for a specific order.

### Customers API (`APIService.customers`)
- `getByPhone(phone)`: lookup customer by phone number.
- `upsert(customerData)`: Create or update customer profile.

### Analytics API (`APIService.analytics`)
- `getTodayStats()`: Fast daily statistics.
- `getDailyReport(date)`: Detailed report for a specific date.
- `getRangeReport(dateFrom, dateTo)`: Report for a date range.
- `getTopItems(from, to, limit)`: Best selling items.
