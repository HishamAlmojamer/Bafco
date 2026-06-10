# UI/UX & Database Improvement Plan

## Overview
Improve the BAFCO Food Plant website's user experience, code architecture, and database schema.

## Phase 1: UI Component Library (Foundation)
Create reusable, accessible UI components.

### 1.1 Toast Notification System
- **New**: `client/src/components/ui/Toast.tsx` — Toast component with success/error/info/warning variants, auto-dismiss, progress bar
- **New**: `client/src/contexts/ToastContext.tsx` — React Context for showing toasts from anywhere
- **Update**: `client/src/App.tsx` — Wrap app with ToastProvider
- **Update**: All pages to use toast for feedback instead of inline success states

### 1.2 Auth Context
- **New**: `client/src/contexts/AuthContext.tsx` — Provides `user`, `isLoggedIn`, `login()`, `logout()`, `loading`
- **Update**: `client/src/App.tsx` — Wrap with AuthProvider
- **Update**: `Header.tsx` — Use AuthContext instead of localStorage
- **Update**: `ProductCard.tsx` — Use AuthContext
- **Update**: `ProtectedRoute.tsx` — Use AuthContext
- **Update**: `CartDrawer.tsx` — Use AuthContext
- **Update**: `CheckoutPage.tsx` — Use AuthContext
- **Update**: `DashboardPage.tsx` — Use AuthContext

### 1.3 Reusable UI Primitives
- **New**: `client/src/components/ui/Skeleton.tsx` — Configurable skeleton loader
- **New**: `client/src/components/ui/Spinner.tsx` — Loading spinner component
- **New**: `client/src/components/ui/EmptyState.tsx` — Empty state with icon, title, description, CTA
- **New**: `client/src/components/ui/FormField.tsx` — Label + input + error message wrapper
- **New**: `client/src/components/ui/Dialog.tsx` — Accessible modal with focus trap, ESC close, ARIA attributes
- **New**: `client/src/components/ui/Badge.tsx` — Status/notification badge
- **New**: `client/src/components/ui/ConfirmDialog.tsx` — Confirmation dialog for destructive actions

## Phase 2: Database & Backend Improvements

### 2.1 Prisma Schema Updates
- **Order model**: Add `shippingAddress`, `shippingCity`, `shippingPhone`, `shippingEmail`, `paymentMethod`, `paymentStatus`, `deliveryFee`, `taxAmount`, `notes`
- **Product model**: Add `stockQuantity` (int, default 0), `isFeatured` (boolean, default false)
- **User model**: Add `phone` (already exists), `address` (string, optional)
- **Add indexes**: `Order(userId, status, createdAt)`, `CartItem(productId)`, `OrderItem(productId)`
- **Fix relations**: Add `onDelete` cascade/restrict where missing

### 2.2 Seed Script Fix
- Ensure `prisma/seed.ts` runs cleanly with updated schema

## Phase 3: Form Validation & UX Polish

### 3.1 Form Validation
- Update all forms to use `FormField` component with field-level validation
- Add real-time validation on blur
- Add proper `aria-invalid`, `aria-describedby` attributes

### 3.2 Accessibility
- Add skip-to-content link in `Layout.tsx`
- Add `role="dialog"`, `aria-modal`, `aria-labelledby` to modals
- Add `role="alert"` / `aria-live` for error messages and status updates

### 3.3 Dashboard Refactoring
- Split `DashboardPage.tsx` (902 lines) into separate components under `client/src/pages/dashboard/`

## Phase 4: Existing Component Audit
- Replace inline `animate-pulse` skeletons with `<Skeleton>` component
- Add toast notifications for cart add/remove, form submit success, errors
- Improve focus management across the app

---

## Files to Create
1. `client/src/contexts/ToastContext.tsx`
2. `client/src/contexts/AuthContext.tsx`
3. `client/src/components/ui/Toast.tsx`
4. `client/src/components/ui/Skeleton.tsx`
5. `client/src/components/ui/Spinner.tsx`
6. `client/src/components/ui/EmptyState.tsx`
7. `client/src/components/ui/FormField.tsx`
8. `client/src/components/ui/Dialog.tsx`
9. `client/src/components/ui/Badge.tsx`
10. `client/src/components/ui/ConfirmDialog.tsx`

## Files to Modify
1. `client/src/App.tsx` — Add providers
2. `client/src/components/layout/Header.tsx` — Use AuthContext
3. `client/src/components/layout/Layout.tsx` — Skip-to-content link
4. `client/src/components/products/ProductCard.tsx` — Use AuthContext, toast
5. `client/src/components/cart/CartDrawer.tsx` — Use AuthContext, toast
6. `client/src/pages/LoginPage.tsx` — Use AuthContext, validation
7. `client/src/pages/RegisterPage.tsx` — Use AuthContext, validation
8. `client/src/pages/ContactPage.tsx` — Toast, validation
9. `client/src/pages/CheckoutPage.tsx` — Toast, validation
10. `client/src/pages/CareersPage.tsx` — Toast, dialog
11. `client/src/pages/DashboardPage.tsx` — Toast, confirm dialog
12. `client/src/pages/ProductsPage.tsx` — Toast
13. `client/src/components/home/NewsGrid.tsx` — Skeleton
14. `client/src/components/products/ProductGrid.tsx` — Skeleton, EmptyState
15. `server/prisma/schema.prisma` — Schema updates
16. `server/prisma/seed.ts` — Seed updates

## Verification
1. `cd client && npx tsc --noEmit` — TypeScript compilation
2. `cd client && npx vite build` — Production build
3. `cd server && npx prisma generate` — Prisma generation
4. Visual check: Run both servers, verify all pages load correctly
