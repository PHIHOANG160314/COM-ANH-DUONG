---
title: "Phase 07: Shipper Delivery Interface"
description: "Build the mobile-first interface for shippers to view assigned orders, update delivery status, and track earnings."
status: completed
priority: P2
effort: 3 days
branch: feat/shipper-delivery
tags: [shipper, delivery, mobile, maps]
created: 2026-01-30
---

# Phase 07: Shipper Delivery Interface

## Context Links
- [POS Architecture 2026](../reports/researcher-260130-1958-pos-architecture-2026.md)

## Overview
Dedicated interface for delivery staff. Allows them to see orders ready for delivery, accept/assign orders, view delivery address (map integration), and update status to "Delivered".

## Key Insights
- **Mobile Only**: Almost exclusively used on phones.
- **One Handed Usage**: Big buttons, simple list view.
- **External Maps**: Link to Google Maps/Apple Maps for navigation.

## Requirements
### Functional
- View list of orders marked "Ready" (and "Delivery" type).
- "Pick up" order (Change status to Shipping).
- View Customer Address/Phone.
- "Complete" order (Change status to Delivered).
- View daily history.

## Architecture
- **Page**: `pages/shipper-delivery-page.tsx`.
- **Features**:
  - `features/delivery`: DeliveryList, DeliveryCard, MapLink.

## Related Code Files
- `src/pages/shipper-delivery-page.tsx`
- `src/features/delivery/components/DeliveryList.tsx`

## Implementation Steps
1.  **Delivery List**: Query orders with status `Ready` | `Shipping`.
2.  **Action Buttons**: "Start Delivery", "Success", "Failed".
3.  **Map Integration**: Create link generator `https://www.google.com/maps/search/?api=1&query=${address}`.
4.  **Phone Integration**: `<a href="tel:...">`.
5.  **History View**: Simple list of completed orders for the day.

## Todo List
- [x] Build `DeliveryList` Component
- [x] Implement Status Transition (Ready -> Shipping -> Delivered)
- [x] Add "Call Customer" Button
- [x] Add "Open Map" Button
- [x] Build Shipper History View

## Success Criteria
- Shipper can see assigned orders.
- Clicking "Map" opens Google Maps app.
- Status updates reflect on Admin/KDS/Customer views.

## Risk Assessment
- **Risk**: Wrong address format breaks map link.
  - **Mitigation**: Validate address input or provide fallback copy-paste.

## Next Steps
- Proceed to [Phase 08: Admin Dashboard](./phase-08-admin-dashboard.md).
